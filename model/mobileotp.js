const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 300 },
  }
});
    
const Motp =new mongoose.model("MOB", otpSchema);

module.exports = Motp;
