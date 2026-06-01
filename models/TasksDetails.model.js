import DbConnection  from "../clients/db.connection.js";
import  {Model,DataTypes}  from 'sequelize';

class TasksDetailsModel extends Model {}

TasksDetailsModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tasksId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tasks',
            key: 'id'
        },
        onDelete: "CASCADE",
    },
    tasksPriority:{
        type:DataTypes.ENUM('high','low','medium'),
        allowNull: false,
        defaultValue:'medium'
    },
    tasksLocation:{
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue:'Unknown'
    },
    tasksNotes:{
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue:'Empty'
    }
},
    {
        sequelize: DbConnection,
        modelName: 'details',
        tableName: 'details',
        timestamps: true,
        freezeTableName: true,
    })

export default TasksDetailsModel;