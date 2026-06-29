import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import { fmt } from "../utils/formatCurrency.js";
import { getSummary, getAIReport, getExpenses } from "../api/expenses.js";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

const CARD = { backgroundColor: "#161B22", border: "1px solid #30363D" };

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CAT_COLORS = {
  "Food Delivery": "#6C63FF",
  Groceries: "#4ECDC4",
  Transport: "#378ADD",
  Entertainment: "#D4537E",
  Shopping: "#D85A30",
  Health: "#BA7517",
  Utilities: "#888780",
  Stationary: "#F59E0B",
  Other: "#B4B2A9",
};

export default function Report() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [allExpenses, setAllExpenses] = useState([]);
  const [filterCat, setFilterCat] = useState("");

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const [sumRes, expRes] = await Promise.all([
        getSummary({ month, year }),
        getExpenses({ month, year }),
      ]);
      setSummary(sumRes.data);
      setAllExpenses(expRes.data);
    } catch (err) {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const fetchAIReport = async () => {
    setAiLoading(true);
    try {
      const res = await getAIReport({ month, year });
      setAiInsights(res.data.insights);
    } catch (err) {
      toast.error("AI report failed");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    setAiInsights([]);
  }, [month, year]);

  const lineData = summary
    ? Object.entries(summary.dailyTotals)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([day, amount]) => ({ day: `Day ${day}`, amount }))
    : [];

  const categoryData = summary
    ? Object.entries(summary.categoryTotals).map(([name, value]) => ({
        name,
        value,
      }))
    : []

  const filteredExpenses = allExpenses.filter((e) =>
    filterCat ? e.category === filterCat : true,
  );

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const handlePrev = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const handleNext = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const insightColor = (type) => {
    if (type === "danger") return "border-red-800 bg-red-950 text-red-400";
    if (type === "warn")
      return "border-yellow-800 bg-yellow-950 text-yellow-400";
    if (type === "good") return "border-green-800 bg-green-950 text-green-400";
    return "border-blue-800 bg-blue-950 text-blue-400";
  };
  

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D1117" }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header + Month Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Monthly Report</h1>
            <p className="text-gray-400 text-sm mt-1">
              AI-powered spending analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="text-gray-400 hover:text-white px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-500"
            >
              ←
            </button>
            <span className="text-white font-semibold min-w-32 text-center">
              {MONTHS[month - 1]} {year}
            </span>
            <button
              onClick={handleNext}
              className="text-gray-400 hover:text-white px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-500"
            >
              →
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            Loading report...
          </div>
        ) : !summary?.total ? (
          <div className="text-center py-20 text-gray-500">
            No expenses found for {MONTHS[month - 1]} {year}
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Spent", value: fmt(summary.total) },
                { label: "Transactions", value: summary.totalTransactions },
                {
                  label: "Daily Average",
                  value: fmt(
                    summary.total / new Date(year, month, 0).getDate(),
                  ),
                },
                {
                  label: "Avg Per Transaction",
                  value: fmt(summary.total / summary.totalTransactions),
                },
              ].map((m, i) => (
                <div key={i} className="rounded-xl p-4" style={CARD}>
                  <p className="text-xs text-gray-400 mb-1">{m.label}</p>
                  <p className="text-xl font-bold text-white">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Line Chart */}
            <div className="rounded-xl p-5 mb-6" style={CARD}>
              <p className="text-sm font-semibold text-gray-300 mb-4">
                Spending Over The Month
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis dataKey="day" tick={{ fill: "#888", fontSize: 10 }} />
                  <YAxis
                    tick={{ fill: "#888", fontSize: 10 }}
                    tickFormatter={(v) => "₹" + Math.round(v / 1000) + "k"}
                  />
                  <Tooltip
                    formatter={(val) => fmt(val)}
                    contentStyle={{
                      backgroundColor: "#161B22",
                      border: "1px solid #30363D",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#6C63FF"
                    strokeWidth={2}
                    dot={{ fill: "#6C63FF", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart — Category */}
            <div className="rounded-xl p-5 mb-6" style={CARD}>
              <p className="text-sm font-semibold text-gray-300 mb-4">
                Category Breakdown
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis
                    type="number"
                    tick={{ fill: "#888", fontSize: 10 }}
                    tickFormatter={(v) => "₹" + Math.round(v / 1000) + "k"}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "#888", fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip
                    formatter={(val) => fmt(val)}
                    contentStyle={{
                      backgroundColor: "#161B22",
                      border: "1px solid #30363D",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 5, 5, 0]}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={CAT_COLORS[entry.name] || "#888"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* AI Report Section */}
            <div className="rounded-xl p-5 mb-6" style={CARD}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-300">
                    🤖 AI Detective Report
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Powered by Groq — personalized insights for your spending
                  </p>
                </div>
                <button
                  onClick={fetchAIReport}
                  disabled={aiLoading}
                  className="text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                  style={{ backgroundColor: "#6C63FF", color: "#fff" }}
                >
                  {aiLoading ? "Analyzing..." : "✨ Generate Report"}
                </button>
              </div>

              {aiInsights.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {aiInsights.map((insight, i) => (
                    <div
                      key={i}
                      className={`rounded-lg p-4 border ${insightColor(insight.type)}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{insight.icon}</span>
                        <p className="font-semibold text-sm">{insight.title}</p>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {insight.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-gray-400 text-sm">
                    Click "Generate Report" to get AI-powered insights about
                    your spending this month.
                  </p>
                </div>
              )}
            </div>

            {/* Top 3 Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: "💸",
                  title: "Biggest Category",
                  value:
                    categoryData.sort((a, b) => b.value - a.value)[0]?.name ||
                    "—",
                  sub: categoryData[0] ? fmt(categoryData[0].value) : "",
                },
                {
                  icon: "📅",
                  title: "Highest Spend Day",
                  value: `Day ${Object.entries(summary.dailyTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"}`,
                  sub: fmt(
                    Object.values(summary.dailyTotals).sort(
                      (a, b) => b - a,
                    )[0] || 0,
                  ),
                },
                {
                  icon: "🧾",
                  title: "Total Transactions",
                  value: summary.totalTransactions,
                  sub: `avg ${fmt(summary.total / summary.totalTransactions)} each`,
                },
              ].map((card, i) => (
                <div key={i} className="rounded-xl p-5" style={CARD}>
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <p className="text-xs text-gray-400 mb-1">{card.title}</p>
                  <p className="text-lg font-bold text-white">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* All Expenses Table */}
      <div className="rounded-xl p-5 mt-4 ml-10 mr-10" style={CARD}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-300">
            📋 All Expenses — {MONTHS[month - 1]} {year}
          </p>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="rounded-lg px-3 py-1.5 text-xs text-white border border-gray-600 focus:outline-none"
            style={{ backgroundColor: "#0D1117" }}
          >
            <option value="">All Categories</option>
            {[
              "Food Delivery",
              "Groceries",
              "Transport",
              "Entertainment",
              "Shopping",
              "Health",
              "Utilities",
              "Stationary",
              "Other",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs text-gray-500 pb-3 font-medium">
                    Name
                  </th>
                  <th className="text-left text-xs text-gray-500 pb-3 font-medium">
                    Category
                  </th>
                  <th className="text-left text-xs text-gray-500 pb-3 font-medium">
                    Date & Time
                  </th>
                  <th className="text-right text-xs text-gray-500 pb-3 font-medium">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((e) => (
                  <tr
                    key={e._id}
                    className="border-b border-gray-800 hover:bg-gray-900"
                  >
                    <td className="py-3 text-white">{e.name}</td>
                    <td className="py-3">
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: CAT_COLORS[e.category] + "22",
                          color: CAT_COLORS[e.category],
                        }}
                      >
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">
                      {new Date(e.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      {new Date(e.date).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 text-white font-medium text-right">
                      {fmt(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-700">
                  <td
                    colSpan="3"
                    className="pt-3 text-xs text-gray-400 font-medium"
                  >
                    {filteredExpenses.length} transactions
                  </td>
                  <td className="pt-3 text-right font-bold text-white">
                    {fmt(filteredExpenses.reduce((a, e) => a + e.amount, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-6">
            No expenses for this month
          </p>
        )}
      </div>
    </div>
  );
}
