const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment config
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Expense = require('../models/Expense');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spendwise';

const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];

// Generate sample expenses over the last 6 months
const generateSampleData = () => {
  const data = [];
  const now = new Date();
  
  // Static descriptions for realism
  const details = {
    Food: [
      { title: 'Weekly Groceries', amount: [1500, 3200], note: 'Supermarket purchase for the household' },
      { title: 'Restaurant Dinner', amount: [1200, 2500], note: 'Weekend meal out with family' },
      { title: 'Coffee & Snacks', amount: [150, 450], note: 'Office break' },
      { title: 'Pizza Delivery', amount: [600, 1100], note: 'Lazy Sunday night food' }
    ],
    Transport: [
      { title: 'Monthly Fuel Refill', amount: [2000, 4000], note: 'Car gas station' },
      { title: 'Cab Ride', amount: [200, 650], note: 'Late night commute home' },
      { title: 'Metro Smartcard Recharge', amount: [500, 1000], note: 'Weekly train pass' }
    ],
    Shopping: [
      { title: 'Summer Clothing', amount: [2500, 6000], note: 'Bought new shirts and jeans' },
      { title: 'Sneakers Purchase', amount: [3500, 7500], note: 'Sports shoes update' },
      { title: 'Books & Stationery', amount: [400, 1200], note: 'Tech books and notebooks' }
    ],
    Bills: [
      { title: 'Broadband Internet', amount: [799, 1200], note: 'High speed fiber monthly dues' },
      { title: 'Electricity Bill', amount: [3000, 6500], note: 'State grid power bill' },
      { title: 'Mobile Phone Plan', amount: [499, 899], note: 'Prepaid phone plan renewal' },
      { title: 'Rent payment', amount: [12000, 15000], note: 'Monthly apartment lease payment' }
    ],
    Entertainment: [
      { title: 'Movie Tickets', amount: [500, 1200], note: 'Weekend movie with popcorn' },
      { title: 'Streaming Subscriptions', amount: [649, 999], note: 'Netflix & Spotify combo' },
      { title: 'Gaming Store Purchase', amount: [1500, 4000], note: 'New game release on Steam' }
    ],
    Other: [
      { title: 'Gym Membership Renewal', amount: [1500, 3000], note: 'Monthly fitness pass' },
      { title: 'Gift for Friend', amount: [1000, 2500], note: 'Birthday present purchase' },
      { title: 'Laundry Service', amount: [300, 800], note: 'Dry cleaning charges' }
    ]
  };

  // Helper to generate a random number within range
  const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Let's seed data for the last 6 months (Month -5 to Month 0 (current))
  for (let m = 5; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 15);
    const year = monthDate.getFullYear();
    const monthIndex = monthDate.getMonth();
    
    // Total days in this month
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();
    
    // Seed 12-16 random expenses per month
    const count = randomRange(12, 16);
    
    for (let i = 0; i < count; i++) {
      // Pick a random category
      const cat = categories[randomRange(0, categories.length - 1)];
      // Pick a random template from that category
      const templates = details[cat];
      const template = templates[randomRange(0, templates.length - 1)];
      
      // Randomize amount within template range
      const finalAmount = parseFloat((randomRange(template.amount[0], template.amount[1]) + Math.random()).toFixed(2));
      
      // Random day in the month
      const day = randomRange(1, totalDays);
      const expenseDate = new Date(year, monthIndex, day, randomRange(9, 21), randomRange(0, 59));

      // Make sure we don't log future expenses for the current month unless we want upcoming bills
      if (m === 0 && expenseDate > now) {
        // Skip or set to now
        expenseDate.setDate(now.getDate() - randomRange(0, now.getDate() - 1));
      }

      data.push({
        title: template.title,
        amount: finalAmount,
        category: cat,
        date: expenseDate,
        note: template.note
      });
    }
  }

  return data;
};

const seedDatabase = async () => {
  try {
    console.log(`Connecting to database at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB. Wiping existing expenses...');
    
    await Expense.deleteMany({});
    console.log('Expenses wiped successfully.');

    const sampleExpenses = generateSampleData();
    console.log(`Generated ${sampleExpenses.length} sample expenses. Inserting...`);

    const result = await Expense.insertMany(sampleExpenses);
    console.log(`Successfully seeded ${result.length} expenses into the database!`);
    
    await mongoose.connection.close();
    console.log('Database connection closed safely. Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  }
};

seedDatabase();
