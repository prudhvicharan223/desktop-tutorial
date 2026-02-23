'use client'

import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatInterface from '../components/ChatInterface'
import CodeEditor from '../components/CodeEditor'
import { Menu, X, Code2 } from 'lucide-react'

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-omni-bg">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 flex-shrink-0
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-omni-border lg:hidden bg-omni-surface">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-omni-muted hover:text-omni-text hover:bg-omni-border transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-omni-text">OmniCode AI</span>
          <button
            onClick={() => setEditorOpen((v) => !v)}
            className={`p-1.5 rounded-md transition-colors ${
              editorOpen
                ? 'text-omni-accent bg-omni-accent/10'
                : 'text-omni-muted hover:text-omni-text hover:bg-omni-border'
            }`}
            aria-label="Toggle code editor"
          >
            <Code2 size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat area */}
          <div className={`flex flex-col flex-1 min-w-0 ${editorOpen ? 'hidden md:flex' : 'flex'}`}>
            <ChatInterface />
          </div>

          {/* Code editor panel */}
          <div
            className={`
              flex-shrink-0 border-l border-omni-border
              ${editorOpen ? 'flex' : 'hidden'}
              md:flex md:w-[420px] lg:w-[500px]
              flex-col
            `}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-omni-border bg-omni-surface">
              <span className="text-sm font-medium text-omni-text flex items-center gap-1.5">
                <Code2 size={14} className="text-omni-accent" />
                Code Editor
              </span>
              <button
                onClick={() => setEditorOpen(false)}
                className="p-1 rounded text-omni-muted hover:text-omni-text hover:bg-omni-border transition-colors md:hidden"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CodeEditor />
            </div>
          </div>

          {/* Desktop toggle button */}
          <button
            onClick={() => setEditorOpen((v) => !v)}
            className="hidden md:flex items-center justify-center w-6 border-l border-omni-border bg-omni-surface hover:bg-omni-border transition-colors text-omni-muted hover:text-omni-text"
            title={editorOpen ? 'Close editor' : 'Open editor'}
          >
            <Code2 size={14} />
          </button>
        </div>
      </main>
    </div>
  )
}
