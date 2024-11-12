import mongoose, {Schema} from "mongoose";

const playlistSchema = new Schema( 
    {
       
// Name of playlist...
        name : {
            type : String,
            required : true
        },

// What is the description of playlist...
        description : {
            type : String,
            required : true
        },

// Playlist has video, so it define as array of videos...
        videos : [
            {
                type : Schema.Types.ObjectId,
                ref : "Video"
            }
        ],

// User is a owner of playlist...
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },
    { timestamps : true })

export const Playlist = mongoose.model( "Playlist", playlistSchema)