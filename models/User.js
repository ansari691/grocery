const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  uid : { type: String, required: true, unique: true },
  phone: { type: Number},
  address : [
    {
      addressType : String,
      landmark : String,
      area : String,
      street : String,
      pincode : String
    }
  ],
  image : { type : String },
  date: { type: Date, default: Date.now }
});

module.exports = User = mongoose.model("user", UserSchema);
