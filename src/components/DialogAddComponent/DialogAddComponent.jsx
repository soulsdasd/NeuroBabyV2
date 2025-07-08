import { supabase } from '../../supabaseClient';
import { useState, useEffect } from "react";
import styles from "../../pages/BabyDataPage/BabyData.module.css";

import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";

function DialogAddComponent(){
    const [isOpen, setIsOpen] = useState(false);
    const [userId, setUserId] = useState("");
    const [nombre_bebe, setNombreBebe] = useState("");
    const [meses_bebe, setMesesBebe] = useState("");
    const [peso_bebe, setPesoBebe] = useState("");
    const [estatura_bebe, setEstaturaBebe] = useState("");
    const [genero, setGenero] = useState("");

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
            .from("bebe")
            .insert([
              {
                id_perfil: userId,
                nombre_bebe: nombre_bebe,
                meses_bebe: meses_bebe,
                peso_bebe: peso_bebe,
                estatura_bebe: estatura_bebe,
                genero: genero
              },
            ]);
    
          if (insertError) {
            console.log(`Error al insertar en la tabla: ${insertError.message}`);
          } else {
            console.log("Registro exitoso..");
          }
        } else {
          console.log("Registro fallido. Intenta de nuevo.");
        }
        window.location.reload();
        setIsOpen(false);
      };
    return(
        <>
            <button className={`btn btn-light ${styles.buttonAdd}`} onClick={handleOpen}>
            +
            </button>
            <Dialog open={isOpen} onClose={handleClose}>
            <DialogTitle>Formulario Bebé</DialogTitle>

            <DialogContent>
                <form id="babyForm" onSubmit={handleSubmit}>
                <TextField
                    label="Nombre"
                    fullWidth
                    margin="normal"
                    value={nombre_bebe}
                    onChange={(e) => setNombreBebe(e.target.value)}
                    required
                />
                <TextField
                    label="Edad (meses)"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={meses_bebe}
                    onChange={(e) => setMesesBebe(e.target.value)}
                    required
                    inputProps={{ min: 0 }}
                />
                <TextField
                    label="Peso (kg)"
                    fullWidth
                    margin="normal"
                    value={peso_bebe}
                    onChange={(e) => setPesoBebe(e.target.value)}
                    required
                    inputProps={{ min: 0 }}
                />
                <TextField
                    label="Estatura (cm)"
                    fullWidth
                    margin="normal"
                    value={estatura_bebe}
                    onChange={(e) => setEstaturaBebe(e.target.value)}
                    required
                    inputProps={{ min: 0 }}
                />
                <FormLabel>Genero</FormLabel>
                <RadioGroup
                    name="planeacion"
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}>
                    <div className={styles.radioContainer}>
                    <FormControlLabel
                        value="masculino"
                        control={<Radio />}
                        label="Masculino"
                    />
                    <FormControlLabel
                        value="femenino"
                        control={<Radio />}
                        label="Femenino"
                    />
                    </div>
                </RadioGroup>
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

export default DialogAddComponent;
