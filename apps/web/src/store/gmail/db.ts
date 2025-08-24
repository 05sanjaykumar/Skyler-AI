import Dexie from "dexie";

export interface Email {
  id: string;
  instanceId: string;
  date: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  aiContent?: string;
  body?: string;
  payload?: any;
}

export class EmailDB extends Dexie {
  emails!: Dexie.Table<Email, string>; // string is the primary key type

  constructor() {
    super("EmailDatabase");
    this.version(2).stores({
      emails: "id,instanceId, date, from, to, subject, snippet, aiContent, body, payload",
    });
  }
}

export const db = new EmailDB();
