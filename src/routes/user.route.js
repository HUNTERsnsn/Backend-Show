import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getUserWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage  } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Create a new Router instance
const router = Router();

// Define the /register route and attach the registerUser controller

router.route("/register").post(
    
// Fields is functionality of multer...
// We Create multer(middleware) for send images and avatar, bcoz we use cloudinary..
    upload.fields( [  // array of objects...
        {
           name : "avatar",    // avatar = file 
           maxCount : 1        // file.originalname = scre......
        },
        { 
            name : "coverImage",
            maxCount : 1
        }
    ]),
    
registerUser);


router.route( "/login" ).post( loginUser )


// secured routes...(logout)
//  we use middleware auth middleware to verify JWT token

router.route( "/logout" ).post( verifyJWT, logoutUser )

router.route( "/refresh-token").post( refreshAccessToken )

router.route( "/change-password").post( verifyJWT, changeCurrentPassword)

router.route( "/current-user").get( verifyJWT, getCurrentUser)

// patch is for prevent all account information updation.
router.route( "/update-account").patch( verifyJWT, updateAccountDetails)

// single for - req.file.path
router.route( "/avatar").patch( verifyJWT, upload.single("avatar"),
updateUserAvatar)

router.route( "/cover-image").patch( verifyJWT, 
upload.single("coverImage"), updateUserCoverImage)


// when we take data from params then - we can use those name that mentioned in method.
router.route( "/c/:username").get( verifyJWT, getUserChannelProfile)

router.route( "/history").get( verifyJWT, getUserWatchHistory )

// Export the router for use in other parts of the application
export default router;
