import HttpErrors from 'http-errors';
import moment from 'moment';

import tokenHandler from '../04_utils/tokenUtils.js';
import userModel from "../03_models/userModel.js";


export  default  async (req,res,next)=>{
    try {
        const token = req.headers?.authorization || null;

        if (!token) {
            next(HttpErrors(401));
        }

        const data =tokenHandler.decrypt(token);
        if (!data || !data?.userId || !data?.expiresIn) {
            next(HttpErrors(401));
        }
        if(!(await  userModel.checkIdExists(data.userId))) {
            next(HttpErrors(401));
        }
        if(moment().isAfter(moment(data.expiresIn))){
            next(HttpErrors(401),'token expired!');
        }
        req.userId = data.userId;
        next();
    }catch (e){
        next(HttpErrors(401));
    }

}