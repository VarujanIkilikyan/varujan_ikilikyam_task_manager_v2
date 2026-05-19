import HttpErrors from 'http-errors';
import bcrypt from "bcrypt";
import moment from 'moment';

import usersModel from '../03_models/userModel.js';
import tokenHandler from '../04_utils/tokenUtils.js';


export default {


    async registration (req, res, next) {
        try {

            const {username,age,email,password} = req.body;

            if(await usersModel.checkEmailExists(email)) {

                throw  new HttpErrors(422,{
                    message: 'Validation error',
                    errors:{
                        email: 'почта уже сушествует',
                    }
                })
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await usersModel.create(username,age,email,hashedPassword)

            delete user.password;



            res.json({
                message: 'User created successfully',
                user
            })
        } catch (e) {
            next(e);
        }
    },
    async login(req, res, next) {
        try {
            const {email,password} = req.body;

            const user = await usersModel.findUserByEmail(email);
            if(!user || !await bcrypt.compare(password, user.password)){
                throw new HttpErrors(401, {
                    errors:{
                        email: 'неправильный email или пароль',
                        password: 'неправильный email или пароль',
                    }
                })
            }

            const token = tokenHandler.encrypt(
                {userId: user.userId,
                    expiresIn: moment().add(30, 'minutes').toISOString(),
                });
            delete user.password;


            res.json({
                message: "Login successful",
                token,
                user
            })

        } catch (e) {
            next(e);
        }
    },

}

