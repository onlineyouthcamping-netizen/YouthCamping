import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import tripsRouter from "./trips";
import attendanceRouter from "./attendance";
import adminRouter from "./admin";
import workdaysRouter from "./workdays";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(tripsRouter);
router.use(attendanceRouter);
router.use(workdaysRouter);
router.use("/admin", adminRouter);

export default router;
