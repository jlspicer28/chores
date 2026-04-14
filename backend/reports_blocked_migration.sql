-- Migration: Add reports and blocked_users tables for Apple Guideline 1.2 compliance
-- Run this in your Supabase SQL editor

-- Reports table: stores user reports of objectionable content
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT DEFAULT '',
  content_type TEXT DEFAULT 'user',
  status TEXT DEFAULT 'pending',
  admin_notes TEXT DEFAULT '',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- Blocked users table: tracks which users have blocked whom
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_blocked ON blocked_users(blocked_id);

-- Enable RLS (Row Level Security)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (backend uses service key)
CREATE POLICY "Service role full access on reports" ON reports
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on blocked_users" ON blocked_users
  FOR ALL USING (true) WITH CHECK (true);
