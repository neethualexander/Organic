const Admin = require("../model/userModel");
const Product = require("../model/productmodel");
const Cart = require("../model/cartmodel");
const category = require("../model/categorymodel");
const Order = require("../model/ordermodel");
const couponModel=require('../model/couponmodel');
const Wallet=require('../model/walletmodel');
const Banner = require('../model/banner');
const User = require("../model/userModel");
const excelJs = require('exceljs');
 






const adminLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    res.render('error',{error:error.message})
  }
};

const adminHome = async (req, res) => {
  try {
    const admindata = await Admin.findOne({ isAdmin: "1" });
    // console.log(admindata);
    if (
      admindata.email === req.body.email &&
      admindata.password == req.body.password
    ) {
      req.session.user_id=admindata.name
      res.redirect("/admin/dashboard");
    } else {
      res.render("login", { message: "Incorrect password" });
    }
  } catch (error) {
    res.render('error',{error:error.message})
  }
};

const logout= async(req,res)=>{
  try{
    req.session.destroy();
    res.redirect('/admin')
  }catch(error){
    res.render('error',{error:error.message})
  }
};

/* const addproduct = async (req, res) => {
  try {
    res.render("addproduct");
  } catch (error) {
    console.log(error.message);
  }
};
 */

const productlist = async (req, res) => {
  try {
    const data = await Product.find({}).populate('category_id').exec();
    // console.log(data);
    if(data)

    res.render("productlist", { data: data });
  } catch (error) {
    res.render("error",{error:error.message})
  }
};



const adregister = async (req, res) => {
  try {
    res.render("adminregistration");
  } catch (error) {
    res.render('error',{error:error.message})
  }
};
const userslist = async (req, res) => {
  try {
    const users = await Admin.find({ admin: { $ne: 1 } });

    res.render("users", { user: users });
  } catch (error) {
    res.render('error',{error:error.message})
  }
};

const blockUser = async (req, res) => {
  try {
    const userId = req.query.id;
    const userData = await Admin.findOne({ _id: userId });
    let b;
    if (userData.blocked == 0) b = 1;
    else b = 0;
    await Admin.updateOne({ _id: userId }, { $set: { blocked: b } });
    res.redirect("/admin/users");
  } catch (error) {
    res.render('error',{error:error.message})
  }
};
// load product page...........
const load_productPage = async (req, res) => {
  try {
    const productData = await Product.find({}).populate('category_id').exec();
    if (productData) 
    {
      // console.log(productData);
      res.render("productlist", { product: productData  });
    } else {
      res.redirect("/admin/index");
    }
  } catch (error) {
    res.render('error',{error:error.message})
  }
};

// ------- ADD PRODUCT---PAGE-----
const load_addproduct = async (req, res) => {
  try {
    
console.log("hhhhhhhhhh");
    const Category = await category.find({});
    // console.log("categories are: " +Category);
    const title=req.flash('notice')
    res.render("addproduct", { Category: Category ,title:title[0]||""});

  } catch (error) {
    res.render("error",{error:error.message})
  }
};

//Add product...............
const add_product = async (req, res) => {
  try {
    if(req.error){
      req.flash('notice', 'Image validation faild. Check image format');
      return res.redirect('/admin/addproduct')
               }
   const pname=req.body.productName
   let productnamelower=pname.toLowerCase().replace(/\s/g, "")
    const arrImages = [];
    if (req.files) {
      for (let i = 0; i < req.files.length; i++) {
        arrImages.push(req.files[i].filename);
      }
    }
    const existCategory=await Product.findOne({productnameLower:productnamelower})
    if(existCategory)
    {req.flash("title","Product Already Exist");
    res.redirect("/admin/addproduct")
  
    }else{

    const product = new Product({
      productName: req.body.productName,
      productnameLower:productnamelower,
      price: req.body.price,
      productQuantity: req.body.productQuantity,
      productDes: req.body.productDes,
      category_id:req.body.category_id,
      productImage: arrImages,
    
    });
  
  
    

    console.log(product);
    await product.save();
    res.status(200).redirect("/admin/productlist");
    // res.status(200).send({succces: true, msg:"product details",data:product_data})
    }
  }catch (error) {
    res.render("error",{error:error.message})
  }
};
  
    





