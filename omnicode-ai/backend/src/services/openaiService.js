const OpenAI = require('openai');

/**
 * Stream a chat completion from OpenAI.
 * @param {Array} messages - Array of { role, content }
 * @param {string} model - OpenAI model name (e.g. 'gpt-4o')
 * @param {Function} onChunk - Called with each text delta string
 * @param {Function} onEnd - Called when stream is complete
 * @param {Function} onError - Called on error
 */
async function streamCompletion(messages, model, onChunk, onEnd, onError) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const stream = await client.chat.completions.create({
      model,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        onChunk(delta);
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
