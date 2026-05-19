import _ from 'lodash';


import DbMysql from "../05_clients/db.mysql.js";

export default {
    async createTask(userId, title, description, taskDate) {
        try {
            const result = await DbMysql.query(
                `insert into tasks (userId, title, description, taskDate)
                 values (?, ?, ?, ?);`,
                [userId, title, description, taskDate],
            );
            const taskId = _.get(result, '0.insertId', null);


            return await this.getTaskById(taskId, userId);
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    async getAllTasksByUser(userId, page, limit) {

        const count = await this.getTotalTasksCountByUser(userId);

        const offset = Math.ceil((page - 1) * limit);

        const [tasks] = await DbMysql.query(
            `SELECT *
             FROM tasks
             WHERE userId = ? limit ?
             offset ?`,
            [userId, limit, offset]
        );
        return {
            tasks,
            pagination: {
                "currentPage": page,
                "totalPages": Math.ceil(count / limit),
                "totalTasks": count,
                "tasksPerPage": limit,
            }
        };

    },
    async getTotalTasksCountByUser(userId) {
        try {
            const [[{count}]] = await DbMysql.query(
                `SELECT COUNT(*) AS count
                 FROM tasks
                 WHERE userId = ?`,
                [userId]
            );
            return count || 0;
        } catch (error) {
            console.error(error);
            return null;
        }

    },
    async getTaskById(taskId, userId) {
        try {
            const [result = null] = (await DbMysql.query(
                `SELECT *
                 FROM tasks
                 WHERE userId = ?
                   AND taskId = ? LIMIT 1;`,
                [userId, taskId]
            )) || [];

            return _.head(result) || null;
        } catch (error) {
            console.error(error);
            return null;
        }

    },
    async getTaskCountByDateAndUser(taskDate, userId) {

    },
    async updateTask(id, userId, {title, description,completed, taskDate},returnData= false) {
        try {
            const result = await DbMysql.query(
                `
                    update tasks
                    set title = ?,
                        description  = ?,
                        completed = ?,
                        taskDate = ?
                    WHERE userId = ?
                      AND taskId = ? LIMIT 1;`,
                [title, description, completed, taskDate,userId,id],
            );

            const affectedRows = _.get(result, '0.affectedRows', null);

            return affectedRows > 0
                ? await this.getTaskById(id,userId)
                :returnData ;
        } catch (error) {
            console.error(error);
            return null;
        }

    },
    async deleteTask(id, userId) {
        try {
            const del= await this.getTaskById(id,userId);
            const result = await DbMysql.query(
                `
                    DELETE
                    FROM tasks
                    WHERE userId = ?
                      AND taskId = ? LIMIT 1;`,
                [userId,id],
            );
            return del;
        } catch (error) {
            console.error(error);
            return null;
        }
    }


}