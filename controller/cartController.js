const Cart = require("../model/cartmodel");
const User = require("../model/userModel");
const nodemailer = require("nodemailer");
const Otp = require("../model/otpmodel");
const otpGenerator = require("otp-generator");
const bcrypt=require("bcrypt");
const Wallet = require("../model/walletmodel");
const mongoose=require("mongoose");
const Order = require("../model/ordermodel");
const Coupon = require("../model/couponmodel");
const Address = require("../model/addressmodel");
const Category = require("../model/categorymodel");
const Product = require("../model/productmodel");
const Wishlist = require("../model/wishlistmodel");
const Razorpay=require('razorpay')
const Banner = require('../model/banner');
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

//----------------cart-------
// #laad cart page
const load_cart = async (req, res) => {
    try {
     
       const userid = req.session.user_id;
    // console.log(userid);
     const cartData = await Cart.findOne({ userId: userid }).populate(
        "product.product_id"
      );
      console.log(cartData)
       const session=req.session.user_id;
    
        res.render("cart", { cart: cartData ,session:session});
      
    }
     catch (error) {
       
      res.status(404).render('error',{error:error.message}) 
    }
  
}
  
  // #add to cart method.........
  const  add_to_cart = async (req, res) => {
    try {
      const userId = req.session.user_id;
      console.log(userId);
      const product_id = req.query.id;
      console.log(product_id);
      const finduserincart = await Cart.findOne({ userId: userId });
      if (finduserincart) {
        console.log("if part");
        const productindex = finduserincart.product.findIndex((product) => {
          // console.log('true or false', new String(product.product_id ).trim() == new String(product_id).trim());
          return (
            new String(product.product_id).trim() == new String(product_id).trim()
          );
          
        });
        console.log(productindex);
        if (productindex == -1) {
          const cart_data = await Cart.updateOne(
            { userId: userId },
            { $push: { product: { product_id } } },
            { upsert: true }
          );
          res.send({
            success: true,
            msg: "product added to cart",
            data: cart_data,
          });
        } else {
          res.send({ message: "1" }); //already added the product in cart
        }
      } else {
        console.log("else part");
        const updatecart = new Cart({
          userId: userId,
          product: { product_id :product_id},
        });
        const data = await updatecart.save();
        res.send({ mes: "added", data: data });
      }
    } catch (error) {
      
      res.status(404).render('error',{error:error.message}) 
    }
  };
  
  // In cart with incrementing the product number of quantity also saving the number in database with each ajax call
  const increment_product = async (req, res) => {
    try {
      const prodid = req.body.proID;
      console.log(prodid);
      const Quantity=req.body.quantity;
      const checkQuatity = await Product.findById({ _id: prodid });
      console.log(Quantity)
      const incr = parseInt(Quantity)+ 1;
      console.log(req.session.user_id);
      if (checkQuatity.productQuantity >= incr) {
        const productupdate = await Cart.updateOne(
          { userId: req.session.user_id, "product.product_id":prodid },
          { $inc: { "product.$.Cartquantity": 1 } }
  
        );
        res.send({ message: "1" });
      } else {
        res.send({ message: "0" });
      }
    } catch (error) {
     
      res.status(404).render('error',{error:error.message}) 
    }
  };
  const decrement_product = async (req, res) => {
    try {
      const prodid = req.body.proID;
      console.log(prodid);
      const Quantity=req.body.quantity;
      console.log(Quantity)
      const incr = parseInt(Quantity)- 1;
      
      if(incr>0){
        const productupdate = await Cart.updateOne(
          { userId: req.session.user_id, "product.product_id":prodid },
          { $inc: { "product.$.Cartquantity": -1 } }
        )
        res.send({ message: "1" });
      }else{
        res.send({ message: "0" });
      }
     


    } catch (error) {
       
      res.status(404).render('error',{error:error.message}) 
    }
  };
  // delete item from the cart
  const delete_cartitem = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const productid = req.query.id;
      const cartitem = await Cart.findOne({ userId: userId });
      const productindex = cartitem.product.findIndex((product) => {
        return (
          new String(product.product_id).trim() == new String(productid).trim()
        );
      });
      if (productindex !== -1) {
        cartitem.product.splice(productindex, 1);
        await cartitem.save();
        res.send({ message: "1" });
      } else {
        res.send({ message: "0" });
      }
    } catch (error) {
       
      res.status(404).render('error',{error:error.message}) 
    }
  };
  // ------------checkout ------------
