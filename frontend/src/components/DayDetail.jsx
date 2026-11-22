import { formatDayLabel, money, netClass, signedMoney } from "../format.js";
import SideTxn from "./SideTxn.jsx";

export default function DayDetail({ cal, selectedDate }) {
  const day = cal.days.find(d => d.date === selectedDate);
  if (!day || day.count === 0) {
    return (
      <>
        <div className="panel-label">Day details</div>
        <div className="day-detail-header">{formatDayLabel(selectedDate)}</div>
        <div className="day-detail-empty">No spending on this day.</div>
      </>
    );
  }
  return (
    <>
      <div className="panel-label">Day details</div>
      <div className="day-detail-header">{formatDayLabel(day.date)}</div>
      <div className="calendar-month-stats" style={{ margin: "0 0 0.75rem" }}>
        <span>Spent <strong>{money(day.spent)}</strong></span>
        {day.credits ? <span>Credits <strong className="amount-credit">{signedMoney(day.credits)}</strong></span> : null}
        <span>Net <strong className={netClass(day.net)}>{signedMoney(day.net)}</strong></span>
      </div>
      {day.transactions.map((t, i) => <SideTxn key={i} t={t} />)}
    </>
  );
}
