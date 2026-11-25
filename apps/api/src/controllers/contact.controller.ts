import type { Context } from "hono";
import { contactCreateSchema } from "@devops-academy/shared/validators";
import { z } from "zod";
import { created, ok } from "../lib/response.ts";
import {
  createContactMessage,
  deleteContactMessage,
  listContactMessages,
  markContactMessageRead,
} from "../services/contact.service.ts";
import { assertUuid, parseJsonBody } from "../validators/index.ts";

const markReadSchema = z.object({
  isRead: z.boolean(),
});

export async function submitContactHandler(c: Context) {
  const body = await parseJsonBody(c, contactCreateSchema);
  const message = await createContactMessage(body);
  return created(c, message);
}

export async function listContactHandler(c: Context) {
  const items = await listContactMessages();
  return ok(c, items);
}

export async function markContactReadHandler(c: Context) {
  const id = assertUuid(c.req.param("id"), "contact message ID");
  const body = await parseJsonBody(c, markReadSchema);
  const updated = await markContactMessageRead(id, body.isRead);
  return ok(c, updated);
}

export async function deleteContactHandler(c: Context) {
  const id = assertUuid(c.req.param("id"), "contact message ID");
  await deleteContactMessage(id);
  return ok(c, { deleted: true });
}
