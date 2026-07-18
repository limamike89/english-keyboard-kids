import { v4 as uuidv4 } from 'uuid'
import { EventBus } from './event-bus'
import { GameMachine } from './game-machine'
import { QuestionPool } from '../questions/question-pool'
import { AnswerValidator } from '../questions/answer-validator'
import { ScoringSystem } from '../scoring/scoring-system'
import { ProgressTracker } from '../progress/progress-tracker'
import { IGameMode } from '../modes/game-mode.interface'
import { IGamePersistence } from '../persistence/game-persistence.interface'
import { GAME_ENGINE_CONFIG } from '../config/game.config'
import {
  GameState,
  GameEventType,
  GameModeType,
  GameSessionState,
  GameQuestion,
  SubmitAnswerInput,
  SubmitAnswerResult,
  GameStateResponse,
  GameResult,
  GameStartInput,
} from './types'
import {
  GameNotFoundError,
  QuestionNotFoundError,
  GameAlreadyFinishedError,
} from '../errors/game-errors'
import { ScoringConfig } from '../scoring/scoring-config'

export type OnGameCompleted = (sessionId: string, result: GameResult) => Promise<void>

type ModeRegistry = Map<GameModeType, IGameMode>

const SESSION_CLEANUP_INTERVAL_MS = 60_000
const SESSION_MAX_AGE_MS = 30 * 60 * 1000

export class GameEngine {
  private sessions = new Map<string, GameSessionState>()
  private machines = new Map<string, GameMachine>()
  private pools = new Map<string, QuestionPool>()
  private trackers = new Map<string, ProgressTracker>()
  private modeRegistry: ModeRegistry = new Map()
  private scoringSystem: ScoringSystem
  private validator: AnswerValidator
  private persistence: IGamePersistence
  private eventBus: EventBus
  private onCompleted: OnGameCompleted | null = null
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor(
    persistence: IGamePersistence,
    scoringConfig?: Partial<ScoringConfig>,
    eventBus?: EventBus,
  ) {
    this.persistence = persistence
    this.scoringSystem = new ScoringSystem(scoringConfig)
    this.validator = new AnswerValidator()
    this.eventBus = eventBus ?? new EventBus()
    this.startCleanupTimer()
  }

  setOnCompleted(handler: OnGameCompleted): void {
    this.onCompleted = handler
  }

  getEventBus(): EventBus {
    return this.eventBus
  }

  getScoringSystem(): ScoringSystem {
    return this.scoringSystem
  }

  registerMode(mode: IGameMode): void {
    this.modeRegistry.set(mode.type, mode)
  }

  getRegisteredModes(): IGameMode[] {
    return Array.from(this.modeRegistry.values())
  }

  private getMode(modeType: GameModeType): IGameMode {
    const mode = this.modeRegistry.get(modeType)
    if (!mode) {
      throw new Error(`Game mode not registered: ${modeType}`)
    }
    return mode
  }

  async start(input: GameStartInput): Promise<{
    gameSessionId: string
    mode: GameModeType
    status: string
    currentQuestion: GameQuestion & { totalQuestions: number }
    score: number
    streak: number
    questionsAnswered: number
    totalQuestions: number
  }> {
    const mode = this.getMode(input.mode)
    const eventBus = new EventBus()
    const machine = new GameMachine(eventBus)
    machine.transition(GameState.LOADING)

    const questions = mode.generateQuestions(input.questions)
    const pool = new QuestionPool()
    pool.initialize(questions)
    machine.transition(GameState.READY)

    const tracker = new ProgressTracker()
    tracker.initialize(questions.length)

    // Keep the session in exactly the order used by the pool. Otherwise the
    // displayed shuffled question can differ from the one validated by index.
    const session = this.createSession(input, pool.getAll())
    this.sessions.set(session.id, session)
    this.machines.set(session.id, machine)
    this.pools.set(session.id, pool)
    this.trackers.set(session.id, tracker)

    machine.transition(GameState.PLAYING)

    const first = pool.next()
    if (!first) {
      this.transitionToEnd(machine, session)
      throw new Error('No questions available')
    }

    tracker.startQuestion(first.id)
    session.state = GameState.PLAYING

    this.eventBus.emit(GameEventType.GameStarted, {
      sessionId: session.id,
      mode: input.mode,
      totalQuestions: questions.length,
    })

    this.eventBus.emit(GameEventType.QuestionGenerated, {
      questionId: first.id,
      questionNumber: 1,
      totalQuestions: questions.length,
    })

    return {
      gameSessionId: session.id,
      mode: input.mode,
      status: 'PLAYING',
      currentQuestion: { ...first, totalQuestions: questions.length },
      score: 0,
      streak: 0,
      questionsAnswered: 0,
      totalQuestions: questions.length,
    }
  }

