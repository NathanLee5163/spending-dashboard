import { amountClass, signedMoney } from "../format.js";

export default function SideTxn({ t }) {
  return (
    <div className="side-txn">
      <div className="side-txn-dot" style={{ background: t.color || "#64748b" }}></div>
      <div className="side-txn-info">
        <div className="side-txn-name">{t.description}</div>
        <div className="side-txn-meta">{t.category}{t.is_credit ? " · Credit" : ""}{t.account ? " · " + t.account : ""}</div>
      </div>
      <div className={`side-txn-amount ${amountClass(t.amount)}`}>{signedMoney(t.amount)}</div>
    </div>
  );
}
