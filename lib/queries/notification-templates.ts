import { sql } from "@/lib/db";
import type { NotificationTemplate, NotificationLog } from "@/types/db";

export async function getTemplateByEvent(event: string): Promise<NotificationTemplate | null> {
  const rows = await sql`
    SELECT * FROM notification_templates
    WHERE event_trigger = ${event} AND is_active = true
    LIMIT 1
  `;
  return (rows[0] as NotificationTemplate) ?? null;
}

export async function getAllTemplates(): Promise<NotificationTemplate[]> {
  const rows = await sql`SELECT * FROM notification_templates ORDER BY event_trigger`;
  return rows as NotificationTemplate[];
}

export async function getAllNotificationLogs(limit = 50): Promise<NotificationLog[]> {
  const rows = await sql`
    SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows as NotificationLog[];
}

export async function logNotification(input: {
  template_id?: number;
  registration_id?: number;
  recipient: string;
  channel: "whatsapp" | "email" | "sms";
  request_payload?: object;
  response_payload?: object;
  status: "sent" | "failed" | "pending";
}) {
  const rows = await sql`
    INSERT INTO notification_logs
      (template_id, registration_id, recipient, channel, request_payload, response_payload, status)
    VALUES
      (${input.template_id ?? null}, ${input.registration_id ?? null}, ${input.recipient},
       ${input.channel}, ${JSON.stringify(input.request_payload ?? null)},
       ${JSON.stringify(input.response_payload ?? null)}, ${input.status})
    RETURNING *
  `;
  return rows[0];
}
