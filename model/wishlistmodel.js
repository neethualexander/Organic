const mongoose = require('mongoose');

const wistlistSchema = mongoose.Schema({

  userId: {
    type: String,
    required: true
    
  },
  product :[{
    product_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required: true
    }}]

});

module.exports = mongoose.model("wishlist", wistlistSchema);