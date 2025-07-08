import styles from "./BabyData.module.css";
import Header from "../../components/HeaderComponent/Header";
import Footer from "../../components/FooterComponent/Footer";
import DialogAddComponent from "../../components/DialogAddComponent/DialogAddComponent";
import DialogLinkComponent from "../../components/DialogLinkComponent/DialogLinkComponent";

import { useEffect, useState } from "react";
import { FaBaby } from "react-icons/fa";
import { supabase } from "../../supabaseClient";

import { useNavigate } from "react-router-dom";

export default function BabyData() {
  const navigate = useNavigate();

  const [bebes, setBebes] = useState([]);
  const [perfil, setPerfil] = useState([]);
  const [userId, setUserId] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [mensajePantalla, setMensajePantalla] = useState("");

  const goTest = (idBebe) => {
    navigate(`/Test/${idBebe}`);
  };
  const goResult = (idBebe) => {
    navigate(`/Resultados/${idBebe}`);
  };

  //Obtener id del usuario
  useEffect(() => {
    const getUser = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.log("Error al obtener los datos del usuario: ", userError);
      } else {
        console.log("Datos obtenidos exitosamente");
        setUserId(userData.user.id);
      }
    };

    getUser();
  }, []);

  //Obtener datos del perfil del usuario
  useEffect(() => {
    const getPerfil = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id_perfil", userId)
        .single();

      if (error) {
        console.log("Error al obtener los datos: ", error);
      } else {
        setPerfil(data);
        console.log("Perfil: ", data);
      }
    };

    getPerfil();
  }, [userId]);

  async function fetchBebes() {
    console.log("Rol: ", perfil.rol_perfil);
    if (perfil.rol_perfil == "tutor") {
      const { data, error } = await supabase
        .from("bebe")
        .select("*")
        .order("id_bebe", { ascending: true })
        .eq("id_perfil", userId);
      setBebes(data);
      if (error) {
        console.log("Error al obtener datos de la tabla bebe: ", error);
      }
      if (data.length == 0) {
        setMensajePantalla(
          "Actualmente no hay pacientes registrados. Utilice el botón en la esquina inferior derecha para añadir uno."
        );
      }
    } else if (perfil.rol_perfil == "fisioterapeuta") {
      const { data, error } = await supabase
        .from("vincular_bebe")
        .select(
          `
          id_vincular, 
          id_perfil,
          id_bebe,
          bebe(
            id_bebe,
            nombre_bebe,
            meses_bebe,
            peso_bebe,
            estatura_bebe,
            genero
          )
        `
        )
        .eq("id_perfil", userId)
        .order("id_bebe", { ascending: true });
      setBebes(data);
      if (error) {
        console.log("Error al obtener datos de la tabla bebe: ", error);
      }
      if (data.length == 0) {
        setMensajePantalla(
          "Actualmente no hay pacientes registrados. Utilice el botón en la esquina inferior derecha para añadir uno."
        );
      }
    }
  }

  useEffect(() => {
    fetchBebes();
  }, [perfil, userId]);

  return (
    <>
      <div className={styles.pageContainer}>
        <Header></Header>

        <div className={styles.mainContainer}>
          <p>{mensajePantalla}</p>
          {perfil.rol_perfil === "tutor"
            ? bebes.map((bebe, index) => (
                <div key={index} className={styles.cardContainer}>
                  <div className={styles.cardHeader}>
                    {bebe.genero === "masculino" ? (
                      <FaBaby
                        size={40}
                        style={{ color: "#A7D7F9", marginBottom: "10px" }}
                      />
                    ) : (
                      <FaBaby
                        size={40}
                        style={{ color: "#f3acdf", marginBottom: "10px" }}
                      />
                    )}
                    <h3>{bebe.nombre_bebe}</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <h4>Meses: {bebe.meses_bebe}</h4>
                    <h5>UUID: {bebe.id_bebe}</h5>
                    <p>Peso: {bebe.peso_bebe} kg</p>
                    <p>Estatura: {bebe.estatura_bebe} cm</p>
                    <div className={styles.buttonContainer}>
                      <button
                        className={`btn btn-light ${styles.addButton}`}
                        onClick={() => goTest(bebe.id_bebe)}>
                        Agregar Registro
                      </button>
                      <button
                        className={`btn btn-light ${styles.addButton}`}
                        onClick={() => goResult(bebe.id_bebe)}>
                        Mostrar resultados
                      </button>
                    </div>
                  </div>
                </div>
              ))
            : bebes.map((vinculo, index) => (
                <div key={index} className={styles.cardContainer}>
                  <div className={styles.cardHeader}>
                    {vinculo.bebe.genero === "masculino" ? (
                      <FaBaby
                        size={40}
                        style={{ color: "#A7D7F9", marginBottom: "10px" }}
                      />
                    ) : (
                      <FaBaby
                        size={40}
                        style={{ color: "#f3acdf", marginBottom: "10px" }}
                      />
                    )}
                    <h3>{vinculo.bebe.nombre_bebe}</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <h4>Meses: {vinculo.bebe.meses_bebe}</h4>
                    <h5>UUID: {vinculo.bebe.id_bebe}</h5>
                    <p>Peso: {vinculo.bebe.peso_bebe} kg</p>
                    <p>Estatura: {vinculo.bebe.estatura_bebe} cm</p>
                    <button
                      className={styles.addButton}
                      onClick={() => goTest(vinculo.bebe.id_bebe)}>
                      Agregar Registro
                    </button>
                    <button
                      className={styles.addButton}
                      onClick={() => goResult(vinculo.bebe.id_bebe)}>
                      Mostrar resultados
                    </button>
                  </div>
                </div>
              ))}

          {perfil.rol_perfil == "fisioterapeuta" ? (
            <DialogLinkComponent />
          ) : (
            <DialogAddComponent />
          )}
        </div>
        <div className={styles.messageContainer}>
          <p>{mensaje}</p>
        </div>
        <Footer />
      </div>
    </>
  );
}
