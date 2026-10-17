import { getTextbooks } from "@/app/admin/actions"
import { WordsManager } from "@/components/WordsManager"

export default async function AdminWordsPage() {
  const textbooks = await getTextbooks()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">词库管理</h1>
      <WordsManager textbooks={textbooks} />
    </div>
  )
}
