import { NextResponse } from "next/server";
import { getRows } from "@/lib/google-sheets";

/**
 * GET /api/verify-sheet
 * Shows what sheet we're connected to, row count, and last rows.
 * Use this to confirm you're looking at the right spreadsheet and see if submissions are there.
 */
export async function GET() {
  try {
    const rows = await getRows();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() ?? "";
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME?.trim() || "Sheet1";

    // Last 3 rows: A=firstName, B=lastName, I=timestamp (if present)
    const lastRows = rows.slice(-3).map((row) => ({
      firstName: row[0] ?? "(empty)",
      lastName: row[1] ?? "(empty)",
      timestamp: row[8] ?? "(empty)",
    }));

    return NextResponse.json({
      connected: true,
      rowCount: rows.length,
      sheetName,
      spreadsheetIdEndsWith: spreadsheetId.slice(-6),
      lastRows,
      hint:
        rows.length === 0
          ? "No rows yet. If you submitted, the sheet tab name might be wrong — add GOOGLE_SHEETS_SHEET_NAME if your tab isn't 'Sheet1'."
          : "If lastRows shows your data, you're looking at the right sheet. If not, check the tab named '" + sheetName + "'.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ connected: false, error: msg }, { status: 500 });
  }
}
