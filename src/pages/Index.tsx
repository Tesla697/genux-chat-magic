
import React, { useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatProvider, useChat } from "../context/ChatContext";
import ChatHeader from "../components/Chat/ChatHeader";
import ChatInput from "../components/Chat/ChatInput";
import ChatMessage from "../components/Chat/ChatMessage";
import ThinkingProcess from "../components/Chat/ThinkingProcess";
import { Button } from "@/components/ui/button";
import { Plus, Menu, X, Edit, Trash2, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import ConversationSidebar from "../components/Chat/ConversationSidebar";

const ChatContainer: React.FC = () => {
  const { messages, isLoading, thinking } = useChat();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

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
        
        {/* Show real-time thinking with ThinkingProcess component */}
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
        
        {/* Invisible element for auto-scrolling */}
        <div ref={chatEndRef} />
      </ScrollArea>
      <ChatInput />
    </div>
  );
};

const Index: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ChatProvider>
      <div className="min-h-screen bg-background">
        <div className="relative h-screen overflow-hidden">
          {/* Main chat container with sidebar toggle */}
          <div className="flex h-screen">
            {/* Sidebar for conversation history */}
            <ConversationSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            {/* Main chat area */}
            <div className={`transition-all duration-300 ease-in-out flex-1 h-screen ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
              <div className="h-full rounded-lg border shadow-lg overflow-hidden relative">
                {/* Sidebar toggle button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 left-4 z-10"
                  onClick={toggleSidebar}
                >
                  <Menu size={20} />
                </Button>
                <ChatContainer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatProvider>
  );
};

export default Index;
