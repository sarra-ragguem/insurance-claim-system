-- ═══════════════════════════════════════════════════════════════════════════
-- INSURANCE CLAIM SYSTEM - DATABASE INITIALIZATION
-- This script creates all tables and inserts test data
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: claims 
-- Stores all insurance claims
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS claims (
    claim_id SERIAL PRIMARY KEY,
    policy_id VARCHAR(50) NOT NULL,
    claim_type VARCHAR(50) NOT NULL,
    amount_requested DECIMAL(12, 2) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: identities - For SOAP Service
-- Stores customer identity information for verification
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS identities (
    id SERIAL PRIMARY KEY,
    national_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: policies For gRPC Service
-- Stores insurance policy information
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS policies (
    id SERIAL PRIMARY KEY,
    policy_id VARCHAR(50) UNIQUE NOT NULL,
    holder_name VARCHAR(100) NOT NULL,
    policy_type VARCHAR(50) NOT NULL,
    covered_claims TEXT[] NOT NULL,  -- Array of claim types: AUTO, HEALTH, HOME, LIFE, TRAVEL
    max_coverage DECIMAL(12, 2) NOT NULL,
    deductible_percentage DECIMAL(5, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE, EXPIRED, SUSPENDED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INSERT TEST DATA: Identities
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO identities (national_id, full_name, date_of_birth) VALUES
    ('12345678', 'Ahmed Ben Ali', '1990-05-15'),
    ('87654321', 'Fatma Trabelsi', '1985-11-20'),
    ('11111111', 'Mohamed Bouazizi', '1992-03-10'),
    ('22222222', 'Sarra Mejri', '1995-07-25'),
    ('33333333', 'Cyrine Gharbi', '1993-01-30'),
    ('44444444', 'Ilef Mansour', '1991-09-05')
ON CONFLICT (national_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- INSERT TEST DATA: Policies
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO policies (policy_id, holder_name, policy_type, covered_claims, max_coverage, deductible_percentage, start_date, end_date, status) VALUES
    ('POL-001', 'Ahmed Ben Ali', 'COMPREHENSIVE', ARRAY['AUTO', 'HOME', 'TRAVEL'], 50000.00, 10.00, '2024-01-01', '2026-12-31', 'ACTIVE'),
    ('POL-002', 'Fatma Trabelsi', 'HEALTH_PREMIUM', ARRAY['HEALTH', 'LIFE'], 100000.00, 5.00, '2023-06-01', '2025-05-31', 'ACTIVE'),
    ('POL-003', 'Mohamed Bouazizi', 'AUTO_BASIC', ARRAY['AUTO'], 20000.00, 15.00, '2024-03-01', '2025-02-28', 'ACTIVE'),
    ('POL-004', 'Sarra Mejri', 'HOME_PLUS', ARRAY['HOME', 'TRAVEL'], 75000.00, 8.00, '2022-01-01', '2024-12-31', 'EXPIRED'),
    ('POL-005', 'Cyrine Gharbi', 'FULL_COVERAGE', ARRAY['AUTO', 'HOME', 'HEALTH', 'LIFE', 'TRAVEL'], 200000.00, 5.00, '2025-01-01', '2027-12-31', 'ACTIVE'),
    ('POL-006', 'Ilef Mansour', 'TRAVEL_BASIC', ARRAY['TRAVEL'], 10000.00, 20.00, '2025-01-01', '2025-12-31', 'ACTIVE')
ON CONFLICT (policy_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO insurance_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO insurance_admin;
