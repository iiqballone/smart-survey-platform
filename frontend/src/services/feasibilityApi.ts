/**
 * Dynata Feasibility & Pricing API
 *
 * PRODUCTION: Replace the mock below with a real call to Dynata's Demand API:
 *   POST https://api.dynata.com/v1/demand/feasibility
 *   Headers: Authorization: Bearer <DYNATA_TOKEN>
 *   Body: { study_type, country, respondent_requirements: { age, gender, incidence_rate },
 *           target_completes, survey_loi }
 *
 * The real endpoint returns: estimated_cpi (USD), feasible_completes, estimated_field_time_days.
 * When access is confirmed, set VITE_DYNATA_FEASIBILITY_ENABLED=true and swap the function body.
 */

export interface FeasibilityRequest {
  country: string;
  ageMin: number;
  ageMax: number;
  gender: 'ALL' | 'MALE' | 'FEMALE';
  sampleSize: number;
  incidenceRate: number;
  questionCount: number; // used to estimate LOI
}

export interface FeasibilityResult {
  feasible: boolean;
  panelSize: number;          // eligible Dynata panelists
  estimatedCompletes: number; // achievable within 30 days
  cpiMin: number;             // USD per response (lower bound)
  cpiMax: number;             // USD per response (upper bound)
  totalCostMin: number;
  totalCostMax: number;
  estimatedLOI: number;       // minutes
  estimatedFieldDays: number;
  warnings: string[];
  source: 'DYNATA_API' | 'MOCK_MATRIX';
}

// ── Mock pricing matrix ─────────────────────────────────────────────────────
// Indicative CPIs negotiated in typical Dynata commercial agreements.
// Replace with live API when VITE_DYNATA_FEASIBILITY_ENABLED=true.

const BASE_CPI: Record<string, number> = {
  US: 3.20, GB: 4.50, AU: 4.80, CA: 3.80,
  DE: 5.20, FR: 5.00, JP: 6.00,
};
const DEFAULT_CPI = 3.50;

// Rough Dynata panel sizes (active respondents, millions)
const PANEL_SIZE_M: Record<string, number> = {
  US: 5.0, GB: 1.2, AU: 0.8, CA: 0.9,
  DE: 1.5, FR: 1.2, JP: 1.8,
};
const DEFAULT_PANEL_M = 0.5;

function irMultiplier(ir: number): number {
  if (ir <= 15) return 3.8;
  if (ir <= 30) return 2.2;
  if (ir <= 50) return 1.5;
  if (ir <= 70) return 1.15;
  return 0.95;
}

function ageMultiplier(ageMin: number, ageMax: number): number {
  const span = ageMax - ageMin;
  const midpoint = (ageMin + ageMax) / 2;
  const ageFactor = midpoint >= 55 ? 1.7 : midpoint >= 45 ? 1.25 : 1.0;
  const spanFactor = span < 10 ? 1.4 : span < 20 ? 1.15 : 1.0;
  return ageFactor * spanFactor;
}

function loiMinutes(questionCount: number): number {
  // ~45s per close-ended question; 90s for open text (assume 30% open text)
  const avgSeconds = questionCount * (0.7 * 45 + 0.3 * 90);
  return Math.round(avgSeconds / 60);
}

function loiMultiplier(loi: number): number {
  if (loi < 5)  return 0.75;
  if (loi < 10) return 1.0;
  if (loi < 15) return 1.35;
  return 1.75;
}

// ── Main function ───────────────────────────────────────────────────────────

export function calcFeasibility(req: FeasibilityRequest): FeasibilityResult {
  const baseCPI    = BASE_CPI[req.country]    ?? DEFAULT_CPI;
  const panelBaseM = PANEL_SIZE_M[req.country] ?? DEFAULT_PANEL_M;

  const irMult    = irMultiplier(req.incidenceRate);
  const ageMult   = ageMultiplier(req.ageMin, req.ageMax);
  const genderMult= req.gender !== 'ALL' ? 1.10 : 1.0;
  const loi       = loiMinutes(Math.max(req.questionCount, 1));
  const loiMult   = loiMultiplier(loi);

  const cpiBase = baseCPI * irMult * ageMult * genderMult * loiMult;
  const cpiMin  = Math.round(cpiBase * 0.85 * 100) / 100;
  const cpiMax  = Math.round(cpiBase * 1.15 * 100) / 100;

  // Eligible panelists: panel × IR% × gender fraction
  const genderFraction = req.gender !== 'ALL' ? 0.48 : 1.0;
  const panelSize = Math.round(
    panelBaseM * 1_000_000 * (req.incidenceRate / 100) * genderFraction *
    Math.min(1, (req.ageMax - req.ageMin) / 50),
  );

  // Daily capacity (Dynata typically fills ~3-5% of eligible per day for standard IR)
  const dailyRate = Math.max(1, panelSize * 0.04);
  const estimatedFieldDays = Math.ceil(req.sampleSize / dailyRate);
  const estimatedCompletes = Math.round(Math.min(panelSize * 0.7, req.sampleSize * 1.5));

  const feasible = panelSize >= req.sampleSize * 0.5 && req.incidenceRate >= 5;

  const warnings: string[] = [];
  if (req.incidenceRate < 15)
    warnings.push('Very low incidence rate (<15%). Expect significantly higher CPI and longer field time.');
  if (req.incidenceRate < 30)
    warnings.push('Low incidence rate. Consider broadening targeting to reduce cost.');
  if (estimatedFieldDays > 14)
    warnings.push(`Estimated ${estimatedFieldDays} days to complete. Shorter surveys or broader targeting can speed this up.`);
  if (req.ageMax - req.ageMin < 10)
    warnings.push('Narrow age range increases cost. Consider widening by ±5 years.');
  if (loi > 12)
    warnings.push(`Estimated survey length is ${loi} min. Above 10 min significantly increases drop-off and CPI.`);

  return {
    feasible,
    panelSize,
    estimatedCompletes,
    cpiMin,
    cpiMax,
    totalCostMin: Math.round(cpiMin * req.sampleSize),
    totalCostMax: Math.round(cpiMax * req.sampleSize),
    estimatedLOI: loi,
    estimatedFieldDays,
    warnings,
    source: 'MOCK_MATRIX',
  };
}
