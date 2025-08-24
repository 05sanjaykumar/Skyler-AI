// apps/web/src/store/mails.ts
import { db } from "@/lib/db";
import { create } from "zustand";
import { Email } from "@/../types/email";
interface MailState {
  emails: Email[];
  selectedEmail: Email | null;
  emailsLoading: boolean;

  setSelectedEmail: (email: Email | null) => void;
  loadCachedEmails: (instanceId: string) => Promise<void>;
  saveEmails: (instanceId: string, emails: Email[]) => Promise<void>;
  deleteCachedEmail: (instanceId: string, emailId: string) => Promise<void>;
  fetchEmailsFromBackend: (instanceId: string, token: string) => Promise<void>;
}

export const useMailStore = create<MailState>((set, get) => ({
  emails: [],
  selectedEmail: null,
  emailsLoading: false,

  setSelectedEmail: (email) => set({ selectedEmail: email }),

  saveEmails: async (instanceId, emails) => {
    // wipe old cache for that instance
    await db.emails.where("instanceId").equals(instanceId).delete();

    const emailsWithInstance = emails.map((email) => ({
      ...email,
      instanceId,
      snippet: email.snippet ?? "",
    }));
    await db.emails.bulkPut(emailsWithInstance);

    console.log("Emails cached locally!: ", emailsWithInstance);
    set({ emails: emailsWithInstance });
  },

  loadCachedEmails: async (instanceId) => {
    set({ emailsLoading: true });
    const cachedEmails = await db.emails.where("instanceId").equals(instanceId).toArray();

    const normalized: Email[] = cachedEmails.map((e) => ({
      id: e.id,
      subject: e.subject,
      body: e.body || "",
      from: e.from,
      to: e.to,
      date: e.date,
      payload: e.payload || {},
      snippet: e.snippet,
      instanceId: e.instanceId,
    }));

    set({ emails: normalized, emailsLoading: false });
    console.log("Loaded emails from cache:", normalized);
  },

  deleteCachedEmail: async (instanceId: string, emailId: string) => {
    await db.emails
      .where({ instanceId, id: emailId })
      .delete();

    const filtered = get().emails.filter(
      (e) => !(e.instanceId === instanceId && e.id === emailId)
    );

    set((state) => ({
      emails: filtered,
      selectedEmail:
        state.selectedEmail?.id === emailId &&
        state.selectedEmail?.instanceId === instanceId
          ? null
          : state.selectedEmail,
    }));

    console.log(`Deleted email ${emailId} from cache for instance ${instanceId}`);
  },

  fetchEmailsFromBackend: async (instanceId, token) => {
    set({ emailsLoading: true });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gmail/pull/${instanceId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        await get().saveEmails(instanceId, data.messages);
        console.log("Fetched emails from backend:", data.messages);
      } else {
        console.error("Failed to fetch emails:", res.status);
      }
    } catch (err) {
      console.error("Error fetching emails:", err);
    } finally {
      set({ emailsLoading: false });
    }
  },
}));
