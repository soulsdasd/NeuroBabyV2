import styles from "./Resultados.module.css";
import { supabase } from "../../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import SelectPeriodoComponent from "../../components/SelectPeriodoComponent/SelectPeriodoComponent";
import Header from "../../components/HeaderComponent/Header";
import Footer from "../../components/FooterComponent/Footer";
import { PieChart } from "@mui/x-charts/PieChart";

export default function Resultados() {
  const navigate = useNavigate();
  const { idBebe } = useParams();
  const [pieData, setPieData] = useState([]);
  const [reflejosData, setReflejosData] = useState([]);
  const [factorRiesgo, setFactorRiesgo] = useState("");
  const [recomendacion, setRecomendacion] = useState("");
  const [factorReflejos, setFactorReflejos] = useState("");
  const [recomendacionReflejos, setRecomendacionReflejos] = useState("");
  const [periodo, setPeriodo] = useState("primer_visita");

  function goContacto() {
    navigate("/Contactanos");
  }

  function calcularReflejos(total) {
    if (total <= 2) {
      setFactorReflejos("Reflejos: " + total);
      setRecomendacionReflejos("Se encuentra en los parámetros normales");
    } else if (total >= 3 && total <= 5) {
      setFactorReflejos("Reflejos: " + total);
      setRecomendacionReflejos("Se detectó un retraso leve");
    } else if (total >= 6 && total <= 9) {
      setFactorReflejos("Reflejos: " + total);
      setRecomendacionReflejos("Se detectó un retraso moderado");
    } else {
      setFactorReflejos("Reflejos: " + total);
      setRecomendacionReflejos("Se detectó un retraso severo");
    }
  }

  function calcularPDN(total) {
    if (total >= 3 && total <= 5) {
      setFactorRiesgo("PDN: " + total);
      setRecomendacion("Solo es necesario hacer seguimiento");
    } else if (total >= 6 && total <= 9) {
      setFactorRiesgo("ARDN: " + total);
      setRecomendacion("Es necesario hacer estudios especializados");
    } else {
      setFactorRiesgo("PRND: " + total);
      setRecomendacion("Se requiere atención inmediata");
    }
  }

  useEffect(() => {
    if (!idBebe) return;

    const obtenerResultados = async () => {
      try {
        const [prenatal, perinatal, postnatal] = await Promise.all([
          supabase.rpc("suma_prenatal", { uid_bebe: String(idBebe) }),
          supabase.rpc("suma_perinatal", { uid_bebe: String(idBebe) }),
          supabase.rpc("suma_postnatal", { uid_bebe: String(idBebe) }),
        ]);

        const prenatalCount = prenatal.data ?? 0;
        const perinatalCount = perinatal.data ?? 0;
        const postnatalCount = postnatal.data ?? 0;
        const total = prenatalCount + perinatalCount + postnatalCount;
        calcularPDN(total);

        const restante = Math.max(28 - total, 0);
        setPieData([
          {
            id: 0,
            value: prenatalCount,
            label: "Riesgo prenatal",
            color: "#3f51b5",
          },
          {
            id: 1,
            value: perinatalCount,
            label: "Riesgo perinatal",
            color: "#f50057",
          },
          {
            id: 2,
            value: postnatalCount,
            label: "Riesgo postnatal",
            color: "#ff9800",
          },
          { id: 3, value: restante, label: "Fuera de riesgo", color: "gray" },
        ]);
      } catch (error) {
        console.error("Error al obtener resultados:", error);
      }
    };

    obtenerResultados();
  }, [idBebe]);

  useEffect(() => {
    if (!idBebe || !periodo) return;

    const obtenerReflejos = async () => {
      try {
        const [arcaicos, primerNivel, segundoNivel] = await Promise.all([
          supabase.rpc("suma_reflejos_arcaicos_por_periodo", {
            uid_bebe: idBebe,
            periodo_input: periodo,
          }),
          supabase.rpc("suma_reflejos_primer_nivel_por_periodo", {
            uid_bebe: idBebe,
            periodo_input: periodo,
          }),
          supabase.rpc("suma_reflejos_segundo_nivel_por_periodo", {
            uid_bebe: idBebe,
            periodo_input: periodo,
          }),
        ]);

        const arcaicosCount = arcaicos.data ?? 0;
        const primerNivelCount = primerNivel.data ?? 0;
        const segundoNivelCount = segundoNivel.data ?? 0;
        const total = arcaicosCount + primerNivelCount + segundoNivelCount;
        calcularReflejos(total);

        setReflejosData([
          { id: 0, value: arcaicosCount, label: "Arcaicos", color: "#4caf50" },
          {
            id: 1,
            value: primerNivelCount,
            label: "1er nivel",
            color: "#2196f3",
          },
          {
            id: 2,
            value: segundoNivelCount,
            label: "2do nivel",
            color: "#9c27b0",
          },
        ]);
      } catch (error) {
        console.error("Error al obtener reflejos:", error);
      }
    };

    obtenerReflejos();
  }, [idBebe, periodo]);

  return (
    <>
      <Header />

      <div className={styles.mainContainer}>
        <div className={styles.pieContainer}>
          <div className={styles.PDNContainer}>
            <div className={styles.infoContainer}>
              <p className={styles.text}>
                <b>PDN:</b> Posible daño neurológico <br />
                <b>ARDN:</b> Alto riesgo de daño neurológico <br />
                <b>PRND:</b> Presunción de daño neurológico definitivo
              </p>
            </div>

            {/* Contenedor que agrupa ambas graficas verticalmente */}
            <div className={styles.graficasContainer}>
              <div className={styles.chartContainer}>
                <h2>Factores de riesgo</h2>
                <h4>{factorRiesgo}</h4>
                <p className={styles.recomendacionContainer}>
                  {recomendacion}{" "}
                  <span className={styles.contactoLink} onClick={goContacto}>
                    Contacta a un profesional
                  </span>
                </p>
                {pieData.length > 0 && (
                  <PieChart
                    series={[
                      {
                        data: pieData,
                        highlightScope: { fade: "global", highlight: "item" },
                        faded: {
                          innerRadius: 30,
                          additionalRadius: -30,
                          color: "gray",
                        },
                      },
                    ]}
                    height={400}
                    width={400}
                  />
                )}
              </div>

              <div className={styles.chartContainer}>
                <h2>Reflejos por periodo</h2>
                <h3>{factorReflejos}</h3>
                <p className={styles.recomendacionContainer}>
                  {recomendacionReflejos}{" "}
                  <span className={styles.contactoLink} onClick={goContacto}>
                    Contacta a un profesional
                  </span>
                </p>
                <div className={styles.select}>
                  <SelectPeriodoComponent
                    opcion={periodo}
                    setOpcion={setPeriodo}
                    apartado={"primero"}
                  />
                </div>
                {reflejosData.length > 0 && (
                  <PieChart
                    series={[
                      {
                        data: reflejosData,
                        highlightScope: { fade: "global", highlight: "item" },
                        faded: {
                          innerRadius: 30,
                          additionalRadius: -30,
                          color: "gray",
                        },
                      },
                    ]}
                    height={400}
                    width={400}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
