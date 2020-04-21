const mongoose = require("mongoose");

const ProductUnitSchema = new mongoose.Schema({
  unitName: { type: String },
});

module.exports = ProductUnit = mongoose.model("productUnit", ProductUnitSchema);
