import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { FileCode, Copy, Check, X, ChevronRight, Info } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FileViewerModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  filePath: string
  content: string
}

export function FileViewerModal({
  isOpen,
  onOpenChange,
  filePath,
  content,
}: FileViewerModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    toast.success('Conteúdo copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  const fileExtension = filePath.split('.').pop() || ''
  const fileName = filePath.split('/').pop() || filePath

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border-border bg-card shadow-2xl">
        <DialogDescription className="sr-only">
          Visualizador de código para {fileName}
        </DialogDescription>

        <DialogHeader className="p-0 border-b border-border bg-muted/30">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <FileCode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  {fileName}
                </DialogTitle>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                  <span className="bg-muted px-1.5 py-0.5 rounded border border-border">
                    {fileExtension}
                  </span>
                  <ChevronRight size={10} />
                  <span className="truncate max-w-[300px]">{filePath}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 px-4"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span className="text-xs">Copiar</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="px-5 py-2 bg-muted/50 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Info size={12} className="text-primary/60" />
              <span>{content.split('\n').length} linhas</span>
            </div>
            <div className="flex items-center gap-1">
              <span>
                {(new TextEncoder().encode(content).length / 1024).toFixed(1)}{' '}
                KB
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-[#0d1117] text-[#e6edf3]">
          <ScrollArea className="h-full w-full">
            <div className="p-6 font-mono text-[12px] leading-relaxed">
              {content.split('\n').map((line, i) => (
                <div
                  key={i}
                  className="flex group hover:bg-white/5 transition-colors -mx-6 px-6"
                >
                  <span className="w-12 shrink-0 text-zinc-600 text-right select-none pr-4 border-r border-zinc-800/50 mr-4">
                    {i + 1}
                  </span>
                  <pre className="whitespace-pre overflow-visible">
                    {line || ' '}
                  </pre>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
