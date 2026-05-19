import {Router} from "express";
import views from "../02_controllers/views.js";
import validate from "../01_middlewares/validation.js";
import schemas from "../01_middlewares/schemas/auth.schema.js";

import controller from "../02_controllers/authController.js";

const authRoutes = Router();

authRoutes.get('/register',views.viewRender('register'));
authRoutes.post('/register',validate(schemas.register,'body'),controller.registration);

authRoutes.get('/login',views.viewRender('login'));
authRoutes.post('/login',validate(schemas.login,'body'),controller.login);
export default authRoutes;