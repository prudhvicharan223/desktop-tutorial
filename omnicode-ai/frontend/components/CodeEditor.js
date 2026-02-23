'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Play, Trash2, ChevronDown } from 'lucide-react'
import useAppStore from '../store/useAppStore'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
  'go', 'rust', 'ruby', 'php', 'html', 'css', 'json', 'yaml', 'sql',
  'bash', 'kotlin', 'swift', 'scala', 'r', 'dart', 'lua',
]

export default function CodeEditor() {
  const { editorContent, setEditorContent, selectedLanguage, setLanguage, sendMessage } = useAppStore()
  const [langOpen, setLangOpen] = useState(false)

  const handleRunCode = () => {
    if (!editorContent.trim()) return
    const prompt = `Please review and explain the following ${selectedLanguage} code:\n\n\`\`\`${selectedLanguage}\n${editorContent}\n\`\`\``
    sendMessage(prompt)
  }

  const handleClear = () => {
    setEditorContent('')
  }

  return (
    <div className="flex flex-col h-full bg-omni-bg">
      {/* Editor toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-omni-border bg-omni-surface">
        {/* Language picker */}
        <div className="relative flex-1">
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-omni-text border border-omni-border bg-omni-bg hover:bg-omni-border transition-colors"
          >
            <span className="font-mono">{selectedLanguage}</span>
            <ChevronDown size={11} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          {langOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 w-40 rounded-xl border border-omni-border bg-omni-surface shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setLangOpen(false) }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-omni-border transition-colors font-mono ${
                      selectedLanguage === lang ? 'text-omni-accent bg-omni-border' : 'text-omni-text'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        <button
          onClick={handleRunCode}
          disabled={!editorContent.trim()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-omni-success/10 text-omni-success border border-omni-success/20 hover:bg-omni-success/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Send code to chat"
        >
          <Play size={12} />
          Analyze
        </button>
        <button
          onClick={handleClear}
          disabled={!editorContent}
          className="p-1.5 rounded-lg text-omni-muted hover:text-omni-error hover:bg-omni-error/10 border border-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Clear editor"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={selectedLanguage}
          value={editorContent}
          onChange={(val) => setEditorContent(val || '')}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            bracketPairColorization: { enabled: true },
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  )
}
