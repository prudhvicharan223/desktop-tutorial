const openaiService = require('./openaiService');
const anthropicService = require('./anthropicService');
const geminiService = require('./geminiService');
const ollamaService = require('./ollamaService');

/**
 * Route a chat completion request to the appropriate AI service.
 * @param {string} model - 'openai' | 'claude' | 'gemini' | 'ollama'
 * @param {Array} messages - Array of { role, content } message objects
 * @param {Object} options - { modelName, onChunk, onEnd, onError }
 */
async function routeToModel(model, messages, options = {}) {
  const { modelName, onChunk, onEnd, onError } = options;

  const handleError = (err) => {
    if (onError) onError(err);
    else throw err;
  };

  switch (model) {
    case 'openai': {
      const openaiModel = modelName || process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o';
      if (!process.env.OPENAI_API_KEY) {
        return handleError(new Error('OpenAI API key is not configured. Set OPENAI_API_KEY in your .env file.'));
      }
      return openaiService.streamCompletion(messages, openaiModel, onChunk, onEnd, onError);
    }

    case 'claude': {
      const claudeModel = modelName || process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022';
      if (!process.env.ANTHROPIC_API_KEY) {
        return handleError(new Error('Anthropic API key is not configured. Set ANTHROPIC_API_KEY in your .env file.'));
      }
      return anthropicService.streamCompletion(messages, claudeModel, onChunk, onEnd, onError);
    }

    case 'gemini': {
      const geminiModel = modelName || process.env.GEMINI_DEFAULT_MODEL || 'gemini-pro';
      if (!process.env.GEMINI_API_KEY) {
        return handleError(new Error('Gemini API key is not configured. Set GEMINI_API_KEY in your .env file.'));
      }
      return geminiService.streamCompletion(messages, geminiModel, onChunk, onEnd, onError);
    }

    case 'ollama': {
      const ollamaModel = modelName || process.env.OLLAMA_DEFAULT_MODEL || 'llama3';
      return ollamaService.streamCompletion(messages, ollamaModel, onChunk, onEnd, onError);
    }

    default:
      return handleError(new Error(`Unknown model provider: "${model}". Supported: openai, claude, gemini, ollama`));
  }
}

module.exports = { routeToModel };
