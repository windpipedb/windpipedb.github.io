import { useState } from "react";

/**
 * WindPipeDB Learning Page
 * Route: /learnwpdb
 *
 * A friendly guide covering basic concepts, query syntax, and examples.
 * Includes a simple interactive query playground so learners can experiment.
 */
export default function LearnWindPipeDB() {
  const [activeSection, setActiveSection] = useState("intro");
  const [playgroundQuery, setPlaygroundQuery] = useState("SELECT * FROM users;");
  const [playgroundResult, setPlaygroundResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Simulate running a query (replace with real API call in production)
  const runPlaygroundQuery = async () => {
    setIsRunning(true);
    // Demo: return a fake result to illustrate the output format
    setTimeout(() => {
      setPlaygroundResult({
        columns: [
          { name: "id", type: "INT" },
          { name: "name", type: "VARCHAR" },
          { name: "email", type: "VARCHAR" },
        ],
        rows: [
          { id: 1, name: "Alice", email: "alice@example.com" },
          { id: 2, name: "Bob", email: "bob@example.com" },
        ],
      });
      setIsRunning(false);
    }, 600);
  };

  // Navigation links for the learning sections
  const sections = [
    { id: "intro", label: "Introduction" },
    { id: "create-table", label: "Creating Tables" },
    { id: "insert", label: "Inserting Data" },
    { id: "select", label: "Querying Data" },
    { id: "update-delete", label: "Update & Delete" },
    { id: "indexes", label: "Indexes" },
    { id: "playground", label: "Try It!" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "intro":
        return <Introduction />;
      case "create-table":
        return <CreateTableGuide />;
      case "insert":
        return <InsertGuide />;
      case "select":
        return <SelectGuide />;
      case "update-delete":
        return <UpdateDeleteGuide />;
      case "indexes":
        return <IndexesGuide />;
      case "playground":
        return <Playground
                  query={playgroundQuery}
                  setQuery={setPlaygroundQuery}
                  result={playgroundResult}
                  isRunning={isRunning}
                  onRun={runPlaygroundQuery}
                  onClear={() => setPlaygroundResult(null)}
                />;
      default:
        return <Introduction />;
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ---- LEFT SIDEBAR: Section navigation ---- */}
      <aside className="w-64 bg-slate-50 border-r border-slate-200 p-5 flex flex-col shrink-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-indigo-700">WindPipeDB</h1>
          <p className="text-sm text-slate-500 mt-1">Learning Center</p>
        </div>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-indigo-100 text-indigo-700 border-l-4 border-indigo-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ---- MAIN CONTENT ---- */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        {renderContent()}
      </main>
    </div>
  );
}

/* ================================================================
   SECTION COMPONENTS
   ================================================================ */

function Introduction() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2>Welcome to WindPipeDB</h2>
      <p>
        WindPipeDB is a lightweight, high‑performance relational database built
        for modern applications. It supports standard SQL, fast indexing, and a
        simple management interface.
      </p>
      <h3>Key Features</h3>
      <ul>
        <li>Full SQL support (SELECT, INSERT, UPDATE, DELETE, JOIN, etc.)</li>
        <li>Automatic indexing for primary and foreign keys</li>
        <li>ACID compliant transactions</li>
        <li>Built‑in connection pooling and query caching</li>
        <li>Easy‑to‑use HTTP API for remote queries</li>
      </ul>
      <h3>Getting Started</h3>
      <p>
        To interact with WindPipeDB, you can use the web dashboard, the
        command‑line client, or the HTTP API. Let’s walk through the basics
        by selecting a topic on the left.
      </p>
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
        💡 <strong>Tip:</strong> All examples in this guide assume you are
        connected to a running WindPipeDB instance.
      </div>
    </div>
  );
}

