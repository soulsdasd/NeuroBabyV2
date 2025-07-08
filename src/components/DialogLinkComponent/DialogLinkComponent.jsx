import { supabase } from '../../supabaseClient';
import { useState, useEffect } from "react";
import styles from "../../pages/BabyDataPage/BabyData.module.css";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";

function DialogLinkComponent(){
    const [isOpen, setIsOpen] = useState(false);
    const [userId, setUserId] = useState("");
    const [idBebe, setIdBebe] = useState("");

      //Obtener id del usuario
      useEffect(() => {
        const getUser = async () => {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if(userError || !userData?.user){
            console.log("Error al obtener los datos del usuario: ", userError);
          }else{
            console.log("Datos obtenidos exitosamente");
            setUserId(userData.user.id);
          }
        };
    
        getUser();
      }, []);

      const handleOpen = () => setIsOpen(true);
      const handleClose = () => setIsOpen(false);

      const handleSubmit = async (e) => {
        e.preventDefault();
        // Verificamos que data y user existan
        if (userId) {
          const { error: insertError } = await supabase
            .from("vincular_bebe")
            .insert([
              {
                id_perfil: userId,
                id_bebe: idBebe
              },
            ]);
    
          if (insertError) {
            console.log(`Error al insertar en la tabla: ${insertError.message}`);
          } else {
            console.log("Registro exitoso..");
            window.location.reload();
          }
        } else {
          console.log("Registro fallido. Intenta de nuevo.");
        }
        setIsOpen(false);
      };
    return(
        <>
            <button className={styles.buttonAdd} onClick={handleOpen}>
            +
            </button>
            <Dialog open={isOpen} onClose={handleClose}>
            <DialogTitle>Formulario Bebé</DialogTitle>

            <DialogContent>
                <form id="babyForm" onSubmit={handleSubmit}>
                    <TextField
                        label="UUID bebe"
                        fullWidth
                        margin="normal"
                        value={idBebe}
                        onChange={(e) => setIdBebe(e.target.value)}
                        required
                        inputProps={{ min: 0 }}
                    />
                </form>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} className={styles.cancelButton}>
                Cancelar
                </Button>
                <Button
                type="submit"
                form="babyForm"
                variant="contained"
                color="primary"
                className={styles.submitButton}>
                Enviar
                </Button>
            </DialogActions>
            </Dialog>
        </>
    );
}

export default DialogLinkComponent;