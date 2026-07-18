interface ScoreDisplayProps {
  score: number
  streak: number
}

export function ScoreDisplay({ score, streak }: ScoreDisplayProps) {
  return (
    <div className="flex items-center justify-center gap-6 rounded-xl bg-white px-6 py-3 shadow-sm">
      <div className="text-center">
        <span className="block text-2xl font-bold text-sky-600">{score}</span>
        <span className="text-xs text-gray-400">Points</span>
      </div>
      <div className="h-8 w-px bg-gray-200" />
      <div className="text-center">
        <span className="block text-2xl font-bold text-amber-500">{streak}</span>
        <span className="text-xs text-gray-400">Streak</span>
      </div>
    </div>
  )
}
