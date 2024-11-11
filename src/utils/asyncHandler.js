// High order function...
// Curly braces {} are used for block statements, not for function parameters.
// Implicit return (without curly braces): const add = (a, b) => a + b;
// Explicit return (with curly braces): const add = (a, b) => {return a + b;};

// If an error occurs within the requestHandler, 
//it is caught and passed to the next() function,
// which is the standard way to handle errors in Express middleware.


const asyncHandler = (requestHandler) => (req, res, next) => {
        Promise.resolve( requestHandler( req, res, next ))
        .catch((err) => next(err))
    }


export {asyncHandler}
