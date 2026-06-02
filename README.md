# SpendWise — Premium Local MERN Expense Tracker

SpendWise is a local-first single-user personal expense tracker built using the MERN (MongoDB, Express, React, Node) stack. It is designed to run entirely locally with zero external dependencies, providing instant, beautiful insights and summaries of your monthly budgets.

This project was built to deliver a fast, self-hosted budgeting tool that keeps your financial data on your machine while still offering advanced analytics, filtered exports, and interactive assistance.

Key additions include an Excel export for filtered expense reports and a small AI-powered chat assistant that can answer questions directly from the user's local expense history.

## What this project delivers

- A local-first expense tracker with a modern dashboard and monthly insights
- Advanced filters with category, date range, and keyword search
- An Excel export function for filtered expense data
- A Groq-powered chat assistant that understands your stored expense records and answers questions naturally
- A self-hosted architecture with no required cloud backend for data privacy

---

## 1. How to Run It

### Prerequisites
- **Node.js** version 18+ installed.
- **MongoDB** community server running locally on port `27017` (e.g. `mongodb://localhost:27017`).

### Clone and Setup
Open your terminal in the project directory and run the following commands:

```bash
# 1. Install all dependencies concurrently (at root, server, and client)
npm run install:all

# 2. Configure environment
# Copy the template from server or root
cp .env.example .env
```

Ensure your `.env` contains:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/spendwise
```

To enable the budget chat assistant, also add:
```env
GROQ_API=
GROQ_API_URL=https://api.groq.ai/v1/outputs
GROQ_MODEL=llama-3.1-8b-instant
```

If the assistant cannot resolve `api.groq.ai`, set `GROQ_API_URL` explicitly and restart the server.

### Seed Analytical Data
Populate 6 months of realistic sample data so that all trend lines, category stacks, averages, and statistics cards render rich charts immediately:
```bash
npm run seed
```

### Run Locally (Concurrent Server + Client)
Launch both the Express backend server (on port `5000`) and the Vite React development client (on port `5173`) with a single command from the project root:
```bash
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 2. Stack Choices & Trade-offs

- **Node & Express:** Serves as a lightweight backend runtime. It provides fast routing, standard JSON parsing, and is perfect for building RESTful endpoints without heavy framework bloat.
- **MongoDB (Local):** Chosen for its flexible document schema, facilitating high speed prototyping. Schema alterations (such as adding transaction notes) require zero database migrations.
- **Mongoose 7.x:** Enforces schema validation directly at the database model layer. We compound index `category` + `date` and create text search indices to support extremely fast listings and partial searches.
- **Vite + React 18:** Downgraded from the standard React 19 template to ensure perfect compatibility with analytical charting packages (Recharts) and validation tools (React Hook Form), completely eliminating peer-dependency resolution warnings or canvas glitches.
- **Recharts:** Operates as a React-native SVG charting engine. It has a lightweight declarative API, smooth transitions on updates, and responds seamlessly inside flex layouts.
- **React Hook Form:** Minimizes standard input bindings boilerplate. Since it utilizes uncontrolled inputs, it limits unnecessary component re-renders during keyboard typing, enhancing client performance.
- **Tailwind CSS:** Provides modern utility utility-first styling with consistent color maps per category across donuts, daily bar curves, badges, and filters.
- **date-fns:** Far lighter than legacy Moment.js, supports modern tree-shaking, and easily manages UTC/local ISO conversions.

---

## 3. What's Done vs Skipped

### ✅ Done
- **Strict Data Model:** Mongoose model validating whitespace, positive floats (`>= 0.01`), enums, and timestamps.
- **REST CRUD Endpoints:** All standard endpoints (`GET /`, `GET /:id`, `POST`, `PUT`, `DELETE`) with route validation and input sanitization.
- **Advanced Aggregations:** MongoDB aggregation pipeline for dynamic monthly summaries (comparing vs prior month) and rolling 6-month historical trends.
- **Interactive Multi-Filters:** Combinable persistent filters (by category, date range, partial keyword searches) synced directly with the browser URL.
- **Optimistic UI updates:** Immediate CRUD state modifications on the client with automated cached rollbacks if REST requests fail.
- **Stat Cards & Charts:** Visual rendering of Donut breakdowns (custom center total label), Daily Spend bar charts (showing zero-height bars for quiet days), and rolling 6-month line and stacked bar charts.
- **Interactive Legend:** Custom legends allowing users to toggle visible categories dynamically across multiple analytics charts simultaneously.
- **Export to Excel:** Download filtered expense data directly from the filter panel as an `.xlsx` report.
- **Budget Chat Assistant:** In-app assistant powered by Groq LLM that reads your local expense records and answers questions like “how much did I spend on transport this week?”.
- **MongoDB Status Guard:** Server stays online and serves 503 errors if local MongoDB is offline, triggering a warning banner on the client instead of throwing CastErrors.

### ⚠️ Partial
- **Pagination:** Supported via standard page indexing and page limits. Custom pagination limits can be easily expanded if entries exceed 50 items.

### ❌ Skipped
- **Authentication:** Multi-user support is omitted to satisfy local-first specifications.


---

## 4. Known Rough Edges

- **Search Debouncing:** Keyword searches are debounced by 350ms to save API network bandwidth, resulting in a slight delay before the table updates as the user types.
- **Amount Floats:** Stored as floating numbers. We handle Indian Rupee currency representation with `.toLocaleString()` / `Intl.NumberFormat` on the UI layer.
- **Date Inputs:** Native HTML calendar picker is utilized for speed. High-end date-range packages (like React-Day-Picker) were skipped to conserve bundle sizes.
- **Chat Assistant Connectivity:** The assistant depends on the Groq API. If `api.groq.ai` cannot be resolved or `GROQ_API_URL` is not configured correctly, the chat widget will return a 502 and will not respond.
