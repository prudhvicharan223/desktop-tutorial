const Anthropic = require('@anthropic-ai/sdk');

/**
 * Stream a chat completion from Anthropic Claude.
 * @param {Array} messages - Array of { role, content }
 * @param {string} model - Anthropic model name
 * @param {Function} onChunk - Called with each text delta string
 * @param {Function} onEnd - Called when stream is complete
 * @param {Function} onError - Called on error
 */
async function streamCompletion(messages, model, onChunk, onEnd, onError) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Anthropic separates system messages from the messages array
  const systemMessages = messages.filter((m) => m.role === 'system');
  const userMessages = messages.filter((m) => m.role !== 'system');
  const systemPrompt = systemMessages.map((m) => m.content).join('\n');

  try {
    const stream = await client.messages.stream({
      model,
      max_tokens: 4096,
      system: systemPrompt || undefined,
      messages: userMessages,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta?.type === 'text_delta'
      ) {
        onChunk(event.delta.text);
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
