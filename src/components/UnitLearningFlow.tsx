"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { VideoPlayer } from "@/components/VideoPlayer"
import { SpellingPractice } from "@/components/SpellingPractice"
import { ResultAnimation } from "@/components/ResultAnimation"
import { PracticeResult } from "@/components/PracticeResult"
import { saveLessonRecord, saveSpellingAttempts } from "@/app/student/units/actions"
import { startChallenge, completeChallenge, handleLessonPerfect } from "@/app/student/units/challenge-actions"
import { getRankDisplayName } from "@/lib/rank-service"

interface WordItem {
  id: string
  en: string
  zh: string
  phonetic: string
}

interface UnitInfo {
  id: string
  name: string
  gradeName: string
  textbookName: string
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

type FlowState = "overview" | "watching" | "practicing" | "animation" | "result"
| "challenge-practicing" | "challenge-animation" | "challenge-result"

export function UnitLearningFlow({
  unit,
  words,
  hasVideo,
  alreadyWatched,
  isUnitCompleted,
  hasCompletedChallenge,
  userId,
}: {
  unit: UnitInfo
  words: WordItem[]
  hasVideo: boolean
  alreadyWatched: boolean
  isUnitCompleted: boolean
  hasCompletedChallenge: boolean
  userId: string
}) {
  const [flowState, setFlowState] = useState<FlowState>("overview")
  const [practiceWords, setPracticeWords] = useState<WordItem[]>(words)
  const [lastResults, setLastResults] = useState<SpellingResult[]>([])
  const [lastCorrectRate, setLastCorrectRate] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [rankUpMessage, setRankUpMessage] = useState("")
  const [unitCompleted, setUnitCompleted] = useState(isUnitCompleted)
  const [challengeDone, setChallengeDone] = useState(hasCompletedChallenge)
  const [challengeQuestions, setChallengeQuestions] = useState<WordItem[]>([])
  const [challengeResult, setChallengeResult] = useState<{
    correctRate: number
    totalQuestions: number
    correctCount: number
    isPerfect: boolean
    rankResult: { newRank: string } | null
  } | null>(null)

  // 开始拼写
  const handleStartPractice = useCallback(() => {
    setPracticeWords(words)
    setRankUpMessage("")
    setFlowState("practicing")
  }, [words])

  // 重做错词
  const handleRetryWrong = useCallback(() => {
    setFlowState("practicing")
  }, [])

  // 拼写完成
  const handlePracticeComplete = useCallback(
    async (results: SpellingResult[], correctRate: number) => {
      setLastResults(results)
      setLastCorrectRate(correctRate)

      const isPerfect = correctRate === 100
      const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0)
      const wrongWordIds = results.filter((r) => !r.isCorrect).map((r) => r.wordId)

      try {
        await saveLessonRecord({
          userId,
          unitId: unit.id,
          totalWords: results.length,
          correctCount: results.filter((r) => r.isCorrect).length,
          timeSpent: totalTime,
          isPerfect,
          wrongWordIds,
          attemptCount: retryCount + 1,
        })

        await saveSpellingAttempts(
          results.map((r) => ({
            userId,
            wordId: r.wordId,
            unitId: unit.id,
            userInput: r.userInput,
            isCorrect: r.isCorrect,
            timeSpent: r.timeSpent,
          }))
        )

        // 全对 → 尝试升级段位
        if (isPerfect) {
          const rankResult = await handleLessonPerfect(userId, unit.id)
          if (rankResult?.upgraded) {
            setRankUpMessage(`段位升级！你已晋升为 ${rankResult.newRank}`)
            setUnitCompleted(true)
          }
        }
      } catch (e) {
        console.error("保存记录失败:", e)
      }

      setFlowState("animation")
    },
    [userId, unit.id, retryCount]
  )

  // 动画确认 → 成绩详情
  const handleAnimationConfirm = useCallback(() => {
    setFlowState("result")
  }, [])

  // 开始单元挑战
  const handleStartChallenge = useCallback(async () => {
    try {
      const data = await startChallenge(unit.id)
      setChallengeQuestions(data.questions)
      setFlowState("challenge-practicing")
    } catch (e: any) {
      alert(e.message || "无法开始挑战")
    }
  }, [unit.id])

  // 挑战完成
  const handleChallengeComplete = useCallback(
    async (results: SpellingResult[], correctRate: number) => {
      const mapped = results.map((r) => ({
        wordId: r.wordId,
        userInput: r.userInput,
        isCorrect: r.isCorrect,
        timeSpent: r.timeSpent,
      }))

      try {
        const data = await completeChallenge(unit.id, mapped)
        setChallengeResult(data)
        setLastCorrectRate(correctRate)
        setLastResults(results)

        if (data.isPerfect) {
          setChallengeDone(true)
        }
      } catch (e) {
        console.error("挑战保存失败:", e)
      }

      setFlowState("challenge-animation")
    },
    [unit.id]
  )

  // 挑战动画确认
  const handleChallengeAnimationConfirm = useCallback(() => {
    setFlowState("challenge-result")
  }, [])

