import express from "express"
import cors from "cors"     // cors have options that takes object.
import cookieParser from "cookie-parser"

const app = express()

// configuration of cors method...

app.use( cors( {          // cors actually aa kha se rha ha..

    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

// use - for configuration....

// How much json we need, for save the server for crash...
// set configuration - for set middlewares...  express.json() - for accept json
// in ancient time we provide - body parser for that... (body-parser, multer -> file uploading configuration)

app.use( express.json( {   
    limit : "16kb"   // when we fill the form...
} ))

app.use( express.urlencoded( {      // for decode the url data -- space = %20
    extended : true,    // for nested object..
    limit : "16kb"
}))

app.use( express.static( "public" ))     // for asset - pdf, img etc.. public - folder.

app.use( cookieParser() )    // cookie of user.


// routes... 

import router from "./routes/user.route.js"

// routes declaration...( users - prefix of all routes of userRouter.) --> controller pass to --> userRouter.
// we use -> use keyword for url in route, instead of get.
app.use( "/api/v1/users", router)  

// http://localhost:8000/api/v1/users... --> go to the userRouter then.
// http://localhost:8000/api/v1/users/register  --> then url go to user.controller help of post method in route.




export {app}

