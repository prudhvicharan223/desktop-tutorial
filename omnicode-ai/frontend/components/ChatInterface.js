'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Send, Paperclip, Zap, Bug, BookOpen, TrendingUp, Repeat2, Bot, User } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import ModelSelector from './ModelSelector'
import ModeSelector from './ModeSelector'
import CodeBlock from './CodeBlock'
import FileUpload from './FileUpload'

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-2 py-1">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-omni-accent/10 border border-omni-accent/20">
        <Zap size={32} className="text-omni-accent" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-omni-text mb-2">Welcome to OmniCode AI</h2>
        <p className="text-omni-muted max-w-md">
          Your intelligent coding assistant powered by GPT-4o, Claude 3.5, Gemini Pro, and local Ollama models.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {[
          { icon: Zap, label: 'Generate', desc: 'Write code from scratch' },
          { icon: Bug, label: 'Debug', desc: 'Find and fix bugs' },
          { icon: BookOpen, label: 'Explain', desc: 'Understand any code' },
          { icon: TrendingUp, label: 'Optimize', desc: 'Improve performance' },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex flex-col gap-1 p-3 rounded-lg border border-omni-border bg-omni-surface hover:border-omni-accent/50 transition-colors cursor-default"
          >
            <div className="flex items-center gap-2 text-omni-accent">
              <Icon size={15} />
              <span className="text-sm font-medium text-omni-text">{label}</span>
            </div>
            <p className="text-xs text-omni-muted">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const markdownComponents = {
  code({ inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    const code = String(children).replace(/\n$/, '')

    if (!inline && language) {
      return <CodeBlock code={code} language={language} />
    }
    return (
      <code className="bg-omni-surface text-omni-accent px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    )
  },
}

function Message({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex gap-3 px-4 py-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-omni-accent/20 text-omni-accent' : 'bg-omni-success/20 text-omni-success'
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-omni-accent/10 text-omni-text border border-omni-accent/20 rounded-tr-sm'
            : 'bg-omni-surface text-omni-text border border-omni-border rounded-tl-sm'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-invert max-w-none text-sm"
            components={markdownComponents}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}

export default function ChatInterface() {
  const { messages, isStreaming, sendMessage } = useAppStore()
  const [input, setInput] = useState('')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    sendMessage(trimmed)
    setInput('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-omni-bg">
      {/* Top toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-omni-border bg-omni-surface flex-wrap">
        <ModelSelector />
        <ModeSelector />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="pb-4">
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            {isStreaming && messages[messages.length - 1]?.role === 'assistant' &&
              messages[messages.length - 1]?.content === '' && (
                <div className="flex gap-3 px-4 py-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-omni-success/20 text-omni-success">
                    <Bot size={16} />
                  </div>
                  <div className="bg-omni-surface border border-omni-border rounded-2xl rounded-tl-sm px-4 py-3">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* File upload panel */}
      {showFileUpload && (
        <div className="border-t border-omni-border bg-omni-surface px-4 py-3">
          <FileUpload onClose={() => setShowFileUpload(false)} />
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-omni-border bg-omni-surface px-4 py-3">
        <div className="flex items-end gap-2 bg-omni-bg border border-omni-border rounded-xl p-2 focus-within:border-omni-accent/50 transition-colors">
          <button
            onClick={() => setShowFileUpload((v) => !v)}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
              showFileUpload
                ? 'text-omni-accent bg-omni-accent/10'
                : 'text-omni-muted hover:text-omni-text hover:bg-omni-border'
            }`}
            title="Upload file"
          >
            <Paperclip size={18} />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask OmniCode AI anything… (Shift+Enter for new line)"
            rows={1}
            className="flex-1 bg-transparent text-omni-text placeholder-omni-muted text-sm resize-none outline-none max-h-40 py-1.5"
            style={{ lineHeight: '1.5' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
            }}
            disabled={isStreaming}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="flex-shrink-0 p-2 rounded-lg bg-omni-accent text-omni-bg hover:bg-omni-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Send message"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-omni-muted mt-1.5 text-center">
          OmniCode AI can make mistakes. Verify important code before using in production.
        </p>
      </div>
    </div>
  )
}
