import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { collection, getDocs, doc, getDoc, query, where, addDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import db from "../firebase";
import "./ShowForm.css";

function ShowForm() {
  const { formId } = useParams();
  const [formResponses, setFormResponses] = useState({});
  const [formList, setFormList] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const history = useHistory();

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
  
                    // Realizar la consulta directamente en la colección "TipoTexto" por el atributo "id"
                    const tipoTextoQuery = query(collection(db, "TipoTexto"), where("id", "==", tipoRespuestaId));
                    const tipoTextoSnapshot = await getDocs(tipoTextoQuery);
  
                    if (!tipoTextoSnapshot.empty) {
                      tipoRespuesta = "TipoTexto";
                      dato = tipoTextoSnapshot.docs[0].data().dato;
                    } else {
                      // Realizar la consulta directamente en la colección "TipoNumero" por el atributo "id"
                      const tipoNumeroQuery = query(collection(db, "TipoNumero"), where("id", "==", tipoRespuestaId));
                      const tipoNumeroSnapshot = await getDocs(tipoNumeroQuery);
  
                      if (!tipoNumeroSnapshot.empty) {
                        tipoRespuesta = "TipoNumero";
                        dato = tipoNumeroSnapshot.docs[0].data().dato;
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
  }, [formId]);
  
  

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
        <div>
          <h1>{selectedForm.data.titulo}</h1>
          <p>{selectedForm.data.descripcion}</p>
          <p>{selectedForm.data.link}</p>
  
          {selectedForm.data.preguntas ? (
            selectedForm.data.preguntas.map((pregunta) => (
              <div key={pregunta.id}>
                <h3>{pregunta.data.pregunta}</h3>
                {pregunta.tipoRespuesta === "TipoTexto" ? (
                  <input
                    type="text"
                    value={formResponses[pregunta.id] || ""}
                    onChange={(e) =>
                      handleResponseChange(pregunta.id, e.target.value)
                    }
                  />
                ) : pregunta.tipoRespuesta === "TipoNumero" ? (
                  <input
                    type="number"
                    value={formResponses[pregunta.id] || ""}
                    onChange={(e) =>
                      handleResponseChange(pregunta.id, e.target.value)
                    }
                  />
                ) : null}
                {pregunta.dato ? (
                  <p>Valor ejemplo de la respuesta: {pregunta.dato}</p>
                ) : null}
              </div>
            ))
          ) : null}
  
          {/* Cambié el botón y agregué el evento onClick */}
          <button onClick={submitResponses}>Enviar Respuestas</button>
        </div>
      ) : (
        <div>
          <h1>Selecciona un formulario para responder:</h1>
          <ul>
            {formList.map((form) => (
              <li key={form.id}>
                <button onClick={() => selectForm(form.id)}>
                  {form.data.titulo}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ShowForm;
