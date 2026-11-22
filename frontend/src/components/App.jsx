import { useRef, useState } from "react";
import { shortName } from "../format.js";
import useDropTarget from "../hooks/useDropTarget.js";
import { UploadIcon } from "./Icons.jsx";
import Results from "./Results.jsx";
import Sidebar from "./Sidebar.jsx";

const INITIAL_TITLE = "Upload transactions";
const INITIAL_SUBTITLE = "Drop a CSV from any bank or budgeting app";

export default function App() {
  // The same mutable model the original script kept in top-level variables. It lives in a ref,
  // not state, because the async upload and re-analyze loops read the latest values after each await.
  const store = useRef({ files: [], activeId: null, combinedData: null, nextId: 1 }).current;
  const expensesOnlyRef = useRef(true);
  const renderCount = useRef(0);
  const fileInputRef = useRef(null);

  // What is on screen. It changes only where the original script updated the DOM.
  const [sidebar, setSidebar] = useState({ files: [], activeId: null, combinedData: null });
  const [header, setHeader] = useState({ title: INITIAL_TITLE, subtitle: INITIAL_SUBTITLE });
  const [view, setView] = useState(null);
  const [resultsHidden, setResultsHidden] = useState(true);
  const [dropZoneHidden, setDropZoneHidden] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expensesOnly, setExpensesOnly] = useState(true);
  const [dropZoneDragover, dropZoneHandlers] = useDropTarget(addFiles);

  function showError(msg) {
    setError(msg);
  }

  function clearError() {
    setError(null);
  }

  function renderSidebar() {
    setSidebar({
      files: store.files.map(({ id, name, data }) => ({ id, name, data })),
      activeId: store.activeId,
      combinedData: store.combinedData,
    });
  }

  async function analyzeFile(file) {
    const form = new FormData();
    form.append("file", file);
    form.append("expenses_only", expensesOnlyRef.current ? "true" : "false");
    const res = await fetch("/api/analyze", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Analysis failed");
    return data;
  }

  async function analyzeCombined() {
    const form = new FormData();
    store.files.forEach(entry => form.append("files", entry.file));
    form.append("expenses_only", expensesOnlyRef.current ? "true" : "false");
    const res = await fetch("/api/analyze-multiple", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Analysis failed");
    return data;
  }

  async function addFiles(fileList) {
    clearError();
    const csvFiles = [...fileList].filter(f => f.name.toLowerCase().endsWith(".csv"));
    if (!csvFiles.length) {
      showError("Please upload .csv files only.");
      return;
    }

    const isFirstUpload = store.files.length === 0;

    setLoading(true);
    if (isFirstUpload) {
      setResultsHidden(true);
      setDropZoneHidden(true);
    }

    try {
      for (const file of csvFiles) {
        if (store.files.some(entry => entry.name === file.name)) continue;

        const id = store.nextId++;
        const entry = { id, name: file.name, file, data: null };
        store.files.push(entry);
        renderSidebar();
        entry.data = await analyzeFile(file);
        renderSidebar();
        selectFile(id);
      }

      if (store.files.length > 1) {
        store.combinedData = await analyzeCombined();
        if (store.activeId === "combined") renderResults(store.combinedData, "All combined");
        renderSidebar();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function removeFile(id) {
    store.files = store.files.filter(f => f.id !== id);
    if (store.activeId === id) {
      store.activeId = store.files.length ? store.files[0].id : null;
      if (store.files.length > 1) store.combinedData = null;
    }
    if (store.files.length <= 1) {
      store.combinedData = null;
      if (store.activeId === "combined") store.activeId = store.files[0]?.id || null;
    }
    if (store.files.length === 0) {
      store.activeId = null;
      store.combinedData = null;
      setResultsHidden(true);
      setDropZoneHidden(false);
      setHeader({ title: INITIAL_TITLE, subtitle: INITIAL_SUBTITLE });
    } else {
      refreshCombined().then(() => {
        if (store.activeId === "combined" && store.combinedData) {
          renderResults(store.combinedData, "All combined");
        } else if (store.activeId) {
          const entry = store.files.find(f => f.id === store.activeId);
          if (entry?.data) renderResults(entry.data, entry.name);
        }
        renderSidebar();
      });
    }
    renderSidebar();
  }

  async function refreshCombined() {
    if (store.files.length > 1) {
      try {
        store.combinedData = await analyzeCombined();
      } catch { store.combinedData = null; }
    } else {
      store.combinedData = null;
    }
  }

  function selectFile(id) {
    store.activeId = id;
    renderSidebar();
    if (id === "combined" && store.combinedData) {
      renderResults(store.combinedData, "All combined");
    } else {
      const entry = store.files.find(f => f.id === id);
      if (entry?.data) renderResults(entry.data, entry.name);
    }
  }

  // Every call re-mounts the results (new key), resetting expanded categories and
  // calendar selections the same way rewriting innerHTML did.
  function renderResults(data, title) {
    setHeader({
      title: shortName(title),
      subtitle: `${data.charge_count ?? data.transaction_count} charges · ${data.credit_count || 0} credits · ${data.categories.length} categories`,
    });
    renderCount.current += 1;
    setView({ data, key: renderCount.current });
    setResultsHidden(false);
  }

  async function exportExcel() {
    if (!store.files.length) return;
    clearError();

    const form = new FormData();
    const toExport = store.activeId === "combined" ? store.files : store.files.filter(f => f.id === store.activeId);
    toExport.forEach(entry => form.append("files", entry.file));
    form.append("expenses_only", expensesOnlyRef.current ? "true" : "false");

    try {
      const res = await fetch("/api/export-excel", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const name = store.activeId === "combined"
        ? "combined_transactions_organized.xlsx"
        : toExport[0].name.replace(/\.csv$/i, "") + "_organized.xlsx";
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showError(err.message);
    }
  }

  async function reanalyzeAll() {
    if (!store.files.length) return;
    setLoading(true);
    clearError();
    try {
      for (const entry of store.files) {
        entry.data = await analyzeFile(entry.file);
      }
      if (store.files.length > 1) store.combinedData = await analyzeCombined();
      renderSidebar();
      selectFile(store.activeId || store.files[0].id);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openFilePicker() {
    fileInputRef.current.click();
  }

  function onFileInputChange(e) {
    if (e.target.files.length) addFiles(e.target.files);
    e.target.value = "";
  }

  function onExpensesOnlyChange(e) {
    expensesOnlyRef.current = e.target.checked;
    setExpensesOnly(e.target.checked);
    reanalyzeAll();
  }

  return (
    <div className="app">
      <Sidebar
        files={sidebar.files}
        activeId={sidebar.activeId}
        combinedData={sidebar.combinedData}
        onSelect={selectFile}
        onRemove={removeFile}
        onAddClick={openFilePicker}
        onDropFiles={addFiles}
      />

      <main className="main">
        <div className="main-header">
          <div>
            <h2 id="viewTitle">{header.title}</h2>
            <p className="subtitle" id="viewSubtitle">{header.subtitle}</p>
          </div>
          <div className="header-actions">
            <label className="checkbox">
              <input type="checkbox" id="expensesOnly" checked={expensesOnly} onChange={onExpensesOnlyChange} />
              Expenses only (hide transfers &amp; payments)
            </label>
            <button className="btn btn-primary" id="exportBtn" disabled={sidebar.files.length === 0} onClick={exportExcel}>Export Excel</button>
          </div>
        </div>

        <div
          className={"drop-zone" + (dropZoneHidden ? " hidden" : "") + (dropZoneDragover ? " dragover" : "")}
          id="dropZone"
          onClick={openFilePicker}
          {...dropZoneHandlers}
        >
          <div className="dz-icon">
            <UploadIcon />
          </div>
          <h3>Drag &amp; drop your CSV here</h3>
          <p>Chase, Bank of America, Capital One, Amex, Monarch, Mint &amp; more</p>
          <p className="hint">Add multiple files — they'll appear in the sidebar</p>
          <input type="file" id="fileInput" accept=".csv" multiple hidden ref={fileInputRef} onChange={onFileInputChange} />
        </div>

        <div id="error" className={"error" + (error === null ? " hidden" : "")}>{error}</div>
        <div id="loading" className={"loading" + (loading ? "" : " hidden")}>
          <div className="spinner"></div>
          <span>Analyzing transactions...</span>
        </div>
        <div id="results" className={resultsHidden ? "hidden" : ""}>
          {view && <Results key={view.key} data={view.data} />}
        </div>
      </main>
    </div>
  );
}
