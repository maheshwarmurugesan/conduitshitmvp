import { google } from "googleapis";

function getAuth() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL?.trim();
  let privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.trim();
  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google Sheets credentials in environment");
  }
  // Handle newlines: Vercel stores \n as literal backslash+n, convert to real newlines
  privateKey = privateKey.replace(/\\n/g, "\n");
  // Strip accidental outer quotes if pasted from JSON
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  return new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetName(): string {
  return process.env.GOOGLE_SHEETS_SHEET_NAME?.trim() || "Sheet1";
}

export async function appendRow(values: string[]) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID");
  }
  const sheetName = getSheetName();
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:I`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

export async function getRows(): Promise<string[][]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID");
  }
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const sheetName = getSheetName();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:I`,
  });
  const rows = res.data.values as string[][] | undefined;
  return rows ?? [];
}
