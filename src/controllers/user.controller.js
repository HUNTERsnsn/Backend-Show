import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";

// creating a method... (work you hit a url...)
// create a async function, inside the asynchandler function, 
// that handle  the request and response and error also...


// Mongodb provide specific id to all element --> _id..
// generateAccessAndRefreshTokens( user._id )...
// user --> object(variable) that holds values, _id particular id given by mongo..

const generateAccessAndRefreshTokens = async( userId ) => {

try{
    const user =  await User.findById( userId )

    const accessToken = user.generateAccessToken()   // methods.

// This token is only just you, not outside...( refreshToken in db)

    const refreshToken = user.generateRefreshToken()

// Add value in Object....
// validateBeforeSave : false -> because the mongoose.model is kick in.
// for Save model, we use this..
// value add in object -> object.value = ""
// ( user = ramesh.)  -> user._id = 1234, this id attach to ramesh user.
// ( ramesh.refreshToken = refreshToken  ) -> ramesh object has refreshToken property.
// This a encoded refreshToken saved in user object.

    user.refreshToken = refreshToken
    await user.save( {validateBeforeSave : false } ) 

    return { accessToken, refreshToken }  
}
    catch (error){
        throw new ApiError( 500, "Something Went Wrong while Generating Tokens" );
    }
}



const registerUser = asyncHandler( async( req, res) => {

// get User details from frontend...
// Validation - not Empty...
// Check if user already exists : username, email
// check for images, check for avatar
// upload them to cloudinary --> get url (response.url), user -> multer -> cloudinary -->
// url -> userobject(mongodb) 
// create user object - create entry in db (check user is not null)
// check for user creation 
// remove password and refresh token field from response field
// return response 
// file handling from --> routes...

// 1). // req.body - express..
const  { fullName, email, username, password } = req.body
console.log(req.body);
console.log( "email:", email);


// 2).
if ( 
    [ fullName, email, username, password ].some( (field)=>
        field?.trim() === "")
) {
    throw new ApiError( 400, "All fields are required")
  }



// 3). $(operator).. User --> mongoose.model, apiError -> class
// constructor = ApiError, constructor(statusCode, message ...)
// findOne is method of mongoose.Model ...

const existedUser = await User.findOne({
    $or : [ { username }, { email } ]
})
if( existedUser ){
    throw new ApiError( 409 , "User with email or username already exists")
}


// 4). check for images and avatar in user.route.js(req.files[0] -> first properities) - multer functionality.
// path is coming from multer - file.originalname (path - localpath of f0ile. (/public/temp))

const avatarLocalPath = req.files?.avatar[0]?.path;


// 4). Classic Method to check coverImage --> (array have a length...)
// if we doesn't provide coverImage or any error, then cloudinary provide = ""

let coverImageLocalPath;
if( req.files && Array.isArray( req.files.coverImage)
    && req.files.coverImage.length > 0){
coverImageLocalPath = req.files.coverImage[0].path }



// const coverImageLocalPath = req.files?.coverImage[0]?.path;
// Array of object --> 
// fieldname, originalname, encoding, mimetype, destination,
// filename, path, size..


if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
}

console.log(req.files);

// 5). upload to cloudinary..

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
    throw new ApiError(400, "Avatar file is required")
}


// 6). create user object - create entry in db (User.create -> method -> object)..
// Db -> provide special id for all element.

const user = await User.create( 
    {
        fullName,           // ( avatar --> we also send like this)
        avatar : avatar.url,   // For send url to db, to hide detail from user.
        coverImage : coverImage?.url || "",  // for check in coverimage is available..
        email,
        password,     // password enter by user.
        username : username.toLowerCase()  // convert to lower case
})

// Method that mongoose have...(_id - with every element, provide by user.create)
// 7). remove password , refreshToken combine with Db check.. (.select --> string)

const UserCheckIsAvailable = await User.findById( user._id).select(
    "-password -refreshToken"  // i don't want this show in db.
)

if( !UserCheckIsAvailable ){
    throw new ApiError(500, "Something went wrong while registing the user")
}

// 8). Send response to user (db is created)...
// ApiResponse is a class for provide res -> constructor( statusCode, data(user.Object), message)

