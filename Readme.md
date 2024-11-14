# chai aur backend...
PORT=8000
MONGODB_URI=
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=


improve version of -- dotenv...
// require('dotenv').config( { path : './env' } )



// -r dotenv/config --experimental-json-modules   -- in package.json
import dotenv from "dotenv"
import connectDB from './db'

dotenv.config({   // for improve consistency...
    path : './env'
})




// Method 1 -->

import mongoose from "mongoose";
import { DB_NAME } from "./constrants";

import express from "express";
const app = express()

// iffy...
( async ()=>{

    try{

// await mongoose.connect('mongodb://127.0.0.1/my_database');

        mongoose.connect(` ${process.env.MONGODB_URI}
        /${DB_NAME}`)

        app.on("error", (error)=> {    // on = listener
            console.log("ERROR",error)
            throw error  // pass on parameter...
        })

        app.listen( process.env.PORT, ()=>{
            console.log(`server is running on port
            ${process.env.PORT}`);
        })
    }

    catch (error) {
        console.log("ERROR:", error)
        throw error
    }

})()


const asyncHandler2 = (fn) => async( req,res,next ) => {

//     try{

//         await fn (req,res,next);
//     }

//     catch( error ){
//         res.status( err.code || 500 ).json( {
//             success : false,
//             mesage: err.mesage
//         })
//     }
// }

// export { asyncHandler }
