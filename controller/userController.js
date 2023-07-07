const User = require("../model/userModel");
const nodemailer = require("nodemailer");
const Otp = require("../model/otpmodel");
const otpGenerator = require("otp-generator");
const bcrypt=require("bcrypt");
const mongoose=require("mongoose");
const Motp = require("../model/mobileotp");
const Banner = require('../model/banner');
const Razorpay =require("razorpay");

const Category = require("../model/categorymodel");
const Product = require("../model/productmodel");

const Cart = require("../model/cartmodel");

//const Coupon = require("../models/couponmodel");
const Address = require("../model/addressmodel");
const Order = require("../model/ordermodel");
const Wallet = require("../model/walletmodel");

const accountSid ="ACf93b18efb6de3a81a175b079baf6df7f";
const authToken = "26a43391ac60f845ac74b5d67248bdea";
let twilioNum= "+13613154948";

const client = require('twilio')(accountSid,authToken);

 const configmobotp= async(req,res)=>{
  try {
    console.log(req.body.phone);
      const userData = await User.findOne({ phone: req.body.phone});
      console.log(userData);
      if (userData) {
        if (userData.blocked === 0) {
          const OTP = otpGenerator.generate(4, {
            digits: true,
            alphabets: false,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
          });
          console.log(OTP);
    
          client.messages
            .create({
              body: `Welcome back to Your Seconds needle account, please enter the otp to signin  ${OTP}`,
              from: twilioNum,
              to: userData.phone,
            })
            .then(async(message) => {
              console.log("OTP sent successfully");
          
              const salt = await bcrypt.genSalt(10);
              const hashedOTP = await bcrypt.hash(OTP, salt);
          
              const Otp = new Motp({ phone: req.body.phone, otp: hashedOTP });
              const result = await Otp.save();
              let session=req.session.user_id;
          
              res.render("mobileotpverify", { data: req.body.phone ,session});
            })
            .catch((error) => {
              
              res.status(500).json({ error: "Error sending OTP" });
            });
        } else {
          // Handle the case when userData.block is not 0
          res.status(400).json({ error: "User is blocked" });
        }
      } else {
        // Handle the case when userData is not found
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      let session=null;    
      res.status(500).json({ error: "Error finding user" ,session});
    
    }
  };
  const mobverify= async (req, res) => {
    try {
        const data = req.body.phone
        console.log(data);
        const userotp = req.body.otp;
        console.log(userotp);
        const otpholder = await Motp.findOne({ phone: data });
        console.log(otpholder);
        if (otpholder) {
            const validuser = await bcrypt.compare(userotp, otpholder.otp)
            console.log("data is " +validuser);
            if (validuser) {
                req.session.user_id = req.body.phone;
                await Motp.deleteOne({ phone: data })
                let session=req.session.user_id;
          
                res.render('passwordreset',{data: req.body.phone,session})
            } else {
                req.flash("notice", "Your OTP is wrong")
                res.redirect('/mobileotpverify')
            }
        } else {
            req.flash("notice", "You Used an expired otp")
            res.redirect('/forgot')
        }
    } catch (error) {
      let session=null;
      res.status(404).render('error',{error:error.message,session}) 
    }
  };
  

const load_home = async (req, res) => {
  try {
  let session = null;
  const banner = await Banner.find({})
  const product = await Product.find({})
    res.render("home",{banner: banner,product: product,session});

  } catch (error) {
    let session=null;
    res.status(404).render('error',{error:error.message,session}) 
  }
};
// catergory product page only

const home_productpage = async(req,res)=>{
  try {
    const catergory_name = req.query.id
   const category_data = await Category.findOne({ categoryName: catergory_name})
  if(category_data){
    const cat_id = category_data._id
    const category_details = await Product.find({category_id: cat_id})
    if (category_details) {
      res.render('categorypage',{category: category_details});
    }else{
      res.redirect('/')
    }
  }else{
    res.redirect('/')
  }
  } catch (error) {
    let session=null;
    res.status(404).render('error',{error:error.message,session}) 
  }
  
  } 
  

const forgot_page=async(req,res)=>{
  try{
    let session=null;
    res.render("forgot",{session:session});
} catch(error){
  let session=null;
 res.status(404).render('error',{error:error.message,session}) 
}
}

const load_loginpage = async (req, res) => {
  try {
    let session = null;
    res.render("sigin", { session: session });
  } catch (error) {
    let session=null;
    res.status(404).render('error',{error:error.message,session}) 
  }
};

const Sign_up= async (req, res) => {
  try { let session=null;
    res.render("register",{session:session});
  } catch (error) {
    let session=null;
    res.status(404).render('error',{error:error.message,session}) 

  }
};
const otp_page = async (req, res) => {
  try {
    const title = req.flash("title");
    const session = null;
    res.render("otp", { title: title[0] || "", session });
  } catch (error) {
    let session=null;
      res.status(404).render('error',{error:error.message,session}) 
  }
};

const load_otpverifypage = async (req, res) => {
  try {
    const title = req.flash("title");
    const session = null;
    res.render("otpverify", { title: title[0] || "", session:session });
  } catch (error) {
    let session=null;
    res.status(404).render('error',{error:error.message,session}) 
   
  }
};
//otp verification to check user is valid or not
const otp_signIn = async (req, res) => {
  console.log(req.body.email);
  try {
    const userData = await User.findOne({ email: req.body.email });
    console.log(userData);
    if (userData) {
      if (userData.blocked == false) {
        const OTP = otpGenerator.generate(4, {
          digits: true,
          alphabets: false,
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
        console.log(OTP);
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "treasaneethualex@gmail.com",
            pass: "jnsmdqlikkalekev",
          },
        });
        var mailOptions = {
          from: "treasaneethualex@gmail.com",
          to: userData.email,
          subject: "OTP VERIFICATION",
          text: "PLEASE ENTER THE OTP FOR LOGIN " + OTP,
        };
        transporter.sendMail(mailOptions, function (error, info) {});
        console.log(OTP);
        const otp = new Otp({ email: req.body.email, otp: OTP });
        const salt = await bcrypt.genSalt(10);
        otp.otp = await bcrypt.hash(otp.otp, salt);
        const result = await otp.save();
        const session = null;
        res.render("otpverify",{ data: result,session });
      } else {
        req.flash("title", "User is already exists");
        res.redirect("/logwithotp");
      }
    } else {
      req.flash("title", "User is not found");
      res.redirect("/logwithotp");
    }
  } catch (error) {
  
    let session=null;
 res.status(404).render('error',{error:error.message,session}) 
  }
};

