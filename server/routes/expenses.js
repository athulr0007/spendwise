const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlySummary,
  getTrendsSummary,
  downloadExpensesExcel
} = require('../controllers/expenseController');
const { expenseValidationRules, validate } = require('../middleware/validate');

// Download route (must come before other routes)
router.get('/download/excel', downloadExpensesExcel);

// Aggregation summary routes (must come BEFORE /:id to prevent routing clashes)
router.get('/summary/monthly', getMonthlySummary);
router.get('/summary/trends', getTrendsSummary);

// CRUD endpoints
router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.post('/', expenseValidationRules, validate, createExpense);
router.put('/:id', expenseValidationRules, validate, updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
