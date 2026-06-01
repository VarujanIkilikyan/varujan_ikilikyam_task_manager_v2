import HttpErrors from 'http-errors';

import {TasksModel, DetailsModel, UsersModel} from '../models/Index.model.js';


export default {


    async createNewTask (req, res, next) {
        try {

            const {taskTitle,taskDescription,taskDate,details} = req.body;
            const userId = req.session.userId;

            const task = await TasksModel.create({
                userId,taskTitle,taskDescription,taskDate,details},{
                include: [{
                    model: DetailsModel,
                    as: 'details'
                }]
                }

            )

            res.json({
                message: 'task created successfully',
                task
            })
        } catch (e) {
            next(e);
        }
    },
    async getAllTasks (req, res, next) {
        try {
            const {page,limit} = req.query;

            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.max(1, parseInt(limit) || 5);
            const offset = Math.ceil((pageNum - 1) * limit);

            const {count,rows} = await TasksModel.findAndCountAll({
                where: {
                    userId:req.session.userId,
                },
                include: [{
                    model: DetailsModel,
                    as: 'details'
                }],
                limit: limitNum,
                offset:offset
            });

            res.json({
                message: 'get all tasks',
                tasks: rows,
                pagination: {
                    "currentPage": pageNum,
                    "totalPages": Math.ceil(count / limit),
                    "totalTasks": count,
                    "UsersPerPage": +limit,
                }
            })
        }catch (e){
            next(e);
        }
    },
    // async getAllTasksWithDetails (req, res, next) {
    //     try {
    //         const {page,limit} = req.query;
    //
    //         const pageNum = Math.max(1, parseInt(page) || 1);
    //         const limitNum = Math.max(1, parseInt(limit) || 5);
    //
    //         const task = await taskModel.getAllTasksByUserWithDetails(req.userId,pageNum,limitNum);
    //         res.json({
    //             message: 'get all tasks With Details',
    //             task
    //         })
    //     }catch (e){
    //         next(e);
    //     }
    // },
    async getTaskById(req, res, next) {
        try {
            const {id} = req.params;


            const task = await TasksModel.findByPk(id,{
                where: {userId: req.session.userId},
                include: [{
                    model: DetailsModel,
                    as: 'details'
                }],
            });
            res.json({
                message: 'single task',
                task
            })
        }catch (e){
            next(e);
        }
    },
    async updateTask(req, res, next) {
        try {

            let oldData = await TasksModel.findByPk(req.params.id,{
                where: {userId: req.session.userId},
                include: [{
                    model: DetailsModel,
                    as: 'details'
                }]
            });
            if(!oldData){
                throw new HttpErrors(401,'ошыбка задача не наидена')
            }
            const oolddata = oldData.toJSON()
            const newData= await oldData.update({...req.body})
            if(!newData){
                throw new HttpErrors(401,'ошыбка при обнавления задачи')
            }
            if (req.body.details && oldData.details) {
                await oldData.details.update(req.body.details);
            }


            res.json({
                message: 'updatet task',
                oolddata,
                newData
            })
        }catch (e){
            next(e);
        }
    },
    async deleteTask(req, res, next) {
        try {
            const {id} = req.params;
            console.log(id)

            const task = await taskModel.deleteTask(id,req.userId);
            res.json({
                message: 'deleted task',
                task
            })
        }catch (e){
            next(e);
        }

    }


}