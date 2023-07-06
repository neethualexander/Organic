const express = require('express');
const multer = require('multer')
const admin_Router= express();
const path=require('path')
const adminController =require('../controller/adminContoller')

admin_Router.set('view engine','ejs')
admin_Router.set('views','./views/Admin')
const bodyParser = require('body-parser')
admin_Router.use(express.static('public'))
admin_Router.use(bodyParser.json())
admin_Router.use(bodyParser.urlencoded({extended:true}))
const Banner = require('../model/banner');



admin_Router.get('/',adminController.adminLogin)
admin_Router.post('/home',adminController.adminHome)
admin_Router.get('/logout', adminController.logout)
// admin_Router.get('/addproduct',adminController.addproduct)
admin_Router.get('/productlist',adminController.productlist)
// admin_Router.get('/orders',adminController.orders)
admin_Router.get('/users',adminController.userslist)
admin_Router.get('/adregister',adminController.adregister)
//admin_Router.get('/error',adminController.error)
admin_Router.get('/block',adminController.blockUser)

const allowedFileTypes = ['.jpg', '.jpeg', '.png',".webp"];
// admin Dashboard
admin_Router.get("/dashboard",adminController.load_dashboard);
admin_Router.get("/getSalesData",adminController.get_saledata);
admin_Router.get("/ExcelSalesData",adminController.excel_saledata);




// Image validation function
const imageFilter = function (req, file, cb) {
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedFileTypes.includes(ext)) {
    req.error = new Error('Only images with .jpg, .jpeg, .png, or .webp extensions are allowed.');
    // req.error.code = 'INVALID_FILE_TYPE';
    cb(null, true);
  }

  // File accepted
  cb(null, true);
};



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/upload'), function (err, success) {
            if (err) {
                throw err
            }
        });
    },
    filename: function (req, file, cb) {
        const name = Date.now()+file.originalname;
        cb(null, name)
    }
})
const upload = multer({ storage: storage ,fileFilter:imageFilter});

//.......product management......
// admin_Router.get('/product', adminController.load_productPage);
admin_Router.get('/addproduct', adminController.load_addproduct);
admin_Router.post('/addproduct', upload.array('productImage'), adminController.add_product);
admin_Router.get('/edit_product', adminController.edit_product);
admin_Router.post('/editproduct', upload.array('productImage'), adminController.update_product)
admin_Router.get('/delete_product',adminController.delete_product)
//...........category management.......

admin_Router.post('/addcategory', adminController.add_category);
admin_Router.get('/categorydisplay',adminController.category_list);
admin_Router.post('/deletecategory', adminController.delete_category);
admin_Router.post('/listandunlist',adminController.list_unlist)  



//----------------ORDER-------------
admin_Router.get('/orders',adminController.load_order)
admin_Router.get('/orderdetails',adminController.order_details)
admin_Router.post('/statusupdate',adminController.status_update)
admin_Router.post('/returnapprove',adminController.approve_return)

//----------Coupan------------------
admin_Router.get('/couponlist',adminController.listCoupon)
admin_Router.get('/addcoupon',adminController.addCouponPage)
admin_Router.post('/addcoupon',adminController.addCoupon)
admin_Router.get('/editcouponpage',adminController.editCouponPage)
admin_Router.post('/editcoupon',adminController.editCoupon)
admin_Router.get('/deletecoupon',adminController.deletecoupon)
// ............banner.......
admin_Router.get('/banner',adminController.load_bannerpage)
admin_Router.post('/addbanner',upload.single('Image'),adminController.add_banner);
admin_Router.get('/deletebanner',adminController.delete_banner);
//..............offer.........
admin_Router.get("/offer",adminController.productoffers);
admin_Router.post("/offer", adminController.addProductOffer);
admin_Router.post("/removeProductOffer", adminController.removeProductOffer);




admin_Router.get('/chartData', adminController.fetchChartData)
admin_Router.get('/chartData2',adminController.chartData2)

module.exports=admin_Router
