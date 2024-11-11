class ApiError extends Error{

    constructor( statusCode,
    message = "Something went wrong",
    errors = [],
    stack = "")
    {
       super(message)    // override..
       this.statusCode = statusCode    // this.statusCode 
       this.data = null
       this.message = message
       this.success = false
       this.errors = errors

       if(stack){
        this.stack = stack
       }
       else{
        Error.captureStackTrace(this, this.constructor)
       }
    }
}

export {ApiError}