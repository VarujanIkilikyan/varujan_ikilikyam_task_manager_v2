import HttpErrors from 'http-errors';
import {UsersModel} from '../models/Index.model.js';


export  default  async (req,res,next)=>{
    try {
        // const token = req.headers?.authorization || null;

        if (!req.session.userId) {
            console.log('a')
            next(HttpErrors(401));
        }

        // const data =tokenHandler.decrypt(token);
        // if (!data || !data?.userId || !data?.expiresIn) {
        //     next(HttpErrors(401));
        // }
        if(!(await  UsersModel.findByPk(req.session.userId))) {
            next(HttpErrors(401));
        }
        // if(moment().isAfter(moment(data.expiresIn))){
        //     next(HttpErrors(401),'token expired!');
        // }
        next();

    }catch (e){
        next(HttpErrors(401));
    }

}