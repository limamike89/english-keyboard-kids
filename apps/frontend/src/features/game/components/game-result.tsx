import type { GameResult as GameResultType } from '../types/game.types'

interface GameResultProps {
  result: GameResultType
  onPlayAgain: () => void
  onGoHome: () => void
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: 3 }, (_, i) => (
        <span
          key={i}
          className={`text-5xl transition-all duration-500 ${
            i < count ? 'scale-100 opacity-100' : 'scale-75 opacity-20'
          }`}
        >
          ⭐
        </span>
      ))}
    </div>
  )
}

export function GameResult({ result, onPlayAgain, onGoHome }: GameResultProps) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-10 shadow-lg">
      <span className="text-6xl">🎉</span>
      <h2 className="text-3xl font-bold text-gray-900">Game Complete!</h2>

      <Stars count={result.stars} />

      <div className="grid w-full max-w-xs grid-cols-2 gap-4 text-center">
        <div className="rounded-xl bg-sky-50 p-3">
          <span className="block text-2xl font-bold text-sky-600">{result.totalScore}</span>
          <span className="text-xs text-gray-500">Points</span>
        </div>
        <div className="rounded-xl bg-green-50 p-3">
          <span className="block text-2xl font-bold text-green-600">
            {result.totalCorrect}/{result.totalCorrect + result.totalIncorrect}
          </span>
          <span className="text-xs text-gray-500">Correct</span>
        </div>
        <div className="rounded-xl bg-amber-50 p-3">
          <span className="block text-2xl font-bold text-amber-600">{result.bestStreak}</span>
          <span className="text-xs text-gray-500">Best Streak</span>
        </div>
        <div className="rounded-xl bg-purple-50 p-3">
          <span className="block text-2xl font-bold text-purple-600">+{result.xpEarned}</span>
          <span className="text-xs text-gray-500">XP</span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full rounded-xl bg-sky-500 px-6 py-3 text-base font-semibold text-white shadow transition hover:bg-sky-600 active:scale-95 sm:px-8 sm:text-lg"
        >
          Play Again
        </button>
        <button
          type="button"
          onClick={onGoHome}
          className="w-full rounded-xl border-2 border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-100 active:scale-95 sm:px-8 sm:text-lg"
        >
          Home
        </button>
      </div>
    </div>
  )
}
