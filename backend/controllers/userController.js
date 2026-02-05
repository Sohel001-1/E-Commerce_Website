import validator from "validator"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";



const createToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,)
}

const loginUser=async(req,res)=>{
    try{
        const{email,password}=req.body;

        const user= await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"User does not exist"})
        }

        const isMatch= await bcrypt.compare(password,user.password);
        if(isMatch){
            const token= createToken(user._id)
            res.json({success:true,token})
        }
        else{
            res.json({success:false,message:"Invalid credentials"})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error occurred during login"})
    }



}
const registerUser= async(req,res)=>{


    try {
        const {name,email,password}=req.body;

const exists= await userModel.findOne({email});
if(exists){
    return res.json({success:false,message:"User already exists"})


}

if(!validator.isEmail(email)){
    return res.json({success:false,message:"Please enter a valid email"})
}
if(password.length<8){
    return res.json({success:false,message:"Please enter a strong password with minimum 8 characters"})
}

const salt= await bcrypt.genSalt(10)
const hashedPassword= await bcrypt.hash(password,salt)

const newUser=new userModel({
    name,
    email,
    password:hashedPassword
})

const user= await newUser.save()
const token= createToken(user._id)
res.json({success:true,token})


    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})

    }

}

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const adminEmail = process.env.ADMIN_EMAIL || "admin@japanautos.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin";

        if (email === adminEmail && password === adminPassword) {
            const token = createToken("admin");
            return res.json({ success: true, token });
        }

        return res.json({ success: false, message: "Invalid admin credentials" });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Error occurred during admin login" });
    }
}



export {loginUser,registerUser,adminLogin};
