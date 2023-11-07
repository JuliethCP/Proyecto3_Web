import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./FormBuilder.css";
import { v4 as uuidv4 } from "uuid";
import { Button, Dropdown } from "react-bootstrap";

function TitleForm({ onTitleChange, onQuestionChange }) {
  const [titleValue, setTitleValue] = useState("");
  const [questionValue, setQuestionValue] = useState("");

  const handleTitleChange = (e) => {
    setTitleValue(e.target.value);
    onTitleChange(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setQuestionValue(e.target.value);
    onQuestionChange(e.target.value);
  };

  return (
    <div className="form">
      <h2>
        <input
          type="text"
          style={{ outline: "none", background: "transparent" }}
          value={titleValue}
          onChange={handleTitleChange}
          placeholder="Form Title"
        />
      </h2>
      <p>
        <input
          type="text"
          style={{ outline: "none", background: "transparent" }}
          value={questionValue}
          onChange={handleDescriptionChange}
          placeholder="Form Description Here"
        />
      </p>
    </div>
  );
}

function FormBuilder() {
  const [questions, setQuestions] = useState([]);
  const [titleValue, setTitleValue] = useState(""); 
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
    // Handle title change if needed
  };

  const handleDescriptionChange = (questionId, question) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId ? { ...q, question: question } : q
    );
    setQuestions(updatedQuestions);
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
              onChange={handleTitleChange}
              placeholder="Form Title"
            />
          </div>
          <div className="col-md-12">
            <p>Form Description Here</p>
            <input
              type="text"
              className="form-control"
              value={questionValue}
              onChange={handleDescriptionChange}
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