  async submitAnswer(input: SubmitAnswerInput): Promise<SubmitAnswerResult> {
    const { session, machine, pool, tracker, currentQuestion } = this.resolveSession(input.gameSessionId, input.questionId)
    const maxAttempts = GAME_ENGINE_CONFIG.MAX_ATTEMPTS_PER_QUESTION

    session.lastActivityAt = new Date()
    session.currentQuestionAttempts++
    machine.transition(GameState.WAITING_FOR_ANSWER)

    this.eventBus.emit(GameEventType.AnswerSubmitted, {
      gameSessionId: input.gameSessionId,
      questionId: input.questionId,
      attemptNumber: session.currentQuestionAttempts,
    })

    const validation = this.validator.validate(input.answer, currentQuestion.correctAnswer)

    if (validation.isCorrect) {
      return this.handleCorrectAnswer(session, machine, pool, tracker, currentQuestion, input.gameSessionId)
    }

    return this.handleWrongAnswer(session, machine, pool, tracker, currentQuestion, input.gameSessionId, maxAttempts)
  }

  private handleCorrectAnswer(
    session: GameSessionState,
    machine: GameMachine,
    pool: QuestionPool,
    tracker: ProgressTracker,
    currentQuestion: GameQuestion,
    gameSessionId: string,
  ): SubmitAnswerResult {
    session.totalCorrect++
    const pointsEarned = this.scoringSystem.calculatePoints(session.currentQuestionAttempts)
    session.streak++
    if (session.streak > session.bestStreak) {
      session.bestStreak = session.streak
    }
    const streakBonus = this.scoringSystem.calculateStreakBonus(session.streak)
    const totalEarned = pointsEarned + streakBonus
    session.score += totalEarned
    tracker.recordCorrect(totalEarned)

    this.eventBus.emit(GameEventType.CorrectAnswer, {
      pointsEarned, streakBonus, totalEarned,
      attemptNumber: session.currentQuestionAttempts,
    })
    this.eventBus.emit(GameEventType.StreakUpdated, {
      currentStreak: session.streak,
      bestStreak: session.bestStreak,
    })
    this.eventBus.emit(GameEventType.ScoreUpdated, { totalScore: session.score })

    machine.transition(GameState.CORRECT)

    if (pool.hasNext()) {
      return this.advanceToNext(session, machine, pool, tracker, currentQuestion, gameSessionId, totalEarned, streakBonus, true)
    }

    return this.completeGame(session, machine, currentQuestion, gameSessionId, totalEarned, streakBonus, true)
  }

  private handleWrongAnswer(
    session: GameSessionState,
    machine: GameMachine,
    pool: QuestionPool,
    tracker: ProgressTracker,
    currentQuestion: GameQuestion,
    gameSessionId: string,
    maxAttempts: number,
  ): SubmitAnswerResult {
    session.totalIncorrect++
    session.streak = 0
    tracker.recordIncorrect()

    this.eventBus.emit(GameEventType.WrongAnswer, {
      correctAnswer: currentQuestion.correctAnswer,
      attemptNumber: session.currentQuestionAttempts,
      remainingAttempts: maxAttempts - session.currentQuestionAttempts,
    })

    machine.transition(GameState.WRONG)

    if (session.currentQuestionAttempts < maxAttempts) {
      session.state = GameState.WAITING_FOR_ANSWER
      return {
        gameSessionId,
        isCorrect: false,
        attemptNumber: session.currentQuestionAttempts,
        correctAnswer: currentQuestion.correctAnswer,
        pointsEarned: 0,
        streakBonus: 0,
        totalScore: session.score,
        streak: 0,
        status: 'INCORRECT',
        message: '¡Casi! Intenta de nuevo.',
      }
    }

    if (pool.hasNext()) {
      return this.advanceToNext(session, machine, pool, tracker, currentQuestion, gameSessionId, 0, 0, false)
    }

    return this.completeGame(session, machine, currentQuestion, gameSessionId, 0, 0, false)
  }

