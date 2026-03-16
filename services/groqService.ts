
import Groq from "groq-sdk";

// Use environment variable for key, do not hardcode.
const getGroqApiKey = () => {
    // Vite 'define' replaces this with the string value.
    const key = process.env.GROQ_API_KEY;
    if (key && key.length > 0) return key;
    return undefined;
};

export const streamGroq = async (
  messages: any[],
  modelId: string,
  onChunk: (text: string) => void
) => {
  try {
    const response = await fetch("/api/chat/groq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelId,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Groq Error");
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader available");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const content = json.choices[0]?.delta?.content || "";
            if (content) onChunk(content);
          } catch (e) {
            // Ignore parse errors for partial chunks
          }
        }
      }
    }
  } catch (error: any) {
    console.warn('Groq Proxy Error:', error.message);
    throw error;
  }
};
