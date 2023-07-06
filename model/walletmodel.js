const mongoose = require("mongoose");

const walletSchema = mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },

  
  orderDetails: [
    {
      orderid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order",
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("wallet", walletSchema);