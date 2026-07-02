import { useState } from "react";
import { createPortal } from "react-dom";
import { useWeeklyReport } from "../../hooks/use-weekly-report";
import { generateReport } from "../../lib/weekly-report";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Copy, Check, Sparkles, FileText, X } from "lucide-react";
import { cn } from "../../lib/utils";

export function WeeklyAISummary() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-ring/50 outline-none hover:bg-muted text-text-secondary"
      >
        <Sparkles className="w-4 h-4" />
        Weekly AI Summary
      </button>

      {open && <WeeklyReportDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function WeeklyReportDialog({ onClose }: { onClose: () => void }) {
  const { data, isLoading } = useWeeklyReport();

  if (isLoading) {
    return (
      <Overlay onClose={onClose}>
        <div className="p-8">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-5/6 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Overlay>
    );
  }

  if (!data) return null;

  const report = generateReport(data);

  return (
    <Overlay onClose={onClose}>
      <TabbedReportContent markdown={report.markdown} aiPrompt={report.aiPrompt} onClose={onClose} />
    </Overlay>
  );
}

function TabbedReportContent({
  markdown,
  aiPrompt,
  onClose,
}: { markdown: string; aiPrompt: string; onClose: () => void }) {
  const [tab, setTab] = useState<"report" | "prompt">("report");
  const [copied, setCopied] = useState(false);

  const content = tab === "report" ? markdown : aiPrompt;

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="flex flex-col max-h-[85vh]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex gap-0">
          <button
            onClick={() => setTab("report")}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-l-lg border border-border transition-colors",
              tab === "report"
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted text-text-secondary",
            )}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1.5" />
            Report
          </button>
          <button
            onClick={() => setTab("prompt")}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-r-lg border border-border border-l-0 transition-colors",
              tab === "prompt"
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted text-text-secondary",
            )}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
            AI Prompt
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleCopy}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : tab === "report" ? "Copy Markdown" : "Copy Prompt"}
          </Button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto p-6">
        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-primary bg-muted/30 rounded-lg p-5 border border-border max-h-[60vh] overflow-y-auto">
          {content}
        </pre>
      </div>

      <div className="px-6 py-3 border-t border-border text-xs text-text-secondary">
        {tab === "report"
          ? "Copy the report and share with your GATE coach or study group."
          : "Paste this prompt into ChatGPT, Claude, or any LLM for AI-powered GATE preparation analysis."}
      </div>
    </div>
  );
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh]">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 bg-popover rounded-xl shadow-2xl ring-1 ring-foreground/10 w-full max-w-3xl mx-4">
        {children}
      </div>
    </div>,
    document.body,
  );
}
