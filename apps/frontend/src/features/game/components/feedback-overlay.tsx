import { useEffect, useState } from 'react'

interface FeedbackOverlayProps {
  isCorrect: boolean
  correctAnswer: string
  message?: string
  onDismiss: () => void
}

export function FeedbackOverlay({ isCorrect, correctAnswer, message, onDismiss }: FeedbackOverlayProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const duration = isCorrect ? 1200 : 1800
    const timer = setTimeout(() => {
      setVisible(false)
      onDismiss()
    }, duration)
    return () => clearTimeout(timer)
  }, [isCorrect, correctAnswer, onDismiss])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity">
      <div
        className={`mx-4 max-w-sm rounded-3xl px-6 py-10 text-center shadow-2xl sm:px-10 sm:py-12 ${
          isCorrect ? 'bg-green-50' : 'bg-red-50'
        }`}
      >
        <div className="text-7xl">{isCorrect ? '✅' : '❌'}</div>
        <h2
          className={`mt-4 text-3xl font-bold ${
            isCorrect ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {isCorrect ? 'Correct!' : 'Try again!'}
        </h2>
        {message && <p className="mt-2 text-sm text-gray-500">{message}</p>}
      </div>
    </div>
  )
}