//edit product.................
const edit_product = async (req, res) => {
  try {
    const id = req.query.id;
    const product_data = await Product.findById({ _id: id });
    const categorydetail =await category.find({status:{$ne:1}})
console.log(categorydetail);
    res.render("editproduct", { product: product_data ,category:categorydetail});
  } catch (error) {
    res.render("error",{error:error.message})
  }
};
// updateproduct...........

const update_product = async (req, res) => {
  try {
    let dataobj;
    const arrImages = [];
     
    const categoryid= await category.findOne({name:req.body.categoryname})

    if (req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        arrImages[i] = req.files[i].filename;
      }
      dataobj = {
        productName: req.body.productName,
      
        productQuantity: req.body.productQuantity,
        price: req.body.productPrice,
        productDes: req.body.productDes,
        productImage: arrImages,
      };
    } else {
      //  ##for if admin not updating the image
      dataobj = {
        productName: req.body.productName,
        category_id:categoryid._id,
        productQuantity: req.body.productQuantity,
        price: req.body.productPrice,
        productDes: req.body.productDes,
      };
    }
    console.log(dataobj);
    const product_data = await Product.findByIdAndUpdate(
      { _id: req.body.id },
      { $set: dataobj },
      { new: true }
    );

    res.redirect("/admin/productlist");
  } catch (error) {
    res.render("error",{error:error.message})
    res.status(500).send({ success: false, msg: error.message });
  }
};
//delete product.....
const delete_product = async (req, res) => {
  try {
    const id = req.query.id;
    await Product.deleteOne({ _id: id });
    res.redirect("/admin/productlist");
  } catch (error) {
    res.render("error",{error:error.message})
  }
};
// category management.....
const category_list = async (req, res) => {
  try {
    const categorydata = await category.find({});
    const title= req.flash('title')
    res.render("category", { category: categorydata ,title:title[0]||""});
  } catch (error) {
    res.render("error",{error:error.message})
  }
};

const add_category = async (req, res) => {
  try {
    const categoryName = req.body.categoryName;
    const CategoryDescription = req.body.CategoryDescription;
    console.log(categoryName);
    let categorylower=categoryName.toLowerCase().replace(/\s/g, "");
    console.log(categorylower);
    const existingCategory =await category.findOne({categoryLower:categorylower})
    if(existingCategory){
        req.flash("title","Category Already Exist");
        res.redirect("/admin/categorydisplay")
    }else{

    const Category = new category({
      name: categoryName,
      Description: CategoryDescription,
      categoryLower:categorylower,

    });

    const category_data = await Category.save();
    res.status(200).redirect("/admin/categorydisplay");
  }}
   catch (error) {
    res.render("error",{error:error.message})
  }
};
const delete_category = async (req, res) => {
  try {
    const id = req.body.id;
    console.log(id);
    await category.deleteOne({ _id: id });
    res.redirect("/admin/categorydisplay");
  } catch (error) {
    res.render("error",{error:error.message})
  }
};
const list_unlist = async(req,res)=>{
  try {
    const categoryid = req.body.categoryId
    const tochange = req.body.text
   const cat_data = await category.findById({_id: categoryid})
  if (cat_data) {
    if(tochange =="List"){
      category.updateOne(
        { _id: categoryid },
        { $set: { status: "0" } }
      )
        .then(() => {
          res.send({ message: "Item Listed" });
        })
        .catch((error) => {
         
          req.flash("title", "Failed to update category");
            res.redirect('/admin/category')
        });
    }else{
      category.updateOne(
        { _id: categoryid }, 
        { $set: { status: "1" } }
      )
        .then(() => {
          res.send({ message: "Item Unlisted" });
        })
        .catch((error) => {
          req.flash("title", "Failed to update category");
            res.redirect('/admin/category')
        });
    }
  }else{
    req.flash("title", "Something went worng");
    res.redirect('/admin/category')
  }
  } catch (error) {
    res.render("error",{error:error.message})
  }
}


// -------ORDER-----

