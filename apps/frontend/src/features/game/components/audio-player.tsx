import { useAudio } from '@/multimedia-engine/react/use-audio'

interface AudioPlayerProps {
  audioKey: string | null
  autoPlay?: boolean
  onEnded?: () => void
}

export function AudioPlayer({ audioKey, autoPlay = true, onEnded }: AudioPlayerProps) {
  const { isPlaying, play } = useAudio({
    key: audioKey ?? '',
    autoPlay: autoPlay && !!audioKey,
    onEnded,
  })

  if (!audioKey) return null

  return (
    <button
      type="button"
      onClick={play}
      disabled={isPlaying}
      className="flex size-16 items-center justify-center rounded-full bg-sky-500 text-3xl text-white shadow-lg transition hover:bg-sky-600 active:scale-95 disabled:opacity-70"
      aria-label={isPlaying ? 'Playing...' : 'Play audio'}
    >
      <span className={isPlaying ? 'animate-pulse' : ''}>
        {isPlaying ? '🔊' : '🔈'}
      </span>
    </button>
  )
}
