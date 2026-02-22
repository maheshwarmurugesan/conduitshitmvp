import Link from "next/link";
import { getRows } from "@/lib/google-sheets";

export default async function VerifyPage() {
  let result: {
    connected: boolean;
    rowCount?: number;
    sheetName?: string;
    spreadsheetIdEndsWith?: string;
    lastRows?: { firstName: string; lastName: string; timestamp: string }[];
    error?: string;
  };

  try {
    const rows = await getRows();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() ?? "";
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME?.trim() || "Sheet1";

    const lastRows = rows.slice(-3).map((row) => ({
      firstName: row[0] ?? "(empty)",
      lastName: row[1] ?? "(empty)",
      timestamp: row[8] ?? "(empty)",
    }));

    result = {
      connected: true,
      rowCount: rows.length,
      sheetName,
      spreadsheetIdEndsWith: spreadsheetId.slice(-6),
      lastRows,
    };
  } catch (err) {
    result = {
      connected: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full space-y-6">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-widest text-[var(--foreground)] text-center">
          CRM Connection Check
        </h1>

        <div className="font-mono text-sm space-y-3 p-4 rounded border border-[var(--border)] bg-[var(--input)]/50">
          {result.connected ? (
            <>
              <p>
                <span className="text-glow-muted">Connected:</span>{" "}
                <span className="text-[var(--accent)]">Yes</span>
              </p>
              <p>
                <span className="text-glow-muted">Rows in sheet:</span>{" "}
                {result.rowCount}
              </p>
              <p>
                <span className="text-glow-muted">Sheet tab:</span>{" "}
                {result.sheetName}
              </p>
              <p>
                <span className="text-glow-muted">Spreadsheet ID ends with:</span>{" "}
                ...{result.spreadsheetIdEndsWith}
              </p>
              {result.lastRows && result.lastRows.length > 0 && (
                <div className="pt-2 border-t border-[var(--border)]">
                  <p className="text-glow-muted mb-2">Last {result.lastRows.length} rows:</p>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(result.lastRows, null, 2)}
                  </pre>
                </div>
              )}
              <p className="text-glow-muted text-xs pt-2">
                Match the ID suffix above to your sheet URL. If rowCount {">"} 0 but you
                don&apos;t see data, check the &quot;{result.sheetName}&quot; tab.
              </p>
            </>
          ) : (
            <>
              <p className="text-[var(--destructive)]">Error: {result.error}</p>
              <p className="text-glow-muted text-xs">
                Check env vars: GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY,
                GOOGLE_SHEETS_SPREADSHEET_ID. Sheet shared with service account?
              </p>
            </>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="font-mono text-sm uppercase tracking-widest text-[var(--accent)] hover:underline"
          >
            ← Back to form
          </Link>
        </div>
      </div>
    </div>
  );
}