function CreateTableGuide() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2>Creating Tables</h2>
      <p>
        Tables are where your data lives. The <code>CREATE TABLE</code> statement
        defines the structure (columns and data types).
      </p>
      <h3>Basic Syntax</h3>
      <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono">
{`CREATE TABLE table_name (
  column1 datatype constraints,
  column2 datatype constraints,
  ...
);`}
      </pre>
      <h3>Example: Users Table</h3>
      <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono">
{`CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
      </pre>
      <h3>Data Types</h3>
      <ul>
        <li><strong>INT</strong> – integer numbers</li>
        <li><strong>VARCHAR(n)</strong> – variable‑length text up to n characters</li>
        <li><strong>BOOLEAN</strong> – true/false</li>
        <li><strong>TIMESTAMP</strong> – date and time</li>
        <li><strong>FLOAT</strong> – floating‑point numbers</li>
      </ul>
    </div>
  );
}

function InsertGuide() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2>Inserting Data</h2>
      <p>
        Use <code>INSERT INTO</code> to add rows to a table.
      </p>
      <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono">
{`INSERT INTO users (name, email)
VALUES ('Alice', 'alice@example.com');`}
      </pre>
      <p>You can also insert multiple rows at once:</p>
      <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono">
{`INSERT INTO users (name, email) VALUES
  ('Bob', 'bob@example.com'),
  ('Charlie', 'charlie@example.com');`}
      </pre>
    </div>
  );
}

function SelectGuide() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2>Querying Data</h2>
      <p>
        <code>SELECT</code> retrieves data from one or more tables.
      </p>
      <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono">
{`SELECT * FROM users;`}
      </pre>
      <h3>Filtering with WHERE</h3>
      <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono">
{`SELECT name, email FROM users WHERE id = 1;`}
      </pre>
      <h3>Sorting with ORDER BY</h3>
      <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono">
{`SELECT * FROM users ORDER BY name ASC;`}
      </pre>
      <h3>Joining Tables</h3>
      <p>Combine data from two tables using a common column.</p>
      <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono">
{`SELECT users.name, orders.total
FROM users
JOIN orders ON users.id = orders.user_id;`}
      </pre>
    </div>
  );
}

function UpdateDeleteGuide() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2>Updating & Deleting Data</h2>
      <h3>UPDATE</h3>
      <p>Modify existing rows.</p>
      <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono">
{`UPDATE users SET email = 'alice_new@example.com' WHERE id = 1;`}
      </pre>
      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
        ⚠️ Always use a <code>WHERE</code> clause to avoid updating all rows.
      </div>
      <h3 className="mt-6">DELETE</h3>
      <p>Remove rows.</p>
      <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono">
{`DELETE FROM users WHERE id = 2;`}
      </pre>
      <p>To delete all rows (be careful!):</p>
      <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono">
{`DELETE FROM users;`}
      </pre>
    </div>
  );
}

function IndexesGuide() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2>Indexes</h2>
      <p>
        Indexes speed up searches on a column. Without an index, WindPipeDB
        scans the entire table (full table scan).
      </p>
      <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono">
{`CREATE INDEX idx_users_email ON users(email);`}
      </pre>
      <p>You can also create unique indexes that enforce uniqueness:</p>
      <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono">
{`CREATE UNIQUE INDEX idx_users_name ON users(name);`}
      </pre>
      <h3>Listing Indexes</h3>
      <pre className="bg-slate-100 p-4 rounded-lg text-sm font-mono">
{`SHOW INDEXES FROM users;`}
      </pre>
    </div>
  );
}

/* ---- Interactive Playground Component ---- */
function Playground({ query, setQuery, result, isRunning, onRun, onClear }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Try It Yourself</h2>
      <p className="text-slate-600 mb-6">
        Write any WindPipeDB SQL query and see a simulated result. In a real
        deployment, this would execute against your live database.
      </p>
      <div className="mb-4">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={5}
          className="w-full border border-slate-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter your SQL query..."
        />
      </div>
      <div className="flex gap-3 mb-6">
        <button
          onClick={onRun}
          disabled={isRunning || !query.trim()}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isRunning ? "Running..." : "Run Query"}
        </button>
        {result && (
          <button
            onClick={onClear}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Clear Result
          </button>
        )}
      </div>

      {result && (
        <div className="border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {result.columns.map((col) => (
                  <th key={col.name} className="px-4 py-2 text-left font-medium text-slate-600">
                    {col.name} <span className="text-xs text-slate-400">({col.type})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  {result.columns.map((col) => (
                    <td key={col.name} className="px-4 py-2 text-slate-700">
                      {row[col.name] !== undefined ? String(row[col.name]) : (
                        <span className="text-slate-400 italic">NULL</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 bg-slate-50 text-xs text-slate-500 border-t border-slate-200">
            {result.rows.length} row{result.rows.length !== 1 ? "s" : ""} returned
          </div>
        </div>
      )}
    </div>
  );
}