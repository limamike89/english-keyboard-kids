import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'

const AUDIO_DIR = join(import.meta.dirname, '..', 'public', 'audio')

const LANGUAGES = {
  en: {
    letters: 'abcdefghijklmnopqrstuvwxyz'.split(''),
    numbers: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
  },
  es: {
    letters: 'abcdefghijklmnopqrstuvwxyz'.split(''),
    numbers: ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'],
  },
}

const GOOGLE_TTS_URL = 'https://translate.google.com/translate_tts'

function ttsUrl(lang, text) {
  return `${GOOGLE_TTS_URL}?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`
}

async function downloadMp3(url, filePath) {
  if (existsSync(filePath)) {
    console.log(`  SKIP ${filePath} (already exists)`)
    return
  }
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'audio/mpeg',
    },
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  writeFileSync(filePath, buffer)
  console.log(`  OK ${filePath}`)
}

async function generateAll() {
  for (const [lang, config] of Object.entries(LANGUAGES)) {
    // Letters
    const letterDir = join(AUDIO_DIR, lang, 'letter')
    mkdirSync(letterDir, { recursive: true })

    for (const letter of config.letters) {
      const filePath = join(letterDir, `${letter}.mp3`)
      const url = ttsUrl(lang, letter)
      await downloadMp3(url, filePath)
    }

    // Numbers
    const numberDir = join(AUDIO_DIR, lang, 'number')
    mkdirSync(numberDir, { recursive: true })

    for (const [i, word] of config.numbers.entries()) {
      const filePath = join(numberDir, `${i}.mp3`)
      const url = ttsUrl(lang, word)
      await downloadMp3(url, filePath)
    }
  }
}

console.log('Generating audio files...')
generateAll()
  .then(() => console.log('Done!'))
  .catch((err) => {
    console.error('Failed:', err.message)
    process.exit(1)
  })
