import HttpErrors from 'http-errors';
import moment from 'moment';

import tokenHandler from '../utils/tokenUtils.js';
import userModel from "../models/userModel.js";


export  default  async (req,res,next)=>{
    try {
        // const token = req.headers?.authorization || null;

        if (!req.session.userId) {
            next(HttpErrors(401));
        }

        // const data =tokenHandler.decrypt(token);
        // if (!data || !data?.userId || !data?.expiresIn) {
        //     next(HttpErrors(401));
        // }
        if(!(await  userModel.checkIdExists(req.session.userId))) {
            next(HttpErrors(401));
        }
        // if(moment().isAfter(moment(data.expiresIn))){
        //     next(HttpErrors(401),'token expired!');
        // }
        req.userId = req.session.userId;
        next();
    }catch (e){
        next(HttpErrors(401));
    }

}