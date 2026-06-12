import React, { useState } from "react";
import "./style.css";

const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// markedDates: Set de chaves "YYYY-MM-DD" com agendamentos (recebem um ponto)
function MiniCalendar({ selectedDate, onSelectDate, markedDates }) {
  const base = selectedDate || new Date();
  const [viewYear, setViewYear] = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth());

  const startWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrevMonth - i,
      outside: true,
      date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i),
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, outside: false, date: new Date(viewYear, viewMonth, d) });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({
      day: nextDay,
      outside: true,
      date: new Date(viewYear, viewMonth + 1, nextDay),
    });
    nextDay++;
  }

  const todayKey = toDateKey(new Date());
  const selectedKey = selectedDate ? toDateKey(selectedDate) : null;

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className="mini-cal">
      <div className="mini-cal-header">
        <button type="button" className="mini-cal-nav" onClick={goPrevMonth}>
          &#8249;
        </button>
        <span className="mini-cal-month">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button type="button" className="mini-cal-nav" onClick={goNextMonth}>
          &#8250;
        </button>
      </div>

      <div className="mini-cal-grid mini-cal-weekdays">
        {WEEK_DAYS.map((d, i) => (
          <span key={i} className="mini-cal-weekday">
            {d}
          </span>
        ))}
      </div>

      <div className="mini-cal-grid">
        {cells.map((cell, i) => {
          const key = toDateKey(cell.date);
          const classNames = ["mini-cal-day"];
          if (cell.outside) classNames.push("outside");
          if (key === todayKey) classNames.push("today");
          if (selectedKey && key === selectedKey) classNames.push("selected");
          if (markedDates && markedDates.has(key)) classNames.push("marked");
          return (
            <button
              key={i}
              type="button"
              className={classNames.join(" ")}
              onClick={() => onSelectDate && onSelectDate(cell.date)}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MiniCalendar;
