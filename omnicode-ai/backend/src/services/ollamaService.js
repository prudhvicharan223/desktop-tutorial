const axios = require('axios');

/**
 * Stream a chat completion from a local Ollama instance.
 * @param {Array} messages - Array of { role, content }
 * @param {string} model - Ollama model name (e.g. 'llama3', 'codellama')
 * @param {Function} onChunk - Called with each text delta string
 * @param {Function} onEnd - Called when stream is complete
 * @param {Function} onError - Called on error
 */
async function streamCompletion(messages, model, onChunk, onEnd, onError) {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  try {
    const response = await axios.post(
      `${baseUrl}/api/chat`,
      { model, messages, stream: true },
      { responseType: 'stream', timeout: 120000 }
    );

    await new Promise((resolve, reject) => {
      let buffer = '';

      response.data.on('data', (rawChunk) => {
        buffer += rawChunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            const content = parsed?.message?.content;
            if (content) {
              onChunk(content);
            }
            if (parsed.done) {
              resolve();
            }
          } catch {
            // Non-JSON line, skip
          }
        }
      });

      response.data.on('end', () => resolve());
      response.data.on('error', (err) => reject(err));
    });

    if (onEnd) onEnd();
  } catch (err) {
    const message =
      err.code === 'ECONNREFUSED'
        ? `Could not connect to Ollama at ${baseUrl}. Is Ollama running?`
        : err.message;

    const wrappedErr = new Error(message);
    if (onError) {
      onError(wrappedErr);
    } else {
      throw wrappedErr;
    }
  }
}

module.exports = { streamCompletion };
