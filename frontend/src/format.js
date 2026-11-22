export const money = (n) => "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const signedMoney = (n) => {
  const value = money(n);
  if (n > 0) return "+" + value;
  if (n < 0) return "-" + value;
  return value;
};

export const amountClass = (n) => {
  if (n > 0) return "amount-credit";
  if (n < 0) return "amount-charge";
  return "";
};

export const netClass = (n) => (n > 0 ? "amount-net-pos" : n < 0 ? "amount-net-neg" : "");

export function shortName(name) {
  if (name.length <= 28) return name;
  return name.slice(0, 25) + "...";
}

export function formatDayLabel(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
