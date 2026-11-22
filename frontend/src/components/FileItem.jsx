import { money, shortName } from "../format.js";

export default function FileItem({ entry, active, onSelect, onRemove }) {
  return (
    <div className={"file-item" + (active ? " active" : "")}>
      <div className="file-icon" onClick={onSelect}>📄</div>
      <div className="file-info" onClick={onSelect}>
        <div className="file-name" title={entry.name}>{shortName(entry.name)}</div>
        <div className="file-meta">{entry.data ? money(entry.data.spent_total ?? entry.data.grand_total) + " spent · " + entry.data.transaction_count + " txns" : "Loading..."}</div>
      </div>
      <button
        className="file-remove"
        title="Remove"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >×</button>
    </div>
  );
}
