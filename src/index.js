// Reduce the consistency of code...
// config -- can have a object ..
// require('dotenv').config( { path : './env' } ) -- require = import.

// The app.listen method is used to start the server and listen for incoming connections on a specified port.
// listen - port --> on which port.. callback --> Give a reply for user.

// The app.on method is used to listen for specific events emitted by the Express application.
// In this case, it listens for the "error" event.
// app.on - error --> display error, callback --> what kind of error...

import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({   // for improve consistency...
    path: './.env'
})

connectDB()      // async function provide a promise in return.

.then( ()=>{

    app.on( "error" , (error)=>{   // parameter pass for throw a error...
        console.log("An error occurred:", error);
        throw error
    })

    app.listen( process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})

.catch ((error)=>{

    console.log("mongodb connection failed !!!", error);
});


