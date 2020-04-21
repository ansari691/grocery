const mongoose = require("mongoose");

const DatabaseSequenceSchema = new mongoose.Schema({
  sequenceName : { type : String },
  sequence : { type: Number, default : 0 },
});

module.exports = DatabaseSequence = mongoose.model("databaseSequence", DatabaseSequenceSchema);
