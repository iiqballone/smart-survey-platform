import { useNavigate } from 'react-router-dom';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  estimatedLOI: number;
  questionCount: number;
  suggestedTargeting: {
    country: string; ageMin: number; ageMax: number;
    gender: 'ALL' | 'MALE' | 'FEMALE'; sampleSize: number; incidenceRate: number;
  };
  questions: Array<{ text: string; type: string; required: boolean; options?: string }>;
  industry: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'brand-tracking',
    name: 'Brand Tracking',
    category: 'Brand',
    icon: '🏷️',
    description: 'Measure brand awareness, familiarity, and consideration. Ideal for quarterly tracking waves.',
    estimatedLOI: 8,
    questionCount: 6,
    industry: 'All industries',
    suggestedTargeting: { country: 'US', ageMin: 18, ageMax: 65, gender: 'ALL', sampleSize: 500, incidenceRate: 65 },
    questions: [
      { text: 'How familiar are you with [Brand]?', type: 'SINGLE_CHOICE', required: true, options: 'Very familiar\nSomewhat familiar\nHeard of it\nNever heard of it' },
      { text: 'Which of the following brands have you purchased in the last 3 months?', type: 'MULTI_CHOICE', required: true, options: '[Brand A]\n[Brand B]\n[Brand C]\nNone of these' },
      { text: 'How likely are you to consider [Brand] for your next purchase?', type: 'RATING', required: true },
      { text: 'How would you rate [Brand] on overall quality?', type: 'RATING', required: true },
      { text: 'What comes to mind when you think of [Brand]?', type: 'OPEN_TEXT', required: false },
      { text: 'How likely are you to recommend [Brand] to a friend or colleague?', type: 'NPS', required: true },
    ],
  },
  {
    id: 'nps-study',
    name: 'NPS Study',
    category: 'Loyalty',
    icon: '⭐',
    description: 'A focused 3-question NPS workflow. Measures loyalty, captures drivers, and segments promoters vs detractors.',
    estimatedLOI: 4,
    questionCount: 3,
    industry: 'All industries',
    suggestedTargeting: { country: 'US', ageMin: 18, ageMax: 65, gender: 'ALL', sampleSize: 300, incidenceRate: 70 },
    questions: [
      { text: 'How likely are you to recommend [Company] to a friend or colleague?', type: 'NPS', required: true },
      { text: 'What is the primary reason for your score?', type: 'SINGLE_CHOICE', required: true, options: 'Product quality\nCustomer service\nPrice/value\nEase of use\nOther' },
      { text: 'What could [Company] do to improve your experience?', type: 'OPEN_TEXT', required: false },
    ],
  },
  {
    id: 'product-satisfaction',
    name: 'Product Satisfaction',
    category: 'Product',
    icon: '🛍️',
    description: 'Post-purchase feedback on product quality, expectations, and intent to repurchase.',
    estimatedLOI: 7,
    questionCount: 5,
    industry: 'Retail / E-commerce',
    suggestedTargeting: { country: 'US', ageMin: 18, ageMax: 55, gender: 'ALL', sampleSize: 400, incidenceRate: 55 },
    questions: [
      { text: 'Overall, how satisfied are you with [Product]?', type: 'RATING', required: true },
      { text: 'Did [Product] meet your expectations?', type: 'SINGLE_CHOICE', required: true, options: 'Exceeded expectations\nMet expectations\nSlightly below expectations\nFar below expectations' },
      { text: 'Which features did you find most valuable?', type: 'MULTI_CHOICE', required: false, options: '[Feature A]\n[Feature B]\n[Feature C]\n[Feature D]' },
      { text: 'How likely are you to purchase [Product] again?', type: 'RATING', required: true },
      { text: 'Do you have any other feedback about your experience?', type: 'OPEN_TEXT', required: false },
    ],
  },
  {
    id: 'ad-recall',
    name: 'Ad Recall Test',
    category: 'Advertising',
    icon: '📺',
    description: 'Measure campaign awareness, message recall, and brand attribution. Compare exposed vs. control groups.',
    estimatedLOI: 9,
    questionCount: 7,
    industry: 'Media / Advertising',
    suggestedTargeting: { country: 'US', ageMin: 18, ageMax: 50, gender: 'ALL', sampleSize: 600, incidenceRate: 50 },
    questions: [
      { text: 'In the past 7 days, have you seen any advertising for [Brand]?', type: 'SINGLE_CHOICE', required: true, options: 'Yes, definitely\nYes, I think so\nNo\nNot sure' },
      { text: 'Where did you see the advertisement?', type: 'MULTI_CHOICE', required: false, options: 'TV\nOnline video\nSocial media\nOut-of-home\nPrint\nRadio' },
      { text: 'What was the main message of the advertisement?', type: 'OPEN_TEXT', required: false },
      { text: 'How relevant was the advertisement to you personally?', type: 'RATING', required: true },
      { text: 'After seeing the ad, how likely are you to consider [Brand]?', type: 'RATING', required: true },
      { text: 'Did the advertisement make you feel positively about [Brand]?', type: 'SINGLE_CHOICE', required: true, options: 'Much more positive\nSomewhat more positive\nNo change\nSomewhat more negative\nMuch more negative' },
      { text: 'How likely are you to recommend [Brand] to others?', type: 'NPS', required: true },
    ],
  },
  {
    id: 'concept-test',
    name: 'Concept Test',
    category: 'Innovation',
    icon: '💡',
    description: 'Validate a new product, service, or feature concept before investing in development.',
    estimatedLOI: 10,
    questionCount: 6,
    industry: 'Product / R&D',
    suggestedTargeting: { country: 'US', ageMin: 25, ageMax: 55, gender: 'ALL', sampleSize: 300, incidenceRate: 45 },
    questions: [
      { text: 'How appealing is this concept to you overall?', type: 'RATING', required: true },
      { text: 'How unique is this concept compared to what currently exists?', type: 'RATING', required: true },
      { text: 'How believable is it that [Company] would offer this?', type: 'RATING', required: true },
      { text: 'How likely would you be to use / purchase this?', type: 'RATING', required: true },
      { text: 'What do you like most about this concept?', type: 'OPEN_TEXT', required: false },
      { text: 'What concerns, if any, do you have about this concept?', type: 'OPEN_TEXT', required: false },
    ],
  },
  {
    id: 'ces',
    name: 'Customer Effort Score',
    category: 'Customer Experience',
    icon: '🤝',
    description: 'Measure how easy it is for customers to interact with your brand. CES strongly predicts loyalty.',
    estimatedLOI: 5,
    questionCount: 4,
    industry: 'B2C / SaaS',
    suggestedTargeting: { country: 'US', ageMin: 18, ageMax: 65, gender: 'ALL', sampleSize: 250, incidenceRate: 60 },
    questions: [
      { text: '[Company] made it easy for me to handle my issue.', type: 'RATING', required: true },
      { text: 'How many interactions did it take to resolve your issue?', type: 'SINGLE_CHOICE', required: true, options: '1 — Resolved first time\n2–3 interactions\n4–5 interactions\nMore than 5' },
      { text: 'What could have made your experience easier?', type: 'OPEN_TEXT', required: false },
      { text: 'How likely are you to continue using [Company] services?', type: 'RATING', required: true },
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Brand: '#818CF8', Loyalty: 'var(--accent)', Product: 'var(--success)',
  Advertising: '#0891b2', Innovation: 'var(--warning)', 'Customer Experience': '#ec4899',
};

export function TemplatesPage() {
  const navigate = useNavigate();

  const useTemplate = (t: Template) => {
    navigate('/surveys/new', {
      state: {
        template: {
          title:       t.name + ' — [Your Brand]',
          description: t.description,
          targeting:   t.suggestedTargeting,
          questions:   t.questions,
        },
      },
    });
  };

  return (
    <div>
      <div className="sh">
        <div>
          <div className="st">Survey Templates</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
            Start with a proven framework — edit questions, adjust targeting, publish in minutes
          </div>
        </div>
        <button className="btn btn-s btn-sm" onClick={() => navigate('/surveys/new')}>
          Start blank
        </button>
      </div>

      <div className="template-grid">
        {TEMPLATES.map((t) => {
          const catColor = CATEGORY_COLORS[t.category] ?? 'var(--muted)';
          return (
            <div key={t.id} className="template-card">
              <div className="tc-header">
                <div className="tc-icon">{t.icon}</div>
                <span className="tc-cat" style={{ background: `${catColor}20`, color: catColor }}>
                  {t.category}
                </span>
              </div>

              <div className="tc-name">{t.name}</div>
              <div className="tc-desc">{t.description}</div>

              <div className="tc-meta">
                <span>📝 {t.questionCount} questions</span>
                <span>⏱ ~{t.estimatedLOI} min</span>
                <span>🌍 {t.suggestedTargeting.country}</span>
              </div>

              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 14 }}>
                {t.industry}
              </div>

              <button className="btn btn-p btn-sm tc-btn" onClick={() => useTemplate(t)}>
                Use this template
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
