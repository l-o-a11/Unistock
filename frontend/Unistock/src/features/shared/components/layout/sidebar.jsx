import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../AuthContext";

import DashboardIcon from "../../../../assets/icons/Dashboard";
import UsuariosIcon from "../../../../assets/icons/Usuarios";
import ComprasIcon from "../../../../assets/icons/Compras";
import ProduccionIcon from "../../../../assets/icons/Produccion";
import SedesIcon from "../../../../assets/icons/sedes";
import ConfigIcon from "../../../../assets/icons/Config";
import logo from "../../../../assets/transparent-Photoroom.png";

const ALL_MENU_ITEMS = [
  { id: "dashboard", name: "Dashboard", icon: DashboardIcon, hasSubmenu: false, path: "/layout/dashboard", modulo: "dashboard" },
  { id: "usuarios",  name: "Usuarios",  icon: UsuariosIcon,  hasSubmenu: false, path: "/layout/usuarios",  modulo: "usuarios"  },
  {
    id: "compras", name: "Compras", icon: ComprasIcon, hasSubmenu: true,
    submenu: [
      { name: "Categorías", path: "categorias-insumos", modulo: "categorias-insumos" },
      { name: "Insumos",    path: "insumos",            modulo: "insumos"            },
      { name: "Proveedores",path: "proveedores",        modulo: "proveedores"        },
      { name: "Compras",    path: "compras",            modulo: "compras"            },
    ],
  },
  {
    id: "produccion", name: "Producción", icon: ProduccionIcon, hasSubmenu: true,
    submenu: [
      { name: "Categorías", path: "categorias", modulo: "categorias" },
      { name: "Productos",  path: "productos",  modulo: "productos"  },
      { name: "Producción", path: "produccion", modulo: "produccion" },
      { name: "Terceros",   path: "terceros",   modulo: "terceros"   },
      { name: "Empleados",  path: "empleados",  modulo: "empleados"  },
    ],
  },
  { id: "sedes", name: "Sedes", icon: SedesIcon, hasSubmenu: false, path: "/layout/sedes", modulo: "sedes" },
];

const BOTTOM_ITEM = { id: "configuracion", name: "Roles", icon: ConfigIcon, hasSubmenu: false, path: "/layout/roles", modulo: "roles" };

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
}

