export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export interface EmailAdapter {
  send(message: EmailMessage): Promise<{ id: string }>;
}
