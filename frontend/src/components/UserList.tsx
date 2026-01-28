import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Input } from "components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table";
import { Badge } from "components/ui/badge";
import { apiRequest } from "services/api";

export default function UserList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const USERS_PAGE_SIZE = 10;
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiRequest<{ users: any[] }>("/api/admin/users"),
  });

  const users = data?.users ?? [];
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredUsers = normalizedSearch
    ? users.filter((user) => {
        const haystack = [
          user.firstName,
          user.lastName,
          user.email,
          user.role,
          user.isActive ? "active" : "inactive",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      })
    : users;

  useEffect(() => {
    setUsersPage(1);
  }, [searchTerm]);

  const totalUsers = filteredUsers.length;
  const totalUserPages = Math.max(Math.ceil(totalUsers / USERS_PAGE_SIZE), 1);
  const clampedUsersPage = Math.min(usersPage, totalUserPages);
  const pagedUsers = filteredUsers.slice(
    (clampedUsersPage - 1) * USERS_PAGE_SIZE,
    clampedUsersPage * USERS_PAGE_SIZE,
  );

  useEffect(() => {
    if (usersPage > totalUserPages) {
      setUsersPage(totalUserPages);
    }
  }, [usersPage, totalUserPages]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Users</CardTitle>
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="h-9 w-full sm:w-32"
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : totalUsers === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                  {normalizedSearch ? "No matching users" : "No users available."}
                </TableCell>
              </TableRow>
            ) : (
              pagedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {totalUsers > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(clampedUsersPage - 1) * USERS_PAGE_SIZE + 1} to{" "}
              {Math.min(clampedUsersPage * USERS_PAGE_SIZE, totalUsers)} of{" "}
              {totalUsers} users
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={clampedUsersPage === 1}
                onClick={() => setUsersPage(clampedUsersPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={clampedUsersPage >= totalUserPages}
                onClick={() => setUsersPage(clampedUsersPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
