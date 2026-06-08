const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pool = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const adPriceRwf = Number(process.env.AD_CAMPAIGN_PRICE_RWF || 10000);
const trialDays = Number(process.env.AD_CAMPAIGN_TRIAL_DAYS || 10);
const renewalDays = Number(process.env.AD_CAMPAIGN_RENEWAL_DAYS || 30);

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? require('stripe')(stripeSecretKey) : null;

const adsDir = path.join(__dirname, '..', 'uploads', 'ads');
if (!fs.existsSync(adsDir)) {
  fs.mkdirSync(adsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, adsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `ad-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
    cb(ok ? null : new Error('Only image or video files are allowed'), ok);
  },
});

const jsonError = (res, status, message, error) =>
  res.status(status).json({
    success: false,
    message,
    error: error || undefined,
  });

/** JWT only stores id + role — load profile from DB */
const getAdvertiserFromRequest = async (req) => {
  const result = await pool.query(
    'SELECT id, first_name, last_name, email, role FROM users WHERE id = $1',
    [req.user.id]
  );
  if (result.rows.length === 0) {
    return null;
  }
  const u = result.rows[0];
  return {
    id: u.id,
    name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Advertiser',
    email: u.email,
    role: u.role,
  };
};

/** Public: active approved ads (trial or paid) */
router.get('/ads/active', async (req, res) => {
  try {
    const placement = req.query.placement || 'global';
    const result = await pool.query(
      `SELECT id, title, description, media_type, media_url, click_url, company_name, placement
       FROM ad_campaigns
       WHERE status = 'active'
         AND payment_status IN ('trial', 'paid')
         AND (ends_at IS NULL OR ends_at > NOW())
         AND (placement = $1 OR placement = 'global')
       ORDER BY created_at DESC
       LIMIT 10`,
      [placement]
    );
    res.json({ success: true, ads: result.rows });
  } catch (err) {
    console.error('Error fetching active ads:', err.message);
    if (err.message?.includes('ad_campaigns')) {
      return jsonError(res, 503, 'Ads table missing. Run: npm run migrate:ads');
    }
    jsonError(res, 500, 'Failed to load ads');
  }
});

/** Pricing — Rwanda: FRW / RWF */
router.get('/ads/pricing', (req, res) => {
  res.json({
    success: true,
    amount: adPriceRwf,
    currency: 'RWF',
    currencyLabel: 'FRW',
    trialDays,
    renewalDays,
    renewalAmount: adPriceRwf,
    message: `${trialDays} days FREE after admin approval, then ${adPriceRwf.toLocaleString()} FRW to continue.`,
  });
});

/** Submit ad — free trial period starts after admin approval */
router.post('/ads', authMiddleware, (req, res) => {
  upload.single('media')(req, res, async (uploadErr) => {
    if (uploadErr) {
      return jsonError(res, 400, uploadErr.message || 'File upload failed');
    }

    try {
      const { title, description, click_url, company_name, placement = 'global' } = req.body;

      if (!title?.trim()) {
        return jsonError(res, 400, 'Title is required');
      }
      if (!req.file) {
        return jsonError(res, 400, 'Image or video file is required');
      }

      const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      const mediaUrl = `/uploads/ads/${req.file.filename}`;

      const advertiser = await getAdvertiserFromRequest(req);
      if (!advertiser) {
        return jsonError(res, 401, 'User account not found');
      }
      if (!advertiser.email) {
        return jsonError(res, 400, 'Your account has no email on file. Update your profile first.');
      }

      const result = await pool.query(
        `INSERT INTO ad_campaigns (
          advertiser_user_id, advertiser_name, advertiser_email, company_name,
          title, description, media_type, media_url, click_url, placement,
          amount, currency, payment_status, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'RWF','trial','pending_review')
        RETURNING *`,
        [
          advertiser.id,
          advertiser.name,
          advertiser.email,
          company_name || null,
          title.trim(),
          description || null,
          mediaType,
          mediaUrl,
          click_url || null,
          placement,
          adPriceRwf,
        ]
      );

      res.status(201).json({
        success: true,
        campaign: result.rows[0],
        message: `Ad submitted! After admin approval you get ${trialDays} days FREE. Then ${adPriceRwf.toLocaleString()} FRW to renew.`,
        trialDays,
        renewalAmount: adPriceRwf,
        currency: 'RWF',
      });
    } catch (err) {
      console.error('Error creating ad:', err.message);
      if (err.message?.includes('ad_campaigns') || err.code === '42P01') {
        return jsonError(res, 503, 'Database table missing. Ask admin to run: npm run migrate:ads');
      }
      jsonError(res, 500, err.message || 'Failed to create ad');
    }
  });
});

router.get('/ads/mine', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ad_campaigns WHERE advertiser_user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, campaigns: result.rows });
  } catch (err) {
    jsonError(res, 500, 'Failed to load your ads');
  }
});

/** Pay 10,000 FRW to renew after trial ends */
router.post('/ads/:id/renew', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await pool.query('SELECT * FROM ad_campaigns WHERE id = $1', [id]);
    if (campaign.rows.length === 0) {
      return jsonError(res, 404, 'Campaign not found');
    }
    const ad = campaign.rows[0];
    if (ad.advertiser_user_id !== req.user.id && req.user.role !== 'admin') {
      return jsonError(res, 403, 'Access denied');
    }

    const trialEnded = ad.trial_ends_at && new Date(ad.trial_ends_at) < new Date();
    const needsPayment =
      ad.payment_status === 'trial' && trialEnded ||
      ad.payment_status === 'awaiting_payment' ||
      (ad.status === 'active' && ad.ends_at && new Date(ad.ends_at) < new Date());

    if (!needsPayment && ad.payment_status === 'paid') {
      return jsonError(res, 400, 'Campaign is still active');
    }

    if (!stripe) {
      return res.json({
        success: true,
        sandbox: true,
        message: `Pay ${adPriceRwf.toLocaleString()} FRW via sandbox (dev mode)`,
        campaignId: ad.id,
      });
    }

    return jsonError(
      res,
      501,
      'Card payment for FRW coming soon. Use sandbox renew in development.'
    );
  } catch (err) {
    jsonError(res, 500, 'Renewal failed');
  }
});

router.post('/ads/:id/renew-sandbox', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await pool.query('SELECT * FROM ad_campaigns WHERE id = $1', [id]);
    if (campaign.rows.length === 0) {
      return jsonError(res, 404, 'Not found');
    }
    const ad = campaign.rows[0];
    if (ad.advertiser_user_id !== req.user.id && req.user.role !== 'admin') {
      return jsonError(res, 403, 'Access denied');
    }

    const starts = new Date();
    const ends = new Date();
    ends.setDate(ends.getDate() + renewalDays);

    await pool.query(
      `UPDATE ad_campaigns SET
        payment_status = 'paid',
        payment_provider = 'sandbox',
        payment_reference = $1,
        status = 'active',
        starts_at = $2,
        ends_at = $3,
        amount = $4,
        currency = 'RWF',
        updated_at = NOW()
       WHERE id = $5`,
      [`renew-sandbox-${Date.now()}`, starts, ends, adPriceRwf, id]
    );

    res.json({
      success: true,
      message: `Renewed for ${renewalDays} days (${adPriceRwf.toLocaleString()} FRW recorded).`,
    });
  } catch (err) {
    jsonError(res, 500, 'Renewal payment failed');
  }
});

router.get('/ads/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const status = req.query.status;
    let query = `SELECT ac.*, u.email AS user_email
                 FROM ad_campaigns ac
                 LEFT JOIN users u ON u.id = ac.advertiser_user_id`;
    const params = [];
    if (status) {
      query += ` WHERE ac.status = $1`;
      params.push(status);
    }
    query += ` ORDER BY ac.created_at DESC`;
    const result = await pool.query(query, params);
    res.json({ success: true, campaigns: result.rows });
  } catch (err) {
    if (err.message?.includes('ad_campaigns')) {
      return jsonError(res, 503, 'Run npm run migrate:ads first');
    }
    jsonError(res, 500, 'Failed to load campaigns');
  }
});

router.patch('/ads/admin/:id/review', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, admin_notes } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return jsonError(res, 400, 'action must be approve or reject');
    }

    const existing = await pool.query('SELECT * FROM ad_campaigns WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return jsonError(res, 404, 'Not found');
    }

    if (action === 'approve') {
      const starts = new Date();
      const ends = new Date();
      ends.setDate(ends.getDate() + trialDays);

      await pool.query(
        `UPDATE ad_campaigns SET
          status = 'active',
          payment_status = 'trial',
          admin_notes = $1,
          reviewed_by = $2,
          reviewed_at = NOW(),
          starts_at = $3,
          ends_at = $4,
          trial_ends_at = $4,
          updated_at = NOW()
         WHERE id = $5`,
        [admin_notes || null, req.user.id, starts, ends, id]
      );

      return res.json({
        success: true,
        message: `Ad is live for ${trialDays} days FREE. Advertiser pays ${adPriceRwf.toLocaleString()} FRW after trial to renew.`,
      });
    }

    await pool.query(
      `UPDATE ad_campaigns SET
        status = 'rejected',
        admin_notes = $1,
        reviewed_by = $2,
        reviewed_at = NOW(),
        updated_at = NOW()
       WHERE id = $3`,
      [admin_notes || null, req.user.id, id]
    );

    res.json({ success: true, message: 'Ad rejected' });
  } catch (err) {
    console.error('Review error:', err.message);
    jsonError(res, 500, 'Review failed');
  }
});

module.exports = router;
