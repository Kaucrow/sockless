export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
};

export interface SendEmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
  envelope: any;
  response: string;
};