//otp verifiy
const otp_verify = async (req, res) => {
  try {
    const useremail = req.body.email;

    const userotp = req.body.otp;
    console.log(userotp);
    const otpHolder = await Otp.findOne({ email: useremail });
    console.log(otpHolder);
    if (otpHolder) {
      const validuser = await bcrypt.compare(userotp, otpHolder.otp);

      if (validuser) {
        req.session.userid = req.body.email;
        const banner = await Banner.find({});
        const product = await Product.find({});
      
        res.render("home", {session: req.session.userid,banner: banner,product: product});
      } else {
        console.log("otp wg");
        req.flash("title", "your otp is worng");
        res.redirect("/otp");
      }
    } else {
      console.log("expire");
      req.flash("title", "You used an Expried OTP");
      res.redirect("/otp");
    }
  } catch (error) {
    
    let session=null;
 res.status(404).render('error',{error:error.message,session}) 
    
  
  }
};

const add_newuser = async (req, res) => {
  const data = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    isAdmin: 0,
    blocked: 0,
  });
  await data.save();
  const banner = await Banner.find({})
  const product = await Product.find({});
req.session.user_id=User.name;
  res.render("home",{session:req.session.user_id,banner: banner,product: product});
};



const verifylogin = async (req, res) => {
  try {
    const userDataFromUrl = await User.findOne({ email: req.body.email });
    console.log("userDataFromUrl:   "+userDataFromUrl);
    if (userDataFromUrl) {
      if (userDataFromUrl.blocked === 0) {
        if (userDataFromUrl.password == req.body.password) {
           req.session.user_id = userDataFromUrl.name;

          console.log(req.session.user_id);
          console.log("success");
          const banner = await Banner.find({})
          const product = await Product.find({});
          res.render("home",{session: req.session.user_id,banner: banner,product: product} );
          console.log("login Successfull");
        } else {
          res.render("sigin", { message: "Password Incorrect",session: req.session.user_id });
          console.log("wrong password");
        }
      } else {
        res.render("sigin", { message: "Account blocked" ,session: req.session.user_id});
        console.log("wrong password");
      }
    } else {
      res.render("sigin", { message: "Username Incorrect",session: req.session.user_id });
    }
  } catch (error) {
    
    let session=null;
 res.status(404).render('error',{error:error.message,session}) }

};

