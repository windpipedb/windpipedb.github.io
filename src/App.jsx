import { useState, useEffect } from "react";

/**
 * Root page for WindPipeDB – a minimal database explorer.
 *
 * Left sidebar lists tables (with search). Click a table to view its columns and
 * data. Top of main area has an inline query box to run SQL.
 *
 * Assumed API endpoints:
 *   GET  /api/tables                 → [ { name: "users" }, ... ]
 *   GET  /api/tables/:name/columns   → [ { name: "id", type: "INT" }, ... ]
 *   GET  /api/tables/:name/data      → [ { ...rowData }, ... ]
 *   POST /api/query                  → { columns: [...], rows: [...] }
 */
export default function WindPipeDBRoot() {
  // ---- Tables list ----
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [tablesError, setTablesError] = useState(null);
  const [search, setSearch] = useState("");

  // ---- Active table view ----
  const [selectedTable, setSelectedTable] = useState(null);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState(null);

  // ---- Query runner ----
  const [queryText, setQueryText] = useState("SELECT * FROM ?");
  const [queryResult, setQueryResult] = useState(null);  // { columns, rows }
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState(null);

  // Fetch tables on mount
  useEffect(() => {
    fetch("/api/tables")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load tables");
        return res.json();
      })
      .then(setTables)
      .catch((err) => setTablesError(err.message))
      .finally(() => setTablesLoading(false));
  }, []);

  // Load table data when selectedTable changes
  useEffect(() => {
    if (!selectedTable) return;
    setTableLoading(true);
    setTableError(null);
    setQueryResult(null); // clear any previous query results
    setQueryText(`SELECT * FROM ${selectedTable}`); // sync query box

    Promise.all([
      fetch(`/api/tables/${selectedTable}/columns`).then((r) => r.json()),
      fetch(`/api/tables/${selectedTable}/data`).then((r) => r.json()),
    ])
      .then(([cols, data]) => {
        setColumns(cols);
        setRows(data);
      })
      .catch((err) => setTableError(err.message))
      .finally(() => setTableLoading(false));
  }, [selectedTable]);

  // Run a custom SQL query
  const runQuery = async () => {
    if (!queryText.trim()) return;
    setQueryLoading(true);
    setQueryError(null);
    setQueryResult(null);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setQueryResult(data);
    } catch (err) {
      setQueryError(err.message);
    } finally {
      setQueryLoading(false);
    }
  };

  // Filter tables by search
  const filteredTables = tables.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  // ---- RENDER ----
  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* ===== LEFT SIDEBAR: TABLE LIST ===== */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-700">WindPipeDB</h1>
          <p className="text-xs text-gray-500 mt-0.5">Database Explorer</p>
        </div>

        <div className="p-3">
          <input
            type="text"
            placeholder="Search tables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
          />
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {tablesLoading && (
            <div className="p-3 text-sm text-gray-500 animate-pulse">Loading…</div>
          )}
          {tablesError && (
            <div className="p-3 text-sm text-red-600">Error: {tablesError}</div>
          )}
          {!tablesLoading && !tablesError && filteredTables.length === 0 && (
            <div className="p-3 text-sm text-gray-500">
              {search ? "No matching tables" : "No tables yet"}
            </div>
          )}
          {filteredTables.map((table) => (
            <button
              key={table.name}
              onClick={() => setSelectedTable(table.name)}
              className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
                selectedTable === table.name
                  ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              📄 {table.name}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200 text-xs text-gray-400">
          {tables.length} table{tables.length !== 1 ? "s" : ""}
        </div>
      </aside>

      {/* ===== MAIN AREA: QUERY + DATA ===== */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Inline query bar */}
        <div className="p-4 bg-white border-b border-gray-200 flex gap-3 items-start">
          <div className="flex-1">
            <textarea
              rows={2}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm font-mono focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              placeholder="Enter SQL query…"
            />
          </div>
          <button
            onClick={runQuery}
            disabled={queryLoading || !queryText.trim()}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {queryLoading ? "Running…" : "Run"}
          </button>
        </div>

        {/* Data display */}
        <div className="flex-1 overflow-auto p-4">
          {/* TABLE DATA MODE (when a table is selected and no manual query result) */}
          {selectedTable && !queryResult && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                📋 {selectedTable}
                <span className="text-sm font-normal text-gray-500">
                  ({columns.length} column{columns.length !== 1 ? "s" : ""})
                </span>
              </h2>
              {tableLoading && (
                <p className="text-gray-500 text-sm">Loading table data…</p>
              )}
              {tableError && (
                <p className="text-red-600 text-sm">Error: {tableError}</p>
              )}
              {!tableLoading && !tableError && (
                <DataTable columns={columns} rows={rows} />
              )}
            </div>
          )}

          {/* QUERY RESULT MODE */}
          {queryResult && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  ⚡ Query Result
                  <span className="text-sm font-normal text-gray-500">
                    ({queryResult.rows.length} row{queryResult.rows.length !== 1 ? "s" : ""})
                  </span>
                </h2>
                <button
                  onClick={() => setQueryResult(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <DataTable columns={queryResult.columns} rows={queryResult.rows} />
            </div>
          )}

          {/* QUERY ERROR */}
          {queryError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
              <strong>Query error:</strong> {queryError}
            </div>
          )}

          {/* EMPTY STATE (nothing selected, no query) */}
          {!selectedTable && !queryResult && !queryError && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Select a table from the sidebar or run a query</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * Small reusable table component.
 * Expects `columns` as array of { name, type? } and `rows` as array of objects.
 */
function DataTable({ columns, rows }) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">No rows to display.</p>;
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.name}
                className="px-4 py-2 text-left font-medium text-gray-600 whitespace-nowrap"
              >
                {col.name}
                {col.type && (
                  <span className="ml-1 text-xs text-gray-400">({col.type})</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td
                  key={col.name}
                  className="px-4 py-2 text-gray-700 whitespace-nowrap max-w-xs truncate"
                >
                  {row[col.name] !== null ? String(row[col.name]) : (
                    <span className="text-gray-400 italic">NULL</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}