import { Outlet } from "react-router-dom";
import Navbar from "../features/shared/components/layout/navbar";
import Sidebar from "../features/shared/components/layout/sidebar";

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Navbar */}
        <div className="sticky top-0 z-30 shrink-0">
          <Navbar />
        </div>

        {/* Main scrollable content */}
        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}