  private advanceToNext(
    session: GameSessionState,
    machine: GameMachine,
    pool: QuestionPool,
    tracker: ProgressTracker,
    currentQuestion: GameQuestion,
    gameSessionId: string,
    pointsEarned: number,
    streakBonus: number,
    wasCorrect: boolean,
  ): SubmitAnswerResult {
    const next = pool.next()!
    session.currentQuestionIndex++
    session.currentQuestionAttempts = 0
    tracker.startQuestion(next.id)
    session.state = GameState.PLAYING

    machine.transition(GameState.NEXT_QUESTION)
    machine.transition(GameState.PLAYING)

    const message = wasCorrect ? undefined : `La respuesta era: ${currentQuestion.correctAnswer}`

    return {
      gameSessionId,
      isCorrect: wasCorrect,
      attemptNumber: session.currentQuestionAttempts,
      correctAnswer: currentQuestion.correctAnswer,
      pointsEarned,
      streakBonus,
      totalScore: session.score,
      streak: session.streak,
      status: wasCorrect ? 'CORRECT' : 'INCORRECT',
      nextQuestion: { ...next, totalQuestions: session.questions.length },
      message,
    }
  }

  private completeGame(
    session: GameSessionState,
    machine: GameMachine,
    currentQuestion: GameQuestion,
    gameSessionId: string,
    pointsEarned: number,
    streakBonus: number,
    wasCorrect: boolean,
  ): SubmitAnswerResult {
    machine.transition(GameState.GAME_FINISHED)
    session.state = GameState.GAME_FINISHED
    session.endTime = new Date()

    const result = this.buildResult(session)

    this.eventBus.emit(GameEventType.GameFinished, { gameSessionId, result })

    if (this.onCompleted) {
      this.onCompleted(gameSessionId, result).catch(() => {})
    }

    const message = wasCorrect ? undefined : `La respuesta era: ${currentQuestion.correctAnswer}`

    return {
      gameSessionId,
      isCorrect: wasCorrect,
      attemptNumber: session.currentQuestionAttempts,
      correctAnswer: currentQuestion.correctAnswer,
      pointsEarned,
      streakBonus,
      totalScore: session.score,
      streak: session.streak,
      status: 'COMPLETED',
      result,
      message,
    }
  }

  getState(gameSessionId: string): GameStateResponse {
    const session = this.sessions.get(gameSessionId)
    if (!session) throw new GameNotFoundError(gameSessionId)

    const current = session.questions[session.currentQuestionIndex]
    const total = session.totalCorrect + session.totalIncorrect
    const accuracy = total > 0 ? session.totalCorrect / total : 0

    return {
      gameSessionId: session.id,
      state: session.state,
      status: session.state,
      currentQuestion: current
        ? { ...current, totalQuestions: session.questions.length }
        : null,
      score: session.score,
      streak: session.streak,
      bestStreak: session.bestStreak,
      questionsAnswered: session.questionsAnswered,
      totalQuestions: session.questions.length,
      accuracy: Math.round(accuracy * 100) / 100,
    }
  }

  async finish(gameSessionId: string): Promise<GameResult> {
    const session = this.sessions.get(gameSessionId)
    if (!session) throw new GameNotFoundError(gameSessionId)

    const machine = this.machines.get(gameSessionId)
    if (!machine) {
      throw new GameAlreadyFinishedError(gameSessionId)
    }

    if (machine.getState() === GameState.GAME_FINISHED || machine.isFinished()) {
      throw new GameAlreadyFinishedError(gameSessionId)
    }

    machine.transition(GameState.GAME_FINISHED)
    session.state = GameState.GAME_FINISHED
    session.endTime = new Date()

    const result = this.buildResult(session)
    return result
  }

