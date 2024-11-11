// Get file from cloudinary ...using( v2 )
// fs --> file system.... (read, write, remove, open, in sync(async) also)
//  --> file system have link (add), unlink( remove), catch --> Even after remove, the file is should be in the fs..

import { v2 as cloudinary } from "cloudinary";
import fs from "fs"   


// Immediately Invoked Function Expression (IIFE)
// To ensure that the code inside the function is executed immediately,
//  without the need to call the function explicitly.

// Configuration

cloudinary.config(
    { 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:  process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    }    
);


// we took file from local and then upload in cloudinary..
// upload the file in cloudinary...(take time)
// know by yourside (cloudinary automatically detect file type)
// cloudinary also provide --> details( url,format,height etc.)
// return --> respone -> for user to seen the response.

const uploadOnCloudinary = async (localFilePath) => {

// Check for valid file path

    try{
        if(!localFilePath) return null

    const response = await cloudinary.uploader.upload( localFilePath,
        {  
            resource_type : "auto"  
        }
    )

// for delete file from the local storage we need to unlink the file.
// like - clear the input data after the search --> 
// file is clear from localstorage, bcoz it is uploaded on cloudinary...

    fs.unlinkSync( localFilePath )  
    console.log("File is uploaded automatically..", response.url);
    return response;  
}


// fs -- unlink (for remove), Sync means-- do this work and then we continue..(linear)
// remove the local file, if operation got failed throuhh many issue -(net etc)..
    catch (error){

        console.error("Upload failed:", error);

        fs.unlinkSync( localFilePath )
        return null;
    }
}

// console.log is used for general-purpose logging, typically for debugging purposes.
// console.error is specifically designed for logging error messages.
// It not only logs the message to the console but also highlights it as an error,
// making it easier to distinguish from regular log messages

export {uploadOnCloudinary}
