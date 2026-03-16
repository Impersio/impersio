
export const streamPollinations = async (
  messages: any[],
  modelId: string,
  onChunk: (text: string) => void
) => {
  try {
    const response = await fetch("/api/chat/pollinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: 'openai',
        messages: messages,
      })
    });

    if (!response.ok) {
        throw new Error(`Pollinations API Error: ${response.statusText}`);
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
    console.warn('Pollinations Proxy Error:', error.message);
    throw error;
  }
};
