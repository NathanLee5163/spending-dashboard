# Spending Dashboard

Upload bank CSV exports and organize your spending by category — with monthly summaries, multi-file support, and Excel export.

Works with exports from **Chase**, **Bank of America**, **Capital One**, **American Express**, and budgeting apps like **Monarch** and **Mint**.

---

## What it does

Drop in a transaction CSV from your bank or budgeting app and the dashboard will:

- **Group transactions by category** (Groceries, Dining, Shopping, etc.)
- **Show totals per category** with every transaction listed underneath
- **Summarize spending by month** with bar charts
- **Support multiple CSV files** — add April, May, Chase, BofA, etc. in the sidebar and switch between them or view a combined total
- **Export to Excel** with separate sheets per category
- **Show unused categories** — common categories your bank supports but you didn't spend in during that period

All processing happens when you upload. **Your data is never stored on a server** (when running locally, files stay on your machine entirely).

---

## Quick start (web app)

### 1. Clone and install

```bash
git clone https://github.com/NathanLee5163/spending-dashboard.git
cd spending-dashboard

python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Run the app

```bash
python app.py
```

Open **http://127.0.0.1:5001** in your browser.

### 3. Upload your CSV

- Drag and drop a `.csv` file onto the main area, **or**
- After your first file, drag another onto the **sidebar** to add more
- Click any file in the sidebar to switch views
- Use **All combined** when you have multiple files loaded
- Toggle **Expenses only** to hide payments, transfers, and refunds
- Click **Export Excel** to download an organized workbook

---

## Command line usage

You can also organize CSVs from the terminal without the web UI:

```bash
# Print a category report to the terminal
python organize_transactions.py your-file.csv

# Save a text report
python organize_transactions.py your-file.csv -o report.txt

# Export an Excel workbook
python organize_transactions.py your-file.csv --excel report.xlsx

# Include transfers and payments (not just expenses)
python organize_transactions.py your-file.csv --all
```

---

## How to export a CSV from your bank

### Chase
1. Log in at [chase.com](https://www.chase.com)
2. Open your credit card account
3. Click **Download account activity**
4. Choose date range → **Download CSV**

Expected columns: `Transaction Date`, `Post Date`, `Description`, `Category`, `Type`, `Amount`

### Bank of America
1. Log in at [bankofamerica.com](https://www.bankofamerica.com)
2. Open your account → click **Download** above the transaction list
3. Choose **Microsoft Excel (.csv)** and your date range

Expected columns: `Date`, `Description`, `Amount`  
Note: BofA files often have a few summary lines at the top before the real headers — the app skips those automatically.

### Capital One
1. Log in at [capitalone.com](https://www.capitalone.com) (desktop browser required)
2. Open your account → **Download Transactions**
3. Choose CSV format

Expected columns: `Transaction Date`, `Posted Date`, `Description`, `Category`, `Debit`, `Credit`

### Monarch / Mint / similar budgeting apps
Export your transactions as CSV from the app's export feature. These typically include columns like `Date`, `Description`, `Type`, `Category`, `Amount`, and `Account`.

---

## Supported CSV formats

The parser auto-detects columns — you don't need to rename anything. It recognizes:

| Field | Accepted column names |
|-------|----------------------|
| Date | `Date`, `Transaction Date`, `Posted Date`, `Post Date` |
| Description | `Description`, `Payee`, `Memo`, `Details` |
| Amount | `Amount` (signed), or separate `Debit` / `Credit` columns |
| Category | `Category` |
| Type | `Type`, `Transaction Type` |
| Account | `Account`, `Card No.` |

**Date formats:** `YYYY-MM-DD`, `MM/DD/YYYY`, and others  
**Expense detection:** Recognizes `Expense`, `Sale`, debits, and negative amounts. Filters out payments, transfers, and refunds when "Expenses only" is on.

**Category normalization:** Bank-specific names (e.g. Chase's `Food & Drink`, `Gas`) are mapped to a shared standard (e.g. `Drinks & dining`, `Auto & transport`) so files from different banks combine cleanly.

---

## Project structure

```
spending-dashboard/
├── app.py                  # Flask web server
├── finance_organizer.py    # Core CSV parsing, analysis, Excel export
├── organize_transactions.py # CLI tool
├── templates/
│   └── index.html          # Web UI
├── requirements.txt
├── Procfile                # For deployment (Render, Railway, etc.)
└── README.md
```

---

## Deploy online (optional)

To share the app publicly, deploy to a free host like [Render](https://render.com):

1. Push this repo to GitHub (already done if you're reading this there)
2. On Render: **New → Web Service** → connect your repo
3. Settings:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `gunicorn app:app`
4. Deploy — you'll get a public URL

On Render's free tier, the app sleeps after inactivity and takes ~30 seconds to wake up on the first visit.

---

## Privacy

- CSV files are processed **in memory** and are **not saved** to disk by the app
- No accounts, logins, or databases
- When running locally, your financial data never leaves your computer
- **Do not commit personal CSV files to GitHub** — they're excluded via `.gitignore`

---

## Requirements

- Python 3.10+
- Dependencies: `flask`, `openpyxl`, `gunicorn` (see `requirements.txt`)

---

## License

Personal project — use and modify freely.
