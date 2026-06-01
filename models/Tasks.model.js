import DbConnection  from "../clients/db.connection.js";
import  {Model,DataTypes}  from 'sequelize';

class Tasks extends Model {}

Tasks.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    taskTitle:{
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    taskDescription:{
        type: DataTypes.TEXT(),
        allowNull: false,
    },
    taskCompleted:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    taskDate:{
        type: DataTypes.DATE,
        allowNull: false,
    },
},
{
    sequelize: DbConnection,
    modelName: 'tasks',
    tableName: 'tasks',
    timestamps: true,
    freezeTableName: true,
}
);

export default Tasks;