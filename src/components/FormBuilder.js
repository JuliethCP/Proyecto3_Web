import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './FormBuilder.css';
import { Button, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';

function TitleForm() {
  const [titleValue, setTitleValue] = useState(''); // Estado para el valor del título
  const [paragraphValue, setParagraphValue] = useState(''); // Estado para el valor del párrafo


  return (
    <div className='form'>
      <h2>
      <input
        type="text"
        style={{ /*border: 'none', */outline: 'none', background: 'transparent' }}
        value={titleValue}
        onChange={(e) => setTitleValue(e.target.value)}
        placeholder="Title"
      />
</h2>
      <p>
        <input
          type="text"
          style={{ /*border: 'none', */ outline: 'none', background: 'transparent' }}
          value={paragraphValue}
          onChange={(e) => setParagraphValue(e.target.value)}
          placeholder="Text here..."
        />
      </p>
    </div>
  );
}

function FormBuilder() {
  const formTooltip = <Tooltip id="tooltip-pregunta">Add title</Tooltip>;
  const preguntaTooltip = <Tooltip id="tooltip-pregunta">Add question</Tooltip>;
  const respuestaTooltip = <Tooltip id="tooltip-respuesta">Add answer</Tooltip>;

  const [titles, setTitles] = useState([]);

  const addTitle = () => {
    setTitles([...titles, <TitleForm key={titles.length} />]);
  };

  return (
    <div className="container">
      <div className="fixed-right">
        <h6 className="text-center mb-3">Controls</h6>
        <div className="mb-1">
          <OverlayTrigger placement="left" overlay={formTooltip}>
            <Button variant="dark" onClick={addTitle}>
              <i className="fa fa-bookmark"></i>
            </Button>
          </OverlayTrigger>
        </div>

        <div className="mb-1">
          <OverlayTrigger placement="left" overlay={preguntaTooltip}>
            <Button variant="dark">
              <i className="fa fa-question-circle"></i>
            </Button>
          </OverlayTrigger>
        </div>

        <OverlayTrigger placement="left" overlay={respuestaTooltip}>
          <Dropdown>
            <Dropdown.Toggle variant="dark" id="dropdown-basic">
              <i className="fa fa-comment"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item href="#">Text</Dropdown.Item>
              <Dropdown.Item href="#">Numbers</Dropdown.Item>
              <Dropdown.Item href="#">Document</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </OverlayTrigger>
      </div>
      <div className="titles-container">{titles}</div>
    </div>
  );
}

export default FormBuilder;