const logoutView = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/login");
  } catch (error) {
   
    
    let session=null;
 res.status(404).render('error',{error:error.message,session}) 
  }
};
//.................forgot password...........
const otp_passwrdrest = async (req, res) => {
  console.log(req.body.email);
  try {
    const userData = await User.findOne({ email: req.body.email });
    console.log(userData);
    if (userData) {
      if (userData.blocked == false) {
        const OTP = otpGenerator.generate(4, {
          digits: true,
          alphabets: false,
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
        console.log(OTP);
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "treasaneethualex@gmail.com",
            pass: "jnsmdqlikkalekev",
          },
        });
        var mailOptions = {
          from: "treasaneethualex@gmail.com",
          to: userData.email,
          subject: "OTP VERIFICATION",
          text: "PLEASE ENTER THE OTP FOR LOGIN " + OTP,
        };
        transporter.sendMail(mailOptions, function (error, info) {});
        console.log(OTP);
        const otp = new Otp({ email: req.body.email, otp: OTP });
        const salt = await bcrypt.genSalt(10);
        otp.otp = await bcrypt.hash(otp.otp, salt);
        const result = await otp.save();
        const session = null;
        res.render("passwordotp",{ data: result,session });
      } else {
        req.flash("title", "User is already exists");
        res.redirect("/forgot");
      }
    } else {
      req.flash("title", "User is not found");
      res.redirect("/forgot");
    }
  } catch (error) {
    
    let session=null;
 res.status(404).render('error',{error:error.message,session}) 
  }

const add_newuser = async (req, res) => {
  const data = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    isAdmin: 0,
    blocked: 0,
  });

  await data.save();
req.session.user_id=User.name;
  
}}
//  
 
const password_otp = async (req, res) => {
  try {
    const useremail = req.body.email;

    const userotp = req.body.otp;
    
    const otpHolder = await Otp.findOne({ email: useremail });
 
    if (otpHolder) {
      const validuser = await bcrypt.compare(userotp, otpHolder.otp);

      if (validuser) {
        req.session.userid = req.body.email;
      
        res.render("passwordreset", {session: req.body.email, email:req.body.email});
      } else {
        console.log("otp wg");
        req.flash("title", "your otp is worng");
        res.redirect("/otp");
      }
    } else {
      console.log("expire");
      req.flash("title", "You used an Expried OTP");
      res.redirect("/otp");
    }
  } catch (error) {
    
    let session=null;
 res.status(404).render('error',{error:error.message,session}) 
  }
};


 const resetPassword= async (req, res) => {
  try {
    let password = req.body.password;
   
    console.log(req.body.phone);
    await User.updateOne(
      { phone: req.body.phone},
      { $set: { password: password } }
    ); let session=null;
     res.render("sigin",{session});
  } catch (error) {
   
    let session=null;
 res.status(404).render('error',{error:error.message,session}) 
  }
}




