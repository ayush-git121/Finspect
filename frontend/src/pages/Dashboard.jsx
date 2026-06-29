import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import {
  getExpenses,
  createExpense,
  deleteExpense,
  getSummary,
} from "../api/expenses.js";
import { fmt } from "../utils/formatCurrency.js";
import toast from "react-hot-toast";
import { getBudgets } from "../api/budgets.js";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const CATEGORIES = [
  "Food Delivery",
  "Groceries",
  "Transport",
  "Entertainment",
  "Shopping",
  "Health",
  "Utilities",
  "Stationary",
  "Other",
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

const CARD = { backgroundColor: "#161B22", border: "1px solid #30363D" };

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "Food Delivery",
    amount: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const fetchAll = async () => {
    try {
      const [expRes, sumRes, budgetRes] = await Promise.all([
        getExpenses({ month, year }),
        getSummary({ month, year }),
        getBudgets(),
      ]);
      setExpenses(expRes.data);
      setSummary(sumRes.data);
      setBudgets(budgetRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.amount) return toast.error("Fill all fields");
    setSubmitting(true);
    try {
      await createExpense({ ...form, amount: Number(form.amount) });
      toast.success("Expense added!");
      setForm({ name: "", category: "Food Delivery", amount: "" });
      fetchAll();
    } catch (err) {
      toast.error("Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      toast.success("Deleted!");
      fetchAll();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const pieData = summary
    ? Object.entries(summary.categoryTotals).map(([name, value]) => ({
        name,
        value,
      }))
    : [];
  const barData = summary
    ? Object.entries(summary.dailyTotals).map(([day, amount]) => ({
        day: `Day ${day}`,
        amount,
      }))
    : [];

  const budgetAlerts = budgets
    .filter((b) => {
      const spent = summary?.categoryTotals?.[b.category] || 0;
      return spent > b.limitAmount;
    })
    .map((b) => ({
      category: b.category,
      spent: summary?.categoryTotals?.[b.category] || 0,
      limit: b.limitAmount,
      pct: Math.round(
        ((summary?.categoryTotals?.[b.category] || 0) / b.limitAmount) * 100,
      ),
    }));

  const detectiveInsights = [
    summary?.total > 0 &&
      `You've spent ${fmt(summary.total)} across ${summary.totalTransactions} transactions this month.`,
    pieData.length > 0 &&
      `Biggest category: ${pieData.sort((a, b) => b.value - a.value)[0]?.name} at ${fmt(pieData[0]?.value)}.`,
    summary?.anomalies?.length > 0 &&
      `⚠️ ${summary.anomalies.length} anomaly detected — check alerts below.`,
  ].filter(Boolean);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D1117" }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Detective Bar */}
        {detectiveInsights.length > 0 && (
          <div
            className="rounded-xl px-5 py-4 mb-6 border border-purple-500 flex items-start gap-3 bg-purple-700"
            style={{ backgroundColor: "" }}
          >
            <span className="text-xl">🔍</span>
            <div>
              <p className="text-lg font-semibold text-yellow-500 mb-1">
                Detective Insight
              </p>
              {detectiveInsights.map((i, idx) => (
                <p key={idx} className="text-sm text-purple-200">
                  {i}
                </p>
              ))}
            </div>
          </div>
        )}

        {budgetAlerts.length > 0 && (
          <div
            className="rounded-xl p-5 mb-6 border border-red-800"
            style={{ backgroundColor: "#1a0a0a" }}
          >
            <p className="text-sm font-semibold text-red-400 mb-3">
              🚨 Budget Exceeded
            </p>
            <div className="flex flex-col gap-3">
              {budgetAlerts.map((alert, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white font-medium">
                      {alert.category}
                    </p>
                    <p className="text-xs text-red-400 font-semibold">
                      {fmt(alert.spent)} / {fmt(alert.limit)} ({alert.pct}%)
                    </p>
                  </div>
                  <div
                    className="w-full rounded-full h-2"
                    style={{ backgroundColor: "#30363D" }}
                  >
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(alert.pct, 100)}%`,
                        backgroundColor:
                          alert.pct > 150
                            ? "#ef4444"
                            : alert.pct > 100
                              ? "#f97316"
                              : "#eab308",
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    You exceeded your {fmt(alert.limit)} budget by{" "}
                    {fmt(alert.spent - alert.limit)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Spent",
              value: summary ? fmt(summary.total) : "₹0",
            },
            { label: "Transactions", value: summary?.totalTransactions || 0 },
            {
              label: "Top Category",
              value: pieData.sort((a, b) => b.value - a.value)[0]?.name || "—",
            },
            {
              label: "Daily Avg",
              value: summary?.total
                ? fmt(summary.total / new Date(year, month, 0).getDate())
                : "₹0",
            },
          ].map((m, i) => (
            <div key={i} className="rounded-xl p-4" style={CARD}>
              <p className="text-xs text-gray-400 mb-1">{m.label}</p>
              <p className="text-xl font-bold text-white truncate">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Add Expense Form */}
        <div className="rounded-xl p-5 mb-6" style={CARD}>
          <p className="text-sm font-semibold text-gray-300 mb-4">
            Add Expense
          </p>
          <form
            onSubmit={handleAdd}
            className="flex flex-col md:flex-row gap-3"
          >
            <input
              type="text"
              placeholder="Description (e.g. Swiggy order)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="flex-1 rounded-lg px-3 py-2 text-sm text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ backgroundColor: "#0D1117" }}
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-lg px-3 py-2 text-sm text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ backgroundColor: "#0D1117" }}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount ₹"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full md:w-32 rounded-lg px-3 py-2 text-sm text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ backgroundColor: "#0D1117" }}
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-red-600 hover:bg-red-400 cursor-pointer text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {submitting ? "Adding..." : "+ Add"}
            </button>
          </form>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <div className="rounded-xl p-5" style={CARD}>
            <p className="text-sm font-semibold text-gray-300 mb-4">
              Spending by Category
            </p>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={CAT_COLORS[entry.name] || "#888"} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => fmt(val)}
                      contentStyle={{
                        backgroundColor: "#161B22",
                        border: "1px solid #30363D",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2">
                  {pieData.map((e, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: CAT_COLORS[e.name] || "#888",
                        }}
                      ></div>
                      <span className="text-xs text-gray-400">{e.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm text-center py-10">
                No data yet
              </p>
            )}
          </div>

          {/* Bar Chart */}
          <div className="rounded-xl p-5" style={CARD}>
            <p className="text-sm font-semibold text-gray-300 mb-4">
              Daily Spending
            </p>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
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
                  <Bar dataKey="amount" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm text-center py-10">
                No data yet
              </p>
            )}
          </div>
        </div>

        {/* Anomalies + Recent Expenses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Anomaly Alerts */}
          <div className="rounded-xl p-5" style={CARD}>
            <p className="text-sm font-semibold text-gray-300 mb-4">
              Anomaly Alerts
            </p>
            {summary?.anomalies?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {summary.anomalies.map((a, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-3 border ${a.type === "danger" ? "border-red-800 bg-red-950" : "border-yellow-800 bg-yellow-950"}`}
                  >
                    <p
                      className={`text-sm font-semibold ${a.type === "danger" ? "text-red-400" : "text-yellow-400"}`}
                    >
                      {a.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{a.desc}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No anomalies detected. Spending looks normal ✅
              </p>
            )}
          </div>

          {/* Recent Expenses */}
          <div className="rounded-xl p-5" style={CARD}>
            <p className="text-sm font-semibold text-gray-300 mb-4">
              Recent Expenses
            </p>
            {expenses.length > 0 ? (
              <div className="flex flex-col gap-2">
                {expenses.slice(0, 6).map((e) => (
                  <div
                    key={e._id}
                    className="flex items-center gap-3 py-2 border-b border-gray-800"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: CAT_COLORS[e.category] || "#888",
                      }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{e.name}</p>
                      <p className="text-xs text-gray-500">
                        {e.category} •{" "}
                        {new Date(e.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        {new Date(e.date).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>{" "}
                    </div>
                    <p className="text-sm font-medium text-white">
                      {fmt(e.amount)}
                    </p>
                    <button
                      onClick={() => handleDelete(e._id)}
                      className="text-gray-600 hover:text-red-400 text-xs ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No expenses yet. Add your first one above!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