  const wrongResults = lastResults.filter((r) => !r.isCorrect)
  const correctCount = lastResults.filter((r) => r.isCorrect).length
  const canRetry = wrongResults.length > 0

  const isChallengeMode = flowState.startsWith("challenge-")

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-6">
          <Link href="/student/units" className="text-sm text-gray-500 hover:text-blue-600">
            &larr; 返回
          </Link>
          <h1 className="font-medium text-gray-800">{unit.name}</h1>
          <span className="text-xs text-gray-400">
            {unit.textbookName} · {unit.gradeName}
          </span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          {flowState === "practicing" ? "拼写练习" :
           flowState === "challenge-practicing" ? "单元挑战" :
           flowState === "result" || flowState === "challenge-result" ? "成绩" :
           "单词学习"}
        </h2>

        {/* 概览 */}
        {(flowState === "overview") && (
          <div className="space-y-6">
            <VideoPlayer
              hasVideo={hasVideo}
              onComplete={() => {}}
              alreadyWatched={alreadyWatched}
            />

            {/* 段位升级提示 */}
            {rankUpMessage && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-700 font-medium">{rankUpMessage}</p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="text-center space-y-3">
              <button
                onClick={handleStartPractice}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-lg"
              >
                开始拼写 ({words.length} 词)
              </button>

              {unitCompleted && !challengeDone && (
                <div>
                  <button
                    onClick={handleStartChallenge}
                    className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition text-lg"
                  >
                    单元挑战
                  </button>
                  <p className="text-sm text-gray-400 mt-2">
                    完成挑战全对可晋升段位
                  </p>
                </div>
              )}

              {challengeDone && (
                <div className="text-green-600 text-sm font-medium">
                  本单元挑战已完成
                </div>
              )}
            </div>

            {/* 单词列表 */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-700">
                  本单元单词 ({words.length})
                </h3>
              </div>
              <div className="divide-y">
                {words.map((w) => (
                  <div key={w.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-800">{w.en}</span>
                      <span className="text-gray-400 mx-2">-</span>
                      <span className="text-gray-600">{w.zh}</span>
                    </div>
                    <span className="text-sm text-gray-400">{w.phonetic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 拼写练习 */}
        {flowState === "practicing" && (
          <SpellingPractice
            words={practiceWords}
            unitId={unit.id}
            onComplete={handlePracticeComplete}
            onBack={() => setFlowState("overview")}
          />
        )}

        {/* 单元挑战拼写 */}
        {flowState === "challenge-practicing" && (
          <SpellingPractice
            words={challengeQuestions}
            unitId={unit.id}
            onComplete={handleChallengeComplete}
            onBack={() => setFlowState("overview")}
          />
        )}

        {/* 成绩动画 */}
        {flowState === "animation" && (
          <ResultAnimation
            correctRate={lastCorrectRate}
            totalWords={lastResults.length}
            correctCount={correctCount}
            wrongWords={wrongResults.map((r) => ({
              en: r.en, zh: r.zh, phonetic: r.phonetic, userInput: r.userInput,
            }))}
            onConfirm={handleAnimationConfirm}
          />
        )}

        {/* 挑战成绩动画 */}
        {flowState === "challenge-animation" && challengeResult && (
          <ResultAnimation
            correctRate={challengeResult.correctRate}
            totalWords={challengeResult.totalQuestions}
            correctCount={challengeResult.correctCount}
            wrongWords={lastResults.filter((r) => !r.isCorrect).map((r) => ({
              en: r.en, zh: r.zh, phonetic: r.phonetic, userInput: r.userInput,
            }))}
            onConfirm={handleChallengeAnimationConfirm}
          />
        )}

        {/* 练习成绩 */}
        {flowState === "result" && (
          <PracticeResult
            correctRate={lastCorrectRate}
            totalWords={lastResults.length}
            correctCount={correctCount}
            wrongWords={wrongResults.map((r) => ({
              en: r.en, zh: r.zh, phonetic: r.phonetic, userInput: r.userInput,
            }))}
            onBack={() => setFlowState("overview")}
            onRetryWrong={() => {
              const wrongWordObjs = words.filter((w) =>
                wrongResults.some((r) => r.wordId === w.id)
              )
              setPracticeWords(wrongWordObjs)
              setRetryCount((c) => c + 1)
              handleRetryWrong()
            }}
            canRetry={canRetry}
          />
        )}

        {/* 挑战成绩 */}
        {flowState === "challenge-result" && challengeResult && (
          <div className="max-w-2xl mx-auto space-y-6">
            <PracticeResult
              correctRate={challengeResult.correctRate}
              totalWords={challengeResult.totalQuestions}
              correctCount={challengeResult.correctCount}
              wrongWords={lastResults.filter((r) => !r.isCorrect).map((r) => ({
                en: r.en, zh: r.zh, phonetic: r.phonetic, userInput: r.userInput,
              }))}
              onBack={() => setFlowState("overview")}
              onRetryWrong={() => {}}
              canRetry={false}
            />
            {challengeResult.rankResult && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-xl p-6 text-center">
                <p className="text-lg font-bold text-yellow-700">
                  段位晋升！
                </p>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  {challengeResult.rankResult.newRank}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
