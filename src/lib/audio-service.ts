/**
 * 音频服务 — 当前使用 Web Speech API，后续可替换为真人录音/TTS
 */
let customAudioFn: ((text: string) => void) | null = null

export function setAudioPlayer(fn: (text: string) => void) {
  customAudioFn = fn
}

export function speak(text: string): void {
  if (customAudioFn) {
    customAudioFn(text)
    return
  }

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Web Speech API 不可用")
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = "en-US"
  utterance.rate = 0.9
  utterance.pitch = 1.0

  // 尝试选一个英语语音
  const voices = window.speechSynthesis.getVoices()
  const enVoice = voices.find(
    (v) => v.lang.startsWith("en") && v.name.includes("Samantha")
  ) || voices.find(
    (v) => v.lang.startsWith("en-US")
  ) || voices.find(
    (v) => v.lang.startsWith("en")
  )
  if (enVoice) utterance.voice = enVoice

  window.speechSynthesis.speak(utterance)
}