export default function Sidebar() {
  const { canAccess, loading } = useAuthContext();
  const isMobile    = useIsMobile();
  const [expanded,      setExpanded]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [activeMenu,    setActiveMenu]    = useState(null);
  const [openSubmenu,   setOpenSubmenu]   = useState(null);
  const [activeSubItem, setActiveSubItem] = useState(null);
  const navigate   = useNavigate();
  const leaveTimer = useRef(null);

  // Escucha evento global del Navbar hamburguesa
  const handleToggle = useCallback(() => setMobileOpen(v => !v), []);
  useEffect(() => {
    window.addEventListener("sidebar:toggle", handleToggle);
    return () => window.removeEventListener("sidebar:toggle", handleToggle);
  }, [handleToggle]);

  useEffect(() => { if (!isMobile) setMobileOpen(false); }, [isMobile]);

  const visibleMenuItems = ALL_MENU_ITEMS.filter(item =>
    !item.hasSubmenu ? canAccess(item.modulo) : item.submenu?.some(s => canAccess(s.modulo))
  ).map(item =>
    !item.hasSubmenu ? item : { ...item, submenu: item.submenu.filter(s => canAccess(s.modulo)) }
  );
  const showBottomItem = canAccess(BOTTOM_ITEM.modulo);

  const handleMouseEnter = () => { if (!isMobile) { clearTimeout(leaveTimer.current); setExpanded(true); } };
  const handleMouseLeave = () => {
    if (!isMobile) leaveTimer.current = setTimeout(() => { setExpanded(false); setOpenSubmenu(null); }, 120);
  };

  const handleMenuClick = (item) => {
    if (!item.hasSubmenu) {
      setActiveMenu(item.id); setOpenSubmenu(null); setActiveSubItem(null);
      navigate(item.path);
      if (isMobile) setMobileOpen(false);
    } else {
      setActiveMenu(item.id);
      setOpenSubmenu(prev => prev === item.id ? null : item.id);
    }
  };

  const handleSubitemClick = (subitem, key) => {
    setActiveSubItem(key);
    navigate("/layout/" + subitem.path);
    if (isMobile) setMobileOpen(false);
  };

  const iconColor = active => active ? "#ec4899" : "#111827";
  const isExpanded = isMobile ? true : expanded;

  if (loading) {
    return (
      <div style={{ width: 72, height: "100vh", background: "#fff", borderRight: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #f3f4f6", borderTopColor: "#FF4FD6", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const CSS = `
    .sidebar-wrap { will-change: width; }
    .sidebar-wrap * { font-family: 'Nunito','Plus Jakarta Sans',sans-serif; }
    .sb-btn { border:none; cursor:pointer; width:100%; display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; background:transparent; transition:background 0.12s; text-align:left; }
    .sb-btn:hover,.sb-btn.active { background:#fdf2f8; }
    .sb-label { font-size:13px; font-weight:600; color:#374151; white-space:nowrap; overflow:hidden; flex:1; max-width:200px; transition:max-width 0.18s ease,opacity 0.18s ease; }
    .sb-label.hidden { max-width:0; opacity:0; pointer-events:none; }
    .sb-label.active { color:#ec4899; font-weight:700; }
    .sb-chevron { flex-shrink:0; transition:transform 0.18s ease,opacity 0.18s ease; }
    .sb-chevron.hidden { opacity:0; pointer-events:none; }
    .sb-chevron.open { transform:rotate(180deg); }
    .sb-submenu { overflow:hidden; transition:max-height 0.2s ease,opacity 0.15s ease; }
    .sb-subitem { border:none; cursor:pointer; background:transparent; border-radius:8px; display:flex; align-items:center; gap:10px; padding:9px 12px; width:100%; text-align:left; font-size:13px; color:#9ca3af; font-weight:500; transition:background 0.1s,color 0.1s; }
    .sb-subitem:hover,.sb-subitem.active { background:#fdf2f8; color:#ec4899; font-weight:700; }
    .sb-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:199; backdrop-filter:blur(2px); animation:sbFadeIn 0.2s ease; }
    .sb-drawer  { position:fixed; top:0; left:0; height:100vh; z-index:200; animation:sbSlideIn 0.22s cubic-bezier(0.4,0,0.2,1); }
    @keyframes sbFadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes sbSlideIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }
  `;

  const NavContent = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", padding:"18px 16px 10px", gap:10, minHeight:68 }}>
        <div style={{ width:40, height:40, borderRadius:12, overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <img src={logo} alt="Logo" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        </div>
        <div style={{ overflow:"hidden", maxWidth: isExpanded ? 140 : 0, opacity: isExpanded ? 1 : 0, transition:"max-width 0.18s ease,opacity 0.18s ease", whiteSpace:"nowrap" }}>
          <p style={{ fontSize:18, fontWeight:700, color:"#111827", margin:0, lineHeight:1.2 }}>Putongas</p>
        </div>
        {isMobile && (
          <button onClick={() => setMobileOpen(false)}
            style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:"#9ca3af", display:"flex", alignItems:"center", padding:4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      <div style={{ width:"65%", height:1, background:"#f3f4f6", margin:"0 auto 6px" }} />

      <nav style={{ flex:1, overflowY:"auto", overflowX:"hidden", display:"flex", flexDirection:"column", gap:2, padding:"0 8px" }}>
        {visibleMenuItems.map(item => {
          const Icon     = item.icon;
          const isActive = activeMenu === item.id;
          const isOpen   = openSubmenu === item.id;
          return (
            <div key={item.id}>
              <button onClick={() => handleMenuClick(item)} title={!isExpanded ? item.name : undefined}
                className={`sb-btn${isActive ? " active" : ""}`}>
                <Icon style={{ width:24, height:24, flexShrink:0, color:iconColor(isActive), transition:"color 0.12s" }} />
                <span className={`sb-label${isExpanded ? "" : " hidden"}${isActive ? " active" : ""}`}>{item.name}</span>
                {item.hasSubmenu && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#ec4899" : "#9ca3af"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className={`sb-chevron${isExpanded ? "" : " hidden"}${isOpen ? " open" : ""}`}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                )}
              </button>
              {item.hasSubmenu && (
                <div className="sb-submenu" style={{ maxHeight: isOpen && isExpanded ? item.submenu.length * 40 + "px" : "0px", opacity: isOpen && isExpanded ? 1 : 0 }}>
                  <div style={{ marginLeft:12, borderLeft:"3px solid #f9a8d4", paddingLeft:6, marginTop:2, marginBottom:4 }}>
                    {item.submenu.map((subitem, i) => {
                      const key = item.id + "-" + i;
                      return (
                        <button key={i} onClick={() => handleSubitemClick(subitem, key)}
                          className={`sb-subitem${activeSubItem === key ? " active" : ""}`}>
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

      {showBottomItem && (
        <div style={{ padding:"0 8px 18px" }}>
          <div style={{ width:"65%", height:1, background:"#f3f4f6", margin:"0 auto 6px" }} />
          {(() => {
            const item = BOTTOM_ITEM; const Icon = item.icon; const isActive = activeMenu === item.id;
            return (
              <button onClick={() => handleMenuClick(item)} title={!isExpanded ? item.name : undefined}
                className={`sb-btn${isActive ? " active" : ""}`}>
                <Icon style={{ width:24, height:24, flexShrink:0, color:iconColor(isActive), transition:"color 0.12s" }} />
                <span className={`sb-label${isExpanded ? "" : " hidden"}${isActive ? " active" : ""}`}>{item.name}</span>
              </button>
            );
          })()}
        </div>
      )}
    </div>
  );

  // ── Mobile: drawer overlay (no ocupa espacio en el layout) ───────
  if (isMobile) {
    return (
      <>
        <style>{CSS}</style>
        {mobileOpen && (
          <>
            <div className="sb-backdrop" onClick={() => setMobileOpen(false)} />
            <div className="sb-drawer sidebar-wrap"
              style={{ width:240, background:"#fff", borderRight:"1px solid #f3f4f6", boxShadow:"4px 0 24px rgba(0,0,0,0.12)" }}>
              <NavContent />
            </div>
          </>
        )}
      </>
    );
  }

  // ── Desktop: rail expandible al hover ────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="sidebar-wrap" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
        style={{ width: expanded ? 224 : 72, transition:"width 0.2s ease", height:"100vh", background:"#fff", borderRight:"1px solid #f3f4f6", boxShadow:"2px 0 10px rgba(0,0,0,0.04)", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 }}>
        <NavContent />
      </div>
    </>
  );
}
