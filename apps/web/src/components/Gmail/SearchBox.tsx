// apps/web/src/components/main/EmailsSection.tsx
"use client";

import { useState } from "react";
import { Email } from "@/../types/email";
import { useMailStore } from "@/store/gmail/mails";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, MoreVertical, Inbox, Reply } from "lucide-react";

export default function EmailsSection({
  emails,
  onSelect,
  instance,
}: {
  emails: Email[];
  onSelect: (email: Email) => void;
  instance: any;
}) {
  const { deleteCachedEmail } = useMailStore();

  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === emails.length) {
      setSelected([]);
    } else {
      setSelected(emails.map((e) => e.id));
    }
  };

  const bulkDelete = () => {
    selected.forEach((id) => deleteCachedEmail(instance.id, id));
    setSelected([]);
  };

  const replyMessage = () => {
    console.log("Replying to emails:", selected);
  }

  const bulkStore = () => {
    console.log("Storing emails:", selected);
    // implement storeBox logic here
    setSelected([]);
  };

  if (emails.length === 0) return <p>No emails found.</p>;

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={selected.length === emails.length}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selected.length} selected
          </span>
        </div>
        {selected.length > 0 && (
          <div className="flex space-x-2">
            <Button
              variant="default"
              size="sm"
              onClick={replyMessage}
              className="flex items-center space-x-1 bg-blue-400 hover:bg-blue-500 dark:text-white dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Reply className="h-4 w-4" />
              <span>Reply</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={bulkDelete}
              className="flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={bulkStore}
              className="flex items-center space-x-1"
            >
              <Inbox className="h-4 w-4" />
              <span>Store</span>
            </Button>
          </div>
        )}
      </div>
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Email List */}
        {emails.map((email) => {
          const sender =
          email.from?.replace(/^"|"$/g, "") || email.to || "Unknown Sender";
          const initials = sender.charAt(0).toUpperCase();
          
          return (
            <Card
            key={email.id}
            className={`cursor-pointer transition-colors ${
              selected.includes(email.id) ? "bg-accent" : "hover:bg-accent"
            }`}
            onClick={() => onSelect(email)}
            >
              <CardContent className="flex items-start justify-between p-3">
                {/* Left side: Checkbox + Avatar + Info */}
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <Checkbox
                    checked={selected.includes(email.id)}
                    onCheckedChange={() => toggleSelect(email.id)}
                    className="mt-1"
                    />
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

                {/* Right side: Actions */}
                {/* <div className="ml-2 flex-shrink-0">
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
                </div> */}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
