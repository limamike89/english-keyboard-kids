import { VirtualKeyboard } from '@/shared/components/virtual-keyboard'

interface AnswerInputProps {
  disabled: boolean
  onSubmit: (answer: string) => void
  onFinish: () => void
  audioKey: string | null
}

export function AnswerInput({ disabled, onSubmit, onFinish, audioKey }: AnswerInputProps) {
  return <VirtualKeyboard disabled={disabled} onSubmit={onSubmit} onFinish={onFinish} audioKey={audioKey} />
}
