import { money } from "../format.js";

export default function CombinedItem({ active, combinedData, onSelect }) {
  const total = combinedData ? money(combinedData.spent_total ?? combinedData.grand_total) : "...";
  const count = combinedData ? combinedData.transaction_count + " txns" : "";
  return (
    <div className={"file-item combined" + (active ? " active" : "")} onClick={onSelect}>
      <div className="file-icon">📊</div>
      <div className="file-info">
        <div className="file-name">All combined</div>
        <div className="file-meta">{total}{count ? " spent · " + count : ""}</div>
      </div>
    </div>
  );
}