//............category  page..............
// #load category page
const Category_page = async(req,res)=>{
  try {
   
    const catergory_name = req.query.id
   
   const category_data = await Category.findOne({ categoryName: catergory_name})
  if(category_data){
    const cat_id = category_data._id
    const category_details = await Product.find().populate('category_id')
    console.log(category_details);
    if (category_details) {
      const session=req.session.user_id
      res.render('categorypage',{category: category_details,session:session});
    }else{
      const session=null
      res.render('categorypage',{category: category_details,session:session});
     
    }
  }else{
    res.redirect('/')
  }
  } catch (error) {
    
    
    let session=null;
 res.status(404).render('error',{error:error.message,session}) 
    
  }
  
  }
  //............load product page......>
 
  
  
  const load_productpage = async(req,res)=>{

    try {
      var search = '';
      if(req.query.search){
        search = req.query.search
      }
  
      var page = 1;
      if(req.query.page){
       page = req.query.page
      }
      const limit = 4;
  
      const product_data = await Product.find({}).populate('category_id').limit(limit * 1).skip((page - 1) * limit).exec();
      const count = await Product.find({}).populate('category_id').countDocuments();
      const cate=await Category.find({})
  const session=req.session.user_id;
      if(product_data){
       res.render('product',{product: product_data, totalpage : Math.ceil(count/limit), currentpage: page,session,categories:cate});
      }else{
      res.redirect('/');
      }
    } catch (error) {
      
      
    let session=null;
    res.status(404).render('error',{error:error.message,session}) 
    }
    
  } 
  //.......view productpage..........
const load_viewproduct = async (req, res) => {
  try {
    const slugid = req.query.id;
    
    const session=req.session.user_id;
    const productdata = await Product.findOne({ _id: slugid }).populate('category_id');
    
    res.render("viewproduct", { data: productdata ,session});
  } catch (error) {
   
   
    let session=null;
 res.status(404).render('error',{error:error.message,session}) 
}}


//filter based on viewproductpage.......
//const filter_product = async(req,res)=>{
//try {
//  const search = req.body.search
  //console.log(search);
  // const product_data = await Product.find({
  //   $or:[
  //     {productName:{$regex: '.*'+search+'.*',$options:'i'}},
  //     {productsize:{$regex: '.*'+search+'.*',$options:'i'}},
  

  //   ]
  // })
// const categoryQueries = search.map(category => ({ productname: { $regex: '.*' + category + '.*', $options: 'i' } }));

//const query = {
  //categoryQueries,
  
  
//};

//const product_data = await Product.find(query);
 // console.log(product_data);
//} catch (error) {
  //console.log(error.message);

  
//}
//}
  

// -------------PROFILE SETUP---------

const load_profile = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const session=req.session.user_id;
    
    const user =await User.findOne({name:userid})
    // const address1= await Address.findOne({userid:userid})
    // console.log(address1);
    

    // const Userid=user._id
    // console.log(Userid);
    
    // const idobject = new mongoose.Types.ObjectId(Userid);
    
    // if (userid !== undefined) {
    //   const user = await User.aggregate([
    //     {
    //       $match: {
    //         _id: idobject,
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "Address",
    //         localField: "_id",
    //         foreignField: "userid",
    //         as: "address_details",
    //       },
    //     },
    //   ]);

    const Userdetails=await User.findOne({name:userid})
    console.log("================================="+Userdetails.email);
    

      const address1= await Address.find({userid:userid})
      // console.log(address1);
      
     const order_details = await Order.find({ userId: user._id })
       .populate("product.product_id")
        .populate("address")
       
        .exec();
        console.log(userid)
        const wallet = await Wallet.findOne({userid: user._id})

        // console.log("order details : " +order_details);
      res.render("profile", { user: user, wallet, session,userAddress:address1,orders:order_details});
    }catch (error) {
            
       
    let session=null;
    res.status(404).render('error',{error:error.message,session}) 
        }   
      }
//.....edituserdetails........

const edituser_Details = async(req,res)=>{
try {
  const userId = req.session.user_id;
  const session=req.session.user_id;
  const update_user = await User.findByIdAndUpdate({_id: userId},{ $set:{name: req.body.name,email: req.body.email, phone: req.body.phone,session}})
  if(update_user){
    res.send({message:'1'})
  }else{
    res.send({message:'0'})
  }
} catch (error) {
   
  
  let session=null;
  res.status(404).render('error',{error:error.message,session}) 
}
}



