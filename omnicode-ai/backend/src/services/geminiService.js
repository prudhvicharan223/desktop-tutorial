const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Stream a chat completion from Google Gemini.
 * @param {Array} messages - Array of { role, content }
 * @param {string} model - Gemini model name
 * @param {Function} onChunk - Called with each text delta string
 * @param {Function} onEnd - Called when stream is complete
 * @param {Function} onError - Called on error
 */
async function streamCompletion(messages, model, onChunk, onEnd, onError) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const genModel = genAI.getGenerativeModel({ model });

  // Convert messages to Gemini format
  const systemMessages = messages.filter((m) => m.role === 'system');
  const conversationMessages = messages.filter((m) => m.role !== 'system');

  const systemInstruction = systemMessages.map((m) => m.content).join('\n');

  // Gemini uses 'user' and 'model' roles (not 'assistant')
  const history = conversationMessages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const lastMessage = conversationMessages[conversationMessages.length - 1];

  try {
    const chat = genModel.startChat({
      history,
      systemInstruction: systemInstruction || undefined,
    });

    const result = await chat.sendMessageStream(lastMessage?.content || '');

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        onChunk(text);
      }
    }

    if (onEnd) onEnd();
  } catch (err) {
    if (onError) {
      onError(err);
    } else {
      throw err;
    }
  }
}

module.exports = { streamCompletion };
