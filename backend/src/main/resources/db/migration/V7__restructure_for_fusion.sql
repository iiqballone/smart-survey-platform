-- Surveys: rename columns
ALTER TABLE surveys RENAME COLUMN target_response_count   TO completes_required;
ALTER TABLE surveys RENAME COLUMN targeting_country       TO country;
ALTER TABLE surveys RENAME COLUMN received_response_count TO completed_count;

-- Surveys: drop Dynata-specific columns
ALTER TABLE surveys DROP COLUMN IF EXISTS dynata_project_id;
ALTER TABLE surveys DROP COLUMN IF EXISTS targeting_sample_size;
ALTER TABLE surveys DROP COLUMN IF EXISTS targeting_age_min;
ALTER TABLE surveys DROP COLUMN IF EXISTS targeting_age_max;
ALTER TABLE surveys DROP COLUMN IF EXISTS targeting_gender;
ALTER TABLE surveys DROP COLUMN IF EXISTS targeting_incidence_rate;

-- Surveys: add SurveyMonkey + Fusion columns
ALTER TABLE surveys ADD COLUMN survey_url       TEXT;
ALTER TABLE surveys ADD COLUMN fusion_survey_id VARCHAR(255);
ALTER TABLE surveys ADD COLUMN fusion_entry_url TEXT;
ALTER TABLE surveys ADD COLUMN loi              INT          NOT NULL DEFAULT 10;
ALTER TABLE surveys ADD COLUMN cpi_min          NUMERIC(10,2);
ALTER TABLE surveys ADD COLUMN cpi_max          NUMERIC(10,2);
ALTER TABLE surveys ADD COLUMN callback_url     TEXT;
ALTER TABLE surveys ADD COLUMN screenout_count  INT          NOT NULL DEFAULT 0;

-- Responses: rename columns
ALTER TABLE survey_responses RENAME COLUMN dynata_respondent_id TO respondent_id;
ALTER TABLE survey_responses RENAME COLUMN completed_at         TO occurred_at;

-- Responses: drop demographic / timing columns we no longer store
ALTER TABLE survey_responses DROP COLUMN IF EXISTS country;
ALTER TABLE survey_responses DROP COLUMN IF EXISTS age_group;
ALTER TABLE survey_responses DROP COLUMN IF EXISTS gender;
ALTER TABLE survey_responses DROP COLUMN IF EXISTS duration_seconds;

-- Responses: add Fusion event columns
ALTER TABLE survey_responses ADD COLUMN event_type       VARCHAR(50) NOT NULL DEFAULT 'COMPLETE';
ALTER TABLE survey_responses ADD COLUMN fusion_survey_id VARCHAR(255);
ALTER TABLE survey_responses ADD COLUMN cpi              NUMERIC(10,2);

-- Drop tables that are no longer used (answers stored in SurveyMonkey)
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS question_options;
DROP TABLE IF EXISTS questions;
