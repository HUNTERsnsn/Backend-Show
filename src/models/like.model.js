import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema( 
    {

// ( Like's id is already created...)
// On video video user like....
    video : {
        type : Schema.Types.ObjectId,
        ref : "Video"
    },

// On which comment User like...
    comment : {
        type : Schema.Types.ObjectId,
        ref : "Comment"
    },

// On which Tweet User like...
    tweet : {
        type : Schema.Types.ObjectId,
        ref : "Tweet"
    },

// On which Tweet User like...
    likedBy : {
        type : Schema.Types.ObjectId,
        ref : "User"

    }

}, { timestamps : true });

export const Like = mongoose.model( "Like", likeSchema );