return res.status( 201 ).json(
    new ApiResponse( 200, UserCheckIsAvailable, "User registered Successfully")
)


})


const loginUser = asyncHandler( async( req, res ) => { 

    // req.body -> data is coming from body.
    // check username or email is available or not.
    // Find the user. (if user is not availabe, navigate to registerUser)
    // Password Check... ( if is correct )
    // Generate accessToken and refreshToken...
    // Send data using Cookie...
    // Send Response...

// 1). data from req.body...

const  { email, username, password } = req.body;
console.log(email);

// if you want only one -->
// 1). ( !( username || email ) ) --> if both are empty, navigate to registerUser.
// 2) .$or : [ {username}, {email} ]

if( !username && !email ){
    throw new ApiError( 400, "Username and Email is required");
}


// 2). check username or email is available or not.

const user =  await User.findOne( {

// Find one, email or username...
    $or : [ {username}, {email} ]
})


// 3). If username or email is not available, then navigate to registerPage.

if( !user ){
    throw new ApiError( 404, "User does not exist ")
}


// Check the Password...(password) -> request.body...

const isPasswordValid = await user.isPasswordCorrect( password )

if( !isPasswordValid){
    throw new ApiError( 401, "Invalid user Credentials ");
}


// Generate AccessToken and RefreshToken..
// return { accessToken, refreshToken }

const { accessToken, refreshToken } =
await generateAccessAndRefreshTokens( user._id )

// for send data in loggedInUser, bcoz user doesn't have tokens..
// LoggedInUser doesn't have password and refreshToken..

const loggedInUser = await User.findById( user._id ).select(
    "-password -refreshToken"
)


// send Data using cookies....
// Select options(object) for httpOnly can provide security means - 
// not every one modify cookies, it can modify by server...

const options = {
    httpOnly : true,
    secure : true
}

// Send response...
// .cookie takes key value -> ( "key", value, options )

return res
.status( 201 )
.cookie( "accessToken", accessToken, options)
.cookie( "refreshToken", refreshToken, options)

// This is for when, user want to saved accessToken,refreshToken by their side.
// For mobile application, and save in localStorage...

.json( 
    new ApiResponse( 200,
    {
        // user --> data...
        user : loggedInUser, accessToken, refreshToken

    },
    "User logged In Successfully ")
)
})


// How to logout -> also clear accessToken, RefreshToken for pure logout...

const logoutUser = asyncHandler( async( req, res ) => {

// How find which user want to logout...
// pick (req.user) -> take id and delete token, token from user collection...
// We can access user colllection -> req.user(token)

// If you wanna remove something from User, so you can use unset for it.
// And modify and alter for you can use - set..

User.findByIdAndUpdate(

    req.user._id,   // findById
    {
        $unset :    // Update
        {
            refreshToken : 1   // this remove the field from document
        }
    },
    {       // more options ( for new token)
        new : true   
    })

    const options = {
        httpOnly : true,
        secure : true
    }

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json( new ApiResponse( 200, {}, "User Logged Out"))

})



// req.body.cookies - for mobile application...

const refreshAccessToken = asyncHandler( async( req, res ) => { 

    const incomingRefreshToken = req.cookies
    .refreshToken || req.body.refreshToken

    if( !incomingRefreshToken ){
        throw new ApiError( 401, "Unauthorized request ");
    }


// We want the token decoded(anna like ) - so we can check if it's valid or not...
// Bcoz user got encrypted token..
// verify can be used to verify token with decoded information ...

 try {
      const decodedToken = jwt.verify( incomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET)
   
   
   // How to get user using decodedToken -> See we pass _id in generateToken method.
   // When we decode the token we get all information, so we can get user using _id.
   // Bcoz user use this token, without decoded the token we can't get this.
   
      const user = await User.findById( decodedToken?._id )
   
      if( !user ){
       throw new ApiError( 401, "Invalid refreshToken");
   }
   
   
   // IncomingRefreshToken is encrypted, given by user...
   // user.refreshToken -> user is coming from decodedToken.id..
   // means when we decode the token, we found a user using id,
   // so when decodedToken user is same as the encryptedToken user. 
   
   // We want to found that, the user who send the token(incoming) is same,
   // as the user we found when we decoded the token and found by id...
   // For safety purpose to stay login...
   
   if( incomingRefreshToken !== user?.refreshToken ){
       throw new ApiError( 401, "RefreshToken is expired or used")
   }
   
   
   // So we found the same user, so generateToken...
   
   const {accessToken, newrefreshToken } = await 
   generateAccessAndRefreshTokens( user._id )
   
   const options = {
       httpOnly : true,
       secure : true
   }
   
   return res
   .status(200)
   .cookie( "accessToken", accessToken, options )
   .cookie( "refreshToken", newrefreshToken, options )
   .json(
       new ApiResponse(
           200,
           {
              accessToken, refreshToken : newrefreshToken
           },
           " AccessToken RefreshToken generated successfully "
   
       )
   )
 } 
 catch (error) {
    throw new ApiError( 401, error?.message || "invalid refreshToken")
}

} )


