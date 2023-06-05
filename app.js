//jshint esversion:6

require("dotenv").config();
const express = require("express");

const bodyParser = require("body-parser");

const ejs = require("ejs");

const mongoose = require("mongoose");

// const encrypt = require("mongoose-encryption");

const md5 = require("md5");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));


mongoose.connect("mongodb://localhost/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})



// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});


const User = mongoose.model("User", userSchema);




app.get("/", (req,res)=>{
    res.render("home");
})

app.get("/register", (req,res)=>{
    res.render("register");
})

// when the user submits the form to register user we go to this route
app.post("/register", async (req,res)=>{
    const newUser = User({
        email: req.body.username,
        password: md5(req.body.password)
    })

    try{
        await newUser.save();
        res.render("secrets");
    }
    catch(err){
        console.log(err);
    }
})


app.get("/login", (req,res)=>{
    res.render("login");
})

app.post("/login", async(req,res)=>{
    const findUsername = req.body.username;
    const findPassword = md5(req.body.password) ;
    try{
        const foundUser = await User.findOne({email: findUsername});
        if(foundUser){
            if(foundUser.password === findPassword){
                res.render("secrets");
            }
        }
    }
    catch(err){
        console.log(err);
    }
})



app.listen(3000, ()=>{
    console.log("Server started on port 3000");
})