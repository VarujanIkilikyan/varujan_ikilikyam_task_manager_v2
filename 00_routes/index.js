import {Router} from "express";

import views from "../02_controllers/views.js";
import authRoutes from "./authRoutes.js";
import tasksRoutes from "./taskRoutes.js";
import authorization from "../01_middlewares/authorization.js";

const SelectorRouter = new Router();

SelectorRouter.get('/',authorization,views.viewRender('index'));
SelectorRouter.use('/auth',authRoutes)
SelectorRouter.use('/tasks',tasksRoutes)

export default SelectorRouter;