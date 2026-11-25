import { Hono } from "hono";
import { submitContactHandler } from "../controllers/contact.controller.ts";
import { rateLimit } from "../middleware/rate-limit.ts";

export const contactRoutes = new Hono();

contactRoutes.post("/", rateLimit("contact"), submitContactHandler);
