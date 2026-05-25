import express from 'express';
import {createServer} from 'http';
import 'dotenv/config'
import logger from 'morgan';
import path from 'path';

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

