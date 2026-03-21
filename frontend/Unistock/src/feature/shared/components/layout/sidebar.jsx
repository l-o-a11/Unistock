import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import DashboardIcon from "../../../../assets/icons/Dashboard";
import UsuariosIcon from "../../../../assets/icons/Usuarios";
import ComprasIcon from "../../../../assets/icons/Compras";
import ProduccionIcon from "../../../../assets/icons/Produccion";
import SedesIcon from "../../../../assets/icons/sedes";
import ConfigIcon from "../../../../assets/icons/Config";
import logo from "../../../../assets/transparent-Photoroom.png";

const mainMenuItems = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: DashboardIcon,
    hasSubmenu: false,
    path: "/layout/dashboard",
  },
  {
    id: "usuarios",
    name: "Usuarios",
    icon: UsuariosIcon,
    hasSubmenu: false,
    path: "/layout/usuarios",
  },
  {
    id: "compras",
    name: "Compras",
    icon: ComprasIcon,
    hasSubmenu: true,
    submenu: [
      { name: "Categorías", path: "categorias-insumos" },
      { name: "Insumos", path: "insumos" },
      { name: "Proveedores", path: "proveedores" },
      { name: "Compras", path: "compras" },
    ],
  },
  {
    id: "produccion",
    name: "Producción",
    icon: ProduccionIcon,
    hasSubmenu: true,
    submenu: [
      { name: "Categorías", path: "categorias" },
      { name: "Productos", path: "productos" },
      { name: "Producción", path: "produccion" },
      { name: "Terceros", path: "terceros" },
      { name: "Empleados", path: "empleados" },
    ],
  },
  {
    id: "sedes",
    name: "Sedes",
    icon: SedesIcon,
    hasSubmenu: false,
    path: "/layout/sedes",
  },
];

