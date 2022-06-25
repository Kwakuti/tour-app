const GlobalError = require('../utils/globalError');


const handleCastErrorDB = (error) => {
    const message = `Invalid ${error.stringValue} for ${error.path}`;
    return new GlobalError(400, message);
}

const handleDuplicateFieldsDB = (error) => {
    const extractedValue = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate field: ${extractedValue}, name already exists`;
    return new GlobalError(400,  message)
}

const handleValidationErrorDB = (error) => {
    const errorNames =  [];
    const errorsMessage =  [];
    for (let errorElement in error.errors) {
        errorNames.push(errorElement);
    }
    errorsMessage.push(errorNames.map(errorName => {
        return error.errors[errorName].message;
    }))
    const message = `Invalid input data... ${errorsMessage.join('. ')}`;
    return new GlobalError(400, message);
}

const handleJsonWebTokenError = () => {
    return new GlobalError(401, 'Invalid token please login');
}

const handleTokenExpiredError = () => {
    return new GlobalError(401, 'Expired token please login');
}

const sendErrorSelect = (error, res) => {
    const nodeEnv = process.env.NODE_ENV;
    if(nodeEnv == 'production') {
       if(error.isOperational) {
         return res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });   
       } else {
        console.log('the error is here', error);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong...Internal Error Occurred'
        });   
       }
    } else if(nodeEnv == 'development') {
        return res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
            errorStack: error.stack,
            error: error
        });
    }
}


module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;   
    error.status = error.status || 'error'; 
    let errorCopy = {...error};
    errorCopy.errmsg = error.errmsg;
    errorCopy.stack = error.stack;
    if(error.name == 'CastError')  errorCopy = handleCastErrorDB(errorCopy);
    if(error.code == 11000) errorCopy = handleDuplicateFieldsDB(errorCopy);
    if(error.name === 'ValidationError') errorCopy = handleValidationErrorDB(errorCopy);
    if(error.name === 'JsonWebTokenError') errorCopy = handleJsonWebTokenError();
    if(error.name === 'TokenExpiredError') errorCopy = handleTokenExpiredError();
    sendErrorSelect(errorCopy, res);    
}

