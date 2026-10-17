"use client"

import { useState, useCallback, useRef } from "react"
import { createStudent, deleteStudent, updateStudentRank, updateStudentInfo, getStudentPracticeHistory, exportStudentDataCsv } from "@/app/admin/actions"
import { getRankDisplayName } from "@/lib/rank-service"

interface Student {
  id: string; username: string; name: string
  currentRank: string; rankValue: number
  gradeLevel: number | null; parentPhone: string | null
  notes: string | null; avatar: string | null
  createdAt: Date
  _count: { lessonRecords: number; unitChallenges: number }
}

export function StudentsManager({ students: initial }: { students: Student[] }) {
  const [students, setStudents] = useState(initial)
  const [showCreate, setShowCreate] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editingRank, setEditingRank] = useState<string | null>(null)
  const [newRankValue, setNewRankValue] = useState("")
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [practiceHistory, setPracticeHistory] = useState<any>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [exportStart, setExportStart] = useState("")
  const [exportEnd, setExportEnd] = useState("")
  const [exporting, setExporting] = useState(false)

  // 新增表单
  const [newName, setNewName] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newGrade, setNewGrade] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const refresh = () => window.location.reload()

  // 创建学生
  const handleCreate = useCallback(async () => {
    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) {
      alert("姓名、用户名、密码为必填")
      return
    }
    try {
      const student = await createStudent({
        name: newName.trim(),
        username: newUsername.trim(),
        password: newPassword,
        gradeLevel: parseInt(newGrade) || undefined,
        parentPhone: newPhone.trim() || undefined,
        notes: newNotes.trim() || undefined,
      })
      // 如果有文件，上传头像
      const file = fileRef.current?.files?.[0]
      if (file) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("studentId", student.id)
        const res = await fetch("/api/admin/upload-avatar", { method: "POST", body: formData })
        const json = await res.json()
        if (json.avatarUrl) {
          await updateStudentInfo(student.id, { avatar: json.avatarUrl })
        }
      }
      setShowCreate(false)
      setNewName(""); setNewUsername(""); setNewPassword("")
      setNewGrade(""); setNewPhone(""); setNewNotes("")
      if (fileRef.current) fileRef.current.value = ""
      refresh()
    } catch (e: any) { alert(e.message || "创建失败") }
  }, [newName, newUsername, newPassword, newGrade, newPhone, newNotes])

  // 删除学生
  const handleDelete = useCallback(async (userId: string, name: string) => {
    if (!confirm(`确定删除"${name}"吗？所有学习记录将一并删除，不可恢复。`)) return
    try {
      await deleteStudent(userId)
      setStudents((prev) => prev.filter((s) => s.id !== userId))
      setDetailId(null)
    } catch (e: any) { alert(e.message) }
  }, [])

  // 修改段位
  const handleUpdateRank = useCallback(async (userId: string) => {
    const val = parseInt(newRankValue)
    if (isNaN(val) || val < 1) return
    try {
      const result = await updateStudentRank(userId, val)
      setStudents((prev) =>
        prev.map((s) => s.id === userId ? { ...s, rankValue: val, currentRank: result.newRank } : s)
      )
      setEditingRank(null); setNewRankValue("")
    } catch (e: any) { alert(e.message) }
  }, [newRankValue])

  // 修改字段
  const handleUpdateField = useCallback(async (userId: string, field: string, value: string) => {
    try {
      const parsed = field === "gradeLevel" ? (parseInt(value) || null) : value
      await updateStudentInfo(userId, { [field]: parsed })
      setStudents((prev) =>
        prev.map((s) => s.id === userId ? { ...s, [field]: parsed } : s)
      )
    } catch (e: any) { alert(e.message) }
  }, [])

  // 上传头像
  const handleUploadAvatar = useCallback(async (studentId: string, file: File) => {
    setUploadingId(studentId)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("studentId", studentId)
      const res = await fetch("/api/admin/upload-avatar", { method: "POST", body: formData })
      const json = await res.json()
      if (json.error) { alert(json.error); return }
      await updateStudentInfo(studentId, { avatar: json.avatarUrl })
      setStudents((prev) =>
        prev.map((s) => s.id === studentId ? { ...s, avatar: json.avatarUrl } : s)
      )
    } catch (e: any) { alert(e.message) }
    finally { setUploadingId(null) }
  }, [])

  const detailStudent = students.find((s) => s.id === detailId)

  // 打开详情时加载练习记录
  const loadHistory = useCallback(async (id: string) => {
    setLoadingHistory(true)
    try {
      const data = await getStudentPracticeHistory(id)
      setPracticeHistory(data)
    } catch (e) { console.error(e) }
    finally { setLoadingHistory(false) }
  }, [])

  const handleOpenDetail = useCallback((id: string) => {
    if (detailId === id) { setDetailId(null); return }
    setDetailId(id)
    setPracticeHistory(null)
    loadHistory(id)
  }, [detailId, loadHistory])

  // 导出 CSV
  const handleExport = useCallback(async () => {
    if (!exportStart || !exportEnd) { alert("请选择开始和结束日期"); return }
    setExporting(true)
    try {
      const result = await exportStudentDataCsv(detailStudent!.id, exportStart, exportEnd)
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = result.filename
      a.click()
      URL.revokeObjectURL(url)
      alert(`导出完成: ${result.total} 条记录, ${result.wrongCount} 条错误`)
    } catch (e: any) { alert(e.message) }
    finally { setExporting(false) }
  }, [detailStudent, exportStart, exportEnd])

  return (
    <div className="space-y-6">
      {/* 顶栏 */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">共 {students.length} 名学生</span>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition"
        >
          {showCreate ? "取消" : "+ 新增学生"}
        </button>
      </div>

      {/* 创建表单 */}
      {showCreate && (
        <div className="bg-white rounded-lg border p-5">
          <h3 className="font-semibold text-gray-700 mb-3">新增学生</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">姓名 *</label>
              <input className="w-full px-3 py-2 border rounded text-sm" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="学生姓名" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">用户名 *</label>
              <input className="w-full px-3 py-2 border rounded text-sm" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="登录用户名" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">密码 *</label>
              <input className="w-full px-3 py-2 border rounded text-sm" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="初始密码" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">年级</label>
              <input className="w-full px-3 py-2 border rounded text-sm" type="number" min={1} max={12} value={newGrade} onChange={(e) => setNewGrade(e.target.value)} placeholder="1-12" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">家长手机</label>
              <input className="w-full px-3 py-2 border rounded text-sm" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="家长手机号" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">备注</label>
              <input className="w-full px-3 py-2 border rounded text-sm" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="备注" />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs text-gray-500 block mb-1">形象 (JPG/PNG/GIF)</label>
            <input ref={fileRef} type="file" accept="image/*" className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
          </div>
          <button onClick={handleCreate} className="px-6 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">创建学生</button>
        </div>
      )}

      {/* 学生列表 + 详情面板 */}
      <div className="flex gap-4">
        {/* 列表 */}
        <div className={`bg-white rounded-lg border overflow-hidden ${detailId ? "flex-1 min-w-0" : "flex-1"}`}>
          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 border-b z-10">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 w-12">形象</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">用户名</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">姓名</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">段位</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">年级</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((s) => (
                  <tr key={s.id} className={`hover:bg-gray-50 cursor-pointer ${detailId === s.id ? "bg-blue-50" : ""}`}
                    onClick={() => handleOpenDetail(s.id)}>
                    <td className="px-4 py-3">
                      {s.avatar ? (
                        <img src={s.avatar} alt="" className="w-8 h-8 rounded-full object-cover border" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">?</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{s.username}</td>
                    <td className="px-4 py-3 text-gray-800">{s.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-600">
                        {getRankDisplayName(s.rankValue)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.gradeLevel ? `${s.gradeLevel}年级` : "—"}</td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length === 0 && (
              <div className="px-5 py-20 text-center text-gray-400">暂无学生</div>
            )}
          </div>
        </div>

        {/* 详情编辑面板 */}
        {detailStudent && (
          <div className="w-80 flex-shrink-0 bg-white rounded-lg border p-5 max-h-[70vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">学生详情</h3>
              <button onClick={() => setDetailId(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
            </div>

            {/* 头像 */}
            <div className="text-center mb-4">
              <div className="relative inline-block">
                {detailStudent.avatar ? (
                  <img src={detailStudent.avatar} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-400 text-3xl">?</div>
                )}
                <label className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleUploadAvatar(detailStudent.id, f)
                    }}
                  />
                </label>
              </div>
              {uploadingId === detailStudent.id && <p className="text-xs text-blue-500 mt-1">上传中...</p>}
            </div>

            {/* 可编辑字段 */}
            <div className="space-y-3">
              <EditableField label="姓名" value={detailStudent.name} onSave={(v) => handleUpdateField(detailStudent.id, "name", v)} />
              <EditableField label="用户名" value={detailStudent.username} onSave={(v) => handleUpdateField(detailStudent.id, "username", v)} />
              <div>
                <label className="text-xs text-gray-500">年级</label>
                <input
                  type="number"
                  min={1} max={12}
                  defaultValue={detailStudent.gradeLevel || ""}
                  onBlur={(e) => handleUpdateField(detailStudent.id, "gradeLevel", e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm mt-1"
                  placeholder="1-12"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">家长手机</label>
                <input
                  defaultValue={detailStudent.parentPhone || ""}
                  onBlur={(e) => handleUpdateField(detailStudent.id, "parentPhone", e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm mt-1"
                  placeholder="家长手机号"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">备注</label>
                <textarea
                  defaultValue={detailStudent.notes || ""}
                  onBlur={(e) => handleUpdateField(detailStudent.id, "notes", e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm mt-1 resize-none"
                  rows={3}
                  placeholder="添加备注..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">段位 (当前: {getRankDisplayName(detailStudent.rankValue)})</label>
                <div className="flex gap-1 mt-1">
                  <input
                    type="number"
                    defaultValue={detailStudent.rankValue}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateRank(detailStudent.id)
                    }}
                    onChange={(e) => setNewRankValue(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded text-sm"
                    min={1}
                    placeholder="段位数值"
                  />
                  <button
                    onClick={() => handleUpdateRank(detailStudent.id)}
                    className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    更新
                  </button>
                </div>
              </div>
            </div>

            {/* 统计 */}
            <div className="mt-4 pt-4 border-t text-xs text-gray-400 space-y-1">
              <p>练习记录: {detailStudent._count.lessonRecords}</p>
              <p>挑战记录: {detailStudent._count.unitChallenges}</p>
              <p>注册时间: {new Date(detailStudent.createdAt).toLocaleDateString("zh-CN")}</p>
            </div>

            {/* 练习记录 */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">练习记录</h4>
              {loadingHistory ? (
                <p className="text-xs text-gray-400">加载中...</p>
              ) : practiceHistory ? (
                <div className="space-y-3 max-h-60 overflow-auto">
                  {/* 练习汇总 */}
                  {practiceHistory.lessonRecords.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">最近练习</p>
                      {practiceHistory.lessonRecords.slice(0, 5).map((r: any) => (
                        <div key={r.id} className="text-xs text-gray-600 flex justify-between py-0.5">
                          <span>{r.unitName} (第{r.attemptCount}次)</span>
                          <span className={r.isPerfect ? "text-green-500" : "text-orange-500"}>
                            {r.correctCount}/{r.totalWords} {r.isPerfect ? "全对" : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 最近错词 */}
                  {practiceHistory.recentWrong.length > 0 && (
                    <div>
                      <p className="text-xs text-red-400 mb-1">最近错词 ({practiceHistory.recentWrong.length})</p>
                      <div className="space-y-1">
                        {practiceHistory.recentWrong.slice(0, 10).map((w: any, i: number) => (
                          <div key={i} className="text-xs bg-red-50 rounded px-2 py-1">
                            <span className="font-medium">{w.en}</span>
                            <span className="text-gray-400 mx-1">({w.zh})</span>
                            <span className="text-red-400 line-through ml-1">{w.userInput}</span>
                            <span className="text-gray-300 ml-2">{new Date(w.createdAt).toLocaleDateString("zh-CN")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {practiceHistory.lessonRecords.length === 0 && practiceHistory.recentWrong.length === 0 && (
                    <p className="text-xs text-gray-400">暂无记录</p>
                  )}
                </div>
              ) : null}
            </div>

            {/* 导出 */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">导出练习数据</h4>
              <div className="flex gap-2 mb-2">
                <input type="date" value={exportStart} onChange={(e) => setExportStart(e.target.value)} className="flex-1 px-2 py-1.5 border rounded text-xs" />
                <input type="date" value={exportEnd} onChange={(e) => setExportEnd(e.target.value)} className="flex-1 px-2 py-1.5 border rounded text-xs" />
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-xs font-medium rounded transition"
              >
                {exporting ? "导出中..." : "导出 CSV (Excel可打开)"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** 可点击编辑的内联字段 */
function EditableField({
  label, value, onSave,
}: {
  label: string; value: string; onSave: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      {editing ? (
        <div className="flex gap-1 mt-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { onSave(draft); setEditing(false) }
              if (e.key === "Escape") { setDraft(value); setEditing(false) }
            }}
            className="flex-1 px-3 py-2 border rounded text-sm"
            autoFocus
          />
          <button onClick={() => { onSave(draft); setEditing(false) }} className="px-2 py-2 bg-blue-500 text-white text-xs rounded">保存</button>
          <button onClick={() => { setDraft(value); setEditing(false) }} className="px-2 py-2 border text-xs rounded">取消</button>
        </div>
      ) : (
        <p
          className="text-gray-800 text-sm mt-1 cursor-pointer hover:bg-gray-50 px-2 py-1.5 -mx-2 rounded"
          onClick={() => { setDraft(value); setEditing(true) }}
        >
          {value || "—"}
        </p>
      )}
    </div>
  )
}