const load_order = async (req, res) => {
  try {
    const order_details = await Order.find({}).populate('userId').exec();
    res.render("order", { order: order_details });
  } catch (error) {
    res.render("error",{error:error.message})
  }
};
// ............order details......
const order_details = async (req, res) => {
  try {
    const orderid = req.query.id;
    const order_details = await Order.findById({ _id: orderid })
      .populate("product.product_id")
      .populate("address")
      .populate("userId")
      .exec();
      console.log(order_details);
    res.render("orderdetails", { order: order_details });
  } catch (error) {
    res.render("error",{error:error.message})
  }
};

const status_update = async (req, res) => {
  try {
    const orderid = req.body.orderid;
    const status = req.body.status;
    // const order_update = await Order.findByIdAndUpdate(
    //   { _id: orderid },
    //   { $set: { status: status } }
    // );
    // if (order_update) {
    //   res.send({ message: "1" });
    // } else {
    //   res.send({ message: "0" });
    // }
    if(status=="Delivered"){
      const order_update = await Order.findByIdAndUpdate(
          { _id: orderid },
          { $set: { status: status ,paymentstatus:"Paid"} }
        );
    }else{
      const order_update = await Order.findByIdAndUpdate(
        { _id: orderid },
        { $set: { status: status }}
      );
    }
    res.send({ message: "1" });
  } catch (error) {
    res.render("error",{error:error.message})
  }
};
  
// coupan..............
const listCoupon= async (req, res) => {
  try {
    let coupon = await couponModel.find({});
    res.render("couponlist", { coupons: coupon });
  } catch (error) { 
    res.render("error",{error:error.message})
  }
}

 const addCouponPage= async (req, res) => {
  try {
    res.render("addcoupon");
  } catch (error) {
    res.render("error",{error:error.message})
  }
}

 const addCoupon=async (req, res) => {
  try {
    const coupon = new couponModel({
      couponCode: req.body.code,
      couponAmount: req.body.discountprice,
      expireDate: req.body.expiry,
      couponDescription: req.body.coupondescription,
      minimumAmount: req.body.min_purchase,
    });
    coupon.save();
    res.redirect("/admin/couponlist");
  } catch (error) {
    res.render("error",{error:error.message})
  }
}

const  editCouponPage= async (req, res) => {
  try {
    const coupon = await couponModel.findOne({ _id: req.query.id });
    res.render("editcoupan", { coupon: coupon });
  } catch (error) {
    res.render("error",{error:error.message})
  }
}

const editCoupon = async (req, res) => {
  try {
    const coupon = await couponModel.updateOne(
      { _id: req.body.id },
      {
        $set: {
          couponCode: req.body.code,
          couponAmount: req.body.discountprice,
          expireDate: req.body.expiry,
          couponDescription: req.body.coupondescription,
          minimumAmount: req.body.min_purchase,
        },
      }
    );
    res.redirect("/admin/couponList");
  } catch (error) {
    res.render("error",{error:error.message})
  }
}


//   -----delete coupon----------


const deletecoupon = async (req, res) => {
  try {
      const deleteid = req.query.id
      await couponModel.deleteOne({ _id:deleteid })
      res.redirect('/admin/couponlist')

  } catch (error) {
    res.render("error",{error:error.message})
  }
}

 const approve_return=async (req, res) => {
  const { id } = req.body;
  try {
    let order = await Order.findById(id);
    console.log(order)
    const userwallet = await Wallet.findOne({userid: order.userId});
    if (userwallet) {
      await Wallet.findByIdAndUpdate(
        userwallet._id,
        {
          $inc: { balance: order.total },
          $push: {
            orderDetails: {
              orderid: id,
              amount: order.total,
              type: "Added",
            },
          },
        },
        { new: true }
      );
    } else {
      let wallet = new Wallet({
        userid: order.userId,
        balance: order.total,
        orderDetails: [
          {
            orderid: id,
            amount: order.total,
            type: "Added",
          },
        ],
      });
      await wallet.save();
    }
    for (const product of order.product) {
      await Product.findByIdAndUpdate(
        product.product_id,
        {
          $inc: { productQuantity: product.quantity },
        },
        { new: true }
      );
    }
    order = await Order.findByIdAndUpdate(
      id,
      { paymentstatus: "Refund" },
      { new: true }
    );
    order = await Order.findByIdAndUpdate(
      id,
      { status: "Returned" },
      { new: true }
    );
    if (order) {
      res.send({ message: "1" });
    } else {
      res.send({ message: "0" });
    }
  } catch (error) {
    res.render("error",{error:error.message})
    // res.render("error", { error: error.message });
    }
  }
