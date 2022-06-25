const dotenv = require('dotenv');

dotenv.config({path: './config.env'});

process.on('uncaughtException', (errorDetails) => {
    console.log('UnCaught Exception', errorDetails.message);
    process.exit(1);
})

const server = require('./app');
const mongoose = require('mongoose');

const PORT_NUMBER  = process.env.PORT_NUMBER;
const DATABASE_STRING = process.env.DATABASE_LOCAL;

mongoose.connect(DATABASE_STRING,{ useNewUrlParser: true, useUnifiedTopology: true }).then((connection) => {
    console.log('Database connected successfully...')
});


const serverObject = server.listen(PORT_NUMBER, () => {
    console.log(`Starting server on ${PORT_NUMBER}...`);
});

process.on('unhandledRejection', (errorDetails) => {
    console.log(`${errorDetails.name}, ${errorDetails.message}`);
    console.log(`Unhandled Rejection..shutting down`);
    serverObject.close(() => {
        process.exit(1);
    });
});



process.on('uncaughtException', (errorDetails) => {
    console.log('UnCaught Exception', errorDetails.message);
    serverObject.close(() => {
        process.exit();
    });
}) 

/*
function externalErrorsExecution(eventType, errorDetails, serverObject) {
    console.log(eventType, errorDetails);
    serverObject.close(() => {
        process.exit(1 );
    });
}



*/