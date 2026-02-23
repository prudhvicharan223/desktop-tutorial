'use client'

import { Zap, Bug, BookOpen, TrendingUp, Repeat2, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import useAppStore from '../store/useAppStore'

const MODES = [
  { id: 'generate', label: 'Generate', icon: Zap, color: 'text-omni-accent' },
  { id: 'debug', label: 'Debug', icon: Bug, color: 'text-omni-error' },
  { id: 'explain', label: 'Explain', icon: BookOpen, color: 'text-omni-success' },
  { id: 'optimize', label: 'Optimize', icon: TrendingUp, color: 'text-omni-warning' },
  { id: 'convert', label: 'Convert', icon: Repeat2, color: 'text-purple-400' },
]

const TARGET_LANGUAGES = [
  'python', 'javascript', 'typescript', 'java', 'c', 'c++', 'c#', 'go',
  'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'dart',
]

export default function ModeSelector() {
  const { selectedMode, setMode, targetLanguage, setTargetLanguage } = useAppStore()
  const [langOpen, setLangOpen] = useState(false)

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {MODES.map(({ id, label, icon: Icon, color }) => {
        const active = selectedMode === id
        return (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              active
                ? `${color} bg-omni-border border-omni-border`
                : 'text-omni-muted border-transparent hover:text-omni-text hover:bg-omni-border'
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        )
      })}

      {/* Target language picker for Convert mode */}
      {selectedMode === 'convert' && (
        <div className="relative">
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-omni-text border border-omni-border bg-omni-bg hover:bg-omni-border transition-colors"
          >
            <span>→ {targetLanguage}</span>
            <ChevronDown size={11} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          {langOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 w-36 rounded-xl border border-omni-border bg-omni-surface shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                {TARGET_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setTargetLanguage(lang); setLangOpen(false) }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-omni-border transition-colors ${
                      targetLanguage === lang ? 'text-omni-accent bg-omni-border' : 'text-omni-text'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
