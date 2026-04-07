-- Referral Program Migration
-- Run this in the Supabase SQL Editor

-- 1. Add referral columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_credit NUMERIC DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referrals_count INTEGER DEFAULT 0;

-- 2. Create referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referred_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  credit_amount NUMERIC NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(referred_id) -- a user can only be referred once
);

-- 3. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- 4. Backfill referral codes for existing users who don't have one
-- (The backend will generate codes on signup going forward, but existing users need them too)
-- This sets a random 8-char code for any user missing one.
-- Run this AFTER deploying the backend changes:
UPDATE users
SET referral_code = UPPER(
  COALESCE(SUBSTRING(first_name FROM 1 FOR 4), 'USER') ||
  SUBSTRING(md5(random()::text) FROM 1 FOR (8 - LENGTH(COALESCE(SUBSTRING(first_name FROM 1 FOR 4), 'USER'))))
)
WHERE referral_code IS NULL;