//#update address or adding multiple address and  get updated document;....
const add_address = async (req, res) => {
  const userId = req.session.user_id;
  console.log(userId)
  try {
    const userdata = await Address.findOne({ userId: userId });
    console.log(userdata);
    if (userdata) {
      const address = new address({
        userId: userId,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        country: req.body.country,
        landmark: req.body.landmark,
        zipcode: req.body.zipcode,
      });
      const addaddress = await address.save();
      // res.status(200).send({success: true,msg:"address add",data: addaddress});
      res.status(200).redirect("/profile");
    } else {
      console.log("else");
      const address = new Address({
        userid: req.session.user_id,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        country: req.body.country,
        landmark: req.body.landmark,
        zipcode: req.body.zipcode,
      });
      const addaddress = await address.save();
      res.status(200).redirect("/profile");
    }
  } catch (error) {
      
    
    let session=null;
 res.status(404).render('error',{error:error.message,session}) 
  }
};
// #DELETE ADDRESS................
const delete_address = async (req, res) => {
  try {
    const ids = req.query.id;
    console.log(ids)
    const address = await Address.findByIdAndDelete({_id:ids});
    res.redirect('/profile')
  } catch (error) {
     
    
    let session=null;
 res.status(404).render('error',{error:error.message,session}) 
  }
};
// #UPDATE USER PASSWORD...........
const update_password = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const password = req.body.password;
    const userdata = await User.findOne({ _id: userid });
    if (userdata) {
      const newpassword = await securepassword(password);
      const userData = await User.findByIdAndUpdate(
        { _id: userid },
        { $set: { password: newpassword } }
      );
      res.send({ success: true, message: "Your password has been updated" });
    } else {
      res.render( {message: "User is not found" });
    }
  } catch (error) {
    
   
    let session=null;
 res.status(404).render('error',{error:error.message,session}) 
  }
};

//  LOGOUT........................

const log_out = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
      
   
    let session=null;
 res.status(404).render('error',{error:error.message,session}) 
  }
};
// This search method for the  userheader search icon  where user can search product base name,color and also can include price,
// when product dynamically shown user can click the product, it redirect to single product page where can view product deatils
const productsearch = async (req, res) => {
  try {
    const searchname = req.body.searchname.toLowerCase().trim();
    const userid = req.session.user_id;

    const data = await User.findOne({ _id: userid});
  
    const page = parseInt(req.query.page) || 1;
    const productsPerPage = 4; // Define the number of products to display per page
    const totalProducts = await Product.countDocuments({ productname: { $regex: searchname, $options: 'i' } });
    const category = await Category.find({});
    
    const products = await Product.aggregate([
      { $match: { productname: { $regex: searchname, $options: 'i' } } },
      { $skip: (page - 1) * productsPerPage },
      { $limit: productsPerPage }
    ]);

    if (products.length === 0) {
      res.render('product', {
        
        products: products,
        category: category,
        user: req.session.user_id,
        currentPage: page,
       
        totalPages: Math.ceil(totalProducts / productsPerPage)
      });
    } else {
      res.render('product', {
        
        products: products,
        category: category,
        user: req.session.user_id,
        currentPage: page,
        
        totalPages: Math.ceil(totalProducts / productsPerPage)
      });
    }
  
  } catch (error) {
   
    
    let session=null;
 res.status(404).render('error',{error:error.message,session}) 
  }
  
  
  }
  




module.exports = {
  load_home,
  load_loginpage,
  Sign_up,
add_newuser,
  verifylogin,
  otp_signIn,
  otp_verify,
  otp_page,
  load_otpverifypage,
  logoutView,
  forgot_page,
  Category_page,
  load_productpage,
  load_viewproduct,
  //filter_product,
  delete_address,
  add_address,
  edituser_Details,
  load_profile ,
  update_password ,
  log_out,
  resetPassword,
  password_otp,
  otp_passwrdrest ,
  forgot_page,
  configmobotp,
  mobverify,
  productsearch,
  home_productpage
 

  

  
};
