const mongoose = require('mongoose');
const Expense = require('../models/Expense');

// Utility to escape regex characters to prevent regex injection
const escapeRegex = (string) => {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
};

// 1. GET /api/expenses - List with filters & pagination
const getExpenses = async (req, res, next) => {
  try {
    const { category, from, to, title, page = 1, limit = 50 } = req.query;

    const query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by partial title search
    if (title) {
      const sanitized = escapeRegex(title.trim());
      query.title = { $regex: sanitized, $options: 'i' };
    }

    // Filter by date range (from/to)
    if (from || to) {
      let start = from ? new Date(from) : null;
      let end = to ? new Date(to) : null;

      // Automatically swap if start date is after end date
      if (start && end && start > end) {
        [start, end] = [end, start];
      }

      query.date = {};
      if (start) {
        query.date.$gte = start;
      }
      if (end) {
        // Set end to the very end of that day (23:59:59.999) to cover the full day
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        query.date.$lte = endOfDay;
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    // Fetch matching data and count total records
    const data = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Expense.countDocuments(query);

    return res.status(200).json({
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /api/expenses/:id - Fetch a single expense
const getExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    return res.status(200).json(expense);
  } catch (error) {
    next(error);
  }
};

// 3. POST /api/expenses - Create a new expense
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, note } = req.body;

    const newExpense = new Expense({
      title,
      amount: parseFloat(amount),
      category,
      date: date ? new Date(date) : undefined,
      note: note || ''
    });

    const saved = await newExpense.save();
    return res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

// 4. PUT /api/expenses/:id - Update expense
const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (amount !== undefined) updateFields.amount = parseFloat(amount);
    if (category !== undefined) updateFields.category = category;
    if (date !== undefined) updateFields.date = new Date(date);
    if (note !== undefined) updateFields.note = note;

    const updated = await Expense.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// 5. DELETE /api/expenses/:id - Delete expense
const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const deleted = await Expense.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    return res.status(204).send(); // 204 No Content
  } catch (error) {
    next(error);
  }
};

// 6. GET /api/expenses/summary/monthly - Aggregated stats
const getMonthlySummary = async (req, res, next) => {
  try {
    // Expecting YYYY-MM
    const targetMonth = req.query.month || new Date().toISOString().slice(0, 7);
    const [year, monthVal] = targetMonth.split('-').map(Number);

    if (isNaN(year) || isNaN(monthVal) || monthVal < 1 || monthVal > 12) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
    }

    const startOfMonth = new Date(Date.UTC(year, monthVal - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, monthVal, 0, 23, 59, 59, 999));

    // Current month aggregation
    const currentMonthStats = await Expense.aggregate([
      { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
      }},
      { $project: { _id: 0, category: '$_id', total: 1, count: 1 } }
    ]);

    // Format categories map with defaults
    const categories = {
      Food: 0,
      Transport: 0,
      Shopping: 0,
      Bills: 0,
      Entertainment: 0,
      Other: 0
    };

    let total = 0;
    let count = 0;

    currentMonthStats.forEach((stat) => {
      if (categories[stat.category] !== undefined) {
        categories[stat.category] = parseFloat(stat.total.toFixed(2));
      }
      total += stat.total;
      count += stat.count;
    });

    // Previous month aggregation
    const prevYear = monthVal === 1 ? year - 1 : year;
    const prevMonthVal = monthVal === 1 ? 12 : monthVal - 1;
    const startOfPrevMonth = new Date(Date.UTC(prevYear, prevMonthVal - 1, 1));
    const endOfPrevMonth = new Date(Date.UTC(prevYear, prevMonthVal, 0, 23, 59, 59, 999));

    const prevMonthStats = await Expense.aggregate([
      { $match: { date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } } },
      { $group: {
          _id: null,
          total: { $sum: '$amount' }
      }}
    ]);

    const previousMonthTotal = prevMonthStats.length > 0 ? parseFloat(prevMonthStats[0].total.toFixed(2)) : 0;

    return res.status(200).json({
      total: parseFloat(total.toFixed(2)),
      count,
      categories,
      previousMonth: {
        total: previousMonthTotal
      }
    });
  } catch (error) {
    next(error);
  }
};

// 7. GET /api/expenses/summary/trends - Rolling 6-month grouping
const getTrendsSummary = async (req, res, next) => {
  try {
    // Generate dates for past 6 months (including current month)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrends = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1; // 1-indexed for matching aggregation output
      formattedTrends.push({
        year: y,
        monthNumber: m,
        month: monthNames[m - 1],
        Food: 0,
        Transport: 0,
        Shopping: 0,
        Bills: 0,
        Entertainment: 0,
        Other: 0,
        total: 0
      });
    }

    // Earliest date is 6 months ago (start of that month)
    const earliestMonthStart = new Date(formattedTrends[0].year, formattedTrends[0].monthNumber - 1, 1);

    const trends = await Expense.aggregate([
      { $match: { date: { $gte: earliestMonthStart } } },
      { $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            category: '$category'
          },
          total: { $sum: '$amount' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Hydrate trends array
    trends.forEach((stat) => {
      const bucket = formattedTrends.find(
        (b) => b.year === stat._id.year && b.monthNumber === stat._id.month
      );
      if (bucket) {
        if (bucket[stat._id.category] !== undefined) {
          bucket[stat._id.category] = parseFloat(stat.total.toFixed(2));
        }
        bucket.total = parseFloat((bucket.total + stat.total).toFixed(2));
      }
    });

    return res.status(200).json(formattedTrends);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlySummary,
  getTrendsSummary
};
