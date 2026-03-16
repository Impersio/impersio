
// Use environment variable for key, do not hardcode.
const getOpenRouterKey = () => {
    // Vite 'define' replaces process.env.OPENROUTER_API_KEY with the actual string value during build.
    // We must access it directly without checking 'typeof process'.
    const key = process.env.OPENROUTER_API_KEY;
    if (key && key.length > 0) return key;
    return undefined;
};

export const streamOpenRouter = async (
  messages: any[],
  modelId: string,
  onChunk: (text: string) => void
) => {
  try {
    const response = await fetch("/api/chat/openrouter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelId,
        messages: messages,
        include_reasoning: true
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "OpenRouter Error");
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
            const reasoning = json.choices[0]?.delta?.reasoning || "";
            if (reasoning) onChunk(`<think>${reasoning}</think>`);
            else if (content) onChunk(content);
          } catch (e) {
            // Ignore parse errors for partial chunks
          }
        }
      }
    }
  } catch (error: any) {
    console.warn('OpenRouter Proxy Error:', error.message);
    throw error;
  }
};
