import "../../index.css";
import styles from "./Start.module.css";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const goLogin = () => {
    navigate("/login");
  };
  const goRegister = () => {
    navigate("/sign-up");
  };

  return (
    <>
      <div className={styles.mainContainer}>
        <div>
          <img
            src="/src/assets/img_inicio.jpg"
            alt=""
            className={styles.homeImage}
          />
        </div>
        <div>
          <div className={styles.textContainer}>
            <h1>NeurobabyTest</h1>
            <h2>¡Sigue el crecimiento de tu bebe!</h2>
          </div>
          <div className={styles.container}>
            <button
              className={`btn btn-light ${styles.btnstart}`}
              onClick={goRegister}>
              Registrarse
            </button>
            <button
              className={`btn btn-light ${styles.btnstart}`}
              onClick={goLogin}>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
