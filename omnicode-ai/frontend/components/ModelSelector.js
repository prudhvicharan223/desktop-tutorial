'use client'

import { useState } from 'react'
import { ChevronDown, Cpu } from 'lucide-react'
import useAppStore from '../store/useAppStore'

const MODELS = [
  { id: 'openai', label: 'GPT-4o', badge: 'OpenAI', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
  { id: 'claude', label: 'Claude 3.5 Sonnet', badge: 'Anthropic', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' },
  { id: 'gemini', label: 'Gemini Pro', badge: 'Google', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
  { id: 'ollama', label: 'Local Ollama', badge: 'Local', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30' },
]

export default function ModelSelector() {
  const { selectedModel, setModel } = useAppStore()
  const [open, setOpen] = useState(false)

  const current = MODELS.find((m) => m.id === selectedModel) || MODELS[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${current.bg} ${current.color}`}
      >
        <Cpu size={13} />
        <span>{current.label}</span>
        <span className="text-omni-muted">{current.badge}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 w-52 rounded-xl border border-omni-border bg-omni-surface shadow-xl overflow-hidden">
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => { setModel(model.id); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs hover:bg-omni-border transition-colors ${
                  selectedModel === model.id ? 'bg-omni-border' : ''
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${model.color.replace('text-', 'bg-')}`} />
                <div className="flex-1">
                  <div className="font-medium text-omni-text">{model.label}</div>
                  <div className="text-omni-muted">{model.badge}</div>
                </div>
                {selectedModel === model.id && (
                  <span className="text-omni-accent text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
