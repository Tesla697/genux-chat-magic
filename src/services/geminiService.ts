
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Update the API key
const API_KEY = "AIzaSyCipbHVhZwGgS1kwAwBdHn8fwe1A5G-qnA";

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(API_KEY);

// Get the generative model - using gemini-2.5-flash-preview-04-17
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-04-17",
});

// Configuration for generation
const generationConfig = {
  temperature: 1.0,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 4096, // Reduced from 8192 to stay within free tier limits
};

export const sendMessageToGemini = async (
  messages: ChatMessage[],
  temperature: number = 1.0
): Promise<string> => {
  try {
    // Start a chat session
    const chatSession = model.startChat({
      generationConfig: {
        ...generationConfig,
        temperature: temperature,
      },
      history: formatMessagesForHistory(messages.slice(0, -1)), // All previous messages except the latest one
    });

    // Add a small delay to simulate the AI thinking (for demo purposes)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Send the latest message
    const latestMessage = messages[messages.length - 1];
    const result = await chatSession.sendMessage(latestMessage.content);
    
    // Get the response text
    return result.response.text();
  } catch (error: any) {
    console.error("Error sending message to Gemini:", error);
    
    // Check for quota exceeded error (429 status code)
    if (error.status === 429) {
      return "I apologize, but we've reached the API usage limit. This is common with free API keys. Please try again in a few minutes or consider upgrading to a paid API plan for uninterrupted service.";
    }
    
    // Generic error message for other errors
    return "Sorry, I encountered an error. Please try again later.";
  }
};

// Helper function to format messages for chat history
function formatMessagesForHistory(messages: ChatMessage[]) {
  return messages.map(msg => ({
    role: msg.role === "model" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
}
