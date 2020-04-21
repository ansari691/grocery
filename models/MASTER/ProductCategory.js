const mongoose = require("mongoose");

const ProductCategorySchema = new mongoose.Schema({
  name: { type: String },
  image : { type : String },
  active : { type : Boolean, default : true }
});

module.exports = ProductCategory = mongoose.model("productCategory", ProductCategorySchema);
