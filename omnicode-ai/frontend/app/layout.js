import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'OmniCode AI',
  description: 'Multi-model AI coding assistant — GPT-4o, Claude 3.5, Gemini Pro, and local Ollama models.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-omni-bg text-omni-text antialiased`}>
        {children}
      </body>
    </html>
  )
}
