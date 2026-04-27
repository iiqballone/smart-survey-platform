-- ─── Clients ──────────────────────────────────────────────────────────────────

INSERT INTO clients (id, name, contact_email, plan, monthly_response_quota, used_response_count, active, created_at) VALUES
  ('9f4a08bc-ad29-48b9-9be7-d9dac6caf813', 'Acme Corporation',   'jane@acmecorp.com',   'PROFESSIONAL', 5000,  3241, TRUE,  '2026-01-01T00:00:00'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Globex Research',   'ops@globex.io',       'ENTERPRISE',   20000, 8100, TRUE,  '2026-02-01T00:00:00'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Initech Analytics', 'admin@initech.com',   'STARTER',      500,   210,  TRUE,  '2026-03-15T00:00:00'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Umbrella Insights', 'survey@umbrella.com', 'PROFESSIONAL', 5000,  0,    FALSE, '2026-04-01T00:00:00');

-- ─── Client users (team) ──────────────────────────────────────────────────────

INSERT INTO client_users (id, client_id, email, role, created_at) VALUES
  ('aa000000-0000-0000-0000-000000000001', '9f4a08bc-ad29-48b9-9be7-d9dac6caf813', 'alice@acme.com', 'OWNER',  '2026-01-10T00:00:00'),
  ('aa000000-0000-0000-0000-000000000002', '9f4a08bc-ad29-48b9-9be7-d9dac6caf813', 'bob@acme.com',   'ADMIN',  '2026-02-01T00:00:00'),
  ('aa000000-0000-0000-0000-000000000003', '9f4a08bc-ad29-48b9-9be7-d9dac6caf813', 'carol@acme.com', 'VIEWER', '2026-03-15T00:00:00');

-- ─── Surveys ──────────────────────────────────────────────────────────────────

INSERT INTO surveys (id, client_id, title, status, country, survey_url, fusion_survey_id, fusion_entry_url,
                     completes_required, completed_count, screenout_count,
                     loi, cpi_min, cpi_max, callback_url, created_at, published_at, closed_at) VALUES

  ('11111111-1111-1111-1111-111111111111',
   '9f4a08bc-ad29-48b9-9be7-d9dac6caf813',
   'Q2 Brand Perception Study', 'LIVE', 'US',
   'https://www.surveymonkey.com/r/ABC123?rid={rid}',
   'FS-1A2B3C4D', 'https://fusion.spectrumsurveys.com/start-universal/1A2B3C4D',
   500, 312, 87, 10, 2.72, 3.68,
   'https://acmecorp.com/webhooks/surveybridge',
   '2026-04-02T09:00:00', '2026-04-02T11:00:00', NULL),

  ('22222222-2222-2222-2222-222222222222',
   '9f4a08bc-ad29-48b9-9be7-d9dac6caf813',
   'Product Satisfaction – Spring ''26', 'LIVE', 'GB',
   'https://www.surveymonkey.com/r/DEF456?rid={rid}',
   'FS-2B3C4D5E', 'https://fusion.spectrumsurveys.com/start-universal/2B3C4D5E',
   200, 88, 22, 8, 3.83, 5.18,
   'https://acmecorp.com/webhooks/surveybridge',
   '2026-04-10T09:00:00', '2026-04-10T10:00:00', NULL),

  ('33333333-3333-3333-3333-333333333333',
   '9f4a08bc-ad29-48b9-9be7-d9dac6caf813',
   'Competitor Awareness Survey', 'DRAFT', 'US',
   'https://www.surveymonkey.com/r/GHI789?rid={rid}',
   NULL, NULL,
   300, 0, 0, 12, 2.10, 2.84,
   'https://acmecorp.com/webhooks/surveybridge',
   '2026-04-18T09:00:00', NULL, NULL),

  ('44444444-4444-4444-4444-444444444444',
   '9f4a08bc-ad29-48b9-9be7-d9dac6caf813',
   'Ad Recall Test – Campaign V2', 'PAUSED', 'CA',
   'https://www.surveymonkey.com/r/JKL012?rid={rid}',
   'FS-4D5E6F7G', 'https://fusion.spectrumsurveys.com/start-universal/4D5E6F7G',
   400, 145, 61, 15, 2.98, 4.03,
   'https://acmecorp.com/webhooks/surveybridge',
   '2026-03-15T09:00:00', '2026-03-15T12:00:00', NULL),

  ('55555555-5555-5555-5555-555555555555',
   '9f4a08bc-ad29-48b9-9be7-d9dac6caf813',
   'NPS Benchmark 2025', 'COMPLETED', 'AU',
   'https://www.surveymonkey.com/r/MNO345?rid={rid}',
   'FS-5E6F7G8H', 'https://fusion.spectrumsurveys.com/start-universal/5E6F7G8H',
   600, 600, 120, 7, 4.08, 5.52,
   'https://acmecorp.com/webhooks/surveybridge',
   '2026-01-05T09:00:00', '2026-01-05T10:00:00', '2026-02-15T00:00:00');

-- ─── Survey responses (for Q2 Brand Perception Study) ────────────────────────

INSERT INTO survey_responses (id, survey_id, respondent_id, fusion_survey_id, event_type, cpi, occurred_at) VALUES
  ('bb000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'R-anon-001', 'FS-1A2B3C4D', 'COMPLETE',  3.20, '2026-04-25T09:12:00'),
  ('bb000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'R-anon-002', 'FS-1A2B3C4D', 'COMPLETE',  3.15, '2026-04-25T08:55:00'),
  ('bb000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'R-anon-003', 'FS-1A2B3C4D', 'SCREENOUT', NULL, '2026-04-24T22:44:00'),
  ('bb000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'R-anon-004', 'FS-1A2B3C4D', 'COMPLETE',  3.50, '2026-04-24T21:30:00'),
  ('bb000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'R-anon-005', 'FS-1A2B3C4D', 'COMPLETE',  2.90, '2026-04-24T19:08:00'),
  ('bb000000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'R-anon-006', 'FS-2B3C4D5E', 'COMPLETE',  4.10, '2026-04-23T14:20:00'),
  ('bb000000-0000-0000-0000-000000000007', '22222222-2222-2222-2222-222222222222', 'R-anon-007', 'FS-2B3C4D5E', 'SCREENOUT', NULL, '2026-04-23T13:45:00'),
  ('bb000000-0000-0000-0000-000000000008', '44444444-4444-4444-4444-444444444444', 'R-anon-008', 'FS-4D5E6F7G', 'COMPLETE',  3.75, '2026-04-10T11:30:00'),
  ('bb000000-0000-0000-0000-000000000009', '55555555-5555-5555-5555-555555555555', 'R-anon-009', 'FS-5E6F7G8H', 'COMPLETE',  5.10, '2026-02-14T16:00:00'),
  ('bb000000-0000-0000-0000-000000000010', '55555555-5555-5555-5555-555555555555', 'R-anon-010', 'FS-5E6F7G8H', 'COMPLETE',  4.80, '2026-02-14T15:30:00');

-- ─── Notifications ────────────────────────────────────────────────────────────

INSERT INTO notifications (id, client_id, type, title, body, link, read, created_at) VALUES
  ('cc000000-0000-0000-0000-000000000001',
   '9f4a08bc-ad29-48b9-9be7-d9dac6caf813',
   'SUCCESS', 'Survey quota reached',
   'NPS Benchmark 2025 collected all 600 responses.',
   '/surveys/55555555-5555-5555-5555-555555555555/reports',
   FALSE, NOW() - INTERVAL '12 minutes'),

  ('cc000000-0000-0000-0000-000000000002',
   '9f4a08bc-ad29-48b9-9be7-d9dac6caf813',
   'INFO', 'Milestone — 50% complete',
   'Q2 Brand Perception Study hit 250/500 responses.',
   '/surveys/11111111-1111-1111-1111-111111111111',
   FALSE, NOW() - INTERVAL '2 hours'),

  ('cc000000-0000-0000-0000-000000000003',
   '9f4a08bc-ad29-48b9-9be7-d9dac6caf813',
   'WARNING', 'Quota at 78%',
   'You have used 3,900 / 5,000 monthly responses. Upgrade to avoid limits.',
   '/billing',
   FALSE, NOW() - INTERVAL '5 hours'),

  ('cc000000-0000-0000-0000-000000000004',
   '9f4a08bc-ad29-48b9-9be7-d9dac6caf813',
   'WARNING', 'Fusion survey paused',
   'Ad Recall Test – Campaign V2 paused by Fusion: low IR detected.',
   '/surveys/44444444-4444-4444-4444-444444444444',
   TRUE, NOW() - INTERVAL '1 day'),

  ('cc000000-0000-0000-0000-000000000005',
   '9f4a08bc-ad29-48b9-9be7-d9dac6caf813',
   'INFO', 'Team member joined',
   'bob@acme.com accepted your invitation as Viewer.',
   '/team',
   TRUE, NOW() - INTERVAL '2 days');
