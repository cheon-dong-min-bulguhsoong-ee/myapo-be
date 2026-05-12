-- ───────────────────────────────────────────────────────────────────────
-- Document 도메인 시드 데이터
--   schema  : tosalpee
--   대상     : issuers (FK 우선) → document_types
--   재실행 안전: ON CONFLICT (code) DO UPDATE — 매번 최신 상태로 upsert.
--
-- 적용 방법:
--   psql "$DATABASE_URL" -f prisma/seed.sql
--   또는 DBeaver / DataGrip 에서 통째로 실행
-- ───────────────────────────────────────────────────────────────────────

-- 1) Issuer 마스터 (발급기관)
INSERT INTO tosalpee.issuers (code, name, country_code, icon_label, wallet_address, status, is_delete)
VALUES
    ('KR-NTS',  '국세청',          'KR', 'NTS',  NULL, 'ACTIVE', false),
    ('KR-MOJ',  '법무부',          'KR', 'MOJ',  NULL, 'ACTIVE', false),
    ('KR-MOFA', '외교부',          'KR', 'MOFA', NULL, 'ACTIVE', false),
    ('KR-MIL',  '병무청',          'KR', '병무', NULL, 'ACTIVE', false),
    ('KR-SCH',  '교육기관',        'KR', '학교', NULL, 'ACTIVE', false),
    ('KR-MOH',  '국민건강보험공단', 'KR', '건보', NULL, 'ACTIVE', false),
    ('VN-MOFA', '베트남 외교부',    'VN', 'MOFA', NULL, 'ACTIVE', false)
ON CONFLICT (code) DO UPDATE SET
    name           = EXCLUDED.name,
    country_code   = EXCLUDED.country_code,
    icon_label     = EXCLUDED.icon_label,
    wallet_address = EXCLUDED.wallet_address,
    status         = EXCLUDED.status,
    is_delete      = EXCLUDED.is_delete;


-- 2) DocumentType 카탈로그 (발급 신청 시 노출되는 문서 종류)
INSERT INTO tosalpee.document_types
    (code, name, english_name, issuer_code, persona_type, use_case, default_ttl_months, status, is_delete)
VALUES
    -- 외국인 (FOREIGNER)
    ('VN-MOFA-MARRIAGE-CERT',
     '베트남 혼인관계증명서', 'Vietnam Marriage Certificate',
     'VN-MOFA', 'FOREIGNER',
     '한국 체류자격(F-6) 신청용', 6, 'ACTIVE', false),

    ('KR-MOFA-APOSTILLE',
     '아포스티유 확인서', 'Apostille Certificate',
     'KR-MOFA', 'FOREIGNER',
     '해외 제출 한국 공문서의 진본 확인', 12, 'ACTIVE', false),

    -- 한국인 (KOREAN)
    ('KR-MOJ-RESIDENT-CERT',
     '주민등록등본', 'Resident Cert',
     'KR-MOFA', 'KOREAN',
     '주민등록등본', 12, 'ACTIVE', false),

    ('KR-NTS-TAX-PAYMENT',
     '납세증명서', 'Tax Payment Certificate',
     'KR-NTS', 'KOREAN',
     '비자 갱신 / 해외 송금 시 제출용', 6, 'ACTIVE', false),

    ('KR-NTS-INCOME-PROOF',
     '소득금액증명원', 'Income Amount Certificate',
     'KR-NTS', 'KOREAN',
     '대출 / 임대차 계약 시 소득 증빙', 6, 'ACTIVE', false),

    ('KR-NTS-BIZ-REG',
     '사업자등록증명원', 'Business Registration Certificate',
     'KR-NTS', 'KOREAN',
     '해외 법인 설립', 3, 'ACTIVE', false),

    ('KR-COURT-REAL-ESTATE-REG',
     '부동산등기부등본', 'Real Estate Registration Copy',
     'KR-MOJ', 'KOREAN',
     '자산증명', 3, 'ACTIVE', false),

    ('KR-MMA-MILITARY-RECORD',
     '병적증명서', 'Military Service Record',
     'KR-MIL', 'KOREAN',
     '비자·이민 보조', 6, 'ACTIVE', false),

    ('KR-NPA-DRIVING-RECORD',
     '운전경력증명서', 'Driving Record Certificate',
     'KR-MOJ', 'KOREAN',
     '해외 면허 변환', 3, 'ACTIVE', false),

    ('KR-EDU-ACADEMIC-RECORD',
     '학력증명서', 'Academic Record Certificate',
     'KR-SCH', 'KOREAN',
     '해외 취업·유학', 12, 'ACTIVE', false),

    ('KR-MOJ-CRIMINAL-RECORD',
     '범죄경력증명서', 'Criminal Record Certificate',
     'KR-MOJ', 'KOREAN',
     '취업 / 비자 / 해외 이민 신원 증빙', 3, 'ACTIVE', false),

    ('KR-NHIS-HEALTH-INS-PAY',
     '건강보험료납부확인서', 'Health Insurance Payment Certificate',
     'KR-MOH', 'KOREAN',
     '해외 비자·건강보험 증빙', 3, 'ACTIVE', false),

    ('KR-MOJ-FAMILY-CERT',
     '가족관계 증명서', 'Family Cert',
     'KR-MOFA', 'KOREAN',
     '가족관계 증명서', 12, 'ACTIVE', false)
ON CONFLICT (code) DO UPDATE SET
    name               = EXCLUDED.name,
    english_name       = EXCLUDED.english_name,
    issuer_code        = EXCLUDED.issuer_code,
    persona_type       = EXCLUDED.persona_type,
    use_case           = EXCLUDED.use_case,
    default_ttl_months = EXCLUDED.default_ttl_months,
    status             = EXCLUDED.status,
    is_delete          = EXCLUDED.is_delete;


-- 3) 결과 확인
SELECT 'issuers' AS table_name, COUNT(*) AS row_count FROM tosalpee.issuers
UNION ALL
SELECT 'document_types', COUNT(*) FROM tosalpee.document_types;
