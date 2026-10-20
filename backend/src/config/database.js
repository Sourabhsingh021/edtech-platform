import mongoose from "mongoose";
import "dotenv/config";

export const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DB connection successfull")
    }catch(error){
        console.log(error.message);
        throw error;
    }
}