
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import ThemeToggle from "../ThemeToggle";

const ChatHeader: React.FC = () => {
  const { clearChat } = useChat();

  return (
    <div className="border-b p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="font-bold text-xl">Genux</div>
        <div className="text-sm text-muted-foreground">AI Assistant</div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={clearChat}
          title="Clear chat"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
