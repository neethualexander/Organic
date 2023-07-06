const mongoose = require("mongoose");
const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  categoryLower:{
    type:String,
    required:true,
    
  },
  Description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("category", categorySchema);
