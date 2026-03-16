const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');

const isStaffRole = (role) => ['admin', 'leader'].includes(role);
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? require('stripe')(stripeSecretKey) : null;
const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

router.get('/payments/schedules', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fs.*, s.name AS school_name
       FROM fee_schedules fs
       LEFT JOIN schools s ON fs.school_id = s.id
       ORDER BY fs.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching fee schedules:', err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/payments/schedules', authMiddleware, async (req, res) => {
  try {
    if (!isStaffRole(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { school_id, title, amount, currency = 'RWF', due_date } = req.body;
    if (!title || !amount) {
      return res.status(400).json({ message: 'title and amount are required' });
    }

    const result = await pool.query(
      `INSERT INTO fee_schedules (school_id, title, amount, currency, due_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [school_id || null, title, Number(amount), currency, due_date || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating fee schedule:', err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/payments/invoices', authMiddleware, async (req, res) => {
  try {
    const isStaff = isStaffRole(req.user.role);
    const params = [];
    let query = `
      SELECT fi.*, fs.title AS schedule_title, fs.school_id, s.name AS school_name
      FROM fee_invoices fi
      LEFT JOIN fee_schedules fs ON fi.schedule_id = fs.id
      LEFT JOIN schools s ON fs.school_id = s.id
    `;

    if (!isStaff) {
      query += ' WHERE fi.student_user_id = $1';
      params.push(req.user.id);
    }

    query += ' ORDER BY fi.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching invoices:', err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/payments/invoices', authMiddleware, async (req, res) => {
  try {
    const { schedule_id, student_user_id } = req.body;
    if (!schedule_id) {
      return res.status(400).json({ message: 'schedule_id is required' });
    }

    const schedule = await pool.query('SELECT * FROM fee_schedules WHERE id = $1', [schedule_id]);
    if (schedule.rows.length === 0) {
      return res.status(404).json({ message: 'Fee schedule not found' });
    }

    const targetStudentId = isStaffRole(req.user.role)
      ? Number(student_user_id)
      : req.user.id;

    const result = await pool.query(
      `INSERT INTO fee_invoices (schedule_id, student_user_id, amount, currency)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        schedule_id,
        targetStudentId,
        schedule.rows[0].amount,
        schedule.rows[0].currency,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating invoice:', err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/payments/transactions', authMiddleware, async (req, res) => {
  try {
    const isStaff = isStaffRole(req.user.role);
    const params = [];
    let query = `
      SELECT pt.*, fi.student_user_id, fi.status AS invoice_status, fs.title AS schedule_title
      FROM payment_transactions pt
      LEFT JOIN fee_invoices fi ON pt.invoice_id = fi.id
      LEFT JOIN fee_schedules fs ON fi.schedule_id = fs.id
    `;

    if (!isStaff) {
      query += ' WHERE fi.student_user_id = $1';
      params.push(req.user.id);
    }

    query += ' ORDER BY pt.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching transactions:', err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/payments/stripe/checkout', authMiddleware, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: 'Stripe is not configured. Set STRIPE_SECRET_KEY.' });
    }

    const { invoice_id, success_url, cancel_url } = req.body;
    if (!invoice_id) {
      return res.status(400).json({ message: 'invoice_id is required' });
    }

    const invoiceResult = await pool.query(
      'SELECT * FROM fee_invoices WHERE id = $1',
      [invoice_id]
    );
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];
    const isStaff = isStaffRole(req.user.role);
    if (!isStaff && invoice.student_user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice already paid' });
    }

    const scheduleResult = await pool.query('SELECT title FROM fee_schedules WHERE id = $1', [invoice.schedule_id]);
    const scheduleTitle = scheduleResult.rows[0]?.title || 'School Fees';

    const rawCurrency = (invoice.currency || 'RWF').toLowerCase();
    const stripeCurrency = ['usd', 'eur', 'gbp'].includes(rawCurrency) ? rawCurrency : 'usd';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: stripeCurrency,
            product_data: {
              name: scheduleTitle,
            },
            unit_amount: Math.round(Number(invoice.amount) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { invoice_id: String(invoice.id) },
      success_url: success_url || `${frontendBaseUrl}/payments/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${frontendBaseUrl}/payments/stripe-cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating Stripe checkout:', err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/payments/stripe/confirm', authMiddleware, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: 'Stripe is not configured. Set STRIPE_SECRET_KEY.' });
    }

    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({ message: 'session_id is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const invoiceId = Number(session.metadata?.invoice_id);
    if (!invoiceId) {
      return res.status(400).json({ message: 'Missing invoice metadata' });
    }

    const invoiceResult = await pool.query('SELECT * FROM fee_invoices WHERE id = $1', [invoiceId]);
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];
    const isStaff = isStaffRole(req.user.role);
    if (!isStaff && invoice.student_user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await pool.query(
      `INSERT INTO payment_transactions (invoice_id, amount, currency, provider, status, reference)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [invoice.id, invoice.amount, invoice.currency, 'stripe', 'success', session.id]
    );

    const updated = await pool.query(
      `UPDATE fee_invoices
       SET status = 'paid', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [invoice.id]
    );

    res.json({ invoice: updated.rows[0] });
  } catch (err) {
    console.error('Error confirming Stripe payment:', err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/payments/mobile-money/initiate', authMiddleware, async (req, res) => {
  try {
    const { invoice_id, provider, phone_number } = req.body;
    if (!invoice_id || !provider || !phone_number) {
      return res.status(400).json({ message: 'invoice_id, provider, and phone_number are required' });
    }

    if (!['MTN', 'Airtel'].includes(provider)) {
      return res.status(400).json({ message: 'provider must be MTN or Airtel' });
    }

    const invoiceResult = await pool.query('SELECT * FROM fee_invoices WHERE id = $1', [invoice_id]);
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];
    const isStaff = isStaffRole(req.user.role);
    if (!isStaff && invoice.student_user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice already paid' });
    }

    // Simulate mobile money payment initiation
    const merchant_code = `RSBS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const payer_code = `${Math.floor(100000 + Math.random() * 900000)}`;
    const reference = `${provider}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    res.json({
      merchant_code,
      payer_code,
      reference,
      provider,
      amount: invoice.amount,
      currency: invoice.currency,
      phone_number,
      status: 'pending',
      message: `Dial *${provider === 'MTN' ? '182' : '175'}*8*1# and use merchant code: ${merchant_code} and payer code: ${payer_code}`,
    });
  } catch (err) {
    console.error('Error initiating mobile money payment:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/payments/mobile-money/confirm', authMiddleware, async (req, res) => {
  try {
    const { invoice_id, reference, provider } = req.body;
    if (!invoice_id || !reference || !provider) {
      return res.status(400).json({ message: 'invoice_id, reference, and provider are required' });
    }

    const invoiceResult = await pool.query('SELECT * FROM fee_invoices WHERE id = $1', [invoice_id]);
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];
    const isStaff = isStaffRole(req.user.role);
    if (!isStaff && invoice.student_user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice already paid' });
    }

    // Simulate successful mobile money payment
    await pool.query(
      `INSERT INTO payment_transactions (invoice_id, amount, currency, provider, status, reference)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [invoice.id, invoice.amount, invoice.currency, provider.toLowerCase(), 'success', reference]
    );

    const updated = await pool.query(
      `UPDATE fee_invoices
       SET status = 'paid', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [invoice.id]
    );

    res.json({
      invoice: updated.rows[0],
      receipt: {
        reference,
        amount: invoice.amount,
        currency: invoice.currency,
        provider,
        paid_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Error confirming mobile money payment:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/payments/sandbox/charge', authMiddleware, async (req, res) => {
  try {
    const { invoice_id } = req.body;
    if (!invoice_id) {
      return res.status(400).json({ message: 'invoice_id is required' });
    }

    const invoiceResult = await pool.query(
      'SELECT * FROM fee_invoices WHERE id = $1',
      [invoice_id]
    );
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];
    const isStaff = isStaffRole(req.user.role);
    if (!isStaff && invoice.student_user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice already paid' });
    }

    const reference = `SBX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await pool.query(
      `INSERT INTO payment_transactions (invoice_id, amount, currency, provider, status, reference)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [invoice.id, invoice.amount, invoice.currency, 'sandbox', 'success', reference]
    );

    const updated = await pool.query(
      `UPDATE fee_invoices
       SET status = 'paid', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [invoice.id]
    );

    res.json({
      invoice: updated.rows[0],
      receipt: {
        reference,
        amount: invoice.amount,
        currency: invoice.currency,
        provider: 'sandbox',
        paid_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Error processing sandbox payment:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/payments/invoices/:id/receipt', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const invoiceResult = await pool.query('SELECT * FROM fee_invoices WHERE id = $1', [id]);
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];
    const isStaff = isStaffRole(req.user.role);
    if (!isStaff && invoice.student_user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const payment = await pool.query(
      `SELECT * FROM payment_transactions
       WHERE invoice_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [invoice.id]
    );

    res.json({
      invoice,
      payment: payment.rows[0] || null,
    });
  } catch (err) {
    console.error('Error fetching receipt:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
