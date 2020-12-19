require('dotenv').config()
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs")
const multer=require("multer")
const app=express()
app.use(express.json());
app.use(express.static("public"))
app.set('view engine','ejs')
const mongoose=require('mongoose');
// const encrypt= require("mongoose-encryption"); ye encryption ke liye use hota hai
// const md5=require('md5') hashin wala the ye
// const bcrypt=require('bcrypt') //salting
// const saltround=6//salting
const session=require('express-session')
const passport=require('passport');
const passportLocalMongoose=require("passport-local-mongoose");
var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  // your verification logic goes here
  // this test verification function always succeeds and returns a hard-coded user
  function (username, password, done) {
    console.log("Verification function called");
    return done(null, { username, id: "1" });
  }
));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret:"secret",
  resave:false,
  saveUninitialized:false
}))
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/Bugsbunnydb", { useUnifiedTopology: true , useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
//
// const userSchema={
//   email:String,
//   password:String,
//
// }hy
const userSchema=new mongoose.Schema({ //ye apn hashing me krte hai encrypt me bhi
  email:String,
  password:String
})
userSchema.plugin(passportLocalMongoose)
// const secret="wehw"
// userSchema.plugin(encrypt,{secret:secret,encryptedFields:['password']}) normal password encryp
const User=new mongoose.model("User",userSchema)
const userSchema1=new mongoose.Schema({

  id:String,
  subname:String,
  password:String
})
const Usersub=new mongoose.model("Usersub",userSchema1)
const s=new Usersub({
  id:"22",
  subname:"WD",
  password:"efsd"
})

const itemsSchema=new mongoose.Schema({
  name: String
})
const Item=mongoose.model("Item",itemsSchema);

const userContent=new mongoose.Schema({
  id:String,
  content:[itemsSchema]
})
const Usercon=new mongoose.model("Usercon",userContent)
const userCreate=new mongoose.Schema({
  id:String,
  password:String,
  subname:String
})
const Usercre=new mongoose.model("Usercre",userCreate)
const Userqu=new mongoose.Schema({
  question:String,
  o1:String,
  o2:String,
  o3:String,
  o4:String,
  ans:String
})

const Userque=new mongoose.model("Userque",Userqu)
const Userqui=new mongoose.Schema({
  id:String,
  qulist:[Userqu],
  marks:Number,
  date:String,
  stime:String,
  etime:String

})
const Userquiz=new mongoose.model("Userquiz",Userqui)
const Userfinalschema=new mongoose.Schema({
  email:String,
  
})
var username=""
passport.use(new LocalStrategy({
    username: 'email',

  },User.authenticate()));
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        // Uploads is the Upload_folder_name
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now()+".jpg")
    }
  })
  const maxSize = 1 * 1000 * 1000;

var upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb){

        // Set the filetypes, it is optional
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);

        var extname = filetypes.test(path.extname(
                    file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }

        cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes);
      }

// mypic is the name of file attribute
}).single("mypic");


app.get("/",function(req,res) {
  res.render("login")
})
app.get("/signup",function(req,res){
  res.render("signup")
})
app.get("/studentbutton",function(req,res) {
  var s=username.split('@')
  res.render("student",{user:s[0]})
})
app.get("/home",function(req,res){
  if(req.isAuthenticated()){
    var s=username.split('@')

    res.render("home",{user:s[0]})
  }
  else{
    res.render("login")
  }


})
app.get("/student",function(req,res) {
  var s=username.split('@')
  res.render("student",{user:s[0]})
})
app.get("/teacher",function(req,res) {
  var s=username.split('@')
  res.render("faculty",{user:s[0]})
})
app.get('/managestudent',function(req,res) {
  Usercre.find({},function(err,findItems) {

    res.render("managestudent",{sub:findItems})
  })

})
app.get("/createquiz",function(req,res) {
  res.render("createquiz")
})
app.post("/createclass",function(req,res) {
  res.redirect("managesubject")
})
app.post("/uploadProfilePicture",function (req, res, next) {

    // Error MiddleWare for multer file upload, so if any
    // error occurs, the image would not be uploaded!
    upload(req,res,function(err) {

        if(err) {

            // ERROR occured (here it can be occured due
            // to uploading image of size greater than
            // 1MB or uploading different file type)
            res.send(err)
        }
        else {

            // SUCCESS, image successfully uploaded
            res.send("Success, Image uploaded!")
        }
    })
})