//.............Admin Dashboard............

//loading dashboad with deatils of each sections like user count, product count,order details
const load_dashboard = async (req, res) => {
  try {
    const revenue = await Order.aggregate([{ '$match': {"status": "Delivered"}},{'$group': {'_id': "null", "total": {"$sum": "$total"}}}])
    const ordercount = await Order.find({}).count()
    const orders = await Order.find({}).populate('userId')
    const product = await Product.find({}).count()
    const user = await Admin.find({}).count()
  
    res.render("index",{orders: orders,ordercount: ordercount,user: user, product: product,revenue: revenue });
  } catch (error) {
    res.render("error",{error:error.message})
  }
};
const get_saledata = async (req, res) => {
  try {
    const salesData = await Order.aggregate([{ $match: { status: 'Delivered' } },{ $group: {_id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },totalRevenue: { $sum: '$total' }}},{ $sort: { _id: 1 } }]);
  //   const categorySales = await Order.aggregate([
  //     {
  //       $lookup: {
  //         from: "categories", // The name of the Category collection
  //         localField: "category_id",
  //         foreignField: "_id",
  //         as: "categoryInfo"
  //       }
  //     },
  //     {
  //       $unwind: "$categoryInfo"
  //     },
  //     {
  //       $group: {
  //         _id: "$categoryInfo.categoryName",
  //         totalSales: { $sum: "$total" }
  //       }
  //     }
  //   ]);  
  //  res.json({ salesData: salesData, categorySales: categorySales });  
  } catch (error) {
    res.render("error",{error:error.message})
  }
};

// converting saledata into excel file and downloading the report
const excel_saledata = async(req,res)=>{
try {
  const workbook = new excelJs.Workbook();
  const worksheet = workbook.addWorksheet("Sale Data")
  const revenue = await Order.aggregate([{ '$match': {"status": "Delivered"}},{'$group': {'_id': "null", "total": {"$sum": "$total"}}}])
  const ordercount = await Order.find({}).count()
  const product = await Product.find({}).count()
  const user = await User.find({}).count();

  worksheet.addRow(['Total Revenue',revenue[0].total]);
  worksheet.addRow(["Order Count" ,ordercount]);
  worksheet.addRow(["User Count",  user]);
  worksheet.addRow(["Product Count",product]);

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=saledata.xlsx");
  
  return workbook.xlsx.write(res)
    .then(() => {
      res.status(200).end();
    })
    .catch(error => {
      console.error(error);
      res.status(500).end();
    });
} catch (error) {
    res.render('error',{error:error.message})
  
}
}



// ------------------BANNER------------------
// loading banner page when banner is clicked
const load_bannerpage =async(req,res)=>{
  try { 
    const Banner_data = await Banner.find({})
  
    res.render('banner',{banner: Banner_data});
  } catch (error) {
      res.render('error',{error:error.message})
  }
  }
  // adding banner deatils and images as array in database
  const add_banner =async(req,res)=>{
  try {
    const {Description} = req.body
     const Image = req.file
     const name = req.body.name
    const newBanner = new Banner({
      name: name,
      Image : Image.filename,
      Description: Description,
    })
   const banner = await newBanner.save()
   if(banner){
   res.send({message:"banner added"})
   }else{
    res.send({message:"something went worng"})
   }
  } catch (error) {
      res.render('error',{error:error.message})
  }
  }
  // this method is for deleting  selected banner by admin
  const delete_banner = async(req,res)=>{
  try {
    const id = req.query.id;
    if(id){
      const banner_data = await Banner.findByIdAndDelete({_id: id})
      res.send({message: "1"})
    } else{
      res.send({message: "0"})
    }
  } catch (error) {
      res.render('error',{error:error.message})
  }
  }
