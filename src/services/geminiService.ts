
// This service handles communication with the Gemini API using fetch
// instead of the Node.js @google/generative-ai package

const API_KEY = "AIzaSyA5j-eAJWbA6zsHnBgUiMXlFsXiH_BDeXs";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent";

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export const sendMessageToGemini = async (
  messages: ChatMessage[],
  temperature: number = a1
): Promise<string> => {
  try {
    // Format the messages in the structure expected by Gemini API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    // Create the request payload
    const requestBody = {
      contents: formattedMessages,
      generationConfig: {
        temperature,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
      }
    };

    // Send the request to the Gemini API
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data: GeminiResponse = await response.json();
    
    // Extract the text response from the first candidate
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return candidate.content.parts[0].text || "";
      }
    }
    
    return "No response generated.";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};
