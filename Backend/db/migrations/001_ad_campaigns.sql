-- Run this in Supabase SQL Editor (or via npm run migrate:ads)

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id SERIAL PRIMARY KEY,
  advertiser_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  advertiser_name VARCHAR(255) NOT NULL,
  advertiser_email VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  click_url TEXT,
  placement VARCHAR(50) DEFAULT 'global',
  amount NUMERIC(12, 2) NOT NULL DEFAULT 10000,
  currency VARCHAR(10) DEFAULT 'RWF',
  payment_provider VARCHAR(50),
  payment_reference VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'trial',
  status VARCHAR(50) DEFAULT 'pending_review',
  admin_notes TEXT,
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_payment ON ad_campaigns(payment_status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_advertiser ON ad_campaigns(advertiser_user_id);

-- If table already existed from an older version, add missing columns
ALTER TABLE ad_campaigns ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE ad_campaigns ALTER COLUMN currency SET DEFAULT 'RWF';
ALTER TABLE ad_campaigns ALTER COLUMN amount SET DEFAULT 10000;