const   check_out = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const session=req.session.user_id;
    console.log(userid);
    const cart = await Cart.find({ userId: userid }).populate(
      "product.product_id"
    );
    const address = await Address.find({ userid: userid });
    const coupon = await Coupon.find({});
    //res.render("checkout", { user: address, cart: cart });
    res.render("checkout", { user: address, cart: cart ,coupon: coupon,session});
  } catch (error) {
     // res.render('error',{error:error.message})
     
     res.status(404).render('error',{error:error.message}) 
  }
};
// checking for user enter coupon is valid or not
const checkvalid_Coupon = async (req, res) => {
  try {
    const couponCode = req.query.id;
    const coupon = await Coupon.findOne({ couponCode });
    if (coupon) {
      res.json({ message: "1", coupon: coupon });
    } else {

      res.send({ message: "Coupon code invalid" });
    }
  } catch (error) {
     
    res.status(404).render('error',{error:error.message}) 
  }
};
    //-----load wishlist-------
  const load_wishlist = async (req, res) => {
    try {
      const userid = req.session.user_id;
      const wishlist = await Wishlist.findOne({ userId:userid }).populate(
        "product.product_id"
      );
      let session=req.session.user_id;
      if (wishlist) {
        console.log();
        res.render("wishlist", { wishlist: wishlist ,session});
      } else {
        res.send( "Wishlist is Empty" );
      }
    } catch (error) {
       
      res.status(404).render('error',{error:error.message}) 
    }
  };
  
  // ------- add to whishlist--------
  
  const add_to_wishlist = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const product_id = req.query.id;
      const finduserinwishliist = await Wishlist.findOne({ userId: userId });
      if (finduserinwishliist) {
        const productindex = finduserinwishliist.product.findIndex((product) => {
          // console.log('true or false', new String(product.product_id ).trim() == new String(product_id).trim());
          return (
            new String(product.product_id).trim() == new String(product_id).trim()
          );
        });
        if (productindex == -1) {
          const wish_data = await Wishlist.updateOne(
            { userId: userId },
            { $push: { product: { product_id } } },
            { upsert: true }
          );
          res.send({
            success: true,
            msg: "product added to cart",
            data: wish_data,
          });
        } else {
          res.send({ message: "1" }); //already added the product in wishlist
        }
      } else {
        const updatewishlist = new Wishlist({
          userId: userId,
          product: { product_id },
        });
        const data = await updatewishlist.save();
        res.send({ mes: "added", data: data });
      }
    } catch (error) {
   
      res.status(404).render('error',{error:error.message}) 
        
    }
  };
  
   const delete_wishlist = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const productid = req.query.id;
      const wishitem = await Wishlist.findOne({ userId: userId });
      const productindex = wishitem.product.findIndex((product) => {
        return (
          new String(product.product_id).trim() == new String(productid).trim()
        );
      });
      if (productindex !== -1) {
        wishitem.product.splice(productindex, 1);
        await wishitem.save();
        res.send({ message: "1" });
      } else {
        res.send({ message: "0" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
//........order............
const order_Details = async (req, res) => {
  try {
   
    console.log(req.session.user_id);
    let flag = 0,
    stockOut = [];
  const address = req.body.address;
  const total = req.body.total;
  const paymentMethod = req.body.paymentmethod;
  const user = req.session.user_id;
  const userid=await User.findOne({name:user})

  let paymentstatus;
  if(paymentMethod=="Razorpay"){
    paymentstatus="Paid"
  }else{
    paymentstatus="unpaid"
  }

  console.log(address+" " +total +"  "+ paymentMethod,user);
  const cart = await Cart.findOne({ userId: user }).populate('product.product_id');
    cart.product.forEach(async (product) => {
    const pro = await Product.findOne({ _id: product.product_id });
    if (product.Cartquantity > pro.productQuantity) {
      flag = 1; 
      stockOut.push({ name: pro.productName, available: pro.productQuantity });
    }
  });
  if (flag == 0) {
    const orderdetail = new Order({
      userId: userid._id,
      total: total,
      paymentMethod: paymentMethod,
      address: address,
      paymentstatus:paymentstatus
    });

    cart.product.forEach(async (product) => {
      let qty = product.Cartquantity;
      console.log('qty',qty)
      let idpro = product.product_id;

      orderdetail.product.push({
        product_id: idpro,
        quantity: qty, 
      });
      await Product.updateOne(
        { _id: idpro },
        { $inc: { productQuantity: -qty } }
      );
    });
   
    await orderdetail.save(); 
    await Cart.findOneAndDelete({ userId: user});
    console.log("hooooooooooooo");
    res.send({ message: "1" });
  
  } else {
    res.send({ message: "0" });
  }
} catch (error) {
  console.log(error.message);
}
}
   // user  cancelling the one order or particular product
const cancel_order = async (req, res) => {
  const orderid = req.body.id;
  console.log(orderid);
  if(orderid){
    const orderitem = await Order.findByIdAndUpdate(
      { _id: orderid },
      { $set: { status: "Cancelled" } }
    );
    res.send({message: "1"}) // if orderstatus is updated sending ajax responce to fronted 
  }else{
    res.send({message: "0"}) // if orderstatus is updated send message 0 as string.message will shown to user by sweet_alert
  }
  
};
// viewing orderhistory(purchased item from cart) and details
const order_history = async (req, res) => {
  try {
    const orderid = req.query.id;
    const order_Details = await Order.findById({ _id: orderid })
      .populate("product.product_id")
      .populate("address")
      .populate("userId")
      .exec();
      let session=req.session.user_id;
    if (order_Details) {
      res.render("orderhistory", { order: order_Details ,session});
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
     console.log(error.message)
  }
};

// for online payement through razorpayment and loading the page
 const createOrder=async (req, res) => {
  try {
    const user = req.session.user_id;
    let amount = parseInt(req.body.amount) *100;
    console.log(amount);
    const options = {
      amount: amount,
      currency: "INR",
      receipt: "treasaneethualex@gmail.com",
    };
    razorpayInstance.orders.create(options, (err, order) => {
      if (!err) {
        console.log('no error')
        res.status(200).send({
          success: true,
          msg: "Order Created",
          amount: amount,
          key_id: RAZORPAY_ID_KEY,
          contact: "7306015174",
          name: user.name,
          email: "treasaneethualex@gmail.com",
        });
       
      } else {
        console.log("else")
        res
          .status(400)
          .send({ success: false, msg: "Something went wrong!" });
       
      }
    });
  } catch (error) {
    console.log({error:error.message});
  }
}


// after online payment succes page
const ordersuccess_page = async(req,res)=>{
try {

  res.render('paymentsuccess')
} catch (error) {
    console.log(error.message)
}
}
// After receving the peoduct user want to return the product 
const return_order=async (req,res)=>{

  const { id } = req.body;
    try {
      let order = await Order.findByIdAndUpdate(
        id,
        { status: "Return Requested" },
        { new: true }
      );
      if (order) {
        res.send({ message: "1" });
      } else {
        res.send({ message: "0" });
      }
    } catch (error) {
      res.render("error", { error: error.message });
    }
  }






  module.exports={
    load_cart ,
    increment_product,
    add_to_cart ,
    decrement_product,
    delete_cartitem ,
    check_out,
    checkvalid_Coupon,
    order_Details ,
    load_wishlist ,
    add_to_wishlist ,
    delete_wishlist,
    cancel_order,
    return_order,
    ordersuccess_page ,
    createOrder,
    order_history 
   
    }