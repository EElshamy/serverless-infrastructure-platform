import { desc, eq } from "drizzle-orm";
import { contactMessages, db } from "@devops-academy/database";
import type { ContactMessage } from "@devops-academy/shared";
import { notFound } from "../lib/errors.ts";

function toContactDto(row: typeof contactMessages.$inferSelect): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ContactMessage> {
  const [created] = await db
    .insert(contactMessages)
    .values({
      name: input.name,
      email: input.email.toLowerCase(),
      subject: input.subject,
      message: input.message,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to save contact message");
  }

  return toContactDto(created);
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  return rows.map(toContactDto);
}

export async function markContactMessageRead(id: string, isRead: boolean): Promise<ContactMessage> {
  const [updated] = await db
    .update(contactMessages)
    .set({ isRead })
    .where(eq(contactMessages.id, id))
    .returning();

  if (!updated) {
    throw notFound("Contact message not found");
  }

  return toContactDto(updated);
}

export async function deleteContactMessage(id: string): Promise<void> {
  const [deleted] = await db
    .delete(contactMessages)
    .where(eq(contactMessages.id, id))
    .returning({ id: contactMessages.id });

  if (!deleted) {
    throw notFound("Contact message not found");
  }
}
