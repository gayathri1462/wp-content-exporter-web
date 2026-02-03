"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch";

type Props = {
  onSubmit: (endpoint: string, headers: Record<string, string>) => Promise<void>;
};

export default function SiteConfigForm({ onSubmit }: Props) {
  const [endpoint, setEndpoint] = useState("");
  const [useAuth, setUseAuth] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!endpoint) {
      setError("WordPress URL is required");
      return;
    }
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (useAuth && token) headers["Authorization"] = `Bearer ${token}`;
      await onSubmit(endpoint, headers);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to connect");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="space-y-3">
        <Input
          label="WordPress Site URL"
          placeholder="https://example.com"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <Switch checked={useAuth} onChange={setUseAuth} label="Require Authentication" />
          {useAuth && (
            <Input
              type="password"
              placeholder="Bearer token"
              className="w-64"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          )}
        </div>

        <Button onClick={handleSubmit} disabled={loading || !endpoint} variant="primary">
          {loading ? "Connecting…" : "Connect"}
        </Button>

        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
    </Card>
  );
}
