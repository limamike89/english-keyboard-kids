interface HeroProps {
  displayName: string
}

export function Hero({ displayName }: HeroProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <span className="text-7xl" role="img" aria-label="alphabet">
        🔤
      </span>
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">
        English Keyboard Kids
      </h1>
      <p className="max-w-md text-lg text-gray-600">
        Hello <span className="font-semibold text-sky-600">{displayName}</span>!
        Pick a mode and start learning English by listening and typing.
      </p>
    </div>
  )
}
