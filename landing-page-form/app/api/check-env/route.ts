import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    googleSheets: {
      hasClientEmail: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY,
      hasSpreadsheetId: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    },
  });
}
