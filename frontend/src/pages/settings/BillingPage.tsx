const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: '49',
    desc: 'Perfect for small teams getting started with surveys.',
    features: ['500 responses/month', '5 active surveys', 'CSV export', 'Email support'],
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    price: '149',
    desc: 'For growing teams that need more scale and features.',
    features: ['5,000 responses/month', 'Unlimited surveys', 'Excel + CSV export', 'Priority support', 'Advanced targeting'],
    current: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: '499',
    desc: 'Full platform access for large organisations.',
    features: ['20,000 responses/month', 'Unlimited everything', 'SSO + API access', 'Dedicated support', 'SLA guarantee'],
  },
];

const INVOICES = [
  { date: 'Apr 1, 2026',  amount: '$149.00', status: 'Paid' },
  { date: 'Mar 1, 2026',  amount: '$149.00', status: 'Paid' },
  { date: 'Feb 1, 2026',  amount: '$149.00', status: 'Paid' },
  { date: 'Jan 1, 2026',  amount: '$149.00', status: 'Paid' },
];

export function BillingPage() {
  const used  = 3241;
  const quota = 5000;
  const pct   = Math.min(100, (used / quota) * 100);

  return (
    <div>
      <div className="sh"><div className="st">Billing</div></div>

      <div className="plan-grid">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`plan-card${plan.current ? ' current' : ''}`}>
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">${plan.price}<span>/mo</span></div>
            <div className="plan-desc">{plan.desc}</div>
            {plan.features.map((f) => (
              <div key={f} className="plan-feature">
                <span>✓</span>
                <span>{f}</span>
              </div>
            ))}
            {!plan.current && (
              <button className="btn btn-s btn-sm" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
                Switch to {plan.name}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="ccard" style={{ marginBottom: 20 }}>
        <div className="chead"><div className="ctitle">Usage this month</div></div>
        <div className="usage-row">
          <div className="usage-lbl">Responses</div>
          <div className="usage-bar">
            <div className="usage-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,var(--accent),var(--accent2))' }} />
          </div>
          <div className="usage-val">{used.toLocaleString()} / {quota.toLocaleString()}</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
          Resets on May 1, 2026 · {(quota - used).toLocaleString()} remaining
        </div>
      </div>

      <div className="ccard">
        <div className="chead"><div className="ctitle">Invoices</div></div>
        <div className="tw" style={{ marginBottom: 0, border: 'none' }}>
          {INVOICES.map((inv, i) => (
            <div key={i} className="inv-row">
              <div className="inv-date">{inv.date}</div>
              <span className="badge" style={{ background: 'rgba(52,211,153,.12)', color: 'var(--success)' }}>{inv.status}</span>
              <div className="inv-amt">{inv.amount}</div>
              <button className="btn btn-g btn-xs">PDF</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
