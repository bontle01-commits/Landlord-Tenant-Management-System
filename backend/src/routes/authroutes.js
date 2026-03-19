const router = require("express").Router();
import { register, login } from './authcontroller';

router.post("/register", register);
router.post("/login", login);

export default router;