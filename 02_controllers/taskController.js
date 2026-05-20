import HttpErrors from 'http-errors';

import taskModel from '../03_models/taskModel.js';

export default {


    async createNewTask (req, res, next) {
        try {

            const {title,description,taskDate,details} = req.body;

            const task = await taskModel.createTask(req.userId, title, description,taskDate,details)

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

            const task = await taskModel.getAllTasksByUser(req.userId,pageNum,limitNum);
            res.json({
                message: 'get all tasks',
                task
            })
        }catch (e){
            next(e);
        }
    },
    async getTaskById(req, res, next) {
        try {
            const {id} = req.params;


            const task = await taskModel.getTaskById(id,req.userId);
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
            const {id} = req.params;


            const task = await taskModel.updateTask(id,req.userId,req.body);
            res.json({
                message: 'updatet task',
                task
            })
        }catch (e){
            next(e);
        }
    },
    async deleteTask(req, res, next) {
        try {
            const {id} = req.params;

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