-- Migration: Create Daily Reports Table
-- Date: 2026-03-06
-- Description: Tracking daily performance and issues for all employee roles.

CREATE TABLE IF NOT EXISTS rizik_daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES rizik_employees(id),
    report_date DATE DEFAULT CURRENT_DATE,
    summary TEXT NOT NULL,
    sales_count INTEGER DEFAULT 0,
    orders_handled INTEGER DEFAULT 0,
    issues_encountered TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, report_date)
);

-- Enable RLS
ALTER TABLE rizik_daily_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Employees can insert their own reports
CREATE POLICY employee_insert_report ON rizik_daily_reports
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM rizik_employees WHERE id = employee_id
    ));

-- Policy: Employees can view their own reports
CREATE POLICY employee_view_report ON rizik_daily_reports
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM rizik_employees WHERE id = employee_id
    ));

-- Policy: Admin/Managers can view all reports
CREATE POLICY admin_view_all_reports ON rizik_daily_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'DIRECTOR')
        )
    );

-- Disable RLS for AI Agent access during development
ALTER TABLE rizik_daily_reports DISABLE ROW LEVEL SECURITY;
