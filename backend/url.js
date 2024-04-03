const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  origUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
  },
  urlId: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date, 
    required: true, 
  },
  date: {
    type: Date,
    default: Date.now,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
});


module.exports = mongoose.model("Url", urlSchema);
