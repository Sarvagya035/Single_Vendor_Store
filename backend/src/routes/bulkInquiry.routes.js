import { Router } from "express";
import { createBulkInquiry } from "../controllers/bulkInquiry.controller.js";

const router = Router();

router.route("/").post(createBulkInquiry);

export default router;
