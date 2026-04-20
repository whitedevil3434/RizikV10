-- Rizik Executive KPI and Risk Governance Schema
-- Date: 2026-02-27

CREATE TABLE IF NOT EXISTS public.exec_kpi_targets (
    target_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_key TEXT UNIQUE NOT NULL,
    metric_name TEXT NOT NULL,
    unit TEXT NOT NULL, -- BDT, PERCENT, COUNT, HOURS
    cadence TEXT NOT NULL DEFAULT 'DAILY' CHECK (cadence IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY')),
    owner_role TEXT NOT NULL,
    target_value NUMERIC(18, 4) NOT NULL,
    warning_threshold NUMERIC(18, 4),
    critical_threshold NUMERIC(18, 4),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exec_kpi_daily (
    snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date DATE NOT NULL,
    metric_key TEXT NOT NULL REFERENCES public.exec_kpi_targets(metric_key) ON DELETE CASCADE,
    metric_value NUMERIC(18, 4) NOT NULL,
    data_source TEXT NOT NULL, -- e.g. "orders", "portal", "manual_audit"
    source_ref TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(snapshot_date, metric_key)
);

CREATE INDEX IF NOT EXISTS idx_exec_kpi_daily_date ON public.exec_kpi_daily(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_exec_kpi_daily_metric ON public.exec_kpi_daily(metric_key);

CREATE TABLE IF NOT EXISTS public.exec_risk_register (
    risk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- security, operations, finance, compliance
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    likelihood INTEGER NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
    impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
    risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'MITIGATING', 'ACCEPTED', 'CLOSED')),
    mitigation_plan TEXT,
    owner_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exec_risk_status ON public.exec_risk_register(status);
CREATE INDEX IF NOT EXISTS idx_exec_risk_score ON public.exec_risk_register(risk_score DESC);

CREATE OR REPLACE VIEW public.v_exec_kpi_latest AS
SELECT
    t.metric_key,
    t.metric_name,
    t.unit,
    t.owner_role,
    t.target_value,
    t.warning_threshold,
    t.critical_threshold,
    d.snapshot_date,
    d.metric_value,
    CASE
        WHEN t.critical_threshold IS NOT NULL AND d.metric_value < t.critical_threshold THEN 'CRITICAL'
        WHEN t.warning_threshold IS NOT NULL AND d.metric_value < t.warning_threshold THEN 'WARNING'
        ELSE 'ON_TRACK'
    END AS health_status
FROM public.exec_kpi_targets t
LEFT JOIN LATERAL (
    SELECT snapshot_date, metric_value
    FROM public.exec_kpi_daily d
    WHERE d.metric_key = t.metric_key
    ORDER BY snapshot_date DESC
    LIMIT 1
) d ON TRUE
WHERE t.is_active = TRUE;

-- Optional RLS enabling (uncomment when policy design is finalized):
-- ALTER TABLE public.exec_kpi_targets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.exec_kpi_daily ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.exec_risk_register ENABLE ROW LEVEL SECURITY;
