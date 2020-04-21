const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId : { type : String, required : true },
  name : { type : String, required : true },
  email : { type : String, required : true },
  phone : { type : String, required : true },
  products : [{
    image : { type : String, required : true },
    productName: { type: String, required : true },
    brandName : { type : String, required : true },
    productSize : { type : Number, required : true },
    productUnit : { type : String, required : true },
    productPrice : { type : Number, required : true },
    productDiscount : { type : Number, required : true },
    productQuantity : { type  : Number, required : true }
  }],
  orderAmount : { type : Number },
  orderStatus : { type : String, enum: ['ORDERED', 'INPROGRESS', 'DELIVERED'], default : 'ORDERED'},
  address : {
    addressType : String,
    landmark : String,
    area : String,
    street : String,
    pincode : String
  },
  paymentMode : { type : String, default : 'CASH_ON_DELIVERY' },
  orderDate : { type: Date, default: Date.now },
  deliveryDate : { type : Date },
  deliveryBoyId : { type : String }
});

module.exports = Order = mongoose.model("order", OrderSchema);
