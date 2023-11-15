import React, { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import { useParams, useHistory } from "react-router-dom";
import { collection, getDocs, doc, getDoc, query, where, addDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import db from "../firebase";
import "./ShowForm.css";
import img from "../assets/iconForm.png"

function ShowForm() {
  const { formId } = useParams();
  const [formResponses, setFormResponses] = useState({});
  const [formList, setFormList] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const history = useHistory();
  const [opcionesEncontradas, setOpcionesEncontradas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formQuery = query(collection(db, "Form"));
        const formSnapshot = await getDocs(formQuery);

        const forms = formSnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            data: doc.data(),
          };
        });

        setFormList(forms);
      } catch (error) {
        console.error("Error al recuperar la lista de formularios:", error);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    const loadFormData = async () => {
      if (formId) {
        try {
          const formDocRef = doc(db, "Form", formId);
          const formDocSnapshot = await getDoc(formDocRef);

          if (formDocSnapshot.exists()) {
            const formData = {
              id: formDocSnapshot.id,
              data: formDocSnapshot.data(),
            };

            console.log("Formulario seleccionado:", formData);

            // Obtener preguntas asociadas al formulario a través de Form_Preguntas
            const formPreguntasQuery = query(collection(db, "Form_Preguntas"), where("idForm", "==", formData.data.id));
            const formPreguntasSnapshot = await getDocs(formPreguntasQuery);
            const preguntaIds = formPreguntasSnapshot.docs.map((doc) => doc.data().idPregunta);

            console.log("Identificadores de preguntas:", preguntaIds);

            // Obtener los detalles de las preguntas y sus tipos de respuesta
            const preguntasPromises = preguntaIds.map(async (preguntaId) => {
              console.log(`Recuperando pregunta con ID ${preguntaId}`);

              try {
                // Realizar la consulta directamente en la colección "Preguntas" por el atributo "id"
                const preguntasQuery = query(collection(db, "Preguntas"), where("id", "==", preguntaId));
                const preguntasSnapshot = await getDocs(preguntasQuery);

                if (!preguntasSnapshot.empty) {
                  const preguntaData = preguntasSnapshot.docs[0].data();
                  console.log("Pregunta recuperada:", preguntaData);

                  // Obtener el tipo de respuesta de la tabla Pregunta_Respuesta
                  const respuestaQuery = query(collection(db, "Pregunta_Respuesta"), where("idPregunta", "==", preguntaId));
                  const respuestaSnapshot = await getDocs(respuestaQuery);

                  console.log("Respuesta encontrada:", respuestaSnapshot.docs[0].data());
                  // Determinar el tipo de respuesta y asignar el valor del dato
                  let tipoRespuesta;
                  let dato;
                  let tipoRespuestaId; // Agregamos esta variable para almacenar el id real

                  if (!respuestaSnapshot.empty) {
                    tipoRespuestaId = respuestaSnapshot.docs[0].data().idRespuesta;
                    console.log("ID de respuesta encontrado:", tipoRespuestaId);

                    // Definir un array con los nombres de las colecciones a consultar
                    const colecciones = ["TipoTexto", "TipoNumero", "TipoComboBox"];


                    for (const tipoColeccion of colecciones) {
                      const tipoQuery = query(collection(db, tipoColeccion), where("id", "==", tipoRespuestaId));
                      const tipoSnapshot = await getDocs(tipoQuery);

                      if (!tipoSnapshot.empty) {
                        tipoRespuesta = tipoColeccion;

                        if (tipoRespuesta === "TipoComboBox") {
                          const opcionesQuery = query(collection(db, "Opciones"), where("idTipoCombobox", "==", tipoRespuestaId));
                          const opcionesSnapshot = await getDocs(opcionesQuery);

                          if (!opcionesSnapshot.empty) {
                            // Recorrer las opciones y guardarlas en el array
                            const nuevasOpciones = opcionesSnapshot.docs.map((opcionDoc) => opcionDoc.data().opcion);
                            setOpcionesEncontradas(nuevasOpciones);
                            console.log("Opciones encontradas:", opcionesEncontradas);
                          }
                        } else {
                          dato = tipoSnapshot.docs[0].data().dato;
                        }
                        break;
                      }
                    }
                  }

                  console.log("Tipo de respuesta:", tipoRespuesta);
                  console.log("Dato encontrado:", dato);

                  return {
                    id: preguntasSnapshot.docs[0].id,
                    data: preguntaData,
                    tipoRespuesta: tipoRespuesta,
                    dato: dato,
                    tipoRespuestaId: tipoRespuestaId, // Almacenamos el id real
                  };
                } else {
                  console.log(`No se encontró la pregunta con ID ${preguntaId}`);
                  return null;
                }
              } catch (error) {
                console.error(`Error al recuperar la pregunta con ID ${preguntaId}:`, error);
                return null;
              }
            });

            // Esperar a que todas las promesas se completen
            const preguntas = await Promise.all(preguntasPromises);

            console.log("Preguntas cargadas:", preguntas);

            formData.data.preguntas = preguntas.filter((pregunta) => pregunta !== null); // Filtrar preguntas nulas
            setSelectedForm(formData);
          } else {
            console.log(`No se encontró el formulario con ID ${formId}`);
          }
        } catch (error) {
          console.error("Error al recuperar el formulario:", error);
        }
      }
    };

    loadFormData();
  }, [formId, opcionesEncontradas]);



  const selectForm = (formId) => {
    history.push(`/showForm/${formId}`);
  };

  const handleResponseChange = (questionId, response) => {
    setFormResponses({
      ...formResponses,
      [questionId]: response,
    });
  };

  const addResponsesToDatabase = async () => {
    try {
      // Iterar sobre las preguntas y agregar las respuestas a la tabla de Respuestas
      for (const pregunta of selectedForm.data.preguntas) {
        const respuestaData = {
          idTipo: pregunta.tipoRespuestaId, // Utilizamos el id real obtenido anteriormente
          timestamp: Timestamp.fromDate(new Date()),
          respuesta: formResponses[pregunta.id] || "",
        };

        // Agregar la nueva respuesta a la colección "Respuestas"
        await addDoc(collection(db, "Respuestas"), respuestaData);
      }

      console.log("Respuestas agregadas a la tabla Respuestas.");
    } catch (error) {
      console.error("Error al agregar respuestas:", error);
    }
  };



  const submitResponses = async () => {
    try {
      console.log("Enviando respuestas...");
      await addResponsesToDatabase();
      console.log("Respuestas enviadas con éxito.");
    } catch (error) {
      console.error("Error al enviar respuestas:", error);
    }
  };

  return (
    <div className="containerSF">
      {selectedForm ? (
        <div className="form-container">
          <h1 className="form-title">{selectedForm.data.titulo}</h1>
          <p className="form-description">{selectedForm.data.descripcion}</p>
          <p className="form-link">{selectedForm.data.link}</p>

          {selectedForm.data.preguntas ? (
            selectedForm.data.preguntas.map((pregunta) => (
              <div key={pregunta.id} className="form-question">
                <h3>{pregunta.data.pregunta}</h3>
                {pregunta.tipoRespuesta === "TipoTexto" ? (
                  <input
                    type="text"
                    className="text-input"
                    value={formResponses[pregunta.id] || ""}
                    onChange={(e) =>
                      handleResponseChange(pregunta.id, e.target.value)
                    }
                  />
                ) : pregunta.tipoRespuesta === "TipoNumero" ? (
                  <input
                    type="number"
                    className="number-input"
                    value={formResponses[pregunta.id] || ""}
                    onChange={(e) =>
                      handleResponseChange(pregunta.id, e.target.value)
                    }
                  />
                ) : pregunta.tipoRespuesta === 'TipoComboBox' ? (
                  <select
                    className="combo-box"
                    value={formResponses[pregunta.id] || ''}
                    onChange={(e) => handleResponseChange(pregunta.id, e.target.value)}
                  >
                    <option value="">Selecciona una opción</option>
                    {opcionesEncontradas.map((opcion, index) => (
                      <option key={index} value={opcion}>
                        {opcion}
                      </option>
                    ))}
                  </select>
                ) : null}
                {pregunta.dato ? (
                  <p className="example-value">Valor ejemplo de la respuesta: {pregunta.dato}</p>
                ) : null}
              </div>
            ))
          ) : null}

          <Button className="submit-button" variant="dark" onClick={submitResponses}>Send response</Button>
        </div>
      ) : (
        <div>
          <h1>Select a form to respond</h1>
          <div className="card-container">
            {formList.map((form) => (
              <div key={form.id} className="card">
                <img src={img} alt={form.data.titulo} />
                <div className="card-content">
                  <h3>{form.data.titulo}</h3>
                  <Button variant="outline-dark" onClick={() => selectForm(form.id)}>View responses</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ShowForm;