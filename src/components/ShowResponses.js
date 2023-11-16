import React, { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import { useParams, useHistory } from "react-router-dom";
import { collection, getDocs, doc, query, where, getDoc } from "firebase/firestore";
import db from "../firebase";
import "./ShowResponses.css";
import img from "../assets/iconForm.png"

const ShowResponses = () => {
    const { formId } = useParams();
    const [respuestasEncontradas, setRespuestasEncontradas] = useState([]);
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


    const selectForm = (formId) => {
        history.push(`/responses/${formId}`);
    };

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
        
                        const formPreguntasQuery = query(collection(db, "Form_Preguntas"), where("idForm", "==", formData.data.id));
                        const formPreguntasSnapshot = await getDocs(formPreguntasQuery);
                        const preguntaIds = formPreguntasSnapshot.docs.map((doc) => doc.data().idPregunta);
        
                        console.log("Identificadores de preguntas:", preguntaIds);
        
                        const preguntasPromises = preguntaIds.map(async (preguntaId) => {
                            console.log(`Recuperando pregunta con ID ${preguntaId}`);
        
                            try {
                                const preguntasQuery = query(collection(db, "Preguntas"), where("id", "==", preguntaId));
                                const preguntasSnapshot = await getDocs(preguntasQuery);
        
                                if (!preguntasSnapshot.empty) {
                                    const preguntaData = preguntasSnapshot.docs[0].data();
                                    console.log("Pregunta recuperada:", preguntaData);
        
                                    const respuestaQuery = query(collection(db, "Pregunta_Respuesta"), where("idPregunta", "==", preguntaId));
                                    const respuestaSnapshot = await getDocs(respuestaQuery);
        
                                    console.log("Respuesta encontrada:", respuestaSnapshot.docs[0].data());
        
                                    let tipoRespuesta;
                                    let dato;
                                    let tipoRespuestaId;
        
                                    if (!respuestaSnapshot.empty) {
                                        tipoRespuestaId = respuestaSnapshot.docs[0].data().idRespuesta;
                                        console.log("ID de respuesta encontrado:", tipoRespuestaId);
        
                                        const colecciones = ["TipoTexto", "TipoNumero", "TipoComboBox"];
                                        let nuevasOpciones = [];
        
                                        for (const tipoColeccion of colecciones) {
                                            const tipoQuery = query(collection(db, tipoColeccion), where("id", "==", tipoRespuestaId));
                                            const tipoSnapshot = await getDocs(tipoQuery);
        
                                            if (!tipoSnapshot.empty) {
                                                tipoRespuesta = tipoColeccion;
        
                                                if (tipoRespuesta === "TipoComboBox") {
                                                    const opcionesQuery = query(collection(db, "Opciones"), where("idTipoCombobox", "==", tipoRespuestaId));
                                                    const opcionesSnapshot = await getDocs(opcionesQuery);
        
                                                    if (!opcionesSnapshot.empty) {
                                                        nuevasOpciones = opcionesSnapshot.docs.map((opcionDoc) => opcionDoc.data().opcion);
                                                        console.log("Opciones encontradas:", nuevasOpciones);
                                                    }
                                                } else {
                                                    dato = tipoSnapshot.docs[0].data().dato;
                                                }
                                                break;
                                            }
                                        }
        
                                        console.log("Tipo de respuesta:", tipoRespuesta);
        
                                        if (tipoRespuestaId) {
                                            try {
                                                const respuestasQuery = query(collection(db, "Respuestas"), where("idTipo", "==", tipoRespuestaId));
                                                const respuestasSnapshot = await getDocs(respuestasQuery);
        
                                                if (!respuestasSnapshot.empty) {
                                                    const nuevasRespuestas = respuestasSnapshot.docs.map((respuestaDoc) => ({
                                                        id: respuestaDoc.id,
                                                        data: respuestaDoc.data(),
                                                    }));
        
                                                    return {
                                                        id: preguntasSnapshot.docs[0].id,
                                                        data: preguntaData,
                                                        tipoRespuesta: tipoRespuesta,
                                                        dato: dato,
                                                        tipoRespuestaId: tipoRespuestaId,
                                                        respuestas: nuevasRespuestas,
                                                    };
                                                } else {
                                                    console.log(`No se encontraron respuestas para el tipo de respuesta con ID ${tipoRespuestaId}`);
                                                }
                                            } catch (error) {
                                                console.error(`Error al buscar respuestas para el tipo de respuesta con ID ${tipoRespuestaId}:`, error);
                                            }
                                        }
                                    }
        
                                    return null;
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
        
                        // Filtrar preguntas nulas
                        const filteredPreguntas = preguntas.filter((pregunta) => pregunta !== null);
        
                        // Actualizar el estado después de salir del bucle
                        setSelectedForm({
                            ...formData,
                            data: {
                                ...formData.data,
                                preguntas: filteredPreguntas,
                            },
                        });
        
                        // Recopilar todas las respuestas en un solo array
                        const allRespuestas = filteredPreguntas.reduce((acc, pregunta) => acc.concat(pregunta.respuestas), []);
        
                        // Actualizar el estado de respuestas
                        setRespuestasEncontradas(allRespuestas);
        
                        // Recopilar todas las opciones en un solo array
                        const allOpciones = filteredPreguntas.reduce((acc, pregunta) => {
                            if (pregunta.tipoRespuesta === "TipoComboBox") {
                                acc = acc.concat(pregunta.respuestas.map(respuesta => respuesta.data.respuesta));
                            }
                            return acc;
                        }, []);
        
                        // Actualizar el estado de opciones
                        setOpcionesEncontradas(allOpciones);
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



    return (
        <div className="containerSF">
            {selectedForm ? (
                <div className="form-container">
                    <h1 className="form-title">{selectedForm.data.titulo}</h1>
                    <p className="form-description">{selectedForm.data.descripcion}</p>
                    {selectedForm.data.preguntas ? (
                        selectedForm.data.preguntas.map((pregunta) => {
                            // Encontrar respuestas asociadas a la pregunta actual
                            const respuestasParaPregunta = respuestasEncontradas.filter(
                                (respuesta) => respuesta.data.idTipo === pregunta.tipoRespuestaId
                            );
    
                            return (
                                <div key={pregunta.id} className="form-question">
                                    <h3>{pregunta.data.pregunta}</h3>
    
                                    {/* Mostrar respuestas asociadas */}
                                    {respuestasParaPregunta.length > 0 ? (
                                        <div className="respuestas-list">
                                            {respuestasParaPregunta.map((respuesta) => (
                                                <div key={respuesta.id} className="respuesta-item">
                                                    {respuesta.data.respuesta}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>No hay respuestas para esta pregunta.</p>
                                    )}
                                </div>
                            );
                        })
                    ) : null}
                </div>
            ) : (
                <div>
                    <h1>Select a form to see the answers</h1>
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

export default ShowResponses;
