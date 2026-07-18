import { GameState, GameEventType } from './types'
import { InvalidTransitionError } from '../errors/game-errors'
import { EventBus } from './event-bus'

type TransitionMap = Partial<Record<GameState, GameState[]>>

const VALID_TRANSITIONS: TransitionMap = {
  [GameState.INITIAL]: [GameState.LOADING],
  [GameState.LOADING]: [GameState.READY, GameState.END],
  [GameState.READY]: [GameState.PLAYING, GameState.END],
  [GameState.PLAYING]: [GameState.WAITING_FOR_ANSWER, GameState.GAME_FINISHED],
  [GameState.WAITING_FOR_ANSWER]: [GameState.CORRECT, GameState.WRONG],
  [GameState.CORRECT]: [GameState.NEXT_QUESTION, GameState.GAME_FINISHED],
  [GameState.WRONG]: [GameState.WAITING_FOR_ANSWER, GameState.NEXT_QUESTION, GameState.GAME_FINISHED],
  [GameState.NEXT_QUESTION]: [GameState.PLAYING, GameState.GAME_FINISHED],
  [GameState.GAME_FINISHED]: [GameState.SAVING_RESULTS],
  [GameState.SAVING_RESULTS]: [GameState.END],
  [GameState.END]: [],
}

export class GameMachine {
  private currentState: GameState = GameState.INITIAL
  private eventBus: EventBus

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
  }

  getState(): GameState {
    return this.currentState
  }

  canTransition(to: GameState): boolean {
    const allowed = VALID_TRANSITIONS[this.currentState]
    return allowed ? allowed.includes(to) : false
  }

  transition(to: GameState): void {
    if (!this.canTransition(to)) {
      throw new InvalidTransitionError(this.currentState, to)
    }

    const from = this.currentState
    this.currentState = to

    this.eventBus.emit(GameEventType.StateChanged, {
      from,
      to,
    })
  }

  reset(): void {
    this.currentState = GameState.INITIAL
  }

  isFinished(): boolean {
    return this.currentState === GameState.END
  }

  isPlaying(): boolean {
    return [
      GameState.PLAYING,
      GameState.WAITING_FOR_ANSWER,
      GameState.CORRECT,
      GameState.WRONG,
      GameState.NEXT_QUESTION,
    ].includes(this.currentState)
  }
}
