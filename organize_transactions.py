#!/usr/bin/env python3
"""Organize transaction CSV files by category with per-category totals."""

import argparse
from pathlib import Path

from finance_organizer import (
    build_monthly_summary,
    build_report,
    export_excel,
    group_by_category,
    load_transactions,
)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Organize transaction CSV files by category."
    )
    parser.add_argument(
        "csv_file",
        type=Path,
        help="Path to the transactions CSV file",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Include transfers and payments, not just expenses",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Optional path to save the report as a text file",
    )
    parser.add_argument(
        "--excel",
        type=Path,
        help="Optional path to export an Excel workbook",
    )
    args = parser.parse_args()

    if not args.csv_file.exists():
        raise SystemExit(f"File not found: {args.csv_file}")

    transactions = load_transactions(args.csv_file, expenses_only=not args.all)
    grouped = group_by_category(transactions)
    monthly = build_monthly_summary(transactions)
    report = build_report(grouped, monthly=monthly)

    print(report)

    if args.output:
        args.output.write_text(report, encoding="utf-8")
        print(f"\nReport saved to {args.output}")

    if args.excel:
        export_excel(transactions, args.excel)
        print(f"Excel workbook saved to {args.excel}")


if __name__ == "__main__":
    main()
