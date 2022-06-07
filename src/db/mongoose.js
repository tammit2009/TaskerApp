const mongoose = require('mongoose');

const connectMongoDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,  
        })

        console.log(`Connected to mongodb on "${conn.connection.host}"`.cyan.underline);

    } catch (err) {
        console.error(`Error: ${err.message}`.red.underline.bold);
    }
};

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection to DB disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected on app termination');
        process.exit(0);
    });
});

process.on('SIGTERM', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected on app termination');
        process.exit(0);
    });
});

module.exports = connectMongoDb;