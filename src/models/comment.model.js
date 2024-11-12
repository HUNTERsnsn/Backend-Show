import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
    {

// comment on which thing - video...
        content : {
            type : String,
            required : true
        },

// Which video...
        video : {
            type : Schema.Types.ObjectId,
            ref : "Video"
        },

// Comment by which user...
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },

    },
    { timestamps : true })


// plugin provide functionality, where to start the video and end...
commentSchema.plugin( mongooseAggregatePaginate );

export const Comment = mongoose.model( "Comment", commentSchema)