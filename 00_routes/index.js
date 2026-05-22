import {Router} from "express";

import views from "../02_controllers/views.js";
import authRoutes from "./authRoutes.js";
import tasksRoutes from "./taskRoutes.js";


const SelectorRouter = new Router();

SelectorRouter.get('/',views.viewRender('index'));
SelectorRouter.use('/users',authRoutes)
SelectorRouter.use('/tasks',tasksRoutes)

export default SelectorRouter;