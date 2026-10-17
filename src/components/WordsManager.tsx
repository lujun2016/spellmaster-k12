"use client"

import { useState, useCallback, useRef } from "react"
import {
  createTextbook, deleteTextbook,
  createGrade, deleteGrade,
  createUnit, deleteUnit,
  getUnitWords, createWord, updateWord, deleteWord, batchImportWords,
} from "@/app/admin/actions"

interface TextbookNode {
  id: string
  name: string
  grades: {
    id: string
    name: string
    units: { id: string; name: string; sortOrder: number; _count: { words: number }; video?: { status: string; fileKey?: string | null } | null }[]
  }[]
}

export function WordsManager({ textbooks: initial }: { textbooks: TextbookNode[] }) {
  const [textbooks, setTextbooks] = useState(initial)
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [words, setWords] = useState<{ id: string; en: string; zh: string; phonetic: string }[]>([])
  const [editingWord, setEditingWord] = useState<string | null>(null)
  const [newEn, setNewEn] = useState("")
  const [newZh, setNewZh] = useState("")
  const [newPhonetic, setNewPhonetic] = useState("")
  const [batchText, setBatchText] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showBatch, setShowBatch] = useState(false)
  const [videoUploading, setVideoUploading] = useState<string | null>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  // 选中单元 → 加载单词
  const selectUnit = useCallback(async (unitId: string) => {
    setSelectedUnit(unitId)
    setShowAddForm(false)
    setShowBatch(false)
    try {
      const data = await getUnitWords(unitId)
      setWords(data)
    } catch (e) {
      console.error(e)
    }
  }, [])

  // 新增教材
  const handleCreateTextbook = useCallback(async () => {
    const name = prompt("教材名称:")
    if (!name) return
    try {
      const tb = await createTextbook(name)
      setTextbooks((prev) => [...prev, { ...tb, grades: [] }])
    } catch (e: any) { alert(e.message) }
  }, [])

  // 新增年级
  const handleCreateGrade = useCallback(async (textbookId: string) => {
    const name = prompt("年级名称 (如: 一年级上):")
    if (!name) return
    const level = parseInt(prompt("排序级别 (1=一上, 2=一下, ...):") || "1")
    try {
      await createGrade(textbookId, name, level)
      window.location.reload()
    } catch (e: any) { alert(e.message) }
  }, [])

  // 新增单元
  const handleCreateUnit = useCallback(async (gradeId: string) => {
    const name = prompt("单元名称 (如: Unit 1 Hello):")
    if (!name) return
    const sortOrder = parseInt(prompt("排序号:") || "1")
    try {
      await createUnit(gradeId, name, sortOrder)
      window.location.reload()
    } catch (e: any) { alert(e.message) }
  }, [])

  // 删除确认
  const handleDelete = useCallback(async (type: string, id: string) => {
    if (!confirm(`确定要删除这个${type}吗？此操作不可恢复。`)) return
    try {
      if (type === "教材") await deleteTextbook(id)
      else if (type === "年级") await deleteGrade(id)
      else if (type === "单元") await deleteUnit(id)
      else if (type === "单词") {
        await deleteWord(id)
        setWords((prev) => prev.filter((w) => w.id !== id))
        return
      }
      window.location.reload()
    } catch (e: any) { alert(e.message) }
  }, [])

  // 新增单词
  const handleAddWord = useCallback(async () => {
    if (!selectedUnit || !newEn.trim()) return
    try {
      const w = await createWord(selectedUnit, newEn.trim(), newZh.trim(), newPhonetic.trim())
      setWords((prev) => [...prev, w])
      setNewEn(""); setNewZh(""); setNewPhonetic("")
      setShowAddForm(false)
    } catch (e: any) { alert(e.message) }
  }, [selectedUnit, newEn, newZh, newPhonetic])

  // 更新单词
  const handleUpdateWord = useCallback(async (id: string) => {
    try {
      await updateWord(id, { en: newEn.trim(), zh: newZh.trim(), phonetic: newPhonetic.trim() })
      setWords((prev) => prev.map((w) => w.id === id ? { ...w, en: newEn, zh: newZh, phonetic: newPhonetic } : w))
      setEditingWord(null)
      setNewEn(""); setNewZh(""); setNewPhonetic("")
    } catch (e: any) { alert(e.message) }
  }, [newEn, newZh, newPhonetic])

  // 上传视频
  const handleUploadVideo = useCallback(async (unitId: string) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "video/mp4,video/webm,video/mov"
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0]
      if (!file) return
      setVideoUploading(unitId)
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("unitId", unitId)
        const res = await fetch("/api/admin/upload-video", { method: "POST", body: formData })
        const json = await res.json()
        if (json.error) { alert(json.error); return }
        alert("视频上传成功")
        window.location.reload()
      } catch (e: any) { alert(e.message) }
      finally { setVideoUploading(null) }
    }
    input.click()
  }, [])

  // 批量导入
  const handleBatchImport = useCallback(async () => {
    if (!selectedUnit || !batchText.trim()) return
    try {
      const result = await batchImportWords(selectedUnit, batchText)
      alert(`成功导入 ${result.count} 个单词`)
      setBatchText("")
      setShowBatch(false)
      selectUnit(selectedUnit)
    } catch (e: any) { alert(e.message) }
  }, [selectedUnit, batchText, selectUnit])

  return (
    <div className="flex gap-6">
      {/* 左侧：教材树 */}
      <div className="w-72 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700">教材结构</h2>
          <button onClick={handleCreateTextbook} className="text-xs text-blue-500 hover:text-blue-700">+教材</button>
        </div>
        <div className="bg-white rounded-lg border divide-y max-h-[70vh] overflow-auto">
          {textbooks.map((tb) => (
            <div key={tb.id} className="p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-800">{tb.name}</span>
                <button onClick={() => handleDelete("教材", tb.id)} className="text-xs text-red-400 hover:text-red-600">删除</button>
              </div>
              {tb.grades.map((grade) => (
                <div key={grade.id} className="ml-3 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{grade.name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleCreateUnit(grade.id)} className="text-xs text-blue-400 hover:text-blue-600">+单元</button>
                      <button onClick={() => handleDelete("年级", grade.id)} className="text-xs text-red-400 hover:text-red-600">删</button>
                    </div>
                  </div>
                  {grade.units.map((unit) => (
                    <div key={unit.id} className="ml-3 mt-1 flex items-center gap-1">
                      <button
                        onClick={() => selectUnit(unit.id)}
                        className={`text-xs flex-1 text-left px-2 py-1 rounded transition ${
                          selectedUnit === unit.id
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {unit.name} ({unit._count.words})
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUploadVideo(unit.id) }}
                        disabled={videoUploading === unit.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded transition flex-shrink-0 ${
                          unit.video?.status === "ready"
                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        }`}
                        title={unit.video?.status === "ready" ? "点击替换视频" : "上传视频"}
                      >
                        {videoUploading === unit.id ? "..." : unit.video?.status === "ready" ? "已上传" : "+视频"}
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              <button onClick={() => handleCreateGrade(tb.id)} className="text-xs text-blue-400 hover:text-blue-600 mt-2 ml-3 block">
                +年级
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧：单词列表 */}
      <div className="flex-1">
        {!selectedUnit ? (
          <div className="text-center py-20 text-gray-400">选择左侧单元查看单词</div>
        ) : (
          <div className="bg-white rounded-lg border">
            <div className="px-5 py-3 border-b flex items-center justify-between bg-gray-50">
              <h3 className="font-semibold text-gray-700">单词列表 ({words.length})</h3>
              <div className="flex gap-2">
                <button onClick={() => { setShowAddForm(true); setShowBatch(false); setEditingWord(null) }} className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600">+单词</button>
                <button onClick={() => { setShowBatch(true); setShowAddForm(false) }} className="text-xs px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600">批量导入</button>
              </div>
            </div>

            {/* 新增/批量表单 */}
            {(showAddForm || editingWord) && (
              <div className="px-5 py-3 border-b bg-gray-50">
                <div className="flex gap-2">
                  <input className="flex-1 px-3 py-2 border rounded text-sm" placeholder="英文" value={newEn} onChange={(e) => setNewEn(e.target.value)} />
                  <input className="flex-1 px-3 py-2 border rounded text-sm" placeholder="中文" value={newZh} onChange={(e) => setNewZh(e.target.value)} />
                  <input className="w-40 px-3 py-2 border rounded text-sm" placeholder="音标" value={newPhonetic} onChange={(e) => setNewPhonetic(e.target.value)} />
                  <button onClick={editingWord ? () => handleUpdateWord(editingWord) : handleAddWord} className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                    {editingWord ? "保存" : "添加"}
                  </button>
                  <button onClick={() => { setShowAddForm(false); setEditingWord(null); setNewEn(""); setNewZh(""); setNewPhonetic("") }} className="px-4 py-2 border text-sm rounded hover:bg-gray-100">取消</button>
                </div>
              </div>
            )}

            {showBatch && (
              <div className="px-5 py-3 border-b bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">每行一个单词，格式: 英文[Tab]中文[Tab]音标</p>
                <textarea className="w-full h-32 px-3 py-2 border rounded text-sm font-mono" value={batchText} onChange={(e) => setBatchText(e.target.value)} placeholder="apple	苹果	/ˈæpl/" />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleBatchImport} className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600">导入</button>
                  <button onClick={() => setShowBatch(false)} className="px-4 py-2 border text-sm rounded hover:bg-gray-100">取消</button>
                </div>
              </div>
            )}

            <div className="divide-y max-h-[60vh] overflow-auto">
              {words.map((w) => (
                <div key={w.id} className="px-5 py-2.5 flex items-center gap-4">
                  <span className="font-medium text-gray-800 w-28">{w.en}</span>
                  <span className="text-gray-500 w-20">{w.zh}</span>
                  <span className="text-gray-400 text-sm flex-1">{w.phonetic}</span>
                  <button onClick={() => { setEditingWord(w.id); setNewEn(w.en); setNewZh(w.zh); setNewPhonetic(w.phonetic); setShowAddForm(false); setShowBatch(false) }} className="text-xs text-blue-500 hover:text-blue-700">编辑</button>
                  <button onClick={() => handleDelete("单词", w.id)} className="text-xs text-red-400 hover:text-red-600">删除</button>
                </div>
              ))}
              {words.length === 0 && (
                <div className="px-5 py-10 text-center text-gray-400 text-sm">暂无单词</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
