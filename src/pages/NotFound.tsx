import React from "react"
import { Link } from "react-router-dom"
import { ServerOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center text-zinc-300 select-none">
      <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-6">
        <ServerOff className="h-8 w-8" />
      </div>
      <span className="font-mono text-xs text-zinc-500 tracking-widest uppercase">
        Error 404
      </span>
      <h1 className="mt-2 text-2xl font-bold font-mono text-white sm:text-3xl">
        Instance Route Not Found
      </h1>
      <p className="mt-2 max-w-md text-xs font-mono text-zinc-400">
        The requested endpoint or server resource does not exist in the KineticHost routing table.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button asChild className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold h-9">
          <Link to="/dashboard">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
