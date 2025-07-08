import { useNavigate, useMatch, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Styles from "./Header.module.css";
import { supabase } from "../../supabaseClient";
import logo from "../../assets/logo.png";

import Badge from "@mui/material/Badge";
import MailIcon from "@mui/icons-material/Mail";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function Header() {
  const navigate = useNavigate();
  const matchResultados = useMatch("/Resultados/:id");
  const matchTest = useMatch("/Test/:id");
  const location = useLocation();

  const [solicitudes, setSolicitudes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [usuario, setUsuario] = useState(null); // ✅ Para guardar nombre del perfil
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión:", error.message);
    } else {
      localStorage.removeItem("usuario");
      navigate("/login");
    }
  };

  useEffect(() => {
    const obtenerUsuarioYNotificaciones = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        console.log("user id: "+userId);

        // Obtener nombre del perfil
        const { data: perfil, error: errorPerfil } = await supabase
          .from("perfiles")
          .select("nombre_perfil")
          .eq("id_perfil", user.id)
          .single();

        if (!errorPerfil) {
          setUsuario(perfil);
          console.log("PERFIL:", perfil);
        }

        // Obtener solicitudes pendientes
        const { data, error } = await supabase
          .from("vincular_bebe")
          .select("id_vincular, bebe(nombre_bebe, meses_bebe)")
          .eq("id_perfil", user.id)
          .eq("aceptado", false);

        if (!error) setSolicitudes(data);
      }
    };

    obtenerUsuarioYNotificaciones();
  }, []);

  const aceptarSolicitud = async (id_vincular) => {
    const { error } = await supabase
      .from("vincular_bebe")
      .update({ aceptado: true })
      .eq("id_vincular", id_vincular);

    if (!error) {
      setSolicitudes((prev) =>
        prev.filter((s) => s.id_vincular !== id_vincular)
      );
    }
  };

  return (
    <div className={Styles.containerHeader}>
      {/* Logo */}
      <img
        src={logo}
        alt="logo"
        className={Styles.logo}
        onClick={() => navigate("/Home")}
        style={{ cursor: "pointer" }}
      />

      {/* Menú */}
      <div className={Styles.navLinks}>
        <button
          className={`${Styles.btnMain} ${
            location.pathname === "/Home" ? Styles.active : ""
          }`}
          onClick={() => navigate("/Home")}
        >
          Inicio
        </button>
        <button
          className={`${Styles.btnMain} ${
            location.pathname === "/Instrucciones" ? Styles.active : ""
          }`}
          onClick={() => navigate("/Instrucciones")}
        >
          Instrucciones
        </button>
        <button
          className={`${Styles.btnMain} ${
            location.pathname === "/babyData" || matchResultados || matchTest
              ? Styles.active
              : ""
          }`}
          onClick={() => navigate("/babyData")}
        >
          Pacientes
        </button>
        <button
          className={`${Styles.btnMain} ${
            location.pathname === "/Contactanos" ? Styles.active : ""
          }`}
          onClick={() => navigate("/Contactanos")}
        >
          Contactanos
        </button>
      </div>
      <div style={{display: 'flex', alignItems: 'center'}}>
          <Badge
            color="secondary"
            variant="dot"
            invisible={solicitudes.length === 0}
            onClick={() => setDrawerOpen(true)}
            sx={{ cursor: "pointer", marginRight: "1rem" }}
          >
            <MailIcon />
          </Badge>
        {/* Usuario + Notificaciones */}
        <div className={Styles.userContainer} style={{ display: "flex", alignItems: "center" }}>
          <button className={Styles.btnUser}>
            {usuario?.nombre_perfil || "Usuario"}
          </button>
          <button className={Styles.btnLogOut} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Drawer para solicitudes */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} style={{zIndex: 9999}}>
        <Box sx={{ width: 300, padding: 2}}>
          <Typography variant="h6">Solicitudes de Vinculación</Typography>
          {solicitudes.length === 0 ? (
            <Typography variant="body2" sx={{ mt: 2 }}>
              No tienes solicitudes pendientes.
            </Typography>
          ) : (
            <List>
              {solicitudes.map((s) => (
                <ListItem key={s.id_vincular} divider>
                  <Box>
                    <Typography variant="subtitle1">
                      {s.bebe?.nombre_bebe || "Bebé desconocido"}
                    </Typography>
                    <Typography variant="body2">
                      {s.bebe?.meses_bebe} meses
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => aceptarSolicitud(s.id_vincular)}
                      sx={{ mt: 1 }}
                    >
                      Aceptar
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </div>
  );
}
