const mongoose=require('mongoose')
const LoginSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Number,
        required:true,
        default:0
    },
    blocked:{
        type:Number,
        required:true,
        default:0
    }
    
})

module.exports= mongoose.model('user',LoginSchema)