// How to update the password...
// It is simple to update the password, because we already have functionality.

// 1). Take a old and newPassword from the body, bcoz we enter in the body.
// Like a update password page, we have to input old and set new...

// 2). Check who send request for update the password from auth.middleware..
// Means Before logout the user, we attach the user,( req.user ) in request.

// 3). Find the user using req.user._id and we found the user.

// 4). Check the user Enter the right Password, using isPasswordCorrect method.
// When we find the user( User.findbyid) and saved in variable, it got method of userSchema.

// 5). If password is correct, update it - user.password = newPassword.

// 6). Save in db - user.save.

// 7). Provide a response.

const changeCurrentPassword = asyncHandler( async( req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await User.findById( req.user?._id )

    const isPasswordCorrect = await user.isPasswordCorrect( oldPassword )


    if( !isPasswordCorrect ){
        throw new ApiError( 400, " Invalid old password ")
}

// The user variable in your code is an instance of the User model.
// which typically represents a user in your database.The exact fields available in 
// the user variable depend on how the User model is defined in your application.

    user.password = newPassword
    await user.save( { validateBeforeSave : false })

    return res
    .status( 200 )
    .json(
        new ApiResponse( 200, {}, "Password Changed Successfully ")
    )
})


// Get Current user..
// bcoz we pass whole user in req.user
const getCurrentUser = asyncHandler( async( req, res) => {

    return res
    .status( 200)
    .json( 200, req.user, "Current user fetched succesffuly")

})


// How to update the Account details...
// Tip - When you update the file, keep the controller endpoint seperate.
// { new : true } - It provide information, after the update.

