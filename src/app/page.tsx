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
    <div className="min-h-screen flex flex-col lg:flex-row bg-background selection:bg-primary/30 font-sans">
      {/* Left Sidebar - 40% Width */}
      <aside className="lg:w-[40%] bg-card border-r border-border min-h-[300px] lg:min-h-screen p-8 lg:p-12 flex flex-col justify-between">
        <div className="space-y-12">
          {/* Header */}
          <header className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex items-center justify-center p-2 bg-primary text-primary-foreground">
              <Layout size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none uppercase">
                WP Exporter
              </h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                Content Dashboard
              </p>
            </div>
          </header>

          {/* Nav Stepper */}
          <nav className="space-y-4 max-w-sm">
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
                  className={`w-full flex items-center gap-6 p-4 transition-all relative group text-left ${isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "text-primary hover:bg-primary/5"
                        : "text-muted-foreground opacity-30 cursor-not-allowed"
                    }`}
                >
                  <div className={`shrink-0 w-10 h-10 flex items-center justify-center border-2 transition-colors ${isActive ? "border-primary-foreground/30 bg-primary-foreground/10" : "border-current"
                    }`}>
                    {isCompleted ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Step 0{idx + 1}</span>
                    <span className="text-sm font-bold tracking-tight">{s.label}</span>
                  </div>
                  {isActive && (
                    <div className="ml-auto">
                      <ChevronRight size={18} className="animate-in slide-in-from-left-2" />
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="mt-12 flex items-center justify-between pt-8 border-t border-border/50 animate-in fade-in duration-1000">
          <ThemeToggle />
          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">Build v1.0.4</p>
        </div>
      </aside>

      {/* Right Content - 60% Width */}
      <main className="flex-1 min-h-screen flex flex-col bg-background relative overflow-y-auto">
        {/* Animated Background Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] -z-10 animate-pulse-slow" />

        {/* Status Header - Dynamic Contextual Colors */}
        {status && (
          <div className={`w-full p-4 border-b animate-in slide-in-from-top duration-300 flex items-center gap-3 font-bold text-xs uppercase tracking-wider ${statusStyle}`}>
            {status.toLowerCase().includes("fetching") ? <Loader2 size={16} className="animate-spin" /> : status.toLowerCase().includes("error") ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{status}</span>
          </div>
        )}

        <div className="p-8 lg:p-16 max-w-4xl w-full mx-auto">
          {step === "site" && (
            <div className="animate-in fade-in duration-500">
              <SiteConfigForm onSubmit={handleSiteConfig} />
            </div>
          )}

          {step === "postType" && (
            <div className="animate-in fade-in duration-500">
              <PostTypeSelector
                endpoint={endpoint}
                token={token}
                onSelect={handlePostTypeSelect}
              />
            </div>
          )}

          {step === "fields" && (
            <div className="animate-in fade-in duration-500">
              <FieldSelector fields={fields} sampleData={sampleData} onSelect={handleFieldsSelect} />
            </div>
          )}

          {step === "export" && (
            <div className="animate-in fade-in duration-500 flex flex-col items-center text-center space-y-12 py-12">
              <div className="p-10 bg-primary/5 border border-primary/20 relative group">
                <FileBox size={80} className="text-primary group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute -inset-1 bg-primary/20 blur opacity-30 -z-10 group-hover:opacity-50 transition-opacity" />
              </div>
              <div className="space-y-4 max-w-md">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic">Export Ready</h2>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                  The data for <span className="text-primary font-bold underline decoration-wavy underline-offset-4">{postType}</span> has been processed. Download the CSV below to proceed.
                </p>
              </div>
              <div className="w-full max-w-xs pt-4">
                <ExportButton endpoint={endpoint} postType={postType} fields={fields} token={token} />
              </div>
              <button
                onClick={() => setStep("fields")}
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1"
              >
                ← Back to configuration
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
