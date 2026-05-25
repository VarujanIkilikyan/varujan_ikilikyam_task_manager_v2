import {Router} from "express";
import views from "../controllers/views.js";
import validate from "../middlewares/validation.js";
import schemas from "../middlewares/schemas/tasks.schema.js";
import authorization from "../middlewares/authorization.js";

import controller from "../controllers/taskController.js";

const tasksRoutes = Router();


tasksRoutes.post('/',authorization,validate(schemas.create,'body'),controller.createNewTask);

tasksRoutes.get('/',authorization,validate(schemas.list,'query'),controller.getAllTasks)
tasksRoutes.get('/with-details',validate(schemas.list,'query'),authorization,controller.getAllTasksWithDetails)

tasksRoutes.get('/:id',authorization,validate(schemas.param,'params'),controller.getTaskById)
tasksRoutes.put('/:id',authorization,controller.updateTask)
tasksRoutes.delete('/:id',authorization,controller.deleteTask)

export default tasksRoutes;