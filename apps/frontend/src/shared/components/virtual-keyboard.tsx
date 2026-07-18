import { useState, useCallback, useEffect, useRef } from 'react'
import { useAudio } from '@/multimedia-engine/react/use-audio'

const HEXAGON = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

const NUMBERS = ['1','2','3','4','5','6','7','8','9','0']
const LETTER_ROWS = [
  ['A','B','C','D','E','F','G'],
  ['H','I','J','K','L','M','N'],
  ['O','P','Q','R','S','T','U'],
  ['V','W','X','Y','Z'],
]

const ROW_COLORS = [
  'bg-orange-400',
  'bg-sky-400',
  'bg-emerald-400',
  'bg-amber-400',
  'bg-violet-400',
]

interface VirtualKeyboardProps {
  disabled: boolean
  onSubmit: (answer: string) => void
  onFinish: () => void
  audioKey: string | null
}

export function VirtualKeyboard({ disabled, onSubmit, onFinish, audioKey }: VirtualKeyboardProps) {
  const [buffer, setBuffer] = useState('')
  const { isPlaying, play } = useAudio({ key: audioKey ?? '', autoPlay: false })
  const submitting = useRef(false)

  // Clear buffer when re-enabled after feedback
  const prevDisabled = useRef(disabled)
  useEffect(() => {
    if (prevDisabled.current === true && disabled === false) {
      setBuffer('')
    }
    prevDisabled.current = disabled
  }, [disabled])

  const handleKey = useCallback(
    (char: string) => {
      if (disabled || submitting.current) return
      submitting.current = true
      const next = buffer + char
      setBuffer(next)
      // reset guard after the next microtask so React can flush the disabled prop
      queueMicrotask(() => { submitting.current = false })
      onSubmit(next)
    },
    [disabled, buffer, onSubmit],
  )

  const keyBase = (color: string) =>
    `flex items-center justify-center aspect-[1.15] ${color} text-white font-bold text-sm sm:text-lg xl:text-xl select-none transition-all duration-100 active:translate-y-[2px] active:brightness-110 shadow-md active:shadow-inner`
  const speakerBase =
    'flex items-center justify-center size-14 rounded-full bg-yellow-400 text-white text-2xl shadow-lg transition-all duration-100 active:translate-y-[2px] active:brightness-110 select-none'

  return (
    <div
      className={`mx-auto w-full max-w-[580px] rounded-3xl bg-gradient-to-b from-fuchsia-400 to-fuchsia-500 p-3 shadow-xl sm:p-5 ${
        disabled ? 'pointer-events-none opacity-50' : ''
      }`}
    >
      {/* Speaker button */}
      <div className="mb-3 flex justify-center">
        <button
          type="button"
          onClick={play}
          disabled={isPlaying}
          className={speakerBase}
          aria-label="Play audio"
        >
          <span className={isPlaying ? 'animate-pulse' : ''}>
            {isPlaying ? '🔊' : '🔈'}
          </span>
        </button>
      </div>

      {/* Numbers row */}
      <div className="mb-2 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
        {NUMBERS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleKey(n)}
            className={keyBase('bg-orange-400')}
            style={{ clipPath: HEXAGON }}
            aria-label={n}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Letter rows */}
      {LETTER_ROWS.map((row, ri) => (
        <div key={ri} className="mb-2 grid grid-cols-7 gap-1.5">
          {row.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => handleKey(ch)}
              className={keyBase(ROW_COLORS[ri])}
              style={{ clipPath: HEXAGON }}
              aria-label={ch}
            >
              {ch}
            </button>
          ))}
          {/* Fill empty cells so hexagons align */}
          {row.length < 7 &&
            Array.from({ length: 7 - row.length }).map((_, i) => (
              <div key={`empty-${ri}-${i}`} />
            ))}
        </div>
      ))}

      {/* Quit */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onFinish}
          className={`${keyBase('bg-rose-500')} min-w-[80px]`}
          style={{ clipPath: HEXAGON }}
          aria-label="Quit game"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
