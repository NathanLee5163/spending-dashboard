import useDropTarget from "../hooks/useDropTarget.js";
import CombinedItem from "./CombinedItem.jsx";
import FileItem from "./FileItem.jsx";
import { DocumentIcon, UploadIcon } from "./Icons.jsx";

export default function Sidebar({ files, activeId, combinedData, onSelect, onRemove, onAddClick, onDropFiles }) {
  const [dragover, dropHandlers] = useDropTarget(onDropFiles);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">💳</div>
          <h1>Finance Organizer</h1>
        </div>
        <p>Works with Chase, BofA, Capital One &amp; more</p>
      </div>

      <div className={"file-list" + (dragover ? " dragover" : "")} id="fileList" {...dropHandlers}>
        <div className="sidebar-drop-overlay">
          <UploadIcon />
          <span>Drop CSV to add</span>
        </div>
        <div className={"sidebar-empty" + (files.length ? " hidden" : "")} id="sidebarEmpty">
          <DocumentIcon />
          <div>No files yet</div>
          <div className="drop-hint">Drag &amp; drop a CSV here</div>
        </div>

        {files.length > 0 && (
          <>
            <div className="file-list-label">Your files</div>
            {files.map(entry => (
              <FileItem
                key={entry.id}
                entry={entry}
                active={entry.id === activeId}
                onSelect={() => onSelect(entry.id)}
                onRemove={() => onRemove(entry.id)}
              />
            ))}
            {files.length > 1 && (
              <CombinedItem
                active={activeId === "combined"}
                combinedData={combinedData}
                onSelect={() => onSelect("combined")}
              />
            )}
            <div className="sidebar-drop-prompt">Drag &amp; drop another CSV here</div>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <button className="add-file-btn" id="addFileBtn" onClick={onAddClick}>
          <span>+</span> Add CSV file
        </button>
      </div>
    </aside>
  );
}
