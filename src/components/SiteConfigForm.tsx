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
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionOk, setConnectionOk] = useState(false);

  async function testConnection() {
    setTesting(true);
    setError(null);
    setConnectionOk(false);
    try {
      if (!endpoint) {
        setError("Please enter a WordPress site URL");
        setTesting(false);
        return;
      }
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const url = new URL("/wp-json/wp/v2/types", endpoint).toString();
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let hint = "";
        if (res.status === 401 || res.status === 403) {
          hint = " Authentication required or token invalid.";
        } else if (res.status === 404) {
          hint = " Check if this is a valid WordPress site with REST API enabled.";
        }
        throw new Error(`Server returned ${res.status}: ${res.statusText}.${hint}`);
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
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-3">WordPress Site Configuration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Enter your WordPress site URL. REST API must be enabled (default in most WordPress installations).
          </p>
        </div>

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

        <div className="flex gap-2">
          <Button 
            onClick={testConnection} 
            disabled={testing || !endpoint}
            variant={connectionOk ? "success" : "secondary"}
          >
            {testing ? "Testing…" : connectionOk ? "✓ Connection OK" : "Test Connection"}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !connectionOk}
            variant="primary"
          >
            {loading ? "Connecting…" : "Continue"}
          </Button>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
      </div>
    </Card>
  );
}
