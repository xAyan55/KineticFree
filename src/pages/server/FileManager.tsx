import React, { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  Folder,
  File,
  FileCode,
  FileText,
  Archive,
  ChevronRight,
  Plus,
  FolderPlus,
  Upload,
  MoreVertical,
  Edit2,
  Trash2,
  Download,
  Search,
  ArrowLeft,
} from "lucide-react"
import { files as fileApi } from "@/lib/api"
import type { FileEntry } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

export const FileManager: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [currentPath, setCurrentPath] = useState("/")
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Modals state
  const [createFileDialog, setCreateFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [createFolderDialog, setCreateFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<FileEntry | null>(null)

  useEffect(() => {
    if (id) loadDirectory(currentPath)
  }, [id, currentPath])

  const loadDirectory = async (path: string) => {
    if (!id) return
    try {
      setLoading(true)
      const data = await fileApi.list(id, path)
      setEntries(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "-"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  const handleNavigate = (entry: FileEntry) => {
    if (!entry.isFile) {
      const next = currentPath === "/" ? `/${entry.name}` : `${currentPath}/${entry.name}`
      setCurrentPath(next)
    } else if (entry.isEditable) {
      const filePath = currentPath === "/" ? `/${entry.name}` : `${currentPath}/${entry.name}`
      navigate(`/dashboard/servers/${id}/files/edit?path=${encodeURIComponent(filePath)}`)
    }
  }

  const handleBreadcrumbClick = (index: number) => {
    const parts = currentPath.split("/").filter(Boolean)
    if (index === -1) {
      setCurrentPath("/")
    } else {
      const next = "/" + parts.slice(0, index + 1).join("/")
      setCurrentPath(next)
    }
  }

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFileName.trim() || !id) return
    const target = currentPath === "/" ? `/${newFileName.trim()}` : `${currentPath}/${newFileName.trim()}`
    try {
      await fileApi.createFile(id, target)
      setCreateFileDialog(false)
      setNewFileName("")
      loadDirectory(currentPath)
      navigate(`/dashboard/servers/${id}/files/edit?path=${encodeURIComponent(target)}`)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim() || !id) return
    const target = currentPath === "/" ? `/${newFolderName.trim()}` : `${currentPath}/${newFolderName.trim()}`
    try {
      await fileApi.createDirectory(id, target)
      setCreateFolderDialog(false)
      setNewFolderName("")
      loadDirectory(currentPath)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || !id) return
    const targetPath = currentPath === "/" ? `/${deleteTarget.name}` : `${currentPath}/${deleteTarget.name}`
    try {
      await fileApi.deleteFile(id, targetPath)
      setDeleteTarget(null)
      loadDirectory(currentPath)
    } catch (err) {
      console.error(err)
    }
  }

  const getFileIcon = (entry: FileEntry) => {
    if (!entry.isFile) return <Folder className="h-4 w-4 text-amber-400 fill-amber-400/20" />
    if (entry.name.endsWith(".jar")) return <Archive className="h-4 w-4 text-rose-400" />
    if (entry.name.endsWith(".yml") || entry.name.endsWith(".yaml") || entry.name.endsWith(".json"))
      return <FileCode className="h-4 w-4 text-blue-400" />
    if (entry.name.endsWith(".properties") || entry.name.endsWith(".txt") || entry.name.endsWith(".log"))
      return <FileText className="h-4 w-4 text-zinc-400" />
    return <File className="h-4 w-4 text-zinc-400" />
  }

  const pathParts = currentPath.split("/").filter(Boolean)
  const filtered = entries.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4 pb-12">
      {/* Top Toolbar & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-lg bg-zinc-950 border border-zinc-800/80 px-3 py-2 text-xs font-mono text-zinc-400 scrollbar-none">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className="hover:text-white transition-colors"
          >
            /root
          </button>
          {pathParts.map((part, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="h-3 w-3 text-zinc-600 shrink-0" />
              <button
                onClick={() => handleBreadcrumbClick(idx)}
                className={`truncate max-w-[120px] transition-colors ${
                  idx === pathParts.length - 1 ? "text-white font-semibold" : "hover:text-white"
                }`}
              >
                {part}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => setCreateFileDialog(true)}
            className="h-8 text-xs font-mono bg-white text-black hover:bg-zinc-200"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            New File
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setCreateFolderDialog(true)}
            className="h-8 text-xs font-mono border-zinc-800 hover:bg-zinc-800 text-zinc-200"
          >
            <FolderPlus className="h-3.5 w-3.5 mr-1" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Filter files in directory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2 pl-9 pr-4 text-xs font-mono text-white placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
        />
      </div>

      {/* Directory Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/60 shadow-xl">
        <div className="grid grid-cols-12 border-b border-zinc-800/80 bg-black/40 px-4 py-2.5 text-[11px] font-mono font-medium text-zinc-500 uppercase">
          <div className="col-span-7 sm:col-span-6">Name</div>
          <div className="col-span-3 sm:col-span-3 text-right">Size</div>
          <div className="col-span-2 sm:col-span-3 text-right">Modified</div>
        </div>

        {loading ? (
          <div className="divide-y divide-zinc-800/60 p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-full rounded" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-500">
            This directory is currently empty.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60 text-xs font-mono">
            {filtered.map((entry) => (
              <div
                key={entry.name}
                onClick={() => handleNavigate(entry)}
                className="grid grid-cols-12 items-center px-4 py-2.5 hover:bg-zinc-900/40 cursor-pointer transition-colors group"
              >
                <div className="col-span-7 sm:col-span-6 flex items-center gap-2.5 min-w-0 pr-2">
                  {getFileIcon(entry)}
                  <span className="truncate text-zinc-200 group-hover:text-white">
                    {entry.name}
                  </span>
                </div>

                <div className="col-span-3 sm:col-span-3 text-right text-zinc-400">
                  {formatSize(entry.size)}
                </div>

                <div className="col-span-2 sm:col-span-3 flex items-center justify-end gap-2 text-zinc-500">
                  <span className="hidden sm:inline">
                    {new Date(entry.modifiedAt).toLocaleDateString()}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button className="rounded p-1 text-zinc-500 hover:text-white transition-colors">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 font-mono text-xs">
                      {entry.isEditable && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleNavigate(entry)
                          }}
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-2" />
                          Edit Content
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget(entry)
                        }}
                        className="text-rose-400 focus:text-rose-400 focus:bg-rose-950/20"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New File Dialog */}
      <Dialog open={createFileDialog} onOpenChange={setCreateFileDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">Create New File</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFile} className="space-y-4">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. motd.txt or permissions.yml"
              className="bg-black border-zinc-800 font-mono text-xs"
              autoFocus
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateFileDialog(false)}
                className="border-zinc-800 text-xs font-mono"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newFileName.trim()}
                className="bg-white text-black hover:bg-zinc-200 text-xs font-mono"
              >
                Create File
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={createFolderDialog} onOpenChange={setCreateFolderDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">Create New Directory</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. datapacks or configs"
              className="bg-black border-zinc-800 font-mono text-xs"
              autoFocus
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateFolderDialog(false)}
                className="border-zinc-800 text-xs font-mono"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newFolderName.trim()}
                className="bg-white text-black hover:bg-zinc-200 text-xs font-mono"
              >
                Create Directory
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-rose-400">Delete File</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-zinc-300 font-mono">
            Are you sure you want to permanently delete{" "}
            <span className="text-white font-bold">{deleteTarget?.name}</span>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="border-zinc-800 text-xs font-mono"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              className="bg-rose-600 text-white hover:bg-rose-700 text-xs font-mono"
            >
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
