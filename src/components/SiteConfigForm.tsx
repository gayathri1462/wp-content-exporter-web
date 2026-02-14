"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch";
import { Globe, Key, AlertCircle, CheckCircle2, Search } from "lucide-react";

type Props = {
  onSubmit: (endpoint: string, headers: Record<string, string>) => Promise<void>;
};

export default function SiteConfigForm({ onSubmit }: Props) {
  const [endpoint, setEndpoint] = useState("");
  const [useAuth, setUseAuth] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionOk, setConnectionOk] = useState(false);

  function buildBasicAuthHeader(creds: string) {
    return `Basic ${btoa(creds)}`;
  }

  async function testConnection() {
    setTesting(true);
    setError(null);
    setConnectionOk(false);

    try {
      if (!endpoint) {
        setError("Please enter a WordPress site URL");
        return;
      }

      if (useAuth && !token) {
        setError("Please enter username and application password");
        return;
      }

      const res = await fetch("/api/test-wp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: endpoint.startsWith("http")
            ? endpoint
            : `https://${endpoint}`,
          auth:
            useAuth && token ? buildBasicAuthHeader(token) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Connection failed");
      }

      setConnectionOk(true);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Connection failed: ${msg}`);
      setConnectionOk(false);
    } finally {
      setTesting(false);
    }
  }


  async function handleSubmit() {
    if (!connectionOk) {
      setError("Please test the connection first");
      return;
    }
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      const finalEndpoint = endpoint.startsWith("http") ? endpoint : `https://${endpoint}`;
      if (useAuth && token) {
        headers["Authorization"] = buildBasicAuthHeader(token);
      }
      await onSubmit(finalEndpoint, headers);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to connect");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="animate-in fade-in zoom-in-95 duration-500">
      <div className="space-y-6">
        <header>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Globe size={18} />
            <h3 className="font-bold text-lg">WordPress Site Configuration</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect to your WordPress site via the REST API to begin exporting.
          </p>
        </header>

        <div className="space-y-4">
          <Input
            label="Site URL"
            placeholder="https://your-wordpress-site.com/"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="font-medium"
          />

          <div className="p-5 rounded-2xl bg-secondary/30 border border-border/50 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Key size={16} className="text-primary" />
                <span>Authenticated (Application Password)</span>
              </div>
              <Switch checked={useAuth} onChange={setUseAuth} />
            </div>

            {useAuth && (
              <Input
                type="password"
                placeholder="username:application-password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="bg-background"
                animate-in fade-in slide-in-from-top-2 duration-300
              />
            )}
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Required if your REST API is restricted or if you need to export private content.
              {useAuth && (
                <span className="block mt-1 text-primary/80">
                  Authentication is tested securely via our server. Browser CORS restrictions do not affect exports.
                </span>
              )}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in shake duration-500">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {connectionOk && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-sm animate-in zoom-in-95 shadow-sm shadow-green-500/5">
            <CheckCircle2 size={16} />
            <p className="font-semibold">Connection verified successfully!</p>
          </div>
        )}

        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 pt-2">
          <Button
            onClick={testConnection}
            disabled={testing || !endpoint}
            variant={connectionOk ? "success" : "secondary"}
            className="w-full"
          >
            {testing ? (
              <span className="flex items-center gap-2">
                <Search size={16} className="animate-pulse" /> Testing...
              </span>
            ) : connectionOk ? "Verified" : "Verify Connection"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !connectionOk}
            variant="primary"
            className="w-full font-bold"
          >
            {loading ? "Connecting..." : "Continue"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
