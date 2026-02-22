import { NextResponse } from "next/server";
import { getRows } from "@/lib/google-sheets";

/**
 * GET /api/verify-sheet
 * Shows what sheet we're connected to and how many rows exist.
 * Use this to confirm you're looking at the right spreadsheet.
 */
export async function GET() {
  try {
    const rows = await getRows();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() ?? "";
    const suffix = spreadsheetId.slice(-6);

    return NextResponse.json({
      connected: true,
      rowCount: rows.length,
      spreadsheetIdEndsWith: suffix,
      hint: "Match the suffix above to the end of your sheet URL. If rowCount > 0 but you don't see data, check the Sheet1 tab.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ connected: false, error: msg }, { status: 500 });
  }
}
