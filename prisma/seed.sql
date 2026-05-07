-- ───────────────────────────────────────────────────────────────────────
-- Document 도메인 시드 데이터
--   schema  : tosalpee
--   대상     : issuers (FK 우선) → document_types
--   재실행 안전: 모든 INSERT 가 ON CONFLICT DO NOTHING
--
-- 적용 방법:
--   psql "$DATABASE_URL" -f prisma/seed.sql
--   또는 DBeaver / DataGrip 에서 통째로 실행
-- ───────────────────────────────────────────────────────────────────────

-- 1) Issuer 마스터 (발급기관)
INSERT INTO tosalpee.issuers (code, name, country_code, icon_label, wallet_address, status, is_delete)
VALUES
    ('KR-NTS',  '국세청',         'KR', 'NTS',  NULL, 'ACTIVE', false),
    ('KR-MOJ',  '법무부',         'KR', 'MOJ',  NULL, 'ACTIVE', false),
    ('KR-MOFA', '외교부',         'KR', 'MOFA', NULL, 'ACTIVE', false),
    ('VN-MOFA', '베트남 외교부',   'VN', 'MOFA', NULL, 'ACTIVE', false)
ON CONFLICT (code) DO NOTHING;

-- 2) DocumentType 카탈로그 (발급 신청 시 노출되는 문서 종류)
INSERT INTO tosalpee.document_types
    (code, name, english_name, issuer_code, persona_type, use_case, default_ttl_months, status, is_delete)
VALUES
    -- 한국인 (KOREAN)
    ('KR-NTS-TAX-PAYMENT',
     '납세증명서', 'Tax Payment Certificate',
     'KR-NTS', 'KOREAN',
     '비자 갱신 / 해외 송금 시 제출용', 6, 'ACTIVE', false),

    ('KR-NTS-INCOME-PROOF',
     '소득금액증명원', 'Income Amount Certificate',
     'KR-NTS', 'KOREAN',
     '대출 / 임대차 계약 시 소득 증빙', 6, 'ACTIVE', false),

    ('KR-MOJ-CRIMINAL-RECORD',
     '범죄경력증명서', 'Criminal Record Certificate',
     'KR-MOJ', 'KOREAN',
     '취업 / 비자 / 해외 이민 신원 증빙', 3, 'ACTIVE', false),

    -- 외국인 (FOREIGNER) — 한국 거주 외국인이 본국 행정문서를 한국에서 발급받는 케이스
    ('VN-MOFA-MARRIAGE-CERT',
     '베트남 혼인관계증명서', 'Vietnam Marriage Certificate',
     'VN-MOFA', 'FOREIGNER',
     '한국 체류자격(F-6) 신청용', 6, 'ACTIVE', false),

    ('KR-MOFA-APOSTILLE',
     '아포스티유 확인서', 'Apostille Certificate',
     'KR-MOFA', 'FOREIGNER',
     '해외 제출 한국 공문서의 진본 확인', 12, 'ACTIVE', false)
ON CONFLICT (code) DO NOTHING;

-- 3) 결과 확인
SELECT 'issuers' AS table_name, COUNT(*) AS row_count FROM tosalpee.issuers
UNION ALL
SELECT 'document_types', COUNT(*) FROM tosalpee.document_types;
