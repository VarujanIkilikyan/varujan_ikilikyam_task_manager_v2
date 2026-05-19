import DbMysql from './05_clients/db.mysql.js';

;(async () => {
    console.log('Running migration...');
    await DbMysql.query(`
        CREATE TABLE IF NOT EXISTS users (
            user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(30),
            age INT,
            email VARCHAR(255) UNIQUE,
            password VARCHAR(255)
            );
  `);
    console.log('-> User table successfully created');
    await DbMysql.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id BIGINT PRIMARY KEY AUTO_INCREMENT,
            user_id BIGINT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            completed   BOOLEAN DEFAULT FALSE,
            task_date   DATE NOT NULL,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            );
`);
    console.log('-> Tasks table successfully created');
    await DbMysql.query(`
        CREATE TABLE IF NOT EXISTS task_details (
            id BIGINT PRIMARY KEY AUTO_INCREMENT,
            task_id     BIGINT NOT NULL,
            priority    ENUM('low', 'medium', 'high') DEFAULT 'medium',
            location    VARCHAR(255),
            notes       TEXT,
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
            );
`);
    console.log('-> Taask Details successfully created');

    console.log('Migration finished successfully.');
})();

