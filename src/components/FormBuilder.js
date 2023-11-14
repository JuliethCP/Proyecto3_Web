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
  const [responseTypeSelected, setResponseTypeSelected] = useState(false);

  const addQuestion = () => {
    const newQuestion = {
      id: uuidv4(),
      type: responseTypeSelected,
      question: "",
      answer: "",
      options: responseTypeSelected === "multiple" ? [""] : [],
      tableRows: 2,
      tableColumns: 2,
      tableData: Array.from({ length: 2 }, () => Array(2).fill("")), // Initialize tableData as a 2D array
    };
    setQuestions([...questions, newQuestion]);
  };

  const isTitleValid = () => {
  // Verifica si el título no está vacío o compuesto solo por espacios en blanco
  return titleValue.trim() !== "";
};

const isFormValid = () => {
  // Verifica si hay preguntas y si el título es válido
  return questions.length > 0 && isTitleValid();
};

  const handleTitleChange = (title) => {
    setTitleValue(title);
  };

  const handleDescriptionChange = (description) => {
    setDescriptionValue(description);
  };

  const handleQuestionChange = (questionId, newQuestion) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId ? { ...question, question: newQuestion } : question
    );
    setQuestions(updatedQuestions);
  };

  const handleAnswerChange = (questionId, answer) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId ? { ...question, answer: answer } : question
    );
    setQuestions(updatedQuestions);
  };

  const handleSelectResponseType = (type) => {
    setResponseTypeSelected(type);
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

  const handleAddOption = (questionId) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId
        ? { ...question, options: [...question.options, ""] }
        : question
    );
    setQuestions(updatedQuestions);
  };

  const handleTableDataChange = (questionId, newData) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId ? { ...question, tableData: newData } : question
    );
    setQuestions(updatedQuestions);
  };

  const handleTableRowsChange = (questionId, newTableRows) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId ? { ...question, tableRows: newTableRows } : question
    );
    setQuestions(updatedQuestions);
  };

  const handleTableColumnsChange = (questionId, newTableColumns) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId ? { ...question, tableColumns: newTableColumns } : question
    );
    setQuestions(updatedQuestions);
  };

  const handleAddRow = (questionId) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId
        ? {
            ...question,
            tableRows: question.tableRows + 1,
            tableData: [
              ...question.tableData,
              Array(question.tableColumns).fill(""), // Initialize a new row with empty values
            ],
          }
        : question
    );
    setQuestions(updatedQuestions);
  };

  const handleAddColumn = (questionId) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId ? { ...question, tableColumns: question.tableColumns + 1 } : question
    );
    setQuestions(updatedQuestions);
  };

  const handleRemoveRow = (questionId) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId ? { ...question, tableRows: Math.max(1, question.tableRows - 1) } : question
    );
    setQuestions(updatedQuestions);
  };

  const handleRemoveColumn = (questionId) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId ? { ...question, tableColumns: Math.max(1, question.tableColumns - 1) } : question
    );
    setQuestions(updatedQuestions);
  };


  const confirmAndSave = () => {
    if (isFormValid() && window.confirm("Are you sure you want to save the form?")) {
      scanAndSave();
      saveFormData();
    } else {
      alert("Please add at least one question and provide a valid title before saving.");
    }
  };

  const saveFormData = async () => {
    try {
      const formId = uuidv4();
  
      await addDoc(collection(db, "Form"), {
        id: formId,
        titulo: titleValue,
        link: "tu_valor_de_link",
      });
  
      for (const question of questions) {
        const preguntaId = uuidv4();
  
        await addDoc(collection(db, "Preguntas"), {
          id: preguntaId,
          pregunta: question.question,
        });
  
        await addDoc(collection(db, "Form_Preguntas"), {
          idForm: formId,
          idPregunta: preguntaId,
        });
  
        // Handle options for questions of type "multiple"
        if (question.type === "multiple") {
          // Crear el registro en la tabla TipoCombobox
          const tipoComboBoxId = uuidv4();
          await addDoc(collection(db, "TipoComboBox"), {
            id: tipoComboBoxId,
          });
  
          // Iterar sobre las opciones y agregarlas a la tabla Opciones
          for (const option of question.options) {
            //const opcionId = uuidv4();
            await addDoc(collection(db, "Opciones"), {
              idTipoCombobox: tipoComboBoxId, // Relación con TipoComboBox
              opcion: option,
            });
  
            // Asociar la opción con la pregunta en la tabla Pregunta_Respuesta
            await addDoc(collection(db, "Pregunta_Respuesta"), {
              idPregunta: preguntaId,
              idRespuesta: tipoComboBoxId,
            });
          }
        } else if (question.type === "text") {
          // Manejar preguntas de tipo texto
          const tipoTextoId = uuidv4();
          await addDoc(collection(db, "TipoTexto"), {
            id: tipoTextoId,
            dato: question.answer,
          });
  
          await addDoc(collection(db, "Pregunta_Respuesta"), {
            idPregunta: preguntaId,
            idRespuesta: tipoTextoId,
          });
        } else if (question.type === "number") {
          // Manejar preguntas de tipo número
          const tipoNumeroId = uuidv4();
          await addDoc(collection(db, "TipoNumero"), {
            id: tipoNumeroId,
            dato: parseFloat(question.answer),
          });
  
          await addDoc(collection(db, "Pregunta_Respuesta"), {
            idPregunta: preguntaId,
            idRespuesta: tipoNumeroId,
          });
        } else if (question.type === "table") {
          // Iterar a través de las celdas de la tabla y guardarlas en la colección correspondiente
          for (let i = 0; i < question.tableRows; i++) {
            for (let j = 0; j < question.tableColumns; j++) {
              const tableCellId = uuidv4();
              await addDoc(collection(db, "TablaRespuestas"), {
                id: tableCellId,
                idPregunta: preguntaId,
                row: i + 1,
                column: j + 1,
                dato: "", // Aquí debes obtener el dato real de cada celda
              });
            }
          }
        }
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
      } else if (question.type === "table") {
        console.log("Número de Filas:", question.tableRows);
        console.log("Número de Columnas:", question.tableColumns);
      }
    });
  };

  return (
    <div className="form-container">
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
                <Dropdown.Item onClick={() => handleSelectResponseType("table")}>
                  Table
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
                    className="custom-input"
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
                    className="custom-input"
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
                    className="custom-input"
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
                        className="btn-block"
                        style={{ marginRight: '-5px', marginBottom: '5px' }}
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

              {question.type === "table" && (
              <div>
                <h4>Table Question</h4>
                <input
                  type="text"
                  className="custom-input-table"
                  placeholder="Question"
                  value={question.question}
                  onChange={(e) =>
                    handleQuestionChange(question.id, e.target.value)
                  }
                />
                <table className="table">
                  <tbody>
                    {[...Array(question.tableRows)].map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {[...Array(question.tableColumns)].map((_, colIndex) => (
                          <td key={colIndex}>
                            <input
                              type="text"
                              className="custom-table-input"
                              placeholder={`Row ${rowIndex + 1}, Column ${colIndex + 1}`}
                              value={question.tableData[rowIndex][colIndex]}
                              onChange={(e) => {
                                const newData = question.tableData.map((row, rIndex) =>
                                  rIndex === rowIndex
                                    ? row.map((cell, cIndex) =>
                                        cIndex === colIndex ? e.target.value : cell
                                      )
                                    : row
                                );
                                handleTableDataChange(question.id, newData);
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: '15px' }}>
                  <Button
                    variant="outline-dark"
                    className="btn-block w-33"
                    style={{ marginRight: '8px', marginTop: '15px' }}
                    onClick={() => handleAddRow(question.id)}
                  >
                    Add Row
                  </Button>
                  <Button
                    variant="outline-dark"
                    className="btn-block w-33"
                    style={{ marginRight: '8px', marginTop: '15px' }}
                    onClick={() => handleRemoveRow(question.id)}
                  >
                    Remove Row
                  </Button>
                  <Button
                    variant="outline-dark"
                    className="btn-block w-33"
                    style={{ marginRight: '8px', marginTop: '15px' }}
                    onClick={() => handleAddColumn(question.id)}
                  >
                    Add Column
                  </Button>
                  <Button
                    variant="outline-dark"
                    className="btn-block w-33"
                    style={{ marginRight: '8px', marginTop: '15px' }}
                    onClick={() => handleRemoveColumn(question.id)}
                  >
                    Remove Column
                  </Button>
                </div>
              </div>
            )}
            </div>
          ))}
        </div>
        <div className="row mt-3">
        <div className="col-md-12">
          <Button variant="dark" onClick={() => {
            scanAndSave();
            saveFormData();
          }}>
            Save Form
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}

export default FormBuilder;