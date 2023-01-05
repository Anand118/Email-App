const express = require('express');
const router = express.Router();
const passport = require('passport');
const userModal = require('./users');
const localStratigy = require("passport-local");
const mailModal = require('./mails');
const multer = require('multer');
passport.use(new localStratigy(userModal.authenticate()));

function fileFilter (req, file, cb) {
if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/svg' || file.mimetype === 'image/jpeg'){
  cb(null, true);
}else{
  cb(new Error('hello'));
}
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/up')
  },
  filename: function (req, file, cb) {
    const fn = Date.now() + Math.floor(Math.random()*1000000) + file.originalname; 
    cb(null, fn)
  }
})

const upload = multer({ storage: storage, fileFilter: fileFilter })
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function(req, res){
  res.render('register')
})

router.post('/fileupload', islogin, upload.single('image'),async function(req, res){
  const loginuser = await userModal.findOne({username: req.session.passport.user});
  loginuser.profilepic = req.file.filename;
  loginuser.save();
  res.redirect('back');
})

router.get('/check/:username',async function(req, res){
  var user = await userModal.findOne({username:req.params.username});
  res.json({user});
})

router.post('/register', function(req, res){
  var newuser = new userModal({
    username: req.body.username,
    email: req.body.email,
    name : req.body.name,
    mobile: req.body.mobile
  })
  userModal.register(newuser, req.body.password)
  .then(function(user){
    passport.authenticate('local')(req, res, function(){
      res.redirect('/profile')
    })
  })
})

router.get('/login', function(req, res){
  res.render('login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}), function(req, res){});

router.get('/profile', islogin, async function(req, res){
  var loginuser = await userModal.findOne({username: req.session.passport.user})
  .populate({
    path: "recivedmails",
    populate:{
      path: 'userid'
    }
  });
  res.render('profile', {user:loginuser});

  // res.send('ho gaya bhai');
})

router.post('/compose', islogin,async function(req, res){
var loginuser = await userModal.findOne({username: req.session.passport.user});
if( loginuser.email !== req.body.recivermail){
var mailcreated = await mailModal.create({
  maildata: req.body.maildata,
  subject: req.body.subject,
  recivermail: req.body.recivermail,
  userid: loginuser._id
})
loginuser.sendmails.push(mailcreated._id);
const updateduser = await loginuser.save();
 
var reciver =  await userModal.findOne({email:req.body.recivermail});
reciver.recivedmails.push(mailcreated._id);
const updatedreciver = await reciver.save();
 res.redirect("back");
}
})

router.get('/mail/read/:id', islogin , async function(req, res){
  const mail = await mailModal.findOne({_id: req.params.id})
  .populate('userid');
  mail.status = false;
  mail.save();
  res.render("readmail", {mail})
})

router.get('/logout',function(req,res){
  req.logOut(function(err){
    if(err) throw err;
    res.redirect('/login');
  })
})

router.get('/sendmail', islogin,async function(req, res){
  var loginuser = await userModal.findOne({username: req.session.passport.user})
  .populate('sendmails');
  res.render("sendmail", {user: loginuser});
})

router.get('/delete/:typemail/:id', islogin,async function(req, res){
  const loginuser = await userModal.findOne({username: req.session.passport.user});
    var index = loginuser.recivedmails.indexOf(req.params.id);
 
    if (index > -1) {
      loginuser.recivedmails.splice(index, 1); // Remove array element
    }
    loginuser.save();
    res.redirect("/profile");
})
function islogin(req, res, next){ 
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect('/login')
  }
}

module.exports = router;
