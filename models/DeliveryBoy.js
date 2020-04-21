const mongoose = require("mongoose");

const DeliveryBoySchema = new mongoose.Schema({
  image : { type : String },
  firstName : { type : String, required : true },
  lastName : { type : String, required : true },
  gender :{ type : String, enum: ['MALE', 'FEMALE'], required : true},
  dob : { type : Date , required : true},
  phone : { type : Number, required : true},
  email : { type : String, required : true },
  aadharNo : { type : Number, required : true },
  panNo : { type : String, required : true },
  joiningDate : { type : Date, required : true },
  address : { type : String , required : true},
  emergencyContactName : { type : String },
  emergencyContactNumber : { type : Number },
  userName : { type : String },
  password : { type : String },
  active : { type : Boolean, default : true }
});

module.exports = DeliveryBoy = mongoose.model("deliveryBoy", DeliveryBoySchema);
