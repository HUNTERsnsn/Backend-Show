// ../ is a relative path that moves up one directory level from the current file.
// Means --> index.js - db - constrants.

import mongoose from "mongoose";
import { DB_NAME } from "../constrants.js";

//  ${process.env.MONGODB_URI} and ${DB_NAME} are template literals
// that embed the values of process.env.MONGODB_URI and DB_NAME into the string.

const connectDB = async() =>{

    try{      // await mongoose.connect('mongodb://127.0.0.1/my_database');
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);   // connection.host -- for host name....
    }
    catch(error){
        console.log("MONGODB CONNECTION ERROR ",error)
        // exit = method, process- currentprocess.

    }
}

export default connectDB;