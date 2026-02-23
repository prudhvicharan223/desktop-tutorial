const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { routeToModel } = require('../services/modelRouter');
const { chatLimiter, apiLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');
const Chat = require('../models/Chat');

const MODE_SYSTEM_PROMPTS = {
  generate: 'You are an expert coding assistant. Generate clean, well-commented code. Follow best practices and include explanations for complex parts.',
  debug: 'You are a debugging expert. Identify and fix bugs in the provided code. Explain what was wrong and why your fix works.',
  explain: 'You are a code teacher. Explain the code clearly with examples. Break down complex concepts into understandable pieces.',
  optimize: 'You are a performance expert. Optimize the code for speed and efficiency. Explain the improvements made and why they help.',
  convert: 'You are a code translator. Convert the code to {targetLanguage}. Preserve logic and functionality while using idiomatic patterns for the target language.',
};

// POST /api/chat/message
router.post(
  '/message',
  chatLimiter,
  authenticate,
  [
    body('messages').isArray({ min: 1 }).withMessage('messages must be a non-empty array'),
    body('messages.*.role').isIn(['user', 'assistant', 'system']).withMessage('Invalid message role'),
    body('messages.*.content').isString().notEmpty().withMessage('Message content is required'),
    body('model').isIn(['openai', 'claude', 'gemini', 'ollama']).withMessage('Invalid model'),
    body('mode').optional().isIn(['generate', 'debug', 'explain', 'optimize', 'convert']).withMessage('Invalid mode'),
    body('targetLanguage').optional().isString().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { messages, model, mode = 'generate', targetLanguage = 'python', modelName } = req.body;

    // Build system prompt from mode
    let systemPromptText = MODE_SYSTEM_PROMPTS[mode] || MODE_SYSTEM_PROMPTS.generate;
    if (mode === 'convert') {
      systemPromptText = systemPromptText.replace('{targetLanguage}', targetLanguage);
    }

    const systemMessage = { role: 'system', content: systemPromptText };
    const fullMessages = [systemMessage, ...messages];

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    let fullContent = '';

    const onChunk = (chunk) => {
      fullContent += chunk;
      res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
    };

    const onEnd = async () => {
      res.write(`data: [DONE]\n\n`);
      res.end();

      // Persist chat to DB asynchronously
      if (req.user?._id && fullContent) {
        try {
          const title =
            messages.find((m) => m.role === 'user')?.content?.slice(0, 80) || 'New Chat';

          const existing = req.body.chatId
            ? await Chat.findOne({ _id: req.body.chatId, userId: req.user._id })
            : null;

          if (existing) {
            existing.messages.push(
              ...messages.filter((m) => m.role !== 'system'),
              { role: 'assistant', content: fullContent }
            );
            await existing.save();
          } else {
            await Chat.create({
              userId: req.user._id,
              title,
              model,
              messages: [
                ...messages.filter((m) => m.role !== 'system'),
                { role: 'assistant', content: fullContent },
              ],
            });
          }
        } catch (dbErr) {
          console.error('Failed to save chat:', dbErr.message);
        }
      }
    };

    const onError = (err) => {
      console.error('Model error:', err.message);
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
      res.end();
    };

    req.on('close', () => {
      // Client disconnected, nothing extra needed
    });

    await routeToModel(model, fullMessages, { modelName, onChunk, onEnd, onError });
  }
);

// GET /api/chat/history
router.get('/history', apiLimiter, authenticate, async (req, res, next) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .select('title model createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json({ chats });
  } catch (err) {
    next(err);
  }
});

// GET /api/chat/:id
router.get('/:id', apiLimiter, authenticate, async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json({ chat });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/chat/:id
router.delete('/:id', apiLimiter, authenticate, async (req, res, next) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json({ message: 'Chat deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
