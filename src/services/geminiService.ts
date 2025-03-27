
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Use the same API key as before
const API_KEY = "AIzaSyA5j-eAJWbA6zsHnBgUiMXlFsXiH_BDeXs";

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(API_KEY);

// Get the generative model
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-exp-03-25",
});

// Configuration for generation
const generationConfig = {
  temperature: 1.0,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
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
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

// Helper function to format messages for chat history
function formatMessagesForHistory(messages: ChatMessage[]) {
  return messages.map(msg => ({
    role: msg.role === "model" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
}