app.get("/managesubject",function(req,res) {
  Usersub.find({},function(err,findItems) {
    if(findItems.length ==0){
        console.log("no length");
      }
      else{
     res.render("managesubject",{sub:findItems})
  }
  })

})
app.get("/student_:id",function(req,res) {
  const id=req.params.id
  Usercon.findOne({id:id},function(err,foundlist) {
    res.render("class",{id:id,content:foundlist.content})
  })
})
const c=1
app.get("/createqui_:id",function(req,res) {
  const id=req.params.id;
  Userquiz.findOne({id:id},function(err,foundlist) {
    if(!foundlist){
      res.render("createquiz",{l:0,id:id})
    }
    else{
      res.render("createquiz",{l:1,list:foundlist.qulist,id:id,c:c})
    }
  })
})
app.post("/createqui",function(req,res) {
  const id=req.body.id;

  const q=(req.body.question);
  const o1=(req.body.option1);
  const o2=(req.body.option2);
  const o3=(req.body.option3);
  const o4=(req.body.option4);
  const ans=(req.body.answer)
  const q1=new Userque({
    question:q,
    o1:o1,
    o2:o2,
    o3:o3,
    o4:o4,
    ans:ans,

  })
  Userquiz.findOne({id:id},function(err,foundlist) {
    if(!foundlist){
      const uq=new Userquiz({
        id:id,
        qulist:q1
      })
      uq.save()
      res.redirect("/createqui_"+id)
    }
    else{
      foundlist.qulist.push(q1)
      foundlist.save()
      res.redirect("/createqui_"+id)
    }
  })
})
app.post("/quizready_:id",function(req,res) {
 const id=(req.body.id);
console.log(req.body.marks);
console.log(req.body.date);
console.log(req.body.stime);
console.log(req.body.etime);

 Userquiz.updateOne(
      {id:id},{
        $set:
      {
      marks:req.body.marks,
      date:req.body.date,
      stime:req.body.stime,
      etime:req.body.etime,

    }},{upsert:true}).then((result, err) => {
                    return res.status(200).json({ data: result, message:"Value Updated" })})

})
app.get("/existquiz_:id",function(req,res) {
  const id=req.params.id
  Userquiz.findOne({id:id},function(err,foundlist) {
    if(!foundlist){
      res.send("No Quiz")
    }
    else{
      Usersub.findOne({id:id},function(err,foundUser) {
        const v=foundUser.subname;
        res.render("totalquiz",{id:id,sub:v})
      })
    }
  })
})

app.post("/totalquiz",function(req,res) {
  const id=req.body.id
  const sub1=req.body.sub
  Userquiz.findOne({id:id},function(err,foundlist) {
      res.render("quiz",{id:id,sub:sub1,qu:foundlist,c:1})
  })

})
app.get("/:id",function(req,res) {

  const id=req.params.id
  Usercon.findOne({id:id},function(err,foundUser) {
    if(!foundUser){
      const item=new Item({
        name:['Welcome']
      });
      const h=new Usercon({
        id:req.params.id,
        content:item
      })
      h.save()
         res.redirect("/"+id)
    }
    else{
      res.render("manage",{id:req.params.id,content:foundUser.content})
    }
  })

})

app.post("/manage",function(req,res) {

  const id=req.body.id

  const content=req.body.content
  const item=new Item({
    name:content
  });
  Usercon.findOne({id:id},function(err,foundlist) {
    if (!foundlist){
      const u=new Usercon({
        id:id,
        content:item
      })
      u.save()
      res.redirect("/"+id)
    }
    else{
      foundlist.content.push(item)
      foundlist.save()
      res.redirect("/"+id)
    }
  })
})

app.post("/managesubject",function(req,res) {
  res.redirect("managesubject")
})
app.post("/create",function(req,res) {

   const newUSer=new Usersub({
     id:req.body.id,
     subname:req.body.subname,
     password:req.body.psw
   })

   newUSer.save(function(err){
     if(err){
       console.log(err);
     }
     else{
       res.redirect("/managesubject")
     }
   })
})
app.post("/",function(req,res) {
User.register({username:req.body.username},req.body.password,function(err,user) {
  if(err){
    console.log(err);

  }
  else{
    username=req.body.username
     passport.authenticate("local")(req,res,function() {
       res.redirect("/home")
     })
  }
})

// bcrypt.hash(req.body.password,saltround,function(err,hash) {
//   const newUser=new User({
//     email:req.body.email,
//     password:hash//md5(req.body.password)//hash function
//   })
//   newUser.save(function(err){
//     if(err){
//       console.log(err);
//     }
//     else{
//       console.log("success");
//       res.render("home")
//     }
//   })
// })
})
app.post("/signup",function(req,res){

const user=new User({
  username:req.body.username,
  password:req.body.password
})
req.login(user,function(err){
  if(err){
    console.log(err);
  }
  else{
    passport.authenticate("local")(req,res,function(){
      username=req.body.username
      res.redirect("/home")
    })
  }
})
// const email1=req.body.email
// const password=req.body.password
// User.findOne({email:req.body.email},function(err,foundUser) {
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("sucess");
//     if(foundUser){
//       bcrypt.compare(password,foundUser.password,function(err,result){
//         if(result===true){
//           res.render("home")
//         }
//
//       })
//
//     }
//   }
// })
})
app.post("/join",function(req,res) {
  name=(req.body.name);
  password=req.body.password;
  Usersub.findOne({id:name},function(err,foundlist) {
    if(!foundlist){
      res.redirect("/student")
    }
    else{
      if(foundlist.password==password){

        const a=Usercre({
          id:name,
          password:password,
         subname:foundlist.subname
        })
        a.save()


      }
    }
  })
})
app.post("/check",function(req,res) {
  res.redirect("/managestudent")
})
app.post("/studentbutton",function(req,res) {
  res.redirect("student")
})
app.post("/teacherbutton",function(req,res) {
  res.redirect("teacher")
})
app.listen(3000,function() {
  console.log("server is running");
})
