const express = require('express');
const user_Router = express();
const path=require('path')
const userController = require('../controller/userController')
const bodyparser = require('body-parser')
user_Router.set('view engine','ejs')
user_Router.set('views','./views/user')
//const flash=require('connect-flash');
const session=require('express-session')
const nocache=require('nocache')
const cartController = require('../controller/cartController')
const flash = require('connect-flash')
const cors=require("cors")
//const path=require("path")
const cookieParser=require("cookie-parser")
const Razorpay=require('razorpay')
const Wallet = require("../model/walletmodel");
const Banner = require('../model/banner');
const adminRouter=require('../router/adminRouter')





user_Router.use(cors());
user_Router.use(express.json());
user_Router.use(express.urlencoded({extended:false}))
//const client=require(twilio(accountSid,authtoken))


//user_Router.use(flash());

user_Router.use(express.static('public'))

user_Router.use(bodyparser.json());
user_Router.use(bodyparser.urlencoded({extended:true}))
user_Router.use(flash())

user_Router.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}));
 user_Router.use(nocache());

user_Router.get('/',userController.load_home);
user_Router.get("/t-shirtpage",userController.home_productpage)
user_Router.get('/login',userController.load_loginpage)
user_Router.get('/register',userController.Sign_up)
// user_Router.get('/admin',)
// user_Router.post('/loggedin',userController.verifylogin)
user_Router.post('/register',userController.add_newuser)
user_Router.post('/sigin',userController.verifylogin)
user_Router.post('/configmobotp',userController.configmobotp)
user_Router.post('/mob-verify',userController.mobverify)
//search product...........
user_Router.post("/search",userController.productsearch)


user_Router.get('/otp',userController.otp_page,);
user_Router.post('/otpverify',userController.otp_signIn);
user_Router.get('/otpverify',userController.load_otpverifypage);
user_Router.post('/otp_verify',userController.otp_verify);
user_Router.get('/logoutView',userController.logoutView);
// forgot password......
user_Router.get('/forgot',userController.forgot_page,);
user_Router.post('/passwordotp',userController.otp_passwrdrest);
user_Router.post('/password_otp',userController.password_otp);
user_Router.post('/resetPassword',userController.resetPassword)
// load category page......
user_Router.get('/categorypage',userController.Category_page)
//load productpage......
user_Router.get('/product',userController.load_productpage)
user_Router.get('/viewproduct',userController.load_viewproduct)
//user_Router.post('/filterproduct',userController.filter_product)//filter according to check boxes
// load cart.................
user_Router.get('/cart',cartController.load_cart);
user_Router.get('/addtocart',cartController.add_to_cart);
user_Router.post('/decrementproduct',cartController.decrement_product);
user_Router.post('/incrementproduct',cartController.increment_product);
user_Router.get('/deletecartitem',cartController.delete_cartitem);
// userprofile.........
user_Router.get('/profile',userController.load_profile);
user_Router.post('/edituserdeatils',userController.edituser_Details);
user_Router.post('/addaddress',userController.add_address);
user_Router.get('/deleteaddress',userController.delete_address);
user_Router.post('/updatepassword',userController.update_password);
user_Router.get('/logout',userController.log_out)
//checkoutpage............
user_Router.get('/checkout',cartController.check_out);
user_Router.get('/checkvalidcoupon',cartController.checkvalid_Coupon)
//order.....................

user_Router.post('/orderdetails',cartController.order_Details);
user_Router.post('/cancelorder',cartController.cancel_order);
user_Router.get('/orderhistory',cartController.order_history);
user_Router.post('/returnorder',cartController.return_order);
//wishlist..............
user_Router.get('/wishlist',cartController.load_wishlist);
user_Router.get('/addtowishlist',cartController.add_to_wishlist);
user_Router.get('/deletewishlistitem',cartController.delete_wishlist);
//order success.......
user_Router.post('/razorpay',cartController.createOrder);
//user_Router.get('/ordersuccess',cartController.ordersuccess_page);

user_Router.use('/admin', adminRouter);

user_Router.use((req, res, next) => {
    const error = new Error('Page not found');
    error.status = 404;
    next(error);
  });
  
  // Error handling middleware to display the error message
  user_Router.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    res.status(status).render('error', { error: message });
  });

module.exports = user_Router