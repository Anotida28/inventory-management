import { useState } from "react";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Input } from "components/ui/input";
import { apiRequest } from "services/api";

export default function ApiTester() {
  const [endpoint, setEndpoint] = useState("/api/health");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(endpoint);
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setResponse(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={endpoint}
            onChange={(event) => setEndpoint(event.target.value)}
            placeholder="/api/health"
          />
          <Button onClick={handleTest} disabled={loading}>
            {loading ? "Testing..." : "Run"}
          </Button>
        </div>
        <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
{response || "Response will appear here."}
        </pre>
      </CardContent>
    </Card>
  );
}
