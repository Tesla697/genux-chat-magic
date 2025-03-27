
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { sendMessageToGemini } from "../services/geminiService";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  thinking?: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  thinking: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  createNewConversation: () => void;
  switchConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
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

// Generate a random ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Create a new empty conversation
const createEmptyConversation = (): Conversation => {
  const now = new Date();
  return {
    id: generateId(),
    title: "New Chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
};

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    // Try to load conversations from localStorage
    const savedConversations = localStorage.getItem("conversations");
    if (savedConversations) {
      try {
        // Parse dates from the stored JSON
        const parsed = JSON.parse(savedConversations, (key, value) => {
          if (key === "timestamp" || key === "createdAt" || key === "updatedAt") {
            return new Date(value);
          }
          return value;
        });
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved conversations:", e);
        return [createEmptyConversation()];
      }
    }
    return [createEmptyConversation()];
  });
  
  const [currentConversationId, setCurrentConversationId] = useState<string>(() => {
    return conversations[0]?.id || "";
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [thinking, setThinking] = useState<string | null>(null);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  // Get the current conversation based on the currentConversationId
  const currentConversation = conversations.find(c => c.id === currentConversationId) || null;
  
  // Current messages from the active conversation
  const messages = currentConversation?.messages || [];

  const generateMessageId = (): string => {
    return generateId();
  };

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim() || !currentConversation) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Update the current conversation with the new user message
    const updatedConversations = conversations.map(conv => {
      if (conv.id === currentConversationId) {
        // Update the conversation title based on the first user message if it's still "New Chat"
        const title = conv.title === "New Chat" && conv.messages.length === 0
          ? content.slice(0, 30) + (content.length > 30 ? "..." : "")
          : conv.title;
          
        return {
          ...conv,
          title,
          messages: [...conv.messages, userMessage],
          updatedAt: new Date(),
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setIsLoading(true);

    try {
      // Get current messages including the new one for the API
      const currentMessages = [
        ...updatedConversations.find(c => c.id === currentConversationId)!.messages
      ];
      
      // Format messages for the API
      const messageHistory = currentMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Start the thinking process
      const thinkingProcess = `
Here's a thinking process for addressing the query: "${content}"

1. **Understand the Query**
   - The user is asking: "${content}"
   - Need to determine what type of information is being requested
   - Identify key terms and concepts in the query

2. **Search Knowledge Base**
   - Looking for relevant information in my training data
   - Considering multiple angles to approach this question
   - Finding connections between concepts mentioned in the query

3. **Generate Possible Solutions**
   - Considering several approaches to answering this question
   - Weighing different perspectives and interpretations
   - Prioritizing the most relevant and accurate information

4. **Structure the Response**
   - Planning how to present information clearly and logically
   - Organizing key points in a user-friendly format
   - Ensuring the answer directly addresses the user's needs

5. **Verify Information**
   - Checking for accuracy and completeness
   - Ensuring I'm providing well-supported information
   - Looking for any gaps or inconsistencies that need to be addressed
      `.trim();
      
      setThinking(thinkingProcess);

      // Get response from Gemini
      const response = await sendMessageToGemini(messageHistory);

      // Add bot response to chat
      const botMessage: ChatMessage = {
        id: generateMessageId(),
        role: "model",
        content: response,
        thinking: thinkingProcess,
        timestamp: new Date(),
      };

      // Update conversations with the bot response
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              messages: [...conv.messages, botMessage],
              updatedAt: new Date(),
            };
          }
          return conv;
        })
      );
      
      setThinking(null);
    } catch (error) {
      console.error("Failed to get response:", error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: "model",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      
      // Update conversations with the error message
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              messages: [...conv.messages, errorMessage],
              updatedAt: new Date(),
            };
          }
          return conv;
        })
      );
      
      setThinking(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = (): void => {
    setConversations(prevConversations => 
      prevConversations.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: [],
            title: "New Chat",
            updatedAt: new Date(),
          };
        }
        return conv;
      })
    );
    setThinking(null);
  };

  const createNewConversation = (): void => {
    const newConversation = createEmptyConversation();
    setConversations(prev => [...prev, newConversation]);
    setCurrentConversationId(newConversation.id);
  };

  const switchConversation = (id: string): void => {
    if (conversations.some(conv => conv.id === id)) {
      setCurrentConversationId(id);
    }
  };

  const deleteConversation = (id: string): void => {
    // Don't delete if it's the only conversation
    if (conversations.length <= 1) {
      return;
    }

    const newConversations = conversations.filter(conv => conv.id !== id);
    setConversations(newConversations);
    
    // If we're deleting the current conversation, switch to the first available one
    if (id === currentConversationId) {
      setCurrentConversationId(newConversations[0].id);
    }
  };

  const updateConversationTitle = (id: string, title: string): void => {
    setConversations(prevConversations => 
      prevConversations.map(conv => {
        if (conv.id === id) {
          return {
            ...conv,
            title: title || "Untitled Chat",
            updatedAt: new Date(),
          };
        }
        return conv;
      })
    );
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        isLoading,
        thinking,
        sendMessage,
        clearChat,
        createNewConversation,
        switchConversation,
        deleteConversation,
        updateConversationTitle,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
