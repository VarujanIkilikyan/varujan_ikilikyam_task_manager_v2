import express from 'express';
import {createServer} from 'http';
import 'dotenv/config'
import logger from 'morgan';
import path from 'path';
import expressSession from 'express-session';
import MySQLStoreFactory from  'express-mysql-session';

import './migrate.js';

import SelectorRouter from './routes/index.js';
import errorHandler from "./middlewares/errorHandler.js";


const app = express();
const server = createServer(app);
//logger
app.use(logger('dev'))
//view engin setup
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'views'));
app.use(express.static(path.join(path.resolve(), 'public')));

//express Session class creator
const MySQLStore = MySQLStoreFactory(expressSession);
//express Session config
const {MY_SQL_HOST,MY_SQL_PORT,MY_SQL_USER,MY_SQL_PASSWORD,MY_SQL_DATABASE}= process.env
const options = {
    host: MY_SQL_HOST,
    port: MY_SQL_PORT,
    user: MY_SQL_USER,
    password: MY_SQL_PASSWORD,
    database: MY_SQL_DATABASE,

    clearExpired: true,
    checkExpirationInterval: 1800000,

    createDatabaseTable: true,
    tableName: 'sessions',

    // schema: {
    //     columnNames: {
    //         session_id: 'session_id',
    //         expires: 'expires',
    //         data: 'data'
    //     }
    // }

}

const sessionStore = new MySQLStore(options);
//express Session
app.use(expressSession({
    name: 'session',
    store: sessionStore,

    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: +process.env.COOKIE_COOKIE_TIME,
        httpOnly: true,
        secure: false,
    },
}));

//transform post body req.body
app.use(express.json());

//request handler
app.use(SelectorRouter);

//error handler
app.use(errorHandler.notFound);
app.use(errorHandler.errors);



const { PORT = 3000, HOST = 'localhost' } = process.env;
server.listen(+PORT, HOST,()=>{
    console.log(`Server run on ${HOST}:${PORT}`);
});

