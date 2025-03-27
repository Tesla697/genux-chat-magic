
import React, { createContext, useContext, useState, ReactNode } from "react";
import { sendMessageToGemini } from "../services/geminiService";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

interface ChatContextProps {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const useChat = (): ChatContextProps => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateMessageId = (): string => {
    return Math.random().toString(36).substring(2, 9);
  };

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim()) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Format messages for the API
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      // Add the new message
      messageHistory.push({
        role: "user",
        content,
      });

      // Get response from Gemini
      const response = await sendMessageToGemini(messageHistory);

      // Add bot response to chat
      const botMessage: ChatMessage = {
        id: generateMessageId(),
        role: "model",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to get response:", error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: "model",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = (): void => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
