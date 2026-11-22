import { useState } from "react";
import { money, netClass, signedMoney } from "../format.js";
import DayDetail from "./DayDetail.jsx";

function heatColor(total, maxTotal) {
  if (total <= 0) return "rgba(255,255,255,0.02)";
  const intensity = Math.min(total / maxTotal, 1);
  const alpha = 0.12 + intensity * 0.55;
  return `rgba(91, 141, 239, ${alpha})`;
}

export default function SpendingCalendar({ cal, index }) {
  // Defaults to the latest day with spending, else the first day of the month.
  const [selectedDate, setSelectedDate] = useState(() => {
    const withSpend = [...cal.days].reverse().find(d => d.count > 0);
    return withSpend ? withSpend.date : cal.days[0].date;
  });
  const maxDayTotal = Math.max(...cal.days.map(d => d.total), 1);
  const calNet = cal.net ?? -(cal.spent ?? cal.total);

  const cells = [];
  for (let i = 0; i < cal.first_weekday; i++) {
    cells.push(<div key={"empty-" + i} className="cal-day cal-empty"></div>);
  }
  for (const day of cal.days) {
    const isSelected = day.date === selectedDate;
    cells.push(
      <div
        key={day.date}
        className={"cal-day" + (isSelected ? " cal-selected" : "")}
        data-date={day.date}
        style={{ background: heatColor(day.total, maxDayTotal) }}
        onClick={() => setSelectedDate(day.date)}
      >
        <span className="cal-day-num">{day.day}</span>
        <span className={"cal-day-amount" + (day.total > 0 ? "" : " empty")}>{day.total > 0 ? money(day.total) : "—"}</span>
      </div>
    );
  }

  return (
    <section className="calendar-section">
      <div className="calendar-top">
        <div className="calendar-title-block">
          <div className="spent-label">Spent in {cal.short_label}</div>
          <div className="spent-total">{money(cal.spent ?? cal.total)}</div>
          <div className="calendar-month-stats">
            <span>Credits <strong className="amount-credit">{signedMoney(cal.credits || 0)}</strong></span>
            <span>Net <strong className={netClass(calNet)}>{signedMoney(calNet)}</strong></span>
          </div>
        </div>
      </div>
      <div className="calendar-layout">
        <div>
          <div className="calendar-weekdays">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span>
            <span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div className="calendar-grid" id={`calendarGrid-${index}`}>
            {cells}
          </div>
        </div>
        <div className="calendar-side">
          <div className="day-detail-panel" id={`dayDetail-${index}`}>
            <DayDetail cal={cal} selectedDate={selectedDate} />
          </div>
        </div>
      </div>
    </section>
  );
}