//..........offer..............
 const productoffers= async (req, res) => {
  try {
    const successmsg = req.flash("success")[0];
    const messageAlert = req.flash("title")[0];
    const products = await  Product.find({ offerprice: { $eq: 0 } });
    console.log(products)
    const offered = await Product.find({ offerprice: { $ne: 0 } });
    res.render("offer", {
      products,
      offered,
      successmsg,
      messageAlert,
    });
  } catch (error) {
    res.render("error", { error: error.message });
  }
}

 const addProductOffer= async (req, res) => {
  const { productName, offerpercentage } = req.body;
  try {
    const product = await Product.findOne({ productName });
    if (product.offerpercentage == 0) {
      const offerprice = Math.floor(
        product.price - (product.price * offerpercentage) / 100
      );
      const productUpdate = await Product.updateOne(
        { productName },
        { $set: { offerpercentage, offerprice } }
      );
      req.flash("success", "Offer Applied");
      res.redirect("/admin/offer");
    } else {
      req.flash("title", "Product Already have an Offer");
      res.redirect("/admin/offer");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
}

 const removeProductOffer= async (req, res) => {
  const { id } = req.body;
  try {
    const product = await Product.findByIdAndUpdate(id, {
      $set: { offerpercentage: 0, offerprice: 0 },
    });
    if (product) {
      res.send({ message: "1" });
    } else {
      res.send({ message: "0" });
    }
  } catch (error) {
    res.send({ message: "0" });
  }
}
  
const fetchChartData=async(req,res)=>{
  try {
    console.log("hello worlf"); 
      const salesData = await Order.aggregate([
          { $match: { status: 'Delivered' } },  { $group: { _id: { $dateToString: { format: '%Y-%m-%d',date: { $toDate: '$orderDate' } }},totalRevenue: { $sum: '$total' } }},
          {$sort: { _id: -1 }},{$project: { _id: 0, date: '$_id',totalRevenue: 1}},{$limit: 7}]);
  
          // const productData = await orderdb.aggregate([
          // { $match: { status: 'Delivered' } },  { $group: { _id: { $dateToString: { format: '%Y-%m-%d',date: { $toDate: '$purchased' } }},totalRevenue: { $sum: '$grandtotal' } }},
          // {$sort: { _id: -1 }},{$project: { _id: 0, date: '$_id',totalRevenue: 1}},{$limit: 4}]);
  
      //   console.log(salesData);
  
        const data = [];
        const date = [];
      for (const totalRevenue of salesData) {
          data.push(totalRevenue.totalRevenue);
        }
      
          for (const item of salesData) {
          date.push(item.date);
        }
        data.reverse()
        date.reverse();
        
        // console.log("cahrt 1"+data);
        // console.log("chart 2"+date);
      res.status(200).send({ data:data, date:date })

  } catch (error) {
 
       res.status(404).render('error',{error:error.message}) 
    }

}

  const chartData2= async (req, res) => {
  try {
    const salesData = 
    await Order.aggregate([
      { $match: { status: 'Delivered' } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: { $toDate: '$orderDate' } }
          },
          totalRevenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: -1 } },
      { $project: { _id: 0, date: '$_id', totalRevenue: 1 } },
      { $limit: 7 }
    ]);

    const data = [];
    const date = [];


    for (const totalRevenue of salesData) {
      data.push(totalRevenue.totalRevenue);
      const monthName = new Date(totalRevenue.date + '-01').toLocaleString('en-US', { month: 'long' });
      date.push(monthName);
    }
    data.reverse();
    date.reverse();
    res.status(200).json({ data: data, date: date });

  } catch (error) {
   
       res.status(404).render('error',{error:error.message}) 
  }
}



module.exports = {
  adminLogin,
  adminHome,
  productlist,
  
  userslist,
  adregister,
  
  list_unlist,
  blockUser,
  add_product,
  edit_product,
  load_productPage,
  load_addproduct,
  
  delete_category,

  update_product,
  delete_product,
  category_list,
  add_category,
  logout,
  order_details,
  status_update,
  load_order,
  listCoupon,
    addCouponPage,
    addCoupon,
    editCoupon,
    editCouponPage,
    deletecoupon,
    approve_return,
    load_bannerpage,
    add_banner,
    delete_banner,
    load_dashboard,
    excel_saledata,
    get_saledata,
    removeProductOffer,
    addProductOffer,
    productoffers,
    fetchChartData,
    chartData2
    
};
