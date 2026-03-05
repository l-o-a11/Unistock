import { Outlet } from "react-router-dom";
import Navbar from "../feature/shared/components/layout/navbar";
import Sidebar from "../feature/shared/components/layout/sidebar";

export default function AppLayout() {
  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-full z-40">
        <Sidebar />
      </div>

      {/* Main content - pushed to the right of sidebar */}
      <div className="flex flex-col h-full" style={{ marginLeft: '121px' }}>
        {/* Navbar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shrink-0">
          <Navbar />
        </div>
        
        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
