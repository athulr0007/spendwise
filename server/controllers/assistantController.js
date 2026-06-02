const Expense = require('../models/Expense');

const parseGroqResponse = (json) => {
  if (!json) return null;

  if (Array.isArray(json.output) && json.output.length > 0) {
    const content = json.output[0]?.content;
    if (Array.isArray(content)) {
      const textBlock = content.find((item) => item.type === 'output_text');
      return textBlock?.text || content.map((item) => item.text || '').join(' ');
    }
  }

  if (Array.isArray(json.results) && json.results.length > 0) {
    const output = json.results[0]?.output;
    if (Array.isArray(output) && output.length > 0) {
      const content = output[0]?.content;
      if (Array.isArray(content)) {
        const textBlock = content.find((item) => item.type === 'output_text');
        return textBlock?.text || content.map((item) => item.text || '').join(' ');
      }
    }
  }

  if (json.output_text) {
    return json.output_text;
  }

  return null;
};

const queryAssistant = async (req, res, next) => {
  try {
    const question = (req.body.question || '').trim();
    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const apiKey = process.env.GROQ_API || process.env.GROQ_API_KEY;
    const configuredUrl = process.env.GROQ_API_URL || 'https://api.groq.ai/v1/outputs';
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ API key is not configured.' });
    }

    const expenses = await Expense.find({}).sort({ date: -1 }).limit(200).lean();
    const expenseRecords = expenses.map((expense) => ({
      date: expense.date?.toISOString().slice(0, 10) || '',
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      note: expense.note || ''
    }));

    const prompt = `You are a helpful personal expense assistant. Use only the expense records provided to answer the user's question. Do not hallucinate or invent information. If the question cannot be answered from the data, say that the information is not available.

Expenses:
${JSON.stringify(expenseRecords, null, 2)}

Question: ${question}

Please answer briefly and clearly, including rupee amounts when applicable.`;

    const payload = {
      model,
      input: prompt,
      max_output_tokens: 400,
      temperature: 0.2
    };

    let response = null;
    let lastError = null;
    try {
      response = await fetch(configuredUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      lastError = err;
    }

    if (!response) {
      console.error('GROQ assistant network error:', lastError);
      return res.status(502).json({
        error: 'Unable to reach the Groq API endpoint. Please check network connectivity and GROQ_API_URL.',
        details: lastError?.message
      });
    }

    if (!response.ok) {
      const responseBody = await response.text();
      const message = `GROQ API request failed (${response.status})`;
      console.error(message, responseBody);
      return res.status(502).json({
        error: message,
        details: responseBody
      });
    }

    const json = await response.json();
    const answer = parseGroqResponse(json) || 'I could not generate an answer from the Groq model.';

    return res.status(200).json({ answer });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  queryAssistant
};