const mongoose= require('mongoose');

 const orderSchema =   mongoose.Schema({

   userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"user",
    requried: true
   },
   product :[{
    product_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required: true
    },
    quantity:{
        type: Number,
        required: true,
    }
    }],
    total:{
        type:Number,
        required:true
    },
    coupon:{
        type:String,
        default:0,
        required:false
    },
    paymentMethod:{
     type:String,
     required:true
    },
   status:{
    type:String,
    default:"Pending"
   },
   address:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Address",
    required: true
   },
orderDate:{
    type: Date,
    default: Date.now
},
paymentstatus:{
    type:String,
    required:true
}

 })
 module.exports = mongoose.model('order',orderSchema);