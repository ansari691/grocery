const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  image : { type : String },
  productName: { type: String },
  productCategory : { type : String },
  brandName : { type : String },
  productVariants : [{
      productSize : Number,
      productUnit : String,
      productPrice : Number,
      productDiscount : Number,
      active : { type : Boolean, default : true }
  }],
  productDescription : { type : String },
  active : { type : Boolean, default : true },
  productCreationDate : { type: Date, default: Date.now }
});

module.exports = Product = mongoose.model("product", ProductSchema);
