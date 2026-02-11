import { NavLink } from "react-router-dom";
import { BarChart3, Users, ShoppingCart, Briefcase } from "lucide-react";

export default function Sidebar() {
  const menu = [
    { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { to: "/usuarios", icon: Users, label: "Usuarios" },
    { to: "/productos", icon: ShoppingCart, label: "Productos" },
    { to: "/empleados", icon: Briefcase, label: "Empleados" },
  ];

  return (
    <aside className="w-[90px] h-screen bg-white border-r border-gray-200 flex flex-col items-center py-6">
      {/* Logo */}
      <div className="w-14 h-14 rounded-2xl bg-fuchsia-500" />

      {/* Menu */}
      <nav className="mt-14 flex flex-col gap-10">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) =>
                `w-14 h-14 rounded-2xl flex items-center justify-center transition
                 ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}`
              }
            >
              <Icon size={28} className="text-black" />
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
