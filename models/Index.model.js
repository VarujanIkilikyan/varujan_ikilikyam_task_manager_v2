import  UsersModel  from './Users.model.js';
import  TasksModel  from './Tasks.model.js';
import DetailsModel from './TasksDetails.model.js';

UsersModel.hasMany(TasksModel,{foreignKey:'userId',as: 'tasks'});
TasksModel.belongsTo(UsersModel,{foreignKey:'userId',as: 'users'});
TasksModel.hasOne(DetailsModel,{foreignKey:'tasksId',as: 'details'});
DetailsModel.belongsTo(TasksModel,{foreignKey:'tasksId',as: 'task'});

export  {
    UsersModel,
    TasksModel,
    DetailsModel
}