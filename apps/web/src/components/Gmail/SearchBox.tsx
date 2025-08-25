// apps/web/src/components/main/EmailsSection.tsx
"use client";

import { useSession } from "next-auth/react";
import { Email } from "@/../types/email";
import { useMailStore } from "@/store/gmail/mails";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EmailsSection({
  emails,
  onSelect,
  instance,
}: {
  emails: Email[];
  onSelect: (email: Email) => void;
  instance: any;
}) {
  const { data: session } = useSession();
  const { deleteCachedEmail } = useMailStore();

  useEffect(() => {
    console.log("Emails updated:", emails);
  }, [emails]);

  if (emails.length === 0) return <p className="text-gray-500">No emails found.</p>;

  return (
    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2">
      {emails.map((email) => {
        let sender = email.from?.match(/^(.*?)</)?.[1]?.trim() || email.from;
        sender = sender.replace(/^"+|"+$/g, "");

        const initials = sender?.[0]?.toUpperCase() || "?";

        return (
          <Card
            key={email.id}
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => onSelect(email)}
          >
            <CardContent className="flex items-start justify-between p-3">
              {/* Left side: Avatar + Info */}
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  {/* Sender + Date row */}
                  <div className="flex items-center space-x-2 min-w-0">
                    <h3 className="text-sm font-medium truncate flex-1 min-w-0">
                      {sender}
                    </h3>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {new Date(email.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Subject */}
                  <p className="text-sm font-semibold truncate min-w-0">
                    {email.subject || "(No Subject)"}
                  </p>

                  {/* Snippet */}
                  <p className="text-xs text-muted-foreground truncate min-w-0">
                    {email.snippet || email.body || "(No preview)"}
                  </p>
                </div>
              </div>

              {/* Right side: Actions (always aligned, never overlaps) */}
              <div className="ml-2 flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCachedEmail(instance.id, email.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
