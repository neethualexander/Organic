const mongoose =require("mongoose");
 const productSchema =  mongoose.Schema({
    productName:{
        type: String,
        required:true,
    },
    productnameLower:{
        type:String,
        required:true
    },
    price:{
        type: String,
        required: true,
    },
    
    productDes:{
        type: String,
        required: true,
    },
      productQuantity: {
        type: Number,
        required: true
      },
      category_id: {
       type: mongoose.Schema.Types.ObjectId,
       ref:'category',
       required:true
      },
    productImage:{
        type: Array,
        required: true,
        validate:[arraylimit,"maximun 3 product image"]
     },
     offerpercentage:{
        type:Number,
        default:0

     },
     offerprice:{
        type:Number,
        default:0
     }
    
    });
    function arraylimit(val) {
        return val.length <= 3;
    }
    
    module.exports = mongoose.model("Product",productSchema);