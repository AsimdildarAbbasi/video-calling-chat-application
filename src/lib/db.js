import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const  connectDB = async () => {
    try{
        const conn=await mongoose.connect(process.env.MongoDB_URI);
        console.log("MongoDB connected"); 
    }catch(error){
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit the process with failure
    }
    
};