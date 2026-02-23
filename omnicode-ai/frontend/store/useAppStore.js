import { create } from 'zustand'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const useAppStore = create((set, get) => ({
  // ── State ─────────────────────────────────────────────────────────────────
  messages: [],
  selectedModel: 'openai',
  selectedMode: 'generate',
  isStreaming: false,
  chatHistory: [],
  isDarkMode: true,
  editorContent: '',
  selectedLanguage: 'javascript',
  targetLanguage: 'python',
  currentChatId: null,
  authToken: null,

  // ── Basic setters ─────────────────────────────────────────────────────────
  setModel: (model) => set({ selectedModel: model }),
  setMode: (mode) => set({ selectedMode: mode }),
  setStreaming: (v) => set({ isStreaming: v }),
  setChatHistory: (chatHistory) => set({ chatHistory }),
  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
  setEditorContent: (editorContent) => set({ editorContent }),
  setLanguage: (selectedLanguage) => set({ selectedLanguage }),
  setTargetLanguage: (targetLanguage) => set({ targetLanguage }),
  setCurrentChatId: (id) => set({ currentChatId: id }),
  setAuthToken: (token) => set({ authToken: token }),

  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages, { ...message, id: crypto.randomUUID() }] })),

  clearMessages: () => set({ messages: [], currentChatId: null }),

  // ── sendMessage ───────────────────────────────────────────────────────────
  sendMessage: async (content) => {
    const { selectedModel, selectedMode, targetLanguage, messages, authToken, currentChatId } = get()

    // Append user message
    const userMsg = { role: 'user', content, id: crypto.randomUUID() }
    set((s) => ({ messages: [...s.messages, userMsg] }))

    // Placeholder for streaming assistant reply
    const assistantMsgId = crypto.randomUUID()
    set((s) => ({
      messages: [...s.messages, { role: 'assistant', content: '', id: assistantMsgId }],
      isStreaming: true,
    }))

    try {
      const conversationMessages = [...messages, userMsg].map(({ role, content: c }) => ({ role, content: c }))

      const response = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          messages: conversationMessages,
          model: selectedModel,
          mode: selectedMode,
          targetLanguage,
          chatId: currentChatId,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || `Server error: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') break

          try {
            const parsed = JSON.parse(payload)
            if (parsed.type === 'chunk' && parsed.content) {
              set((s) => ({
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + parsed.content }
                    : m
                ),
              }))
            } else if (parsed.type === 'error') {
              throw new Error(parsed.message)
            }
          } catch (parseErr) {
            if (parseErr.message !== 'Unexpected end of JSON input') {
              console.warn('SSE parse error:', parseErr)
            }
          }
        }
      }
    } catch (err) {
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: `**Error:** ${err.message}` }
            : m
        ),
      }))
    } finally {
      set({ isStreaming: false })
    }
  },

  // ── uploadFile ────────────────────────────────────────────────────────────
  uploadFile: async (file) => {
    const { authToken } = get()
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await axios.post(`${API_URL}/api/upload/file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    })

    set({ editorContent: data.content, selectedLanguage: data.language || 'plaintext' })

    // Send file contents to chat automatically
    const prompt = `Here is the contents of \`${data.filename}\`:\n\`\`\`${data.language}\n${data.content}\n\`\`\``
    get().addMessage({ role: 'user', content: prompt })

    return data
  },

  // ── loadChatHistory ───────────────────────────────────────────────────────
  loadChatHistory: async () => {
    const { authToken } = get()
    try {
      const { data } = await axios.get(`${API_URL}/api/chat/history`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      set({ chatHistory: data.chats || [] })
    } catch (err) {
      console.error('Failed to load chat history:', err.message)
    }
  },

  // ── loadChat ──────────────────────────────────────────────────────────────
  loadChat: async (chatId) => {
    const { authToken } = get()
    try {
      const { data } = await axios.get(`${API_URL}/api/chat/${chatId}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      set({
        messages: data.chat.messages.map((m) => ({ ...m, id: crypto.randomUUID() })),
        currentChatId: chatId,
        selectedModel: data.chat.model || 'openai',
      })
    } catch (err) {
      console.error('Failed to load chat:', err.message)
    }
  },

  // ── deleteChat ────────────────────────────────────────────────────────────
  deleteChat: async (chatId) => {
    const { authToken, currentChatId } = get()
    try {
      await axios.delete(`${API_URL}/api/chat/${chatId}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      set((s) => ({
        chatHistory: s.chatHistory.filter((c) => c._id !== chatId),
        ...(currentChatId === chatId ? { messages: [], currentChatId: null } : {}),
      }))
    } catch (err) {
      console.error('Failed to delete chat:', err.message)
    }
  },
}))

export default useAppStore
