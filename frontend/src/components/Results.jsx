import { memo } from "react";
import { amountClass, money, netClass, signedMoney } from "../format.js";
import CatCard from "./CatCard.jsx";
import SpendingCalendar from "./SpendingCalendar.jsx";

function Results({ data }) {
  const maxMonthTotal = Math.max(...data.monthly.map(m => m.spent ?? m.total), 1);
  const net = data.net_total ?? -(data.spent_total ?? data.grand_total);

  return (
    <>
      <div className="summary-cards">
        <div className="stat-card" style={{ "--card-accent": "#f87171" }}>
          <div className="label">Total Spent</div>
          <div className="value">{money(data.spent_total ?? data.grand_total)}</div>
        </div>
        <div className="stat-card" style={{ "--card-accent": "#34d399" }}>
          <div className="label">Credits / Refunds</div>
          <div className="value">{signedMoney(data.credits_total || 0)}</div>
        </div>
        <div className="stat-card" style={{ "--card-accent": "#5b8def" }}>
          <div className="label">Net</div>
          <div className={`value ${netClass(net)}`}>{signedMoney(net)}</div>
        </div>
        <div className="stat-card" style={{ "--card-accent": "#a78bfa" }}>
          <div className="label">Charges</div>
          <div className="value">{data.charge_count ?? data.transaction_count}</div>
        </div>
      </div>

      <section>
        <div className="section-header">
          <h3>Monthly Summary</h3>
        </div>
        <div className="month-grid">
          {data.monthly.map((m, mi) => {
            const monthNet = m.net ?? -(m.spent ?? m.total);
            return (
              <div className="month-card" key={mi}>
                <div className="month-card-header">
                  <span className="month-name">{m.month}</span>
                  <div className="month-metrics">
                    <span>Spent <strong>{money(m.spent ?? m.total)}</strong></span>
                    <span>Credits <strong className="amount-credit">{signedMoney(m.credits || 0)}</strong></span>
                    <span>Net <strong className={netClass(monthNet)}>{signedMoney(monthNet)}</strong></span>
                  </div>
                </div>
                <div className="month-bars">
                  {m.categories.map((c, ci) => (
                    <div className="bar-row" key={ci}>
                      <span className="bar-label">{c.category}</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${(c.total / maxMonthTotal * 100).toFixed(1)}%`, background: c.color }}></div>
                      </div>
                      <span className="bar-amount">{money(c.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="section-header">
          <h3>Charges by Category</h3>
          <span className="badge">Negative amounts</span>
        </div>
        <div className="category-grid">
          {data.categories.map((cat, i) => (
            <CatCard
              key={i}
              defaultOpen={i === 0}
              data-cat=""
              header={
                <>
                  <div className="cat-dot" style={{ background: cat.color }}></div>
                  <div className="cat-info">
                    <div className="cat-name">{cat.name}</div>
                    <div className="cat-meta">{cat.count} charge{cat.count !== 1 ? "s" : ""}</div>
                  </div>
                  <span className="cat-total amount-charge">-{money(cat.total)}</span>
                  <span className="cat-chevron">▼</span>
                </>
              }
            >
              {cat.transactions.map((t, ti) => (
                <div className="txn-row" key={ti}>
                  <span className="txn-date">{t.date}</span>
                  <span>{t.description}</span>
                  <span className={`txn-amount ${amountClass(t.amount)}`}>{signedMoney(t.amount)}</span>
                  {t.account || t.source ? <span className="txn-sub">{[t.account, t.source].filter(Boolean).join(" · ")}</span> : null}
                </div>
              ))}
            </CatCard>
          ))}
        </div>
      </section>

      {data.credits && data.credits.length ? (
        <section>
          <div className="section-header">
            <h3>Credits &amp; Refunds</h3>
            <span className="badge">Positive amounts · {signedMoney(data.credits_total || 0)}</span>
          </div>
          <div className="category-grid">
            <CatCard
              defaultOpen={true}
              header={
                <>
                  <div className="cat-dot" style={{ background: "#34d399" }}></div>
                  <div className="cat-info">
                    <div className="cat-name">Incoming credits</div>
                    <div className="cat-meta">{data.credit_count} transaction{data.credit_count !== 1 ? "s" : ""}</div>
                  </div>
                  <span className="cat-total amount-credit">{signedMoney(data.credits_total || 0)}</span>
                  <span className="cat-chevron">▼</span>
                </>
              }
            >
              {data.credits.map((t, ti) => (
                <div className="txn-row" key={ti}>
                  <span className="txn-date">{t.date}</span>
                  <span>{t.description}</span>
                  <span className="txn-amount amount-credit">{signedMoney(t.amount)}</span>
                  <span className="txn-sub">{[t.category, t.account, t.source].filter(Boolean).join(" · ")}</span>
                </div>
              ))}
            </CatCard>
          </div>
        </section>
      ) : null}

      {data.unused_categories && data.unused_categories.length ? (
        <section>
          <div className="section-header">
            <h3>Other Categories</h3>
            <span className="badge">Not used this period</span>
          </div>
          <div className="unused-grid">
            {data.unused_categories.map((cat, i) => (
              <div className="unused-chip" key={i}>
                <div className="cat-dot" style={{ background: cat.color }}></div>
                {cat.name}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {(data.calendars || []).map((cal, i) => (
        <SpendingCalendar key={i} cal={cal} index={i} />
      ))}
    </>
  );
}

export default memo(Results);
