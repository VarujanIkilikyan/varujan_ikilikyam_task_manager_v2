import HttpErrors from 'http-errors';
import bcrypt from "bcrypt";
import {UsersModel} from '../models/Index.model.js';



export default {


    async registration (req, res, next) {
        try {

            const {userName,userAge,userEmail,password} = req.body;

            if(await UsersModel.findOne({where:{userEmail}})) {

                throw  new HttpErrors(422,{
                    message: 'Validation error',
                    errors:{
                        email: 'почта уже сушествует',
                    }
                })
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            const userData = await UsersModel.create(
                {userName,userAge,userEmail,password:hashedPassword})

            const user = userData.toJSON();
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
            const {userEmail,password} = req.body;

            let user = await UsersModel.findOne({where:{userEmail}});
             user = user?.toJSON();
            if(!user || !await bcrypt.compare(password, user.password)){
                throw new HttpErrors(401, {
                    errors:{
                        email: 'неправильный email или пароль',
                        password: 'неправильный email или пароль',
                    }
                })
            }

            req.session.userId = user.id;
            delete user.password;

            res.json({
                message: "Login successful",
                user
            })

        } catch (e) {
            next(e);
        }
    },
    async getUser(req, res, next) {
        try {
            const userData = await UsersModel.findByPk(req.session.userId);
            if(!userData){
                throw new HttpErrors(401,'ошыбка при загрузке профиля')
            }
            const user = userData.toJSON();
            delete user.password;

            res.json({
                message: `профил ползвтеля ${user.userName}`,
                user
            })

        } catch (e) {
            next(e);
        }
    },
    async updateUser(req, res, next) {
        try {
            const userData = await UsersModel.findByPk(req.session.userId);
            if(!userData){
                throw new HttpErrors(401,'ошыбка при загрузке профиля')
            }
            const oldData = userData.toJSON();
            delete  oldData.password;

            const Update= await userData.update({...req.body})
            if(!Update){
                throw new HttpErrors(401,'ошыбка при обнавления профиля')
            }
            const newData = Update.toJSON();
            delete newData.password;

            res.json({
                message: `данные ползвтеля обнавлены`,
                oldData,
                newData
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
            const offset = Math.ceil((pageNum - 1) * limit);

            const {count,rows} = await UsersModel.findAndCountAll({
                limit: limitNum,
                offset:offset
            });

            const userList =[]
            rows.map((user) => {
               const ob =user.toJSON()
                delete ob.password;
               userList.push(ob);
            })

            res.json({
                message: 'get all users',
                userList,
                pagination: {
                    "currentPage": pageNum,
                    "totalPages": Math.ceil(count / limit),
                    "totalUsers": count,
                    "UsersPerPage": limit,
                }
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

