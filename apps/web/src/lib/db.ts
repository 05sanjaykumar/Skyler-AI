import Dexie from "dexie";

export interface Email {
  id: string;
  threadId: string;
  date: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  aiContent?: string;
  body?: string;
}

export class EmailDB extends Dexie {
  emails!: Dexie.Table<Email, string>; // string is the primary key type

  constructor() {
    super("EmailDatabase");
    this.version(1).stores({
      emails: "id, threadId, date, from, to, subject, snippet, aiContent, body",
    });
  }
}

export const db = new EmailDB();
