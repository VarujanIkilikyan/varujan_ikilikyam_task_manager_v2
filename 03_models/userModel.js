import _ from 'lodash';


import DbMysql from "../05_clients/db.mysql.js";

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
}

