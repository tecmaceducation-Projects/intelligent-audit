import { ArrowRight, FileText, Loader2, Sparkles, Upload as UploadIcon, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STEPS = ["Upload", "Review", "Analyze"];

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      toast.error("File exceeds 20MB limit");
      return;
    }
    setFile(f);
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 100;
        }
        return p + 8 + Math.random() * 10;
      });
    }, 120);
  }, []);

  const removeFile = () => {
    setFile(null);
    setProgress(0);
    setUploading(false);
  };

  const onAnalyze = async () => {
    if (!file) {
      toast.error("Upload a claim document first");
      return;
    }
    setAnalyzing(true);
    // Navigate to processing screen with a temp id; processing page will create the claim
    navigate(`/processing/new`);
  };

  const currentStep = analyzing ? 2 : file && !uploading ? 1 : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Upload a claim</h1>
        <p className="text-sm text-muted-foreground">
          Drop in a claim document and let AuditIQ extract data, validate policy, and detect fraud signals.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-3">
        {STEPS.map((label, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          return (
            <div key={label} className="flex flex-1 items-center gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isActive && "bg-gradient-brand text-primary-foreground shadow-glow",
                    isDone && "bg-success text-success-foreground",
                    !isActive && !isDone && "bg-muted text-muted-foreground",
                  )}
                >
                  {i + 1}
                </div>
                <span className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
            </div>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          {!file ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
              className={cn(
                "group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-all",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30",
              )}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
                <UploadIcon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold">Drop your claim document here</p>
                <p className="text-sm text-muted-foreground">PDF, JPG or PNG up to 20MB</p>
              </div>
              <Button type="button" variant="outline" className="mt-2">
                Browse files
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  {uploading && <Progress value={progress} className="mt-2 h-1.5" />}
                  {!uploading && (
                    <p className="mt-1 text-xs font-medium text-success">Upload complete</p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} aria-label="Remove file">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="claim-type">Claim type</Label>
                  <Select defaultValue="inpatient">
                    <SelectTrigger id="claim-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inpatient">Inpatient</SelectItem>
                      <SelectItem value="outpatient">Outpatient</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policy">Policy number (optional)</Label>
                  <Input id="policy" placeholder="POL-123456" />
                </div>
              </div>

              <div className="flex flex-col-reverse items-stretch gap-2 border-t pt-5 sm:flex-row sm:justify-end">
                <Button variant="ghost" onClick={removeFile}>
                  Cancel
                </Button>
                <Button
                  onClick={onAnalyze}
                  disabled={uploading || analyzing}
                  className="bg-gradient-brand text-primary-foreground hover:opacity-95"
                >
                  {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Analyze claim
                  {!analyzing && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