const updateAccountDetails = asyncHandler( async( req, res) => {

    const { fullName, email } = req.body

    if( !fullName && !email ){
        throw new ApiError( 400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate( 
        req.user?._id,
        {
            $set : { 
                fullName,
                email
            }
        },
        { new : true }
).select( "-password")

return res
.status( 200 )
.json( new ApiResponse
    ( 200, user, "Account details updated successfully"))
})


// How to update avatar of your channel...
// Take a path of avatar path from req.file - multer path...
// upload the new avatar on cloudinary, and findandupdate the user by new avatar url
// and then provide response...

const updateUserAvatar = asyncHandler( async( req, res ) =>{

    const avatarLocalPath = req.file?.avatar[0].path

    if( !avatarLocalPath ){
        throw new ApiError( 400, "Avatar File is missing")
    }

    const avatar = await uploadOnCloudinary( avatarLocalPath )

    if( !avatar ){
        throw new ApiError( 400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate( req.user._id,
        {
            $set : { avatar : avatar.url }
        },      
        { new : true }
    )
    .select( "-password")

    return res
    .status( 200 )
    .json( 
        new  ApiResponse( 200, user, "Avatar updated successfully" )
    )
} )


// How to update coverImage of your channel...
// Take a path of coverImage path from req.file - multer path...
// upload the new coverImage on cloudinary, and findandupdate the user by new coverImage url
// and then provide response...

const updateUserCoverImage = asyncHandler( async( req, res) => {

    const coverImageLocalPath = req.file?.path

if( !coverImageLocalPath){
    throw new ApiError( 400, "LocalPath of CoverImage is not available")
}

const coverImage = await uploadOnCloudinary( coverImageLocalPath);

if( !coverImage ){
    throw new ApiError( 400, "CoverImage is not uploaded in cloudinary")
}

const user = await User.findByIdAndUpdate( 
    req.user._id,
    {
        $set : { 
        coverImage : coverImage.url }
    },      
    { new : true }
)
.select( "-password")

return res
.status( 200 )
.json( 
    new  ApiResponse( 200, user, "CoverImage updated successfully" )
)
})


// req.params = url.( because we provide a link to see User Profile )
// When we write pipleline we got array in return.

const getUserChannelProfile = asyncHandler( async( req, res ) => {

    const { username } = req.params

    if( !username?.trim()) {
        throw new ApiError( 400, "Username is Missing" );
    }

    // Channel = chai aur code, username = user.
    const channel = await User.aggregate( [  



        {    // $match = field.  $username = expression...
            $match : {
                username : username?.toLowerCase()
            }
        },

// value being plural and lowercase also... ( user + subscriptions)
// ( channel = subscribers), $lookup = join two collection.
        {    
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "channel",
                as : "subscribers"   
            }
        },

// One subscriber can subscribe to multiple channels.
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo" 
            }
        },

// Add additional fields...($subscribed is a field)
        {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers" 
                },

                channelsSubscribedToCount : {
                    $size : "$subscribedTo"
                },

// For check, channel is subscribed or not...
// $in = check if value is in array or object
// $subscribers = channel and subscriber = user.
                isSubscribed : {
                    $cond : {
                    if : { $in : [ req.user?._id, "$subscribers.subscriber" ] },
                    then : true,
                    else : false
                    }
                }
            }
        },

// project is for project the value and selected value.( 1 flag on)
        {
            $project : {
                fullName : 1,
                username : 1,
                subscribersCount : 1,
                channelsSubscribedToCount : 1,
                isSubscribed : 1,
                avatar : 1,
                coverImage : 1,
                email : 1  
            }
        }
   ])

   console.log( channel )  // array of object.

   if( !channel?.length){
    throw new ApiError( 404, "channel does not exist")
   }

   return res
   .status(200)
   .json(
    new ApiResponse( 200, channel[0], "User Channel Feteched")
   )
})


// req.user._id - is a string given by mongoDB, and then mongoose convert it.
// And then we find this id by using - User.findById( req.user._id )
// Mongoose doesn't work in aggregate, So we need to create a id for it.
// new mongoose.Types.ObjectId ( req.user._id ) - for create a new id.

// we uses a nested pipeline for gain the (owner) from videos
// We uses watchhistory as local because we write it on user.model

const getUserWatchHistory = asyncHandler( async( req, res ) => {

// An example of an ObjectId looks like this: 507f1f77bcf86cd799439011.
    const user = await User.aggregate( [ 
    {
            $match : {
                _id : new mongoose.Types.ObjectId( req.user._id )
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",

                pipeline : [ 
                {
                    $lookup : {
                        from : "users",
                        localField : "owner",
                        foreignField : "_id",
                        as : "owner",

                        pipeline : [
                            {
                                $project : {
                                    fullName : 1,
                                    username : 1,
                                    avatar : 1
                                }
                            }
                        ]  
                    }
                },

// we uses addfield beacuse after lookup we have array so, we get first value from it.
                {
                   $addFields : {
                    owner : {
                        $first : "$owner"
                    }
                } 
            }
        ]
     }
   }  
])

return res
.status( 200 )
.json (
    new ApiResponse (
        200,
        user[0].watchHistory,
        "Watch History fetched successfully "
    )
)
})




export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword
, getCurrentUser,  updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getUserWatchHistory }



// Bad  practice:

// 1).requestHandler = async( req, res ) => {  res.status(200).json( { message : "ok" })}  // for pass message.
// 2) .if( fullname === ""){ throw new ApiError(400, "Fullname is required") }
// 3). return res.status( 201 ).json( {UserCheckIsAvailable} ) --> we can also return response.

// 4). Classic Method to check coverImage -->
// let coverImageLocalPath;
// if( req.files && Array.isArray( req.files.coverImage) && req.files.coverImage.length > 0){
// coverImageLocalPath = req.files.coverImage[0].path }


// 5). one more method -- > 
// const coverImageLocalPath = req.files?.coverImage[0]?.path;