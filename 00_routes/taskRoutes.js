import {Router} from "express";
import views from "../02_controllers/views.js";
import validate from "../01_middlewares/validation.js";
import schemas from "../01_middlewares/schemas/tasks.schema.js";
import authorization from "../01_middlewares/authorization.js";

import controller from "../02_controllers/taskController.js";

const tasksRoutes = Router();


tasksRoutes.post('/',authorization,validate(schemas.create,'body'),controller.createNewTask);

tasksRoutes.get('/',authorization,controller.getAllTasks)
tasksRoutes.get('/:id',authorization,controller.getTaskById)
tasksRoutes.put('/:id',authorization,controller.updateTask)
tasksRoutes.delete('/:id',authorization,controller.deleteTask)

export default tasksRoutes;