const bottomMenuItem = {
  id: "configuracion",
  name: "Roles",
  icon: ConfigIcon,
  hasSubmenu: false,
  path: "/layout/roles",
};

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [activeSubItem, setActiveSubItem] = useState(null);
  const navigate = useNavigate();
  const leaveTimer = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(leaveTimer.current);
    setExpanded(true);
  };

  const handleMouseLeave = () => {
    // Small delay so accidental mouse-outs don't flicker
    leaveTimer.current = setTimeout(() => {
      setExpanded(false);
      setOpenSubmenu(null);
    }, 120);
  };

  const handleMenuClick = (item) => {
    if (!item.hasSubmenu) {
      setActiveMenu(item.id);
      setOpenSubmenu(null);
      setActiveSubItem(null);
      navigate(item.path);
    } else {
      setActiveMenu(item.id);
      setOpenSubmenu((prev) => (prev === item.id ? null : item.id));
    }
  };

  const handleSubitemClick = (subitem, key) => {
    setActiveSubItem(key);
    navigate("/layout/" + subitem.path);
  };

  const iconColor = (active) => (active ? "#ec4899" : "#111827");

  return (
    <>
      <style>{`
        .sidebar-wrap { will-change: width; }
        .sidebar-wrap * { font-family: 'Nunito', 'Plus Jakarta Sans', sans-serif; }

        .sb-btn {
          border: none;
          cursor: pointer;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          background: transparent;
          transition: background 0.12s ease;
          text-align: left;
        }
        .sb-btn:hover { background: #fdf2f8; }
        .sb-btn.active { background: #fdf2f8; }

        .sb-label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          white-space: nowrap;
          overflow: hidden;
          flex: 1;
          max-width: 200px;
          transition: max-width 0.18s ease, opacity 0.18s ease;
        }
        .sb-label.hidden { max-width: 0; opacity: 0; pointer-events: none; }
        .sb-label.active { color: #ec4899; font-weight: 700; }

        .sb-chevron {
          flex-shrink: 0;
          transition: transform 0.18s ease, opacity 0.18s ease;
          opacity: 1;
        }
        .sb-chevron.hidden { opacity: 0; pointer-events: none; }
        .sb-chevron.open { transform: rotate(180deg); }

        .sb-submenu {
          overflow: hidden;
          transition: max-height 0.2s ease, opacity 0.15s ease;
        }

        .sb-subitem {
          border: none;
          cursor: pointer;
          background: transparent;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          width: 100%;
          text-align: left;
          font-size: 13px;
          color: #9ca3af;
          font-weight: 500;
          transition: background 0.1s ease, color 0.1s ease;
        }
        .sb-subitem:hover { background: #fdf2f8; color: #ec4899; font-weight: 600; }
        .sb-subitem.active { background: #fdf2f8; color: #ec4899; font-weight: 700; }
      `}</style>

      <div
        className="sidebar-wrap"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: expanded ? 224 : 72,
          transition: "width 0.2s ease",
          height: "100vh",
          background: "#fff",
          borderRight: "1px solid #f3f4f6",
          boxShadow: "2px 0 10px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "18px 16px 10px",
            gap: 10,
            minHeight: 68,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              overflow: "hidden",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div
            style={{
              overflow: "hidden",
              maxWidth: expanded ? 140 : 0,
              opacity: expanded ? 1 : 0,
              transition: "max-width 0.18s ease, opacity 0.18s ease",
              whiteSpace: "nowrap",
            }}
          >
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#111827",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Putongas
            </p>
          </div>
        </div>

        <div
          style={{
            width: "65%",
            height: 1,
            background: "#f3f4f6",
            margin: "0 auto 6px",
          }}
        />

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: "0 8px",
          }}
        >
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            const isOpen = openSubmenu === item.id;

            return (
              <div key={item.id}>
                <button
                  onClick={() => handleMenuClick(item)}
                  title={!expanded ? item.name : undefined}
                  className={`sb-btn${isActive ? " active" : ""}`}
                >
                  <Icon
                    style={{
                      width: 32,
                      height: 32,
                      flexShrink: 0,
                      color: iconColor(isActive),
                      transition: "color 0.12s ease",
                    }}
                  />
                  <span
                    className={`sb-label${expanded ? "" : " hidden"}${isActive ? " active" : ""}`}
                  >
                    {item.name}
                  </span>
                  {item.hasSubmenu && (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isActive ? "#ec4899" : "#9ca3af"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`sb-chevron${expanded ? "" : " hidden"}${isOpen ? " open" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </button>

                {item.hasSubmenu && (
                  <div
                    className="sb-submenu"
                    style={{
                      maxHeight:
                        isOpen && expanded
                          ? item.submenu.length * 40 + "px"
                          : "0px",
                      opacity: isOpen && expanded ? 1 : 0,
                    }}
                  >
                    <div
                      style={{
                        marginLeft: 12,
                        borderLeft: "3px solid #f9a8d4",
                        paddingLeft: 6,
                        marginTop: 2,
                        marginBottom: 4,
                      }}
                    >
                      {item.submenu.map((subitem, i) => {
                        const key = item.id + "-" + i;
                        const isSubActive = activeSubItem === key;
                        return (
                          <button
                            key={i}
                            onClick={() => handleSubitemClick(subitem, key)}
                            className={`sb-subitem${isSubActive ? " active" : ""}`}
                          >
                            {subitem.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Roles */}
        <div style={{ padding: "0 8px 18px" }}>
          <div
            style={{
              width: "65%",
              height: 1,
              background: "#f3f4f6",
              margin: "0 auto 6px",
            }}
          />
          {(() => {
            const item = bottomMenuItem;
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                onClick={() => handleMenuClick(item)}
                title={!expanded ? item.name : undefined}
                className={`sb-btn${isActive ? " active" : ""}`}
              >
                <Icon
                  style={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    color: iconColor(isActive),
                    transition: "color 0.12s ease",
                  }}
                />
                <span
                  className={`sb-label${expanded ? "" : " hidden"}${isActive ? " active" : ""}`}
                >
                  {item.name}
                </span>
              </button>
            );
          })()}
        </div>
      </div>
    </>
  );
}