
export const streamPollinations = async (
  messages: any[],
  modelId: string,
  onChunk: (text: string) => void
) => {
  try {
    const response = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: 'openai', // Pollinations uses 'openai' to map to their best available model (GPT-4 class)
        messages: messages,
        stream: true
      })
    });

    if (!response.ok) {
        throw new Error(`Pollinations API Error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const json = JSON.parse(data);
            const content = json.choices[0]?.delta?.content || '';
            if (content) onChunk(content);
          } catch (e) {
            // Ignore parsing errors for partial chunks
          }
        }
      }
    }
  } catch (error: any) {
    console.error('Pollinations Streaming Error:', error);
    throw error;
  }
};
