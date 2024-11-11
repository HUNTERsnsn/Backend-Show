import multer from "multer";

// Multer takes methodss..
// cb- callback...

const storage = multer.diskStorage( {

    // multer take the file from disk -- means storage ...
    destination : function( req, file, cb ){

        cb( null, "./public/temp" )
    },

    filename : function( req, file, cb){

// Originalname - enter by user...

        cb( null, file.originalname )  
    }
})


// export upload file - for upload the file...

export const upload = multer({
    storage : storage
})