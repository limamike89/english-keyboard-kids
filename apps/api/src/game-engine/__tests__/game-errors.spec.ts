import {
  GameEngineError,
  GameNotFoundError,
  InvalidTransitionError,
  QuestionNotFoundError,
  GameAlreadyFinishedError,
  UnauthorizedGameAccessError,
  InvalidEventError,
} from '../errors/game-errors'
import { GameState, GameEventType } from '../core/types'

describe('GameEngine Errors', () => {
  describe('GameEngineError (base)', () => {
    it('should create with message and name', () => {
      const error = new GameEngineError('test error')
      expect(error.message).toBe('test error')
      expect(error.name).toBe('GameEngineError')
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('GameNotFoundError', () => {
    it('should include sessionId in message', () => {
      const error = new GameNotFoundError('session-123')
      expect(error.message).toContain('session-123')
      expect(error.name).toBe('GameNotFoundError')
      expect(error).toBeInstanceOf(GameEngineError)
    })
  })

  describe('InvalidTransitionError', () => {
    it('should include from and to states in message', () => {
      const error = new InvalidTransitionError(GameState.PLAYING, GameState.END)
      expect(error.message).toContain('PLAYING')
      expect(error.message).toContain('END')
      expect(error.name).toBe('InvalidTransitionError')
    })
  })

  describe('QuestionNotFoundError', () => {
    it('should include questionId in message', () => {
      const error = new QuestionNotFoundError('q-42')
      expect(error.message).toContain('q-42')
      expect(error.name).toBe('QuestionNotFoundError')
    })
  })

  describe('GameAlreadyFinishedError', () => {
    it('should include sessionId in message', () => {
      const error = new GameAlreadyFinishedError('session-999')
      expect(error.message).toContain('session-999')
      expect(error.name).toBe('GameAlreadyFinishedError')
      expect(error).toBeInstanceOf(GameEngineError)
    })
  })

  describe('UnauthorizedGameAccessError', () => {
    it('should have standard message', () => {
      const error = new UnauthorizedGameAccessError()
      expect(error.message).toContain('not belong to this user')
      expect(error.name).toBe('UnauthorizedGameAccessError')
    })
  })

  describe('InvalidEventError', () => {
    it('should include event in message', () => {
      const error = new InvalidEventError(GameEventType.GameStarted)
      expect(error.message).toContain('GameStarted')
      expect(error.name).toBe('InvalidEventError')
    })
  })
})
