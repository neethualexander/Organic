const express=require('express')
const app=express()
const mongoose=require('mongoose')
const flash=require('connect-flash');
require("dotenv").config()

const {dbconnect} = process.env;

mongoose.connect(dbconnect,{
  useNewUrlParser:true,
  useUnifiedTopology:true
})
.then(()=>{
    console.log('mongodb connected');
}).catch(()=>{
    console.log('failed to connect');
})
  



const session = require('express-session');


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
