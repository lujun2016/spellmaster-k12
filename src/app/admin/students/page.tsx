import { getStudents } from "@/app/admin/actions"
import { StudentsManager } from "@/components/StudentsManager"

export default async function AdminStudentsPage() {
  const students = await getStudents()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">学生管理</h1>
      <StudentsManager students={students} />
    </div>
  )
}
