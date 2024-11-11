import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"


// verify user have correct Token, if user have, then we proceed for logout...
// Middleware to verify JSON Web Token (JWT) for user authentication

export const verifyJWT = asyncHandler( async( req, res, next ) => {

// req have cookie access, bcoz we pass ( app.use( cookie-parser()))
// req.header --> Authorization beared <token> -> in Postman

try {

    // Attempt to retrieve the token from cookies or the Authorization header
    // This token is given by user...

    const token = req.cookies?.accessToken ||
    req.header( "Authorization")?.replace("Bearer ", "")
    
    if( !token ){
        throw new ApiError(401, "Unauthorized request")
    }
    
    // Decocde all information...
    // jwt.verify( <token>(generated Token) , <secretKey>(env) )
    // Decode the token using the secret key to retrieve user information
    
    const decodedToken =  jwt.verify( token, process.env.ACCESS_TOKEN_SECRET)
    
    
    // When we make jwt.sign -> _id : this._id
    // We find decodedToken from User...
    // This user have this token so, remove password, refreshToken...
    // We find the user, using decodedToken._id ...

    const user = await User.findById
    ( decodedToken?._id ).select( "-password -refreshToken")
    
    if( !user ){
        throw new ApiError( 401, "Invalid Access Token")
    }
    
    // provide access of user in request...
    // If the user is found, attach the user object to the request,
    // for use in subsequent middleware or route handlers

    req.user = user;
    next()

} 

catch (error) {

    throw new ApiError( 401, error?.message || "Invalid access Token" )
    
}
})