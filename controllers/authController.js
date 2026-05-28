import HttpErrors from 'http-errors';
import bcrypt from "bcrypt";
import moment from 'moment';

import usersModel from '../models/userModel.js';
import tokenHandler from '../utils/tokenUtils.js';
import userModel from "../models/userModel.js";
import taskModel from "../models/taskModel.js";


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

            const {user_id:userId,user_name:userName,age:userAge,email:userEmail} = user;
            const userData ={userId,userName,userAge,userEmail}



            res.json({
                message: 'User created successfully',
                userData
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
            const {user_id:userId,user_name:userName,age:userAge,email:userEmail} = user;
            const userData ={userId,userName,userAge,userEmail}

            // const token = tokenHandler.encrypt(
            //     {userId,
            //         expiresIn: moment().add(30, 'minutes').toISOString(),
            //     });
            req.session.userId = userData.userId;



            res.json({
                message: "Login successful",
                // token,
                userData
            })

        } catch (e) {
            next(e);
        }
    },
    async getUser(req, res, next) {
        try {
            const {userId} = req;

            const user = await usersModel.findUserById(userId);
            if(!user){
                throw new HttpErrors(401,'ошыбка при загрузке профиля')
            }

            const {user_name:userName,age:userAge,email:userEmail} = user;
            const newUserData ={userId,userName,userAge,userEmail}


            res.json({
                message: `профил ползвтеля ${userName}`,
                newUserData
            })

        } catch (e) {
            next(e);
        }
    },
    async updateUser(req, res, next) {
        try {
            const {userId} = req;

            const u = await  userModel.findUserById(userId);

            const oldUserData ={
                userId:u.user_id,
                userName:u.user_name,
                userAge:u.age,
                userEmail:u.email,
            }


            const user = await usersModel.updateUser(userId,req.body);
            if(!user){
                throw new HttpErrors(401,'ошыбка при загрузке профиля')
            }

            const {user_name:userName,age:userAge,email:userEmail} = user;
            const newUserData ={userId,userName,userAge,userEmail}


            res.json({
                message: `данные ползвтеля обнавлены`,
                oldUserData,
                newUserData
            })

        } catch (e) {
            next(e);
        }
    },
    async getAllUsers (req, res, next) {
        try {
            const {page,limit} = req.query;

            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.max(1, parseInt(limit) || 5);

            const userList = await userModel.getAllUser(pageNum,limitNum);
            res.json({
                message: 'get all users',
                userList
            })
        }catch (e){
            next(e);
        }
    },

    async logout(req, res, next) {
        try {
            await new Promise((resolve, reject) => {
                req.session.destroy((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
            res.clearCookie('session');
            res.redirect('/users/login');

        } catch (err) {
            next(err);
        }
    }

}

