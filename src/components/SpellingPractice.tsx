"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { speak } from "@/lib/audio-service"

interface Word {
  id: string
  en: string
  zh: string
  phonetic: string
}

interface SpellingResult {
  wordId: string
  en: string
  zh: string
  phonetic: string
  userInput: string
  isCorrect: boolean
  timeSpent: number
}

interface SpellingPracticeProps {
  words: Word[]
  unitId: string
  onComplete: (results: SpellingResult[], correctRate: number) => void
  onBack: () => void
}

export function SpellingPractice({ words, unitId, onComplete, onBack }: SpellingPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [results, setResults] = useState<SpellingResult[]>([])
  const [showingResult, setShowingResult] = useState(false)
  const [lastResult, setLastResult] = useState<{ correct: boolean; answer: string } | null>(null)
  const [startTime, setStartTime] = useState(Date.now())
  const inputRef = useRef<HTMLInputElement>(null)

  const currentWord = words[currentIndex]
  const progress = words.length > 0 ? ((currentIndex) / words.length) * 100 : 0

  // 聚焦输入框
  useEffect(() => {
    if (!showingResult) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, showingResult])

  // 提交当前答案
  const submitAnswer = useCallback(() => {
    if (showingResult || !currentWord) return

    const trimmed = userInput.trim()
    if (!trimmed) return

    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    const isCorrect = trimmed.toLowerCase() === currentWord.en.toLowerCase()

    const result: SpellingResult = {
      wordId: currentWord.id,
      en: currentWord.en,
      zh: currentWord.zh,
      phonetic: currentWord.phonetic,
      userInput: trimmed,
      isCorrect,
      timeSpent,
    }

    setResults((prev) => [...prev, result])
    setLastResult({ correct: isCorrect, answer: currentWord.en })
    setShowingResult(true)

    // 播放发音
    setTimeout(() => speak(currentWord.en), 200)
  }, [userInput, showingResult, currentWord, startTime])

  // 进入下一题或完成
  const nextWord = useCallback(() => {
    setShowingResult(false)
    setLastResult(null)
    setUserInput("")

    if (currentIndex + 1 >= words.length) {
      // 全部完成
      const allResults = [...results]
      const correctCount = allResults.filter((r) => r.isCorrect).length
      const correctRate = Math.round((correctCount / allResults.length) * 100)
      onComplete(allResults, correctRate)
    } else {
      setCurrentIndex((prev) => prev + 1)
      setStartTime(Date.now())
    }
  }, [currentIndex, results, words.length, onComplete])

  // 结果展示时监听全局 Enter，因输入框已被 disabled 无法捕获按键
  useEffect(() => {
    if (!showingResult) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        nextWord()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [showingResult, nextWord])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        if (showingResult) {
          nextWord()
        } else {
          submitAnswer()
        }
      }
    },
    [showingResult, submitAnswer, nextWord]
  )

  if (!currentWord) {
    return (
      <div className="text-center py-20 text-gray-500">
        暂无单词
        <button onClick={onBack} className="block mx-auto mt-4 text-blue-500">
          返回
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 进度条 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {words.length}
          </span>
          <span className="text-sm text-gray-400">
            正确: {results.filter((r) => r.isCorrect).length}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 题目卡片 */}
      <div className="bg-white rounded-xl border shadow-sm p-8">
        {/* 中文提示 */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-400 mb-2">请输入对应的英文单词</p>
          <p className="text-3xl font-bold text-gray-800">{currentWord.zh}</p>
        </div>

        {/* 输入区域 */}
        <div className="max-w-sm mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={showingResult}
            className="w-full text-center px-4 py-4 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition disabled:bg-gray-50"
            placeholder="输入英文..."
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {!showingResult ? (
            <button
              onClick={submitAnswer}
              disabled={!userInput.trim()}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition"
            >
              确认 (Enter)
            </button>
          ) : (
            <button
              onClick={nextWord}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              {currentIndex + 1 >= words.length ? "查看成绩" : "下一题 (Enter)"}
            </button>
          )}
        </div>

        {/* 结果反馈 */}
        {showingResult && lastResult && (
          <div className={`mt-6 p-4 rounded-lg text-center ${
            lastResult.correct ? "bg-green-50" : "bg-red-50"
          }`}>
            {lastResult.correct ? (
              <div>
                <p className="text-green-600 font-medium text-lg">
                  {lastResult.answer}
                </p>
                <p className="text-green-500 text-sm mt-1">{currentWord.phonetic}</p>
              </div>
            ) : (
              <div>
                <p className="text-red-500 text-sm">你的输入:</p>
                <p className="text-red-500 line-through">{userInput}</p>
                <p className="text-green-600 font-medium text-lg mt-2">
                  正确答案: {lastResult.answer}
                </p>
                <p className="text-green-500 text-sm mt-1">{currentWord.phonetic}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
