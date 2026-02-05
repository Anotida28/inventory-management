"use client";

import { useState, FormEvent } from "react";
import { useUser } from "lib/user-context";
import { apiRequest } from "services/api";
import { useNavigate } from "react-router-dom";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";

import { Card } from "components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useUser();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!username || !password) {
        setError("Please enter a username and password.");
        setLoading(false);
        return;
      }

      const response = await apiRequest<{
        status: string;
        source: "local" | "localAdmin" | "ad";
        user?: { username: string; role?: string };
        data?: {
          fullname: string;
          employeeID: string;
          email: string;
          title: string;
          businessUnit: string;
          mobile: string;
        };
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (response.status !== "success") {
        throw new Error("Login failed");
      }

      // Build user object based on source
      const userData: import("lib/user-context").User = response.source === "ad"
        ? {
            username: response.data?.fullname || username,
            fullname: response.data?.fullname,
            email: response.data?.email,
            title: response.data?.title,
            employeeID: response.data?.employeeID,
            businessUnit: response.data?.businessUnit,
            mobile: response.data?.mobile,
            source: response.source,
          }
        : {
            username: response.user?.username || username,
            source: response.source,
          };

      setUser(userData);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-100 p-0 sm:p-4 relative dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {/* Background image for extra branding, optional */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none select-none">
        <img
          src="/images/230135_3_Landing page_14.jpg"
          alt="Background"
          className="h-full w-full object-cover"
        />
      </div>
      <Card className="w-full max-w-md p-8 shadow-2xl z-10 relative bg-card/90 backdrop-blur-md dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_40px_80px_rgba(0,0,0,0.6)]">
        <div className="mb-8 text-center flex flex-col items-center">
          <img
            src="/images/20251022_100241_OMARI_LOGO_WITH_AFFILLIATE_STATEMENT_GRADIENT_GREEN_HORIZONTAL_VECTOR_05_page-0001.jpg.png"
            alt="Omari Logo"
            width={325}
            height={95}
            className="mb-4"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              className="w-full"
            />
          </div>


          {error && (
            <Alert variant="destructive" className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 text-red-500 dark:text-red-400" />
              <div>
                <AlertTitle className="text-sm font-semibold">Login Failed</AlertTitle>
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </div>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Default credentials section removed as requested */}
      </Card>
    </div>
  );
}
