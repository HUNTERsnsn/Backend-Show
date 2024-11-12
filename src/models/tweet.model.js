import mongoose, {Schema} from "mongoose";

const tweetSchema = new Schema( 
    {

// What is the content of Tweet ...
        content : {
            type : String,
            required : true
        },

// Who is the user of This Tweet... 
        owner : {
            Type : Schema.Types.ObjectId,
            ref : "User"
        }
    },
{ timestamps : true } );

export const Tweet = mongoose.model("Tweet", tweetSchema);