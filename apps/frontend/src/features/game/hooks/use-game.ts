import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { createSession } from '@/features/auth/services/auth.service'
import { startGame, submitAnswer } from '../services/game.service'
import { useMultimedia } from '@/multimedia-engine/react/multimedia-context'
import { ROUTES } from '@/shared/utils/constants'
import type { GameStatus, GameQuestion, GameResult as GameResultType } from '../types/game.types'

interface UseGameReturn {
  status: GameStatus
  currentQuestion: GameQuestion | null
  audioKey: string | null
  score: number
  streak: number
  questionsAnswered: number
  totalQuestions: number
  result: GameResultType | null
  lastCorrectAnswer: string
  lastMessage: string | undefined
  isLoading: boolean
  handleSubmit: (answer: string) => Promise<void>
  handleNext: () => void
  handlePlayAgain: () => void
  handleGoHome: () => void
  handleFinish: () => Promise<void>
}

export function useGame(): UseGameReturn {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const sessionToken = useAuthStore((s) => s.sessionToken)
  const multimedia = useMultimedia()

  const [status, setStatus] = useState<GameStatus>('idle')
  const [gameSessionId, setGameSessionId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null)
  const [audioKey, setAudioKey] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [result, setResult] = useState<GameResultType | null>(null)
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState('')
  const [lastMessage, setLastMessage] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const startedGameKeyRef = useRef<string | null>(null)
  const wasIncorrectRef = useRef(false)
  const initialPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const initGame = useCallback(async () => {
    if (!lessonId) return
    let token = sessionToken
    if (!token) {
      try {
        const session = await createSession()
        useAuthStore.getState().setSession(session)
        token = session.sessionToken
      } catch {
        return
      }
    }
    setIsLoading(true)
    try {
      const res = await startGame({ lessonId })
      setGameSessionId(res.gameSessionId)
      setCurrentQuestion(res.currentQuestion)
      setAudioKey(res.currentQuestion.audioKey)
      setScore(res.score)
      setStreak(res.streak)
      setQuestionsAnswered(res.questionsAnswered)
      setTotalQuestions(res.totalQuestions)
      setStatus('playing')
      setResult(null)

      initialPlayTimerRef.current = setTimeout(() => {
        multimedia.playAudio(res.currentQuestion.audioKey)
      }, 3000)
    } catch (err) {
      console.error('[useGame] initGame error:', (err as { response?: { data?: unknown } })?.response?.data ?? err)
      setStatus('idle')
    } finally {
      setIsLoading(false)
    }
  }, [lessonId, sessionToken, multimedia])

  useEffect(() => {
    const gameKey = lessonId && sessionToken ? `${lessonId}:${sessionToken}` : null
    if (!lessonId) return

    if (gameKey) {
      if (startedGameKeyRef.current === gameKey) return
      startedGameKeyRef.current = gameKey
    }

    initGame()
  }, [lessonId, sessionToken, initGame])

  useEffect(() => {
    return () => {
      if (initialPlayTimerRef.current) {
        clearTimeout(initialPlayTimerRef.current)
        initialPlayTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (status === 'playing' && wasIncorrectRef.current && audioKey) {
      wasIncorrectRef.current = false
      multimedia.playAudio(audioKey)
    }
  }, [status, audioKey, multimedia])

  const handleSubmit = useCallback(
    async (answer: string) => {
      if (!gameSessionId || !currentQuestion) return
      setIsLoading(true)
      try {
        const res = await submitAnswer({
          gameSessionId,
          questionId: currentQuestion.id,
          answer,
        })

        setLastCorrectAnswer(res.correctAnswer)
        setLastMessage(res.message)
        setScore(res.totalScore)
        setStreak(res.streak)

        if (res.isCorrect) {
          setStatus('correct')
          const answered = questionsAnswered + 1
          setQuestionsAnswered(answered)

          multimedia.playFeedback('correct')

          if (res.status === 'COMPLETED' && res.result) {
            setResult(res.result)
            multimedia.playFeedback('congratulations')
            setTimeout(() => setStatus('completed'), 1500)
          } else if (res.nextQuestion) {
            setTimeout(() => {
              setCurrentQuestion(res.nextQuestion!)
              setAudioKey(res.nextQuestion!.audioKey)
              setStatus('playing')
              multimedia.playAudio(res.nextQuestion!.audioKey)
              multimedia.preloadPredictive(res.nextQuestion!.audioKey, 'ALPHABET')
            }, 1500)
          }
        } else {
          setStatus('incorrect')
          wasIncorrectRef.current = true
          multimedia.playFeedback('try-again')
        }
      } catch (err) {
        console.error('[useGame] submit error:', (err as { response?: { data?: unknown } })?.response?.data ?? err)
        setStatus('playing')
      } finally {
        setIsLoading(false)
      }
    },
    [gameSessionId, currentQuestion, questionsAnswered, multimedia],
  )

  const handleNext = useCallback(() => {
    setStatus('playing')
  }, [])

  const handlePlayAgain = useCallback(() => {
    initGame()
  }, [initGame])

  const handleGoHome = useCallback(() => {
    navigate(ROUTES.HOME)
  }, [navigate])

  const handleFinish = useCallback(async () => {
    if (gameSessionId) {
      try {
        await submitAnswer({
          gameSessionId,
          questionId: currentQuestion!.id,
          answer: '',
        })
      } catch {
      }
    }
    multimedia.stopAudio()
    navigate(ROUTES.HOME)
  }, [gameSessionId, currentQuestion, navigate, multimedia])

  return {
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
  }
}
