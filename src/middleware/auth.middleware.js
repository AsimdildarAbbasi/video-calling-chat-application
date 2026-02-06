import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const protecteRoute=async (req,res,next) =>{
    try {
        const token =req.cookies.jwt;
        if(!token){
            return res.status(400).json({ message: 'no token provided  ' });
        }
        const decoded =jwt.verify(token,process.env.JWT_SECRET_KEY)
        if(!decoded){
            return res.status(400).json({ message: 'token is invalid' });
        }
        const user=await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(400).json({ message: 'Unauthorized User not found ' });
        }

        req.user=user;
        next();

    } catch (error) {
        console.log("Erro in proected middleware",error);
    }
    
}