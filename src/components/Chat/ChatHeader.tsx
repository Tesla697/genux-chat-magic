
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Menu } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import ThemeToggle from "../ThemeToggle";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

const ChatHeader: React.FC = () => {
  const { clearChat, messages, currentConversation } = useChat();

  const copyCurrentConversation = () => {
    if (messages.length === 0) {
      toast({
        title: "Nothing to copy",
        description: "The current conversation is empty.",
        variant: "destructive",
      });
      return;
    }

    const conversationText = messages.map((msg) => {
      const role = msg.role === "user" ? "You" : "AI";
      return `${role}: ${msg.content}`;
    }).join('\n\n');

    navigator.clipboard.writeText(conversationText)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "The entire conversation has been copied to your clipboard.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy conversation:", err);
        toast({
          title: "Copy failed",
          description: "Failed to copy the conversation to your clipboard.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="border-b p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="font-bold text-xl">Genux</div>
        <div className="text-sm text-muted-foreground">AI Assistant</div>
        {currentConversation && currentConversation.messages.length > 0 && (
          <div className="text-xs bg-muted px-2 py-1 rounded-full ml-2">
            {currentConversation.messages.length} messages
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={copyCurrentConversation}>
              <Copy className="mr-2 h-4 w-4" />
              Copy conversation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={clearChat} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </div>
  );
};

export default ChatHeader;
