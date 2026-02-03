"use client";

import React, { useState } from "react";
import SiteConfigForm from "@/components/SiteConfigForm";
import PostTypeSelector from "@/components/PostTypeSelector";
import FieldSelector from "@/components/FieldSelector";
import ExportButton from "@/components/ExportButton";
import { fetchAllPosts, inferFieldsFromPost } from "@/lib/exporterUtils";

type Step = "site" | "postType" | "fields" | "export";

export default function ExporterPage() {
  const [step, setStep] = useState<Step>("site");
  const [endpoint, setEndpoint] = useState("");
  const [token, setToken] = useState("");
  const [postType, setPostType] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [status, setStatus] = useState("");

  async function handleSiteConfig(ep: string, hdrs: Record<string, string>) {
    setEndpoint(ep);
    // Extract token from Authorization header if present
    const authHeader = hdrs.Authorization || "";
    const tokenValue = authHeader.replace(/^Bearer\s+/, "");
    setToken(tokenValue);
    setStep("postType");
  }

  async function handlePostTypeSelect(pt: string) {
    setPostType(pt);
    setStatus("Fetching sample post…");
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const sample = await fetchAllPosts(endpoint, pt, headers, 1);
      if (sample.length === 0) throw new Error("No posts found");
      const inferred = inferFieldsFromPost(sample[0]);
      setFields(inferred);
      setStep("fields");
      setStatus("");
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function handleFieldsSelect(selected: string[]) {
    setFields(selected);
    setStep("export");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <main className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">WordPress Content Exporter</h1>
          <p className="text-gray-600 mt-2">Export WordPress posts to CSV with custom fields</p>
        </header>

        {status && <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">{status}</div>}

        <div className="space-y-6">
          {step === "site" && <SiteConfigForm onSubmit={handleSiteConfig} />}

          {(step === "postType" || step === "fields" || step === "export") && (
            <div>
              <h2 className="text-lg font-semibold mb-3">✓ Site Connected</h2>
              <PostTypeSelector
                endpoint={endpoint}
                token={token}
                onSelect={handlePostTypeSelect}
              />
            </div>
          )}

          {(step === "fields" || step === "export") && (
            <div>
              <h2 className="text-lg font-semibold mb-3">✓ Post Type: {postType}</h2>
              <FieldSelector fields={fields} onSelect={handleFieldsSelect} />
            </div>
          )}

          {step === "export" && (
            <div>
              <h2 className="text-lg font-semibold mb-3">✓ Ready to Export</h2>
              <ExportButton endpoint={endpoint} postType={postType} fields={fields} token={token} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
