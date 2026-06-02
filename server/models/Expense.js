const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'],
        message: '{VALUE} is not a valid category'
      }
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now
    },
    note: {
      type: String,
      maxlength: [500, 'Note cannot exceed 500 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance and sorting
expenseSchema.index({ date: -1 });                  // primary sort for list view
expenseSchema.index({ category: 1, date: -1 });     // compound for filter + sort
expenseSchema.index({ title: 'text' });             // full-text index for partial title search

module.exports = mongoose.model('Expense', expenseSchema);
