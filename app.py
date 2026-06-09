"""Web app for organizing transaction CSV files."""

import io
from pathlib import Path

from flask import Flask, jsonify, render_template, request, send_file

from finance_organizer import analyze, export_excel, load_transactions, merge_transaction_lists

app = Flask(__name__)


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/analyze")
def api_analyze():
    uploaded = request.files.get("file")
    if not uploaded or not uploaded.filename:
        return jsonify({"error": "No CSV file uploaded."}), 400

    expenses_only = request.form.get("expenses_only", "true") == "true"

    try:
        content = uploaded.read().decode("utf-8-sig")
        transactions = load_transactions(content, expenses_only=expenses_only)
        return jsonify(analyze(transactions))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Failed to parse CSV: {exc}"}), 400


@app.post("/api/analyze-multiple")
def api_analyze_multiple():
    uploads = request.files.getlist("files")
    if not uploads:
        return jsonify({"error": "No CSV files uploaded."}), 400

    expenses_only = request.form.get("expenses_only", "true") == "true"

    try:
        sources: list[tuple[str, list[dict]]] = []
        for uploaded in uploads:
            if not uploaded.filename:
                continue
            content = uploaded.read().decode("utf-8-sig")
            transactions = load_transactions(content, expenses_only=expenses_only)
            sources.append((uploaded.filename, transactions))

        if not sources:
            return jsonify({"error": "No valid CSV files uploaded."}), 400

        merged = merge_transaction_lists(sources)
        result = analyze(merged)
        result["sources"] = [name for name, _ in sources]
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Failed to parse CSV files: {exc}"}), 400


@app.post("/api/export-excel")
def api_export_excel():
    uploads = request.files.getlist("files")
    if not uploads:
        uploaded = request.files.get("file")
        uploads = [uploaded] if uploaded else []

    if not uploads or not any(item and item.filename for item in uploads):
        return jsonify({"error": "No CSV file uploaded."}), 400

    expenses_only = request.form.get("expenses_only", "true") == "true"

    try:
        sources: list[tuple[str, list[dict]]] = []
        for uploaded in uploads:
            if not uploaded or not uploaded.filename:
                continue
            content = uploaded.read().decode("utf-8-sig")
            transactions = load_transactions(content, expenses_only=expenses_only)
            sources.append((uploaded.filename, transactions))

        transactions = merge_transaction_lists(sources) if len(sources) > 1 else sources[0][1]

        buffer = io.BytesIO()
        export_excel(transactions, buffer)
        buffer.seek(0)

        if len(sources) == 1:
            stem = Path(sources[0][0]).stem or "transactions"
        else:
            stem = "combined_transactions"
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"{stem}_organized.xlsx",
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Failed to export Excel: {exc}"}), 400


if __name__ == "__main__":
    # Port 5000 is often taken by macOS AirPlay Receiver
    app.run(debug=True, port=5001)
