"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Edit, Plus, Shuffle, Save, X, Search, RotateCcw, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

interface Item {
  id: string
  name: string
  color: string
}

// Local Storage wrapper
class ItemStorage {
  private storageKey = "randomItemSelector"

  getItems(): Item[] {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  saveItems(items: Item[]): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items))
    } catch (error) {
      console.error("Failed to save items:", error)
    }
  }
}

const storage = new ItemStorage()

// Generate random colors for items
const generateColor = (index: number): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8C471",
    "#82E0AA",
    "#F1948A",
    "#85C1E9",
    "#D7BDE2",
  ]
  return colors[index % colors.length]
}

export default function RandomItemSelector() {
  const [items, setItems] = useState<Item[]>([])
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [formData, setFormData] = useState({ name: "" })
  const [searchQuery, setSearchQuery] = useState("")
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemName, setEditingItemName] = useState("")
  const { toast } = useToast()

  const [isPasteMode, setIsPasteMode] = useState(false)
  const [pasteText, setPasteText] = useState("")
  const [previewItems, setPreviewItems] = useState<string[]>([])

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = () => {
    const loadedItems = storage.getItems()
    setItems(loadedItems)

    // Add default items if none exist
    if (loadedItems.length === 0) {
      const defaultItems: Item[] = [
        { id: "1", name: "Pizza", color: generateColor(0) },
        { id: "2", name: "Burger", color: generateColor(1) },
        { id: "3", name: "Sushi", color: generateColor(2) },
        { id: "4", name: "Tacos", color: generateColor(3) },
        { id: "5", name: "Pasta", color: generateColor(4) },
        { id: "6", name: "中式炒饭", color: generateColor(5) },
        { id: "7", name: "意大利面", color: generateColor(6) },
        { id: "8", name: "日式拉面", color: generateColor(7) },
        { id: "9", name: "韩式烤肉", color: generateColor(8) },
        { id: "10", name: "泰式咖喱", color: generateColor(9) },
      ]
      setItems(defaultItems)
      storage.saveItems(defaultItems)
    }
  }

  // 过滤项目列表
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items
    return items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [items, searchQuery])

  const handleRandomSelect = () => {
    if (items.length === 0) {
      toast({
        title: "没有可选项目",
        description: "请先添加一些项目",
        variant: "destructive",
      })
      return
    }

    setIsSelecting(true)
    setSelectedItem(null)

    // 添加选择动画效果
    let counter = 0
    const maxCounter = 20 + Math.floor(Math.random() * 10) // 20-30次快速切换

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * items.length)
      setSelectedItem(items[randomIndex])
      counter++

      if (counter >= maxCounter) {
        clearInterval(interval)
        // 最终选择
        const finalIndex = Math.floor(Math.random() * items.length)
        const finalSelected = items[finalIndex]
        setSelectedItem(finalSelected)
        setIsSelecting(false)

        toast({
          title: "选择完成！",
          description: `随机选中：${finalSelected.name}`,
        })
      }
    }, 100) // 每100ms切换一次
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "输入错误",
        description: "项目名称不能为空",
        variant: "destructive",
      })
      return
    }

    const newItem: Item = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      color: generateColor(items.length),
    }

    const updatedItems = [...items, newItem]
    setItems(updatedItems)
    storage.saveItems(updatedItems)

    toast({
      title: "添加成功",
      description: "新项目已添加",
    })

    resetForm()
  }

  const handleStartEdit = (item: Item) => {
    setEditingItemId(item.id)
    setEditingItemName(item.name)
  }

  const handleSaveEdit = () => {
    if (!editingItemName.trim()) {
      toast({
        title: "输入错误",
        description: "项目名称不能为空",
        variant: "destructive",
      })
      return
    }

    const updatedItems = items.map((item) =>
      item.id === editingItemId ? { ...item, name: editingItemName.trim() } : item,
    )

    setItems(updatedItems)
    storage.saveItems(updatedItems)

    // 如果编辑的是当前选中的项目，也要更新选中项目的信息
    if (selectedItem?.id === editingItemId) {
      setSelectedItem({ ...selectedItem, name: editingItemName.trim() })
    }

    toast({
      title: "更新成功",
      description: "项目已更新",
    })

    setEditingItemId(null)
    setEditingItemName("")
  }

  const handleCancelEdit = () => {
    setEditingItemId(null)
    setEditingItemName("")
  }

  const handleDelete = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id)
    setItems(updatedItems)
    storage.saveItems(updatedItems)

    if (selectedItem?.id === id) {
      setSelectedItem(null)
    }

    toast({
      title: "删除成功",
      description: "项目已删除",
    })
  }

  const resetForm = () => {
    setFormData({ name: "" })
    setIsAddingNew(false)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  const handlePasteText = () => {
    if (!pasteText.trim()) {
      toast({
        title: "输入错误",
        description: "请输入要导入的文本",
        variant: "destructive",
      })
      return
    }

    // 解析文本，支持多种分隔符
    const lines = pasteText
      .split(/[\n,;|]/) // 支持换行符、逗号、分号、竖线分隔
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && line.length <= 20) // 过滤空行和过长的项目

    if (lines.length === 0) {
      toast({
        title: "解析错误",
        description: "未找到有效的项目数据",
        variant: "destructive",
      })
      return
    }

    // 去重处理
    const existingNames = new Set(items.map((item) => item.name.toLowerCase()))
    const newItems = lines.filter((line) => !existingNames.has(line.toLowerCase()))

    if (newItems.length === 0) {
      toast({
        title: "导入提示",
        description: "所有项目都已存在，未添加新项目",
      })
      return
    }

    setPreviewItems(newItems)
  }

  const confirmPasteImport = () => {
    const newItemsToAdd: Item[] = previewItems.map((name, index) => ({
      id: (Date.now() + index).toString(),
      name: name,
      color: generateColor(items.length + index),
    }))

    const updatedItems = [...items, ...newItemsToAdd]
    setItems(updatedItems)
    storage.saveItems(updatedItems)

    toast({
      title: "导入成功",
      description: `成功添加 ${newItemsToAdd.length} 个项目`,
    })

    // 重置状态
    setPasteText("")
    setPreviewItems([])
    setIsPasteMode(false)
  }

  const cancelPasteImport = () => {
    setPasteText("")
    setPreviewItems([])
    setIsPasteMode(false)
  }

  const handleQuickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text.trim()) {
        setPasteText(text)
        setIsPasteMode(true)
        // 自动解析
        setTimeout(() => {
          const lines = text
            .split(/[\n,;|]/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && line.length <= 20)

          if (lines.length > 0) {
            const existingNames = new Set(items.map((item) => item.name.toLowerCase()))
            const newItems = lines.filter((line) => !existingNames.has(line.toLowerCase()))
            setPreviewItems(newItems)
          }
        }, 100)
      } else {
        toast({
          title: "剪贴板为空",
          description: "请先复制要导入的文本",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "读取失败",
        description: "无法访问剪贴板，请手动粘贴文本",
        variant: "destructive",
      })
      setIsPasteMode(true)
    }
  }

  // 处理输入框的回车和ESC键
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === "Escape") {
      e.preventDefault()
      handleCancelEdit()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">随机选择器</h1>
          <p className="text-gray-600">添加项目，点击按钮随机选择一个结果</p>
        </div>

        {/* Random Selection Area - Centered */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Random Selection Button */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">🎲 随机选择</CardTitle>
              <CardDescription>
                {items.length > 0 ? `从 ${items.length} 个项目中随机选择` : "请先添加项目"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <Button
                onClick={handleRandomSelect}
                disabled={isSelecting || items.length === 0}
                size="lg"
                className="w-48 h-16 text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500"
              >
                {isSelecting ? (
                  <>
                    <Shuffle className="w-6 h-6 mr-2 animate-spin" />
                    选择中...
                  </>
                ) : (
                  <>
                    <Shuffle className="w-6 h-6 mr-2" />
                    随机选择
                  </>
                )}
              </Button>

              {items.length === 0 && <p className="text-gray-500 text-sm">请先在下方添加一些项目</p>}
            </CardContent>
          </Card>

          {/* Result Display */}
          {selectedItem && (
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-orange-800">{isSelecting ? "🔄 选择中..." : "🎉 选中结果"}</h3>
                  <div
                    className={`inline-block px-8 py-4 rounded-2xl text-white font-bold text-2xl shadow-lg transform transition-all duration-300 ${
                      isSelecting ? "scale-105 animate-pulse" : "scale-100"
                    }`}
                    style={{ backgroundColor: selectedItem.color }}
                  >
                    {selectedItem.name}
                  </div>
                  {!isSelecting && <p className="text-orange-700 text-lg">恭喜！这就是你的选择 ✨</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          {items.length > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{items.length}</div>
                    <div className="text-sm text-green-700">总项目数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {items.length > 0 ? Math.round((1 / items.length) * 100) : 0}%
                    </div>
                    <div className="text-sm text-blue-700">单项概率</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{selectedItem ? "1" : "0"}</div>
                    <div className="text-sm text-purple-700">已选择</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Item Management Section */}
        <div className="space-y-6">
          {/* Add/Edit Form */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">项目管理</CardTitle>
                  <CardDescription>添加新项目或批量导入项目</CardDescription>
                </div>
                {!isAddingNew && !isPasteMode && (
                  <div className="flex gap-2">
                    <Button onClick={() => setIsAddingNew(true)} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      添加项目
                    </Button>
                    <Button onClick={handleQuickPaste} size="sm" variant="outline">
                      📋 批量导入
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            {isAddingNew && (
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-3 space-y-2">
                      <Label htmlFor="name">项目名称</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ name: e.target.value })}
                        placeholder="输入项目名称"
                        required
                        maxLength={20}
                      />
                    </div>
                    <div className="flex gap-2 sm:flex-col sm:justify-end">
                      <Button type="submit" className="flex-1 sm:flex-none">
                        <Save className="w-4 h-4 mr-2" />
                        添加
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm} className="flex-1 sm:flex-none">
                        <X className="w-4 h-4 mr-2" />
                        取消
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            )}

            {isPasteMode && (
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pasteText">批量导入项目</Label>
                    <Textarea
                      id="pasteText"
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder="粘贴您的项目列表，支持以下分隔符：&#10;• 换行符（每行一个项目）&#10;• 逗号分隔：项目1,项目2,项目3&#10;• 分号分隔：项目1;项目2;项目3&#10;• 竖线分隔：项目1|项目2|项目3"
                      className="min-h-[120px] text-sm"
                    />
                    <p className="text-xs text-gray-500">支持多种分隔符，自动去重，最大长度20字符</p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handlePasteText} variant="outline" className="flex-1">
                      解析文本
                    </Button>
                    <Button onClick={cancelPasteImport} variant="ghost">
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </Button>
                  </div>

                  {previewItems.length > 0 && (
                    <div className="space-y-3">
                      <div className="border-t pt-3">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">
                          预览导入项目 ({previewItems.length} 个)
                        </h4>
                        <div className="max-h-32 overflow-y-auto">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {previewItems.map((item, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: generateColor(items.length + index) }}
                                />
                                <span className="truncate">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={confirmPasteImport} className="flex-1">
                          <Save className="w-4 h-4 mr-2" />
                          确认导入 ({previewItems.length})
                        </Button>
                        <Button onClick={cancelPasteImport} variant="outline">
                          取消
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Items List Section */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">项目列表</CardTitle>
                  <CardDescription>
                    {searchQuery
                      ? `显示 ${filteredItems.length} / ${items.length} 个项目`
                      : `共 ${items.length} 个项目`}
                  </CardDescription>
                </div>
                {/* Search Bar */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="搜索项目..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {searchQuery && (
                      <Button
                        onClick={clearSearch}
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium mb-2">还没有项目</h3>
                  <p className="text-sm mb-4">使用上方的表单添加第一个项目开始使用吧！</p>
                  <Button onClick={() => setIsAddingNew(true)} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    添加项目
                  </Button>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium mb-2">未找到匹配项目</h3>
                  <p className="text-sm mb-4">尝试使用其他关键词搜索</p>
                  <Button onClick={clearSearch} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    清空搜索
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {filteredItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                        selectedItem?.id === item.id && !isSelecting
                          ? "bg-yellow-50 border-yellow-300 shadow-lg"
                          : "bg-gray-50 border-gray-200 hover:border-gray-300"
                      } ${editingItemId === item.id ? "border-blue-300 bg-blue-50" : ""}`}
                    >
                      {/* Main content - flex layout for left-right alignment */}
                      <div className="flex items-center justify-between gap-3 min-h-[2rem]">
                        {/* Left side - Item name or edit input */}
                        <div className="flex-1 min-w-0">
                          {editingItemId === item.id ? (
                            <Input
                              value={editingItemName}
                              onChange={(e) => setEditingItemName(e.target.value)}
                              onKeyDown={handleEditKeyDown}
                              className="h-7 text-sm border-0 bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                              placeholder="输入项目名称"
                              maxLength={20}
                              autoFocus
                            />
                          ) : (
                            <h3
                              className={`font-medium text-sm truncate ${
                                selectedItem?.id === item.id && !isSelecting ? "text-yellow-800" : "text-gray-900"
                              }`}
                              title={item.name} // Show full name on hover
                            >
                              {item.name}
                            </h3>
                          )}
                        </div>

                        {/* Right side - Action buttons */}
                        <div className="flex gap-1 flex-shrink-0">
                          {editingItemId === item.id ? (
                            // Edit mode buttons
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleSaveEdit}
                                className="h-7 w-7 p-0 hover:bg-green-100 text-green-600 hover:text-green-700"
                                title="保存修改"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                className="h-7 w-7 p-0 hover:bg-gray-100 text-gray-600 hover:text-gray-700"
                                title="取消修改"
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          ) : (
                            // Normal mode buttons
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStartEdit(item)}
                                className="h-7 w-7 p-0 hover:bg-blue-100 text-blue-600 hover:text-blue-700"
                                disabled={isSelecting || editingItemId !== null}
                                title="编辑项目"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(item.id)}
                                className="h-7 w-7 p-0 hover:bg-red-100 text-red-600 hover:text-red-700"
                                disabled={isSelecting || editingItemId !== null}
                                title="删除项目"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Selected indicator */}
                      {selectedItem?.id === item.id && !isSelecting && editingItemId !== item.id && (
                        <div className="mt-2">
                          <div className="inline-flex items-center gap-1 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                            ⭐ 当前选中
                          </div>
                        </div>
                      )}

                      {/* Edit mode indicator */}
                      {editingItemId === item.id && (
                        <div className="mt-2">
                          <div className="inline-flex items-center gap-1 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                            ✏️ 编辑中 (回车保存，ESC取消)
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">使用说明：</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>
                • <strong>添加项目</strong>：使用项目管理模块逐个添加项目
              </li>
              <li>
                • <strong>批量导入</strong>：点击"批量导入"按钮，支持复制粘贴多个项目
              </li>
              <li>
                • <strong>编辑项目</strong>：点击编辑按钮直接在项目内修改，支持回车保存、ESC取消
              </li>
              <li>
                • <strong>搜索项目</strong>：使用搜索框快速查找特定项目
              </li>
              <li>
                • <strong>随机选择</strong>：点击大按钮开始随机选择，每个项目被选中的概率相等
              </li>
              <li>
                • <strong>数据保存</strong>：所有数据自动保存在浏览器本地存储中
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
