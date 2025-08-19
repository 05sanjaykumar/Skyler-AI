import Dexie from "dexie";

export interface Email {
  id: string;
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
    this.version(1).stores({
      emails: "id, date, from, to, subject, snippet, aiContent, body, payload",
    });
  }
}

export const db = new EmailDB();