  async saveResults(gameSessionId: string): Promise<void> {
    const session = this.sessions.get(gameSessionId)
    if (!session) throw new GameNotFoundError(gameSessionId)

    const machine = this.machines.get(gameSessionId)
    if (machine) {
      machine.transition(GameState.SAVING_RESULTS)
    }

    const result = this.buildResult(session)

    await this.persistence.saveProgress({
      userId: session.userId,
      lessonId: session.lessonId,
      mode: session.mode,
      score: result.totalScore,
      totalCorrect: result.totalCorrect,
      totalIncorrect: result.totalIncorrect,
      totalQuestions: session.questions.length,
      bestStreak: result.bestStreak,
      streak: 0,
      stars: result.stars,
      completed: true,
      xpEarned: result.xpEarned,
      coinsEarned: result.coinsEarned,
    })

    this.eventBus.emit(GameEventType.ResultsSaved, { gameSessionId, result })

    this.cleanupSession(gameSessionId)

    if (machine) {
      machine.transition(GameState.END)
    }

    this.eventBus.emit(GameEventType.GameEnded, { gameSessionId })
  }

  private resolveSession(gameSessionId: string, questionId: string) {
    const session = this.sessions.get(gameSessionId)
    if (!session) throw new GameNotFoundError(gameSessionId)

    const machine = this.machines.get(gameSessionId)
    if (!machine || machine.isFinished()) {
      throw new GameAlreadyFinishedError(gameSessionId)
    }

    const pool = this.pools.get(gameSessionId)
    const tracker = this.trackers.get(gameSessionId)
    if (!pool || !tracker) throw new Error('Game session state corrupted')

    const currentQuestion = session.questions[session.currentQuestionIndex]
    if (!currentQuestion) throw new QuestionNotFoundError(questionId)
    if (currentQuestion.id !== questionId) {
      throw new QuestionNotFoundError(questionId)
    }

    return { session, machine, pool, tracker, currentQuestion }
  }

  private createSession(input: GameStartInput, questions: GameQuestion[]): GameSessionState {
    return {
      id: input.sessionId,
      userId: input.userId,
      lessonId: input.lessonId,
      mode: input.mode,
      state: GameState.READY,
      questions,
      currentQuestionIndex: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      currentQuestionAttempts: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      questionsAnswered: 0,
      startTime: new Date(),
      lastActivityAt: new Date(),
    }
  }

  private buildResult(session: GameSessionState): GameResult {
    const total = session.totalCorrect + session.totalIncorrect
    const accuracy = total > 0 ? session.totalCorrect / total : 0
    const elapsed = session.endTime
      ? session.endTime.getTime() - session.startTime.getTime()
      : Date.now() - session.startTime.getTime()
    const answered = Math.max(total, 1)

    return this.scoringSystem.buildResult({
      totalScore: session.score,
      totalCorrect: session.totalCorrect,
      totalIncorrect: session.totalIncorrect,
      bestStreak: session.bestStreak,
      totalTimeMs: elapsed,
      avgTimePerQuestionMs: Math.round(elapsed / answered),
    })
  }

  private transitionToEnd(machine: GameMachine, session: GameSessionState): void {
    machine.transition(GameState.GAME_FINISHED)
    session.state = GameState.GAME_FINISHED
    machine.transition(GameState.END)
  }

  private cleanupSession(sessionId: string): void {
    this.sessions.delete(sessionId)
    this.machines.delete(sessionId)
    this.pools.delete(sessionId)
    this.trackers.delete(sessionId)
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) return
    this.cleanupTimer = setInterval(() => {
      this.cleanupInactiveSessions(SESSION_MAX_AGE_MS)
    }, SESSION_CLEANUP_INTERVAL_MS)
  }

  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  getActiveSessionCount(): number {
    return this.sessions.size
  }

  cleanupInactiveSessions(maxAgeMs: number = SESSION_MAX_AGE_MS): void {
    const now = Date.now()
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActivityAt.getTime() >= maxAgeMs) {
        this.cleanupSession(id)
      }
    }
  }

  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId)
  }
}
