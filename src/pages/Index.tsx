
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatProvider } from "../context/ChatContext";
import ChatHeader from "../components/Chat/ChatHeader";
import ChatInput from "../components/Chat/ChatInput";
import ChatMessage from "../components/Chat/ChatMessage";
import ThinkingProcess from "../components/Chat/ThinkingProcess";
import { useChat } from "../context/ChatContext";

const ChatContainer: React.FC = () => {
  const { messages, isLoading, thinking } = useChat();

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-8">
            <div className="max-w-md">
              <h2 className="text-2xl font-bold mb-2">Welcome to Genux!</h2>
              <p className="text-muted-foreground">
                Your AI assistant powered by Google's Gemini. Ask me anything, and I'll do my best to help you.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        
        {/* Show real-time thinking with new ThinkingProcess component */}
        {thinking && (
          <ThinkingProcess thinking={thinking} />
        )}
        
        {isLoading && !thinking && (
          <div className="flex justify-start mb-4">
            <div className="bg-muted text-muted-foreground max-w-[80%] rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
      <ChatInput />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto h-screen max-w-3xl p-0 overflow-hidden">
          <div className="h-full rounded-lg border shadow-lg overflow-hidden">
            <ChatContainer />
          </div>
        </div>
      </div>
    </ChatProvider>
  );
};

export default Index;
