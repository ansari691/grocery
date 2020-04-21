const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId : { type : String, required : true },
  products : [{
    image : { type : String, required : true },
    productName: { type: String, required : true },
    brandName : { type : String, required : true },
    productSize : { type : Number, required : true },
    productUnit : { type : String, required : true },
    productPrice : { type : Number, required : true },
    productDiscount : { type : Number, required : true },
    productQuantity : { type  : Number, required : true },
    productTotal : { type : Number }
  }],
  cartAmount : { type : Number }
});

module.exports = Cart = mongoose.model("cart", CartSchema);
