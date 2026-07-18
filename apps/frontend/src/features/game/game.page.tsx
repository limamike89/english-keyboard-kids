import { useGame } from './hooks/use-game'
import { AnswerInput } from './components/answer-input'
import { FeedbackOverlay } from './components/feedback-overlay'
import { ProgressBar } from './components/progress-bar'
import { ScoreDisplay } from './components/score-display'
import { GameResult } from './components/game-result'

export function GamePage() {
  const {
    status,
    currentQuestion,
    audioKey,
    score,
    streak,
    questionsAnswered,
    totalQuestions,
    result,
    lastCorrectAnswer,
    lastMessage,
    isLoading,
    handleSubmit,
    handleNext,
    handlePlayAgain,
    handleGoHome,
    handleFinish,
  } = useGame()

  if (isLoading && status === 'idle') {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-300 border-t-transparent" />
      </div>
    )
  }

  if (status === 'completed' && result) {
    return (
      <div className="py-8">
        <GameResult
          result={result}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
        />
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        Could not start the game. <button type="button" onClick={handleGoHome} className="underline">Go home</button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <ProgressBar current={questionsAnswered} total={totalQuestions} />

      <ScoreDisplay score={score} streak={streak} />

      <div className="flex justify-center">
        <AnswerInput
          disabled={status === 'correct' || status === 'incorrect' || isLoading}
          onSubmit={handleSubmit}
          onFinish={handleFinish}
          audioKey={audioKey}
        />
      </div>

      {status === 'correct' && (
        <FeedbackOverlay
          isCorrect
          correctAnswer={lastCorrectAnswer}
          message={lastMessage}
          onDismiss={handleNext}
        />
      )}

      {status === 'incorrect' && (
        <FeedbackOverlay
          isCorrect={false}
          correctAnswer={lastCorrectAnswer}
          message={lastMessage}
          onDismiss={handleNext}
        />
      )}
    </div>
  )
}
