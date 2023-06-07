//jshint esversion:6

require("dotenv").config();
const express = require("express");

const bodyParser = require("body-parser");

const ejs = require("ejs");

const mongoose = require("mongoose");

const session = require("express-session");

const passport = require("passport");

const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost/userDB", {useNewUrlParser: true});


const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose);



// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});


const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
// CREATES COOKIE   
passport.serializeUser(User.serializeUser());
// DISCOVER THE MESSAGE INSIDE THE COOKIE
passport.deserializeUser(User.deserializeUser());


app.get("/", (req,res)=>{
    res.render("home");
})

app.get("/register", (req,res)=>{
    res.render("register");
})

app.get("/secrets", (req,res)=>{
    // if our cookie expires or clear it then it will take us back to
    // login page
    if(req.isAuthenticated()){
        res.render("secrets");
    } else{
        res.redirect("/login");
    }
})

// when the user submits the form to register user we go to this route
app.post("/register", async (req, res) => {
    try {
      const user = await User.register({ username: req.body.username }, req.body.password);
      await passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    } catch (err) {
      console.log(err);
    }
  });
  


app.get("/login", (req,res)=>{
    res.render("login");
})

app.post("/login", async (req, res) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
  
    req.login(user, async (err) => {
      if (err) {
        console.log(err);
        res.redirect("/login"); // Handle login failure
      } else {
        await passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets"); // Handle login success
        });
      }
    });
  });

  app.get("/logout", (req,res)=>{
      req.logout((err)=>{
          if(err){
              console.log(err);
          }
      })
      res.redirect("/");
  })
  



app.listen(3000, ()=>{
    console.log("Server started on port 3000");
})