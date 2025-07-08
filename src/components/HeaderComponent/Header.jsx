import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Styles from "./Header.module.css";
import { supabase } from "../../supabaseClient";
import logo from "../../assets/logo.png";
import { useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  // Para mantener el hover de un btn main si esta activo
  const location = useLocation();

  const [usuario, setUsuario] = useState(null); // usuario de supabase
  const [perfil, setPerfil] = useState(null); // datos del perfil extendido

  console.log(usuario);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión:", error.message);
    } else {
      navigate("/login"); // redirige al login o página de inicio
    }
  };

  useEffect(() => {
    async function obtenerUsuarioYPerfil() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getUser();

      if (sessionError) {
        console.error("Error al obtener el usuario:", sessionError.message);
        return;
      }

      const user = sessionData.user;
      setUsuario(user);

      // Buscar en tabla 'perfiles' usando el id del usuario
      const { data: perfilData, error: perfilError } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id_perfil", user.id)
        .single();

      if (perfilError) {
        console.error("Error al obtener el perfil:", perfilError.message);
      } else {
        setPerfil(perfilData);
      }
    }

    obtenerUsuarioYPerfil();
  }, []);

  return (
    <div className={Styles.containerHeader}>
      {/* Logo  */}
      <img
        src={logo}
        alt="logo"
        className={Styles.logo}
        onClick={() => navigate("/Home")}
      />

      {/* Menú */}
      <div className={Styles.navLinks}>
        <button
          className={`${Styles.btnMain} ${
            location.pathname === "/Home" ? Styles.active : ""
          }`}
          onClick={() => navigate("/Home")}>
          Inicio
        </button>
        <button
          className={`${Styles.btnMain} ${
            location.pathname === "/Instrucciones" ? Styles.active : ""
          }`}
          onClick={() => navigate("/Instrucciones")}>
          Instrucciones
        </button>
        <button
          className={`${Styles.btnMain} ${
            location.pathname === "/babyData" ? Styles.active : ""
          }`}
          onClick={() => navigate("/babyData")}>
          Pacientes
        </button>
        <button
          className={`${Styles.btnMain} ${
            location.pathname === "/Contactanos" ? Styles.active : ""
          }`}
          onClick={() => navigate("/Contactanos")}>
          Contactanos
        </button>
      </div>

      {/* Usuario */}
      <div className={Styles.userContainer}>
        <button className={Styles.btnUser}>
          {perfil?.nombre_perfil || "Usuario"}
        </button>
        <button
          className={`btn btn-light ${Styles.btnLogOut}`}
          onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
