const mongoose= require('mongoose');
const cartSchema = mongoose.Schema({

 product :[{
product_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Product",
    required: true
},
Cartquantity:{
    type:Number,
    default:1,
    required :true
}
}],
userId:{
    type: String,
    required:true,

},

})

module.exports = mongoose.model("Cart",cartSchema);