const mongoose = require('mongoose');

// Define Subcategory Schema
const subcategorySchema = new mongoose.Schema({
 label: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: String,
    required: true,
  },
});

// Define Category Schema
const categorySchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: String,
    required: true,
  },
  subcategories: [subcategorySchema], // Embedding Subcategory Schema as an array
});

// Create models based on the schemas
const Category = mongoose.model('Category', categorySchema);

module.exports =  Category;
