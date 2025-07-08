import styles from "./Contactanos.module.css";

import Header from "../../components/HeaderComponent/Header";
import Footer from "../../components/FooterComponent/Footer";

export default function Contactanos() {
  return (
    <>
      <Header />

      <div className={styles.contactanoscontainer}>
        <h2>Contáctanos</h2>
        <p>
          ¿Tienes dudas, sugerencias o necesitas ayuda con el sistema? Estamos
          para apoyarte.
        </p>

        <div className={styles.contactinfo}>
          <p>
            <strong>📧 Correo:</strong> soporte@neurobaby.mx
          </p>
          <p>
            <strong>📞 Teléfono:</strong> +52 667 123 4567
          </p>
          <p>
            <strong>📍 Dirección:</strong> Mazatlán, Sinaloa, México
          </p>
          <p>
            <strong>🕑 Horario de atención:</strong> Lunes a Viernes, 9:00 a.m.
            - 5:00 p.m.
          </p>
        </div>

        <div className={styles.socialmedia}>
          <p>
            <strong>Síguenos en nuestras redes sociales:</strong>
          </p>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer">
            🌐 Facebook
          </a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer">
            📸 Instagram
          </a>
          <a
            href="https://www.twitter.com"
            target="_blank"
            rel="noopener noreferrer">
            🐦 Twitter
          </a>
        </div>

        <form
          className={styles.formulario}
          onSubmit={(e) => {
            e.preventDefault();
            alert("Mensaje enviado correctamente.");
          }}>
          <input type="text" placeholder="Tu nombre completo" required />
          <input type="email" placeholder="Tu correo electrónico" required />
          <textarea
            placeholder="Escribe tu mensaje aquí..."
            required></textarea>
          <button type="submit" className={`btn btn-light`}>
            Enviar mensaje
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
}
