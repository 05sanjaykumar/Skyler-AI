// apps/web/src/types/email.ts
export type Email = {
  id: string;
  subject: string;
  body: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  instanceId?: string;
  payload: {
    headers: { name: string; value: string }[];
  };
};
