import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile :{    // cloudinary url
        type : String,
        required : true 
       },

       thumbnail :{   // cloudinary url...
        type : String,  
        required : true
       },

       title : {
        type : String,
        required : true
       },

       description : {
        type : String,
        required : true
       },
 
        duration : {   // cloudinary url (when we upload a file in cloudinary,
        // it provide details)
        type : String,
        required : true
       },

       view : {
        type : Number,
        default : 0
       },

       isPublished : {   // hide or not - 0,1
        type : Boolean,
        default : true
       },

       owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
       }

    }, { timestamps : true  } )


videoSchema.plugin( mongooseAggregatePaginate)  // for use paginate...

export const Video = mongoose.model("Video", videoSchema);



