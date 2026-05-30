import {Sequelize} from 'sequelize';

const {
    MY_SQL_DATABASE,
    MY_SQL_USER,
    MY_SQL_PASSWORD,

    MY_SQL_HOST,
    MY_SQL_PORT,
} = process.env;

const connection = new Sequelize(MY_SQL_DATABASE,MY_SQL_USER,MY_SQL_PASSWORD,{
    host: MY_SQL_HOST,
    port: MY_SQL_PORT,
    dialect: 'mysql',
    logging: false,
    pool:{
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 1000,
    }
})

try {
    await connection.authenticate();
    console.log('-> Database Connected Successfully.');

}catch(e) {
    console.error(`-X Database Connection Failed.`, e);

}


export default  connection;