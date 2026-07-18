import { GameState, GameEventType } from '../core/types'

export class GameEngineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GameEngineError'
  }
}

export class GameNotFoundError extends GameEngineError {
  constructor(sessionId: string) {
    super(`Game session not found: ${sessionId}`)
    this.name = 'GameNotFoundError'
  }
}

export class InvalidTransitionError extends GameEngineError {
  constructor(from: GameState, to: GameState) {
    super(`Invalid state transition: ${from} → ${to}`)
    this.name = 'InvalidTransitionError'
  }
}

export class QuestionNotFoundError extends GameEngineError {
  constructor(questionId: string) {
    super(`Question not found: ${questionId}`)
    this.name = 'QuestionNotFoundError'
  }
}

export class GameAlreadyFinishedError extends GameEngineError {
  constructor(sessionId: string) {
    super(`Game session already finished: ${sessionId}`)
    this.name = 'GameAlreadyFinishedError'
  }
}

export class UnauthorizedGameAccessError extends GameEngineError {
  constructor() {
    super('Game session does not belong to this user')
    this.name = 'UnauthorizedGameAccessError'
  }
}

export class InvalidEventError extends GameEngineError {
  constructor(event: GameEventType) {
    super(`Invalid event: ${event}`)
    this.name = 'InvalidEventError'
  }
}
