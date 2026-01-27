import { Outlet } from "react-router-dom";
import { MainLayout } from "components/layout/main-layout";

export default function HomePage() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
