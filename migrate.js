import {UsersModel,TasksModel,DetailsModel} from './models/Index.model.js';


    (async () => {
    console.log('Running migration...');
    const modelsList = [UsersModel,TasksModel,DetailsModel];
        for (let model of modelsList){
           await model.sync({alter: true});
            console.log(`model->${ model.name}->synchronized`)
        }
//     await DbMysql.query(`
//         CREATE TABLE IF NOT EXISTS users (
//             user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
//             user_name VARCHAR(30),
//             age INT,
//             email VARCHAR(255) UNIQUE,
//             password VARCHAR(255)
//             );
//   `);
//     console.log('-> User table successfully created');
//     await DbMysql.query(`
//         CREATE TABLE IF NOT EXISTS tasks (
//             task_id BIGINT PRIMARY KEY AUTO_INCREMENT,
//             user_id BIGINT NOT NULL,
//             title VARCHAR(255) NOT NULL,
//             description TEXT,
//             completed   BOOLEAN DEFAULT FALSE,
//             task_date   DATE NOT NULL,
//             created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
//             );
// `);
//     console.log('-> Tasks table successfully created');
//     await DbMysql.query(`
//         CREATE TABLE IF NOT EXISTS task_details (
//             details_id BIGINT PRIMARY KEY AUTO_INCREMENT,
//             task_id     BIGINT NOT NULL,
//             priority    ENUM('low', 'medium', 'high') DEFAULT 'medium',
//             location    VARCHAR(255),
//             notes       TEXT,
//             FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
//             );
// `);
//     console.log('-> Taask Details successfully created');
//
//     console.log('Migration finished successfully.');
})();

