import DbConnection  from "../clients/db.connection.js";
import  {Model,DataTypes}  from 'sequelize';

class Users extends Model {}

Users.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userName:{
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    userAge:{
        type: DataTypes.TINYINT(),
        allowNull: false,
        validate: {
            notEmpty:true,
            min:6,
            max:120
        }
    },
    email:{
        type: DataTypes.STRING(255),
        allowNull: false,
        unique:true,
        validate: {
            notEmpty:true,
            is: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        }
    },
    password:{
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty:true,
        }
    },
},
    {
        sequelize: DbConnection,
        modelName: 'users',
        tableName: 'users',
        timestamps: true,
        freezeTableName: true,
    }
);
export default Users;