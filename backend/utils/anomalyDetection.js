export const detectAnomalies = (expenses, categoryTotals, dailyTotals, total) => {
  const anomalies = []
  if (!expenses.length) return anomalies

  // Category spike — over 40% of total
  Object.entries(categoryTotals).forEach(([cat, amount]) => {
    const pct = Math.round((amount / total) * 100)
    if (pct > 40) {
      anomalies.push({
        type: 'warn',
        title: `${cat} spike`,
        desc: `₹${Math.round(amount).toLocaleString('en-IN')} spent — ${pct}% of your budget this month.`
      })
    }
  })

  // High single day — over 2x daily average
  const dayValues = Object.values(dailyTotals)
  const dailyAvg = dayValues.reduce((a, b) => a + b, 0) / dayValues.length
  Object.entries(dailyTotals).forEach(([day, amount]) => {
    if (amount > dailyAvg * 2) {
      anomalies.push({
        type: 'danger',
        title: 'Unusually high day',
        desc: `Day ${day} had ₹${Math.round(amount).toLocaleString('en-IN')} — ${Math.round(amount / dailyAvg)}x your daily average.`
      })
    }
  })

  // Spending acceleration — last 3 transactions above overall average
  if (expenses.length >= 3) {
    const overallAvg = total / expenses.length
    const last3Avg = expenses.slice(0, 3).reduce((a, e) => a + e.amount, 0) / 3
    if (last3Avg > overallAvg * 1.4) {
      anomalies.push({
        type: 'warn',
        title: 'Spending accelerating',
        desc: `Your last 3 transactions average ₹${Math.round(last3Avg).toLocaleString('en-IN')}, above your usual pattern.`
      })
    }
  }

  return anomalies
}