import Groq from "groq-sdk";

export const generateAIReport = async (summary) => {
  const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const { categoryTotals, dailyTotals, total, totalTransactions } = summary;

  if (!total) return [];

  const prompt = `
You are Finspect, an AI expense detective. Analyze this user's monthly spending data and give 4-5 sharp, honest insights like a financial detective. Be direct, specific, use the actual numbers.

Spending Data:
- Total spent: ₹${Math.round(total).toLocaleString("en-IN")}
- Total transactions: ${totalTransactions}
- Category breakdown: ${JSON.stringify(categoryTotals)}
- Daily totals: ${JSON.stringify(dailyTotals)}

Return a JSON array of insights. Each insight must have:
- type: "danger" or "warn" or "good" or "info"
- icon: one relevant emoji
- title: short punchy title (5 words max)
- message: 2 sentences max, specific to their numbers, sounds like a detective finding clues

Return ONLY the JSON array, no explanation, no markdown, no backticks.
`;

  try {
    const response = await client.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const text = response.choices[0].message.content.trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("AI report error:", err);
    // fallback if AI fails
    return [
      {
        type: "info",
        icon: "📊",
        title: "Monthly Summary",
        message: `You spent ₹${Math.round(total).toLocaleString("en-IN")} across ${totalTransactions} transactions this month.`,
      },
    ];
  }
};
