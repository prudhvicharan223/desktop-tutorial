'use client'

import { useEffect, useState } from 'react'
import { Plus, Zap, MessageSquare, Trash2, X, Sun, Moon, Github, ChevronLeft } from 'lucide-react'
import useAppStore from '../store/useAppStore'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function Sidebar({ onClose }) {
  const {
    chatHistory,
    clearMessages,
    loadChatHistory,
    loadChat,
    deleteChat,
    isDarkMode,
    toggleDarkMode,
    currentChatId,
  } = useAppStore()

  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadChatHistory()
  }, [loadChatHistory])

  const handleNewChat = () => {
    clearMessages()
    onClose?.()
  }

  const handleSelectChat = (id) => {
    loadChat(id)
    onClose?.()
  }

  const handleDeleteChat = async (e, id) => {
    e.stopPropagation()
    setDeletingId(id)
    try {
      await deleteChat(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-omni-surface border-r border-omni-border">
      {/* Logo / brand */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-omni-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-omni-accent/20 flex items-center justify-center">
            <Zap size={16} className="text-omni-accent" />
          </div>
          <span className="font-bold text-sm text-omni-text">OmniCode AI</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded text-omni-muted hover:text-omni-text hover:bg-omni-border transition-colors"
          aria-label="Close sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* New Chat button */}
      <div className="px-3 py-3">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-omni-text bg-omni-accent/10 hover:bg-omni-accent/20 border border-omni-accent/20 transition-colors"
        >
          <Plus size={16} className="text-omni-accent" />
          New Chat
        </button>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-2">
        {chatHistory.length > 0 ? (
          <div className="space-y-0.5">
            <p className="px-2 py-1.5 text-[10px] font-semibold text-omni-muted uppercase tracking-wider">
              Recent Chats
            </p>
            {chatHistory.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleSelectChat(chat._id)}
                className={`group relative flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  currentChatId === chat._id
                    ? 'bg-omni-border text-omni-text'
                    : 'text-omni-muted hover:bg-omni-border hover:text-omni-text'
                }`}
              >
                <MessageSquare size={13} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{chat.title || 'Untitled Chat'}</p>
                  <p className="text-[10px] text-omni-muted mt-0.5">{formatDate(chat.updatedAt)}</p>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(e, chat._id)}
                  disabled={deletingId === chat._id}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-omni-muted hover:text-omni-error transition-all flex-shrink-0"
                  title="Delete chat"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-3 py-6 text-center">
            <MessageSquare size={24} className="text-omni-border mx-auto mb-2" />
            <p className="text-xs text-omni-muted">No chat history yet.<br />Start a new conversation!</p>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="px-3 py-3 border-t border-omni-border space-y-1">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-omni-muted hover:text-omni-text hover:bg-omni-border transition-colors"
        >
          {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          {isDarkMode ? 'Light mode' : 'Dark mode'}
        </button>
        <a
          href="https://github.com/your-org/omnicode-ai"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-omni-muted hover:text-omni-text hover:bg-omni-border transition-colors"
        >
          <Github size={14} />
          View on GitHub
        </a>
      </div>
    </div>
  )
}
