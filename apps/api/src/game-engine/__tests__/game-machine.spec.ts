import { GameMachine } from '../core/game-machine'
import { EventBus } from '../core/event-bus'
import { GameState } from '../core/types'
import { InvalidTransitionError } from '../errors/game-errors'

describe('GameMachine', () => {
  const createMachine = () => new GameMachine(new EventBus())

  it('should start in INITIAL state', () => {
    const m = createMachine()
    expect(m.getState()).toBe(GameState.INITIAL)
  })

  it('should not be finished initially', () => {
    const m = createMachine()
    expect(m.isFinished()).toBe(false)
  })

  it('should transition INITIAL → LOADING', () => {
    const m = createMachine()
    m.transition(GameState.LOADING)
    expect(m.getState()).toBe(GameState.LOADING)
  })

  it('should follow full game flow to END', () => {
    const m = createMachine()
    m.transition(GameState.LOADING)
    m.transition(GameState.READY)
    m.transition(GameState.PLAYING)
    m.transition(GameState.WAITING_FOR_ANSWER)
    m.transition(GameState.CORRECT)
    m.transition(GameState.GAME_FINISHED)
    m.transition(GameState.SAVING_RESULTS)
    m.transition(GameState.END)
    expect(m.getState()).toBe(GameState.END)
    expect(m.isFinished()).toBe(true)
  })

  it('should throw on invalid transition', () => {
    const m = createMachine()
    expect(() => m.transition(GameState.PLAYING)).toThrow(InvalidTransitionError)
  })

  it('should throw on PLAYING → END', () => {
    const m = createMachine()
    m.transition(GameState.LOADING)
    m.transition(GameState.READY)
    m.transition(GameState.PLAYING)
    expect(() => m.transition(GameState.END)).toThrow(InvalidTransitionError)
  })

  it('should check valid transitions', () => {
    const m = createMachine()
    expect(m.canTransition(GameState.LOADING)).toBe(true)
    expect(m.canTransition(GameState.END)).toBe(false)
  })

  it('should return to INITIAL on reset', () => {
    const m = createMachine()
    m.transition(GameState.LOADING)
    m.reset()
    expect(m.getState()).toBe(GameState.INITIAL)
  })

  it('should be playing during active states', () => {
    const m = createMachine()
    m.transition(GameState.LOADING)
    m.transition(GameState.READY)
    m.transition(GameState.PLAYING)
    expect(m.isPlaying()).toBe(true)
  })

  it('should not be playing after end', () => {
    const m = createMachine()
    m.transition(GameState.LOADING)
    m.transition(GameState.READY)
    m.transition(GameState.PLAYING)
    m.transition(GameState.WAITING_FOR_ANSWER)
    m.transition(GameState.CORRECT)
    m.transition(GameState.GAME_FINISHED)
    m.transition(GameState.SAVING_RESULTS)
    m.transition(GameState.END)
    expect(m.isPlaying()).toBe(false)
  })
})
