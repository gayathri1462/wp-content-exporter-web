"use client";

import React, { useState } from "react";
import SiteConfigForm from "@/components/SiteConfigForm";
import PostTypeSelector from "@/components/PostTypeSelector";
import FieldSelector from "@/components/FieldSelector";
import ExportButton from "@/components/ExportButton";
import { fetchAllPosts, inferFieldsFromPost, flattenObject } from "@/lib/exporterUtils";
import { CheckCircle2, Layout, FileBox, Globe, Layers, Filter, Download, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

type Step = "site" | "postType" | "fields" | "export";

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "site", label: "Connection", icon: Globe },
  { id: "postType", label: "Post Type", icon: Layers },
  { id: "fields", label: "Configuration", icon: Filter },
  { id: "export", label: "Export", icon: Download },
];

export default function ExporterPage() {
  const [step, setStep] = useState<Step>("site");
  const [endpoint, setEndpoint] = useState("");
  const [token, setToken] = useState("");
  const [postType, setPostType] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  async function handleSiteConfig(ep: string, hdrs: Record<string, string>) {
    setEndpoint(ep);
    const authHeader = hdrs.Authorization || "";
    const tokenValue = authHeader.replace(/^Bearer\s+/, "");
    setToken(tokenValue);
    setStep("postType");
  }

  async function handlePostTypeSelect(pt: string) {
    setPostType(pt);
    setStatus("Fetching sample data from WordPress…");
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const sample = await fetchAllPosts(endpoint, pt, headers, 1);
      if (sample.length === 0) throw new Error("No posts found for this type.");
      const inferred = inferFieldsFromPost(sample[0]);
      const flattened = flattenObject(sample[0]);
      setFields(inferred);
      setSampleData(flattened);
      setStep("fields");
      setStatus("Successfully configured fields!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function handleFieldsSelect(selected: string[]) {
    setFields(selected);
    setStep("export");
  }

  // Status Styling Logic
  const getStatusStyle = () => {
    if (!status) return null;
    if (status.toLowerCase().includes("error")) return "bg-destructive/10 border-destructive text-destructive";
    if (status.toLowerCase().includes("fetching") || status.toLowerCase().includes("loading")) return "bg-primary/10 border-primary text-primary";
    return "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400";
  };

  const statusStyle = getStatusStyle();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background selection:bg-primary/30 font-sans antialiased text-foreground">
      {/* Left Sidebar - Refined Ratio (Fixed width for better balance) */}
      <aside className="lg:w-[300px] xl:w-[320px] bg-card border-r-2 border-border min-h-[300px] lg:min-h-screen p-8 xl:p-10 flex flex-col justify-between shrink-0">
        <div className="space-y-12">
          {/* Header - Designer Polish */}
          <header className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-foreground text-background font-black text-xl rounded-lg shadow-lg shadow-foreground/10">
                W
              </div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">
                Exporter<span className="text-primary italic">.</span>
              </h1>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-relaxed max-w-[200px]">
              Advanced Content Extraction Interface
            </p>
          </header>

          {/* Nav Stepper - Swiss Style */}
          <nav className="space-y-0 border-t border-border/50">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isActive = s.id === step;
              const isCompleted = idx < currentStepIndex;
              const isPending = idx > currentStepIndex;

              return (
                <button
                  key={s.id}
                  disabled={isPending}
                  onClick={() => {
                    setStep(s.id);
                    setStatus("");
                  }}
                  className={`w-full flex items-center gap-6 p-5 transition-all mb-2 text-left group relative rounded-xl border border-transparent  ${isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10 border-primary cursor-pointer"
                    : isCompleted
                      ? "text-primary hover:bg-primary/5 cursor-pointer"
                      : "text-muted-foreground opacity-30 cursor-not-allowed"
                    }`}
                >
                  {isActive && (
                    <div className="absolute -left-1 top-3 bottom-3 w-1.5 bg-foreground rounded-full z-10" />
                  )}
                  <span className="text-[11px] font-mono font-black opacity-40">0{idx + 1}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest">{s.label}</span>
                  </div>
                  {isCompleted && (
                    <div className="ml-auto">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="mt-12 flex items-center justify-between pt-10 border-t-2 border-border animate-in fade-in duration-1000">
          <ThemeToggle />
          <div className="text-right">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Designed & Developed By</p>
            <p className="text-[10px] font-mono font-bold">N Gayathri Devi</p>
          </div>
        </div>
      </aside>

      {/* Right Content - Full Focus Area */}
      <main className="flex-1 h-screen flex flex-col bg-background relative overflow-hidden">
        {/* Status Header - Designer Header Pattern */}
        <div className="h-16 shrink-0 relative flex items-center px-8 border-b-2 border-border bg-card/30 backdrop-blur-sm z-20">
          {status ? (
            <div className={`absolute inset-0 px-8 flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 ${statusStyle} font-black text-[11px] uppercase tracking-[0.15em]`}>
              {status.toLowerCase().includes("fetching") ? <Loader2 size={14} className="animate-spin" /> : status.toLowerCase().includes("error") ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
              <span className="border-l border-current pl-4">{status}</span>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-muted-foreground font-black text-[11px] uppercase tracking-[0.15em]">
              <div className="w-2 h-2 bg-muted-foreground" />
              <span>Ready for Configuration</span>
            </div>
          )}
        </div>

        {/* Content Area with strict padding */}
        <div className="flex-1 p-2 lg:p-4 xl:p-4 w-full overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            {step === "site" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <SiteConfigForm onSubmit={handleSiteConfig} />
              </div>
            )}

            {step === "postType" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <PostTypeSelector
                  endpoint={endpoint}
                  token={token}
                  onSelect={handlePostTypeSelect}
                />
              </div>
            )}

            {step === "fields" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <FieldSelector fields={fields} sampleData={sampleData} onSelect={handleFieldsSelect} />
              </div>
            )}

            {step === "export" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-start text-left space-y-12">
                <div className="w-24 h-24 bg-primary flex items-center justify-center rounded-[2.5rem] shadow-2xl shadow-primary/30">
                  <FileBox size={40} className="text-primary-foreground" />
                </div>
                <div className="space-y-6">
                  <h2 className="text-6xl font-black uppercase tracking-tighter leading-none italic">
                    Ready<br />To Export<span className="text-primary text-8xl">.</span>
                  </h2>
                  <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-xl">
                    The requested data for <span className="text-foreground font-black underline decoration-4 decoration-primary underline-offset-8 uppercase">{postType}</span> has been processed and is ready for local archiving.
                  </p>
                </div>
                <div className="w-full max-w-md pt-4">
                  <ExportButton endpoint={endpoint} postType={postType} fields={fields} token={token} />
                </div>
                <button
                  onClick={() => setStep("fields")}
                  className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">←</span>
                  <span className="border-b-2 border-transparent group-hover:border-foreground pb-0.5">Edit Configuration</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
