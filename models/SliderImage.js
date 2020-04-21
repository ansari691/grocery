const mongoose = require("mongoose");

const SliderImageSchema = new mongoose.Schema({
  image : { type : String },
  text : { type: String },
});

module.exports = SliderImage = mongoose.model('sliderImage', SliderImageSchema);
