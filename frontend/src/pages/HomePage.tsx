import { Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "components/layout/main-layout";
import { useUser } from "lib/user-context";

export default function HomePage() {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
