import _ from 'lodash';
import DbMysql from "../clients/db.mysql.js";

export default {
    async create(username, age, email, password) {
        try {
            const result = await DbMysql.query(
                `insert into users (user_name, age, email, password)
                 values (?, ?, ?, ?);`,
                [username, age, email, password]
            );


            return await this.findUserByEmail(email);
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    async findUserByEmail(email) {
        try {
            const [result = null] = (await DbMysql.query(
                `SELECT *
                 FROM users
                 WHERE email = ? limit 1;`,
                [email]
            )) || [];

            return _.head(result) || null;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    async findUserById(id) {
        try {
            const [result = null] = (await DbMysql.query(
                `SELECT *
                 FROM users
                 WHERE user_id = ? limit 1;`,
                [id]
            )) || [];

            return _.head(result) || null;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    async checkUsernameExists(username) {
        try {
            const [result = null] = (await DbMysql.query(
                `SELECT *
                 FROM users
                 WHERE user_name = ? limit 1;`,
                [username]
            )) || [];

            return !_.isEmpty(result);
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    async checkEmailExists(email) {
        try {
            const [result = null] = (await DbMysql.query(
                `SELECT *
                 FROM users
                 WHERE email = ? limit 1;`,
                [email]
            )) || [];

            return !_.isEmpty(result);
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    async checkIdExists(userId) {
        try {
            const [result = null] = (await DbMysql.query(
                `SELECT *
                 FROM users
                 WHERE user_id = ? limit 1;`,
                [userId]
            )) || [];

            return !_.isEmpty(result);
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    async updateUser(userId, data,returnData= false) {
        try {
            const fields = Object.keys(data).map(key =>`${key}=?`).join(',')
            const values = Object.values(data);
            const result = await DbMysql.query(
                ` update users
                    set ${fields}
                    WHERE user_id = ? LIMIT 1;`,
                [...values, userId,],
            );

            const affectedRows = _.get(result, '0.affectedRows', null);

            return affectedRows > 0
                ? await this.findUserById(userId)
                :returnData ;
        } catch (error) {
            console.error(error);
            return null;
        }

    },
    async getAllUser( page, limit) {

        const count = await this.getTotalUserCount();

        const offset = Math.ceil((page - 1) * limit);

        const [Users] = await DbMysql.query(
            `SELECT user_id,user_name,age
             FROM users
              limit ?
             offset ?`,
            [+limit,+offset]
        );
        return {
            Users,
            pagination: {
                "currentPage": page,
                "totalPages": Math.ceil(count / limit),
                "totalUsers": count,
                "UsersPerPage": limit,
            }
        };

    },
    async getTotalUserCount() {
        try {
            const [[{count}]] = await DbMysql.query(
                `SELECT COUNT(*) AS count
                 FROM users`,
            );
            return count || 0;
        } catch (error) {
            console.error(error);
            return null;
        }

    },
}

