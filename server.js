const mongoose=require('mongoose')
const flash=require('connect-flash');

require("dotenv").config()
mongoose.connect(process.env.dbconnect,{useNewUrlParser:true})
.then(()=>{
    console.log('mongodb connected');
}).catch(()=>{
    console.log('failed to connect');
})



const express=require('express')
const session = require('express-session');
const app=express()

app.use(
    session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: true,
    })
  );

  app.use(flash());

const userRouter=require('./router/userRouter')
const adminRouter=require('./router/adminRouter')

app.use('/admin',adminRouter);
app.use('/',userRouter);





app.listen(3000,()=>{
    console.log("server started");
})
