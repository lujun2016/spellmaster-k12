import { speak } from "@/lib/audio-service"

interface WrongWord {
  en: string
  zh: string
  phonetic: string
  userInput?: string
}

interface PracticeResultProps {
  correctRate: number
  totalWords: number
  correctCount: number
  wrongWords: WrongWord[]
  onBack: () => void
  onRetryWrong: () => void
  canRetry: boolean
}

export function PracticeResult({
  correctRate,
  totalWords,
  correctCount,
  wrongWords,
  onBack,
  onRetryWrong,
  canRetry,
}: PracticeResultProps) {
  const gradeColor =
    correctRate === 100 ? "text-yellow-500" :
    correctRate >= 90 ? "text-blue-500" :
    correctRate >= 70 ? "text-green-500" :
    "text-orange-500"

  return (
    <div className="max-w-2xl mx-auto">
      {/* 成绩总览 */}
      <div className="bg-white rounded-xl border shadow-sm p-8 text-center mb-6">
        <div className={`text-6xl font-bold ${gradeColor} mb-3`}>
          {correctRate}%
        </div>
        <p className="text-gray-500">
          正确 {correctCount} / 共 {totalWords} 题
        </p>
        <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden max-w-xs mx-auto">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${correctRate}%` }}
          />
        </div>
      </div>

      {/* 错词列表 */}
      {wrongWords.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-700">
              错词列表 ({wrongWords.length})
            </h3>
          </div>
          <div className="divide-y">
            {wrongWords.map((w, i) => (
              <div key={i} className="px-6 py-3 flex items-center gap-4">
                <span className="w-8 h-8 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{w.en}</div>
                  <div className="text-sm text-gray-400">{w.zh} · {w.phonetic}</div>
                  {w.userInput && (
                    <div className="text-sm text-red-400 line-through mt-0.5">
                      你写的: {w.userInput}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => speak(w.en)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 transition"
                  title="播放发音"
                >
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={onBack}
          className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
        >
          返回单元
        </button>
        {canRetry && wrongWords.length > 0 && (
          <button
            onClick={onRetryWrong}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            重做错词 ({wrongWords.length})
          </button>
        )}
      </div>
    </div>
  )
}
