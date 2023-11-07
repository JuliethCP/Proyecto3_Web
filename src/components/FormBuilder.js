import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./FormBuilder.css";
import { v4 as uuidv4 } from "uuid";
import { Button, Dropdown } from "react-bootstrap";
import { collection, addDoc } from "firebase/firestore";
import db from "../firebase";

function FormBuilder() {
  const [questions, setQuestions] = useState([]);
  const [titleValue, setTitleValue] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [questionValue, setQuestionValue] = useState("");
  const [responseTypeSelected, setResponseTypeSelected] = useState(false);

  const addQuestion = () => {
    const newQuestion = {
      id: uuidv4(),
      type: responseTypeSelected,
      question: "",
      answer: "",
      options: responseTypeSelected === "multiple" ? [""] : [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleTitleChange = (title) => {
    setTitleValue(title);
  };

  const handleDescriptionChange = (description) => {
    setDescriptionValue(description); // Update the descriptionValue state
  };


  const handleQuestionChange = (questionId, newQuestion) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId
        ? { ...question, question: newQuestion }
        : question
    );
    setQuestions(updatedQuestions);
  };

  const handleAnswerChange = (questionId, answer) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId ? { ...question, answer: answer } : question
    );
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionId, optionIndex, option) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId
        ? {
          ...question,
          options: question.options.map((o, index) =>
            index === optionIndex ? option : o
          ),
        }
        : question
    );
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (questionId) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId
        ? { ...question, options: [...question.options, ""] }
        : question
    );
    setQuestions(updatedQuestions);
  };

  const handleRemoveOption = (questionId, optionIndex) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId
        ? {
          ...question,
          options: question.options.filter(
            (_, index) => index !== optionIndex
          ),
        }
        : question
    );
    setQuestions(updatedQuestions);
  };

  const handleSelectResponseType = (type) => {
    setResponseTypeSelected(type);
  };

  const saveFormData = async () => {
    try {
      // Genera un ID único para el formulario
      const formId = uuidv4();
  
      // Crear un documento en la colección "Form" con los datos del formulario
      const formDocRef = await addDoc(collection(db, "Form"), {
        titulo: titleValue, 
        descripcion: descriptionValue,
        id: formId,
        link: "tu_valor_de_link", 
      });
  
      // Iterar a través de las preguntas y guardarlas en la colección "Preguntas"
      for (const question of questions) {
        const preguntaId = uuidv4(); // Genera un ID único para la pregunta
  
        const preguntaDocRef = await addDoc(collection(db, "Preguntas"), {
          pregunta: question.question,
          id: preguntaId,
        });
  
        // Guardar la relación entre el formulario y la pregunta en "Form_Preguntas"
        await addDoc(collection(db, "Form_Preguntas"), {
          idForm: formId,
          idPregunta: preguntaId,
        });
  
        // Aquí deberías manejar los tipos de respuesta y las respuestas
      }
  
      console.log("Formulario guardado correctamente en Firestore.");
    } catch (error) {
      console.error("Error al guardar el formulario:", error);
    }
  };
  
  


  const scanAndSave = () => {
    console.log("Título del Formulario:", titleValue);
    console.log("Descripción del Formulario:", descriptionValue);

    questions.forEach((question, index) => {
      console.log(`Pregunta ${index + 1}:`);
      console.log("Tipo de Respuesta:", question.type);
      console.log("Pregunta:", question.question);
      console.log("Respuesta:", question.answer);

      if (question.type === "multiple") {
        console.log("Opciones:");
        question.options.forEach((option, optionIndex) => {
          console.log(`Opción ${optionIndex + 1}: ${option}`);
        });
      }
    });
  };

  return (
    <div className="form-container">
      <div className="row mt-3">
        <div className="col-md-12">
          <Button variant="primary" onClick={() => {
            scanAndSave();
            saveFormData();
          }}>
            Guardar
          </Button>
        </div>
      </div>

      <div className="container">
        {/* Espacio para el título */}
        <div className="row">
          <div className="col-md-12">
            <h2>Form Title</h2>
            <input
              type="text"
              className="form-control"
              value={titleValue}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Form Title"
            />
          </div>
          <div className="col-md-12">
            <h6>Form Description</h6>
            <input
              type="text"
              className="form-control"
              value={descriptionValue}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Form Description Here"
            />
          </div>
        </div>

        {/* Controles para agregar preguntas */}
        <div className="row mt-3">
          <div className="col-md-6">
            <Button variant="dark" onClick={addQuestion} disabled={!responseTypeSelected}>
              Add Question
            </Button>
          </div>
          <div className="col-md-6">
            <Dropdown>
              <Dropdown.Toggle variant="dark" id="dropdown-basic">
                Select Response Type
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleSelectResponseType("text")}>
                  Text
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleSelectResponseType("number")}>
                  Number
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleSelectResponseType("multiple")}>
                  Multiple Choice
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* Preguntas y respuestas */}
        <div className="row mt-3">
          {questions.map((question) => (
            <div
              key={question.id}
              className="col-md-12 mb-3 question-container"
            >
              {question.type === "text" && (
                <div>
                  <h4>Text Question</h4>
                  <input
                    type="text"
                    className="custom-input" // Agrega una clase personalizada
                    placeholder="Question"
                    value={question.question}
                    onChange={(e) =>
                      handleQuestionChange(question.id, e.target.value)
                    }
                  />
                  <input
                    type="text"
                    className="custom-data-input"
                    placeholder="Answer"
                    value={question.answer}
                    onChange={(e) =>
                      handleAnswerChange(question.id, e.target.value)
                    }
                  />
                </div>
              )}

              {question.type === "number" && (
                <div>
                  <h4>Number Question</h4>

                  <input
                    type="text"
                    className="custom-input" // Agrega una clase personalizada
                    placeholder="Question"
                    value={question.question}
                    onChange={(e) =>
                      handleQuestionChange(question.id, e.target.value)
                    }
                  />
                  <input
                    type="number"
                    className="custom-data-input"
                    placeholder="Answer"
                    value={question.answer}
                    onChange={(e) =>
                      handleAnswerChange(question.id, e.target.value)
                    }
                  />
                </div>
              )}

              {question.type === "multiple" && (
                <div>
                  <h4>Multiple Choice Question</h4>
                  <input
                    type="text"
                    className="custom-input" // Agrega una clase personalizada
                    placeholder="Question"
                    value={question.question}
                    onChange={(e) =>
                      handleQuestionChange(question.id, e.target.value)
                    }
                  />
                  {question.options.map((option, index) => (
                    <div key={index} className="mb-1 custom-option-container">
                      <input
                        type="text"
                        className="custom-option-input"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(question.id, index, e.target.value)
                        }
                      />
                      <Button
                        variant="outline-danger"
                        onClick={() => handleRemoveOption(question.id, index)}
                      >
                        Remove Option
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline-dark"
                    onClick={() => handleAddOption(question.id)}
                  >
                    Add Option
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FormBuilder;
