import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { apiRequest } from "services/api";

export default function ServerStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ["server-status"],
    queryFn: () => apiRequest<{ status: string; mode?: string }>("/api/health"),
  });

  const statusLabel = isLoading ? "Checking" : data?.status ?? "Unknown";
  const badgeVariant = statusLabel === "ok" ? "default" : "secondary";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server Status</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Badge variant={badgeVariant}>{statusLabel}</Badge>
        <span className="text-sm text-muted-foreground">
          {data?.mode ?? "No backend configured"}
        </span>
      </CardContent>
    </Card>
  );
}
