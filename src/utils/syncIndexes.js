// Drops any index in the database that isn't defined in the current schema,
// and creates any that are missing. Fixes exactly the kind of problem where
// an old/stray index (e.g. a leftover unique index on a field no longer in
// the schema) blocks inserts with a confusing duplicate-key error.
//
// Safe to run any time — it only touches indexes, never documents.
// Run with: npm run fix-indexes
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Review = require("../models/Review");
const Order = require("../models/Order");
const User = require("../models/User");

const syncAll = async () => {
  await connectDB();

  const models = { Product, Category, Review, Order, User };

  for (const [name, model] of Object.entries(models)) {
    console.log(`\nIndexes on ${name} before sync:`);
    console.log(await model.collection.indexes());

    const result = await model.syncIndexes();
    console.log(`${name}: syncIndexes result ->`, result);
  }

  await mongoose.connection.close();
  console.log("\nDone. Restart your server and try creating a product again.");
};

syncAll().catch((err) => {
  console.error(err);
  process.exit(1);
});