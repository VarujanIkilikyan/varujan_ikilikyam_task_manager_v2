import _ from 'lodash';


import DbMysql from "../05_clients/db.mysql.js";

export default {
    async createTask(userId, title, description, taskDate, details) {
        try {
            const result = await DbMysql.query(
                `insert into tasks (user_id, title, description, task_date)
                 values (?, ?, ?, ?);`,
                [userId, title, description, taskDate],
            );
            const taskId = _.get(result, '0.insertId', null);
            if(details){
                const{priority,location,notes}= details;
                const detail = await DbMysql.query(
                    `insert into task_details (task_Id, priority, location, notes)
                 values (?, ?, ?, ?);`,
                    [taskId, priority, location, notes],
                );}
            const inerResult = await DbMysql.query(
                `
                    SELECT t.task_id,
                           t.user_id,
                           t.title,
                           t.description,
                           t.completed,
                           t.task_date,
                           td.priority,
                           td.location,
                           td.notes 
                    FROM tasks t
                    LEFT JOIN task_details td ON t.task_id = td.task_id
                    WHERE t.task_id = ?
                      AND t.user_id = ?`,
                [taskId,userId],
            );


            return inerResult[0];
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    async getAllTasksByUser(userId, page, limit) {

        const count = await this.getTotalTasksCountByUser(userId);

        const offset = Math.ceil((page - 1) * limit);

        const [tasks] = await DbMysql.query(
            `SELECT t.task_id,
                    t.user_id,
                    t.title,
                    t.description,
                    t.completed,
                    t.task_date,
                    td.priority,
                    td.location,
                    td.notes
             FROM tasks t
             LEFT JOIN task_details td ON t.task_id = td.task_id
             WHERE t.user_id = ?
             ORDER BY t.task_id ASC
             limit ?
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
    async getAllTasksByUserWithDetails(userId, page, limit) {

        const count = await this.getTotalTasksCountByUserWithDetails(userId);

        const offset = Math.ceil((page - 1) * limit);

        const [tasks] = await DbMysql.query(
            `SELECT t.task_id,
                    t.user_id,
                    t.title,
                    t.description,
                    t.completed,
                    t.task_date,
                    td.priority,
                    td.location,
                    td.notes
             FROM tasks t
             INNER JOIN task_details td ON t.task_id = td.task_id
             WHERE t.user_id = ?
             ORDER BY t.task_id ASC
             limit ?
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
    async getTotalTasksCountByUserWithDetails(userId) {
        try {
            const [[{count}]] = await DbMysql.query(
                `SELECT COUNT(*) AS count
                 FROM tasks t
                 INNER JOIN task_details td ON t.task_id = td.task_id
                 WHERE t.user_id = ?;`,
                [userId]
            );
            return count || 0;
        } catch (error) {
            console.error(error);
            return null;
        }

    },
    async getTotalTasksCountByUser(userId) {
        try {
            const [[{count}]] = await DbMysql.query(
                `SELECT COUNT(*) AS count
                 FROM tasks
                 WHERE user_id = ?`,
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
                 FROM tasks t
                 LEFT JOIN task_details td ON t.task_id = td.task_id
                 WHERE t.task_id = ?
                   AND t.user_id = ? LIMIT 1;`,
                [taskId,userId]
            )) || [];

            return _.head(result) || null;
        } catch (error) {
            console.error(error);
            return null;
        }

    },
    async getTaskCountByDateAndUser(taskDate, userId) {

    },
    async updateTask(id, userId, {title, description,completed, taskDate,details},returnData= false) {
        try {
            const result = await DbMysql.query(
                `
                    update tasks
                    set title = ?,
                        description  = ?,
                        completed = ?,
                        taskDate = ?
                    WHERE user_id = ?
                      AND task_id = ? LIMIT 1;`,
                [title, description, completed, taskDate,userId,id],
            );
            if(details){
                const{priority,location,notes}= details;
                const detail = await DbMysql.query(
                    `  update tasks_details
                       set priority = ?,
                           location  = ?,
                           notes = ?
                       WHERE task_id = ?
                         AND details_id = ? LIMIT 1;`,
                    [priority, location, notes,taskId],
                );}

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
                    WHERE userd_id = ?
                      AND task_id = ? LIMIT 1;`,
                [userId,id],
            );
            return del;
        } catch (error) {
            console.error(error);
            return null;
        }
    }


}