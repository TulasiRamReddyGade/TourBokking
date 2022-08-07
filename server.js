const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const app = require('./app');
// console.log(process.env);
// console.log(app.get('env'));

if (process.env.NODE_ENV === 'production') {
    const URL = process.env.DATABASE.replace(
        '<PASSWORD>',
        process.env.DATABASE_PASSWORD
    );
    mongoose
        .connect(URL, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
        .then(con => console.log('databse connected '));
} else {
    const URL = 'mongodb://localhost:27017/natours';
    mongoose
        .connect(URL, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
        .then(con => {
            console.log('connected to db');
        });
}

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
    console.log(`app running on port: ${port}`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('unhandled Rejection');
    server.close(() => {
        process.exit(1);
    });
});
process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('uncaughtException');
    server.close(() => {
        process.exit(1);
    });
});
