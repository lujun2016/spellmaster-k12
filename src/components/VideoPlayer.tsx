"use client"

import { useState, useRef, useEffect, useCallback } from "react"

interface VideoPlayerProps {
  hasVideo: boolean
  /** 模拟视频时长 (秒), 默认 10 */
  simulatedDuration?: number
  onComplete: () => void
  alreadyWatched: boolean
}

export function VideoPlayer({
  hasVideo,
  simulatedDuration = 10,
  onComplete,
  alreadyWatched,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1.0)
  const [timeLeft, setTimeLeft] = useState(simulatedDuration)
  const [completed, setCompleted] = useState(alreadyWatched)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const speeds = [1.0, 1.1, 1.2]

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    setPlaying(true)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const step = 1 * speed
        if (prev <= step) {
          stopTimer()
          setPlaying(false)
          setCompleted(true)
          return 0
        }
        return prev - step
      })
    }, 1000)
  }, [speed, stopTimer])

  useEffect(() => {
    return () => stopTimer()
  }, [stopTimer])

  useEffect(() => {
    if (completed) {
      onComplete()
    }
  }, [completed, onComplete])

  const totalTime = simulatedDuration
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* 视频区域 */}
      <div className="relative bg-black aspect-video flex items-center justify-center">
        {!hasVideo ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">视频尚未上传</p>
          </div>
        ) : (
          <p className="text-gray-400">视频加载中...</p>
        )}

        {/* 进度条 (只读) */}
        {playing && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div
              className="h-full bg-blue-500 transition-all duration-1000 linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* 控制栏 */}
      <div className="px-4 py-3 flex items-center justify-between bg-gray-50 border-t">
        <div className="flex items-center gap-3">
          {!completed ? (
            playing ? (
              <button
                onClick={() => { stopTimer(); setPlaying(false) }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition"
                title="暂停"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <button
                onClick={startTimer}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 transition"
                title="播放"
              >
                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </button>
            )
          ) : (
            <span className="text-sm text-green-600 font-medium">已观看</span>
          )}

          <span className="text-sm text-gray-500">
            {Math.ceil(timeLeft)}s
          </span>
        </div>

        {/* 倍速 */}
        <div className="flex items-center gap-1">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => !completed && setSpeed(s)}
              disabled={completed}
              className={`px-2 py-1 text-xs rounded transition ${
                speed === s && !completed
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-500 hover:text-gray-700"
              } ${completed ? "opacity-50 cursor-default" : ""}`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
