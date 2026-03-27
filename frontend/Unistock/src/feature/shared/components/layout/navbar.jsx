import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Briefcase,
  MapPin,
  LogOut,
  Settings,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { AuthAPI } from "../../../auth/services/AuthAPI";
import Alert from "../Alert";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const session = AuthAPI.getSession();
  const user = {
    name: session?.nombre ?? "Usuario",
    email: session?.correo ?? "",
    rol: session?.rol ?? "",
    sede: session?.sede ?? "",
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cerrarSesion = () => {
    setOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmarCerrarSesion = () => {
    setShowLogoutConfirm(false);
    AuthAPI.logout();
    navigate("/");
  };

  const editarPerfil = () => {
    navigate("/layout/perfil");
    setOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

        .navbar-root * { font-family: 'Nunito', sans-serif; box-sizing: border-box; }

        .navbar-trigger {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 14px 8px 8px;
          border-radius: 50px;
          border: 1.5px solid #f3f4f6;
          background: #fff;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .navbar-trigger:hover {
          border-color: #fce7f3;
          box-shadow: 0 2px 8px rgba(236,72,153,0.08);
        }
        .navbar-trigger.open {
          border-color: #f9a8d4;
          box-shadow: 0 2px 12px rgba(236,72,153,0.12);
        }

        .avatar-wrap {
          position: relative;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
        }
        .avatar-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .online-dot {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #22c55e;
          border: 2px solid #fff;
        }

        .dropdown-card {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 280px;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10);
          border: 1px solid #e5e7eb;
          z-index: 100;
          overflow: hidden;
          animation: dropIn 0.18s cubic-bezier(0.4,0,0.2,1);
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .dropdown-header {
          padding: 18px 18px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #f9fafb;
        }

        .avatar-lg {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }
        .online-dot-lg {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #22c55e;
          border: 2px solid #fff;
        }

        .dropdown-body {
          padding: 12px 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-bottom: 1px solid #f9fafb;
        }

        .info-row {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .info-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #9ca3af;
        }
        .info-value {
          font-size: 13px;
          font-weight: 500;
          color: #111827;
        }

        .dropdown-actions {
          padding: 10px 18px 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 10px;
          border-radius: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: background 0.13s;
          font-size: 13px;
          font-weight: 600;
        }
        .action-btn:hover { background: #f9fafb; }

        .action-btn.danger { color: #ec4899; }
        .action-btn.danger:hover { background: #fdf2f8; }

        .action-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>

      <nav
        className="navbar-root"
        style={{
          width: "100%",
          background: "#fff",
          borderBottom: "1px solid #f3f4f6",
          padding: "0 24px",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <div ref={dropdownRef} style={{ position: "relative" }}>
          {/* Trigger */}
          <button
            className={`navbar-trigger ${open ? "open" : ""}`}
            onClick={() => setOpen((v) => !v)}
          >
            <div className="avatar-wrap">
              <div className="avatar-circle">
                <User size={18} color="#ec4899" />
              </div>
              <span className="online-dot" />
            </div>

            <div style={{ textAlign: "left" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.3,
                }}
              >
                {user.name}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#6b7280",
                  lineHeight: 1.3,
                }}
              >
                {user.rol}
              </p>
            </div>

            {open ? (
              <ChevronUp size={14} color="#9ca3af" />
            ) : (
              <ChevronDown size={14} color="#9ca3af" />
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="dropdown-card">
              {/* Header */}
              <div className="dropdown-header">
                <div className="avatar-lg">
                  <User size={22} color="#ec4899" />
                  <span className="online-dot-lg" />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {user.name}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    {user.rol}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="dropdown-body">
                <div className="info-row">
                  <span className="info-label">Correo</span>
                  <span className="info-value">{user.email || "—"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Rol</span>
                  <span className="info-value">{user.rol || "—"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Sede</span>
                  <span className="info-value">{user.sede || "—"}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="dropdown-actions">
                <button className="action-btn" onClick={editarPerfil}>
                  <span
                    className="action-icon"
                    style={{ background: "#f9fafb" }}
                  >
                    <Settings size={15} color="#6b7280" />
                  </span>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      Editar Cuenta
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: "#9ca3af",
                        fontWeight: 400,
                      }}
                    >
                      Modificar información personal
                    </p>
                  </div>
                </button>

                <button className="action-btn danger" onClick={cerrarSesion}>
                  <span
                    className="action-icon"
                    style={{ background: "#fdf2f8" }}
                  >
                    <LogOut size={15} color="#ec4899" />
                  </span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Alert de confirmación para cerrar sesión */}
      <Alert
        isOpen={showLogoutConfirm}
        type="confirm"
        title="Cerrar Sesión"
        message="¿Seguro que deseas cerrar sesión?"
        onConfirm={confirmarCerrarSesion}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default Navbar;