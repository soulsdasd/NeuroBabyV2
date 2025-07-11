import styles from "./BabyData.module.css";
import Header from "../../components/HeaderComponent/Header";
import Footer from "../../components/FooterComponent/Footer";
import DialogAddComponent from "../../components/DialogAddComponent/DialogAddComponent";
import DialogLinkComponent from "../../components/DialogLinkComponent/DialogLinkComponent";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";

import { useEffect, useState } from "react";
import { FaBaby } from "react-icons/fa";
import { supabase } from "../../supabaseClient";

import { useNavigate } from "react-router-dom";

export default function BabyData() {
  const navigate = useNavigate();

  const [bebes, setBebes] = useState([]);
  const [perfil, setPerfil] = useState([]);
  const [userId, setUserId] = useState("");
  const [mensajePantalla, setMensajePantalla] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBebeId, setSelectedBebeId] = useState(null);
  const [fisioterapeutas, setFisioterapeutas] = useState([]);
  const [fisioterapeutaSeleccionado, setFisioterapeutaSeleccionado] = useState(null);

  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    // Cargar lista fisioterapeutas de Supabase
    const fetchFisioterapeutas = async () => {
      const { data, error } = await supabase
        .from("perfiles")
        .select("id_perfil, nombre_perfil")
        .eq("rol_perfil", "fisioterapeuta");

      if (!error) setFisioterapeutas(data);
    };
    fetchFisioterapeutas();
  }, []);

  // Obtener usuario actual y cargar solicitudes pendientes
  useEffect(() => {
    const cargarUsuarioYSolicitudes = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.log("Error al obtener usuario", userError);
        return;
      }
      setUserId(userData.user.id);

      // Cargar solicitudes pendientes
      const { data: solicitudesPendientes, error: solicitudesError } = await supabase
        .from("vincular_bebe")
        .select(`id_vincular, bebe(id_bebe, nombre_bebe, meses_bebe, peso_bebe, estatura_bebe, genero)`)
        .eq("id_perfil", userData.user.id)
        .eq("aceptado", false);

      if (!solicitudesError) {
        setSolicitudes(solicitudesPendientes);
        console.log(solicitudes);
      } else {
        console.log("Error al cargar solicitudes", solicitudesError);
      }
    };

    cargarUsuarioYSolicitudes();
  }, []);

  const abrirModal = (id_bebe) => {
    setSelectedBebeId(id_bebe);
    setFisioterapeutaSeleccionado(null);
    setModalOpen(true);
  };

  const vincularBebe = async (e) => {
    e.preventDefault();
    if (userId && fisioterapeutaSeleccionado) {
      const { error: insertError } = await supabase
        .from("vincular_bebe")
        .insert([
          {
            id_perfil: fisioterapeutaSeleccionado.id_perfil,
            id_bebe: selectedBebeId,
          },
        ]);

      if (insertError) {
        console.log(`Error al insertar en la tabla: ${insertError.message}`);
      } else {
        console.log("Registro exitoso..");
        window.location.reload();
      }
    } else {
      console.log("Datos insuficientes para vincular");
    }
  };

  const goTest = (idBebe) => {
    navigate(`/Test/${idBebe}`);
  };
  const goResult = (idBebe) => {
    navigate(`/Resultados/${idBebe}`);
  };

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

  // Cargar bebés o vínculos según rol
  async function fetchBebes() {
    if (!perfil.rol_perfil) return;

    if (perfil.rol_perfil === "tutor") {
      const { data, error } = await supabase
        .from("bebe")
        .select("*")
        .order("id_bebe", { ascending: true })
        .eq("id_perfil", userId);
      setBebes(data);
      if (error) {
        console.log("Error al obtener datos de la tabla bebe: ", error);
      }
      if (!data || data.length === 0) {
        setMensajePantalla(
          "Actualmente no hay pacientes registrados. Utilice el botón en la esquina inferior derecha para añadir uno."
        );
      }
    } else if (perfil.rol_perfil === "fisioterapeuta") {
      const { data, error } = await supabase
        .from("vincular_bebe")
        .select(
          `id_vincular, id_perfil, id_bebe, bebe(id_bebe, nombre_bebe, meses_bebe, peso_bebe, estatura_bebe, genero)`
        )
        .eq("id_perfil", userId)
        .eq("aceptado", true)
        .order("id_bebe", { ascending: true });
      setBebes(data);
      if (error) {
        console.log("Error al obtener datos de la tabla bebe: ", error);
      }
      if (!data || data.length === 0) {
        setMensajePantalla(
          "Actualmente no hay pacientes registrados. Utilice el botón en la esquina inferior derecha para añadir uno."
        );
      }
    }
  }

  useEffect(() => {
    fetchBebes();
  }, [perfil, userId]);

  const eliminarVinculacion = async (id_vincular) => {
    const { error } = await supabase
      .from("vincular_bebe")
      .delete()
      .eq("id_vincular", id_vincular);

    if (!error) {
      setSolicitudes((prev) => prev.filter((s) => s.id_vincular !== id_vincular));
      fetchBebes(); // refresca lista si quieres
    } else {
      console.error("Error al eliminar la vinculación:", error.message);
    }
  };

  return (
    <>
      <div className={styles.pageContainer}>
        <Header />

        <div className={styles.mainContainer}>
          <p>{mensajePantalla}</p>
          {/* Listado normal de bebés o vínculos */}
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
                    <p>Peso: {bebe.peso_bebe} kg</p>
                    <p>Estatura: {bebe.estatura_bebe} cm</p>
                    <div className={styles.buttonContainer}>
                      <button
                        className={`btn btn-light ${styles.addButton}`}
                        onClick={() => goTest(bebe.id_bebe)}
                      >
                        Agregar Registro
                      </button>
                      <button
                        className={`btn btn-light ${styles.addButton}`}
                        onClick={() => goResult(bebe.id_bebe)}
                      >
                        Mostrar resultados
                      </button>
                      <button
                        className={`btn btn-light ${styles.addButton}`}
                        onClick={() => abrirModal(bebe.id_bebe)}
                      >
                        Asignar fisioterapeuta
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <h3>{vinculo.bebe.nombre_bebe}</h3>
                      <Button
                        variant="contained"
                        color="error"
                        style={{
                          borderRadius: "999px",
                          width: "30px",
                          minWidth: "30px",
                          padding: 0,
                          height: "30px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onClick={() => eliminarVinculacion(vinculo.id_vincular)}
                      >
                        X
                      </Button>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <h4>Meses: {vinculo.bebe.meses_bebe}</h4>
                    <p>Peso: {vinculo.bebe.peso_bebe} kg</p>
                    <p>Estatura: {vinculo.bebe.estatura_bebe} cm</p>
                    <button
                      className={styles.addButton}
                      onClick={() => goTest(vinculo.bebe.id_bebe)}
                    >
                      Agregar Registro
                    </button>
                    <button
                      className={styles.addButton}
                      onClick={() => goResult(vinculo.bebe.id_bebe)}
                    >
                      Mostrar resultados
                    </button>
                  </div>
                </div>
              ))}

          {perfil.rol_perfil === "fisioterapeuta" ? (
            <DialogLinkComponent />
          ) : (
            <DialogAddComponent />
          )}
        </div>
        <Footer />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="modal-fisio-title"
        aria-describedby="modal-fisio-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <h2 id="modal-fisio-title">Selecciona un fisioterapeuta</h2>
          <Autocomplete
            options={fisioterapeutas}
            getOptionLabel={(option) => option.nombre_perfil}
            value={fisioterapeutaSeleccionado}
            onChange={(event, newValue) => setFisioterapeutaSeleccionado(newValue)}
            renderInput={(params) => <TextField {...params} label="Fisioterapeuta" />}
            isOptionEqualToValue={(option, value) => option.id_perfil === value.id_perfil}
            clearOnEscape
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setModalOpen(false)} sx={{ mr: 1 }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={!fisioterapeutaSeleccionado}
              onClick={vincularBebe}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
