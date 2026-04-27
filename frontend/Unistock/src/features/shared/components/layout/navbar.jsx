import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings, ChevronUp, ChevronDown } from "lucide-react";
import { AuthAPI } from "../../../auth/services/AuthAPI";
import { useRoles } from "../../../roles/hooks/useRoles";
import { useSedes } from "../../../sedes/hooks/useSedes";
import Alert from "../Alert";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const session   = AuthAPI.getSession();
  const { roles } = useRoles();
  const { sedes } = useSedes();

  const roleName = roles.find(r => r.id === session?.rolId)?.nombre ?? "";
  const sedeName = sedes.find(s => s.id === session?.sedeId)?.nombre ?? "";

  const user = {
    name:  session?.nombre ?? "Usuario",
    email: session?.correo ?? "",
    rol:   roleName,
    sede:  sedeName,
  };

  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cerrarSesion     = () => { setOpen(false); setShowLogoutConfirm(true); };
  const confirmarCerrar  = () => { setShowLogoutConfirm(false); AuthAPI.logout(); navigate("/"); };
  const editarPerfil     = () => { navigate("/layout/perfil"); setOpen(false); };

  // Dispara el evento global que escucha el Sidebar
  const toggleSidebar = () => window.dispatchEvent(new CustomEvent("sidebar:toggle"));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
        .navbar-root * { font-family:'Nunito',sans-serif; box-sizing:border-box; }

        /* Botón hamburguesa — visible solo en móvil */
        .nb-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          color: #374151;
          transition: background 0.12s;
        }
        .nb-hamburger:hover { background: #f3f4f6; }
        @media (max-width: 767px) {
          .nb-hamburger { display: flex; align-items: center; justify-content: center; }
        }

        /* Nombre de usuario — se trunca en pantallas pequeñas */
        .nb-user-info { text-align: left; overflow: hidden; max-width: 140px; }
        @media (max-width: 480px) { .nb-user-info { display: none; } }

        .navbar-trigger {
          display: flex; align-items: center; gap: 10px;
          padding: 6px 12px 6px 6px; border-radius: 50px;
          border: 1.5px solid #f3f4f6; background: #fff;
          cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .navbar-trigger:hover { border-color: #fce7f3; box-shadow: 0 2px 8px rgba(236,72,153,0.08); }
        .navbar-trigger.open  { border-color: #f9a8d4; box-shadow: 0 2px 12px rgba(236,72,153,0.12); }

        .avatar-wrap   { position:relative; width:40px; height:40px; flex-shrink:0; }
        .avatar-circle { width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg,#fce7f3,#fbcfe8); display:flex; align-items:center; justify-content:center; }
        .online-dot    { position:absolute; bottom:1px; right:1px; width:9px; height:9px; border-radius:50%; background:#22c55e; border:2px solid #fff; }

        .dropdown-card {
          position:absolute; top:calc(100% + 10px); right:0; width:280px;
          background:#fff; border-radius:18px;
          box-shadow:0 16px 48px rgba(0,0,0,0.18),0 4px 16px rgba(0,0,0,0.10);
          border:1px solid #e5e7eb; z-index:100; overflow:hidden;
          animation:dropIn 0.18s cubic-bezier(0.4,0,0.2,1);
        }
        /* Ajuste dropdown en móvil para no salirse de la pantalla */
        @media (max-width: 380px) { .dropdown-card { width: calc(100vw - 24px); right: -8px; } }
        @keyframes dropIn { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }

        .dropdown-header  { padding:18px 18px 14px; display:flex; align-items:center; gap:12px; border-bottom:1px solid #f9fafb; }
        .avatar-lg        { width:46px; height:46px; border-radius:50%; background:linear-gradient(135deg,#fce7f3,#fbcfe8); display:flex; align-items:center; justify-content:center; flex-shrink:0; position:relative; }
        .online-dot-lg    { position:absolute; bottom:2px; right:2px; width:11px; height:11px; border-radius:50%; background:#22c55e; border:2px solid #fff; }
        .dropdown-body    { padding:12px 18px; display:flex; flex-direction:column; gap:12px; border-bottom:1px solid #f9fafb; }
        .info-row         { display:flex; flex-direction:column; gap:1px; }
        .info-label       { font-size:10px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#9ca3af; }
        .info-value       { font-size:13px; font-weight:500; color:#111827; }
        .dropdown-actions { padding:10px 18px 14px; display:flex; flex-direction:column; gap:2px; }
        .action-btn       { display:flex; align-items:center; gap:12px; padding:9px 10px; border-radius:10px; border:none; background:transparent; cursor:pointer; width:100%; text-align:left; transition:background 0.13s; font-size:13px; font-weight:600; }
        .action-btn:hover { background:#f9fafb; }
        .action-btn.danger { color:#ec4899; }
        .action-btn.danger:hover { background:#fdf2f8; }
        .action-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
      `}</style>

      <nav className="navbar-root"
        style={{ width:"100%", background:"#fff", borderBottom:"1px solid #f3f4f6", padding:"0 16px", height:64, display:"flex", alignItems:"center", justifyContent:"flex-end" }}>

        {/* Hamburguesa — solo visible en móvil */}
        <button className="nb-hamburger" onClick={toggleSidebar} aria-label="Abrir menú" style={{ marginRight:"auto" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Perfil de usuario */}
        <div ref={dropdownRef} style={{ position:"relative" }}>
          <button className={`navbar-trigger${open ? " open" : ""}`} onClick={() => setOpen(v => !v)}>
            <div className="avatar-wrap">
              <div className="avatar-circle"><User size={18} color="#ec4899" /></div>
              <span className="online-dot" />
            </div>

            <div className="nb-user-info">
              <p style={{ margin:0, fontSize:15, fontWeight:800, color:"#111827", lineHeight:1.3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</p>
              <p style={{ margin:0, fontSize:12, fontWeight:600, color:"#6b7280", lineHeight:1.3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.rol}</p>
            </div>

            {open ? <ChevronUp size={14} color="#9ca3af"/> : <ChevronDown size={14} color="#9ca3af"/>}
          </button>

          {open && (
            <div className="dropdown-card">
              <div className="dropdown-header">
                <div className="avatar-lg">
                  <User size={22} color="#ec4899"/>
                  <span className="online-dot-lg"/>
                </div>
                <div>
                  <p style={{ margin:0, fontSize:14, fontWeight:700, color:"#111827" }}>{user.name}</p>
                  <p style={{ margin:0, fontSize:12, color:"#6b7280", fontWeight:500 }}>{user.rol}</p>
                </div>
              </div>

              <div className="dropdown-body">
                <div className="info-row"><span className="info-label">Correo</span><span className="info-value">{user.email||"—"}</span></div>
                <div className="info-row"><span className="info-label">Rol</span><span className="info-value">{user.rol||"—"}</span></div>
                <div className="info-row"><span className="info-label">Sede</span><span className="info-value">{user.sede||"—"}</span></div>
              </div>

              <div className="dropdown-actions">
                <button className="action-btn" onClick={editarPerfil}>
                  <span className="action-icon" style={{ background:"#f9fafb" }}><Settings size={15} color="#6b7280"/></span>
                  <div>
                    <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#111827" }}>Editar Cuenta</p>
                    <p style={{ margin:0, fontSize:11, color:"#9ca3af", fontWeight:400 }}>Modificar información personal</p>
                  </div>
                </button>
                <button className="action-btn danger" onClick={cerrarSesion}>
                  <span className="action-icon" style={{ background:"#fdf2f8" }}><LogOut size={15} color="#ec4899"/></span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <Alert
        isOpen={showLogoutConfirm}
        type="confirm"
        title="Cerrar Sesión"
        message="¿Seguro que deseas cerrar sesión?"
        onConfirm={confirmarCerrar}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default Navbar;
