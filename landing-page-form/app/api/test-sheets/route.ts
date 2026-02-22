import { NextResponse } from "next/server";
import { appendRow } from "@/lib/google-sheets";

/**
 * GET /api/test-sheets
 * Tests the Google Sheets connection. Visit this URL in your browser to see
 * the EXACT error if something is wrong. No form submission needed.
 */
export async function GET() {
  const status = {
    hasClientEmail: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY,
    hasSpreadsheetId: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  };

  if (!status.hasClientEmail || !status.hasPrivateKey || !status.hasSpreadsheetId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing env vars",
        status,
        fix: "Add the missing vars in Vercel → Settings → Environment Variables, then redeploy.",
      },
      { status: 500 }
    );
  }

  try {
    await appendRow([
      "[TEST]",
      new Date().toISOString(),
      "First",
      "Last",
      "https://linkedin.com/in/test",
      "test@example.com",
      "5551234567",
      "Test intro",
      "no",
    ]);
    return NextResponse.json({
      ok: true,
      message: "Success! A test row was added to your sheet. Check Sheet1.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const cause = err instanceof Error && err.cause ? String(err.cause) : null;
    return NextResponse.json(
      {
        ok: false,
        error: msg,
        cause: cause || undefined,
        status,
        commonFixes: [
          "Share the sheet with landing-page-form@landing-page-form-488119.iam.gserviceaccount.com as Editor",
          "Spreadsheet ID = the part between /d/ and /edit in the sheet URL (no spaces)",
          "First tab must be named Sheet1",
          "Private key: paste as single line with \\n for line breaks (from the .json key file)",
        ],
      },
      { status: 500 }
    );
  }
}
