import React, { useEffect, useState } from "react"
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Check,
  FileCode,
  FileText,
} from "lucide-react"
import { files as fileApi } from "@/lib/api"
import { Button } from "@/components/ui/button"

export const FileEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const filePath = searchParams.get("path") || "/server.properties"
  const [content, setContent] = useState("")
  const [originalContent, setOriginalContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (id && filePath) {
      loadFile()
    }
  }, [id, filePath])

  const loadFile = async () => {
    if (!id) return
    try {
      setLoading(true)
      const text = await fileApi.getContent(id, filePath)
      setContent(text)
      setOriginalContent(text)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!id) return
    try {
      setSaving(true)
      await fileApi.saveContent(id, filePath, content)
      setOriginalContent(content)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2500)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [content, id, filePath])

  const hasChanges = content !== originalContent

  return (
    <div className="space-y-4 pb-12">
      {/* Editor Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white"
          >
            <Link to={`/dashboard/servers/${id}/files`}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Files
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-blue-400" />
            <span className="font-mono text-xs font-bold text-white">{filePath}</span>
            {hasChanges && (
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 mr-2">
              <Check className="h-3.5 w-3.5" />
              Saved
            </span>
          )}

          <Button
            size="sm"
            variant="outline"
            disabled={!hasChanges || saving}
            onClick={() => setContent(originalContent)}
            className="h-8 text-xs font-mono border-zinc-800 text-zinc-400 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Discard
          </Button>

          <Button
            size="sm"
            disabled={!hasChanges || saving}
            onClick={handleSave}
            className="h-8 text-xs font-mono bg-white text-black hover:bg-zinc-200 font-bold"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1" />
                Save (Ctrl+S)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950/90 shadow-2xl">
        <div className="flex border-b border-zinc-800/80 bg-black/60 px-4 py-2 text-[11px] font-mono text-zinc-500 justify-between">
          <span>UTF-8 • Unix (LF)</span>
          <span>{content.split("\n").length} lines</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-500">
            Loading file contents...
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            className="min-h-[540px] w-full resize-y bg-black/40 p-4 font-mono text-xs leading-relaxed text-zinc-200 outline-none focus:ring-0 selection:bg-zinc-800 selection:text-white scrollbar-thin scrollbar-thumb-zinc-800"
          />
        )}
      </div>
    </div>
  )
}
