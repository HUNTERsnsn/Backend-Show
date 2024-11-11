import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

// Define the schema
const userSchema = new Schema(
     {
        username : { 
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true
        },

        email : { 
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true
        },

        fullName : { 
            type : String,
            required : true,
            trim : true,
            index : true
        },

        avatar : {  // cloudinary url (upload asset and get url).
            type : String,
            required : true
        },

        coverImage : { 
            type : String
        },

        watchHistory : { 
            type : Schema.Types.ObjectId,
            ref : "Video"
        },

        password : {     // for encrypted 
            type : String,  
            required : [true, 'Password is required']
        },

        refreshToken : {
            type : String
        }

     }, { timestamps:true } )    // for created at, uploaded at..


// This work for server, not db -> means password is bcrypt in server.
// password is not saved in db, only hashed password saved in db.

// When user register, password is hashed and saved in db.

userSchema.pre("save", async function (next) {

    // if password is not modified, then return next() middleware...
    if(!this.isModified("password")) return next();

    // this.password access the field of password in userSchema.
    this.password = await bcrypt.hash( this.password, 10)
    next()
})

// custom method... (Schema have object that called - methods)
// When user re-sign up..

// When user try to login..

userSchema.methods.isPasswordCorrect =  async function(password){   // enter by user...

//  compare enter password with hashed password
// (this.password is hashed password, password is enter password)
// return provide boolean value ...

   return await bcrypt.compare(password, this.password)

}

// This method return a access token when it is generate..

userSchema.methods.generateAccessToken = function(){

    return jwt.sign(
        {
        _id : this._id,
        email : this.email,
        username : this.username,
        fullName : this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}


// This method return a refresh token when it is generate..
// Simple function -> for use this...
userSchema.methods.generateRefreshToken = function(){

    return jwt.sign(
        {
        _id : this._id,  // end point.
    },

    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
  )
 }


// Create the model
export const User = mongoose.model("User", userSchema)
