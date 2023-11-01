import React, { Component } from 'react';
import './FormBuilder.css';

class FormBuilder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formFields: [], // Aquí almacenaremos los campos del formulario
      formTitle: '',  // Título del formulario
    };
  }

  // Agrega un nuevo campo al formulario según el tipo
  addField = (fieldType) => {
    const newField = {
      type: fieldType,
      label: '',
      options: [], // Usado para Comboboxes, Tablas Editables, etc.
    };
    this.setState((prevState) => ({
      formFields: [...prevState.formFields, newField],
    }));
  };

  // Actualiza el título del formulario
  handleTitleChange = (e) => {
    this.setState({ formTitle: e.target.value });
  };

  // Maneja cambios en los campos del formulario
  handleFieldChange = (index, key, value) => {
    const updatedFields = [...this.state.formFields];
    updatedFields[index][key] = value;
    this.setState({ formFields: updatedFields });
  };

  // Renderiza la lista de campos del formulario
  renderFields() {
    return this.state.formFields.map((field, index) => (
      <div key={index}>
        {field.type === 'combobox' ? (
          <div>
            <label>Tipo de Campo: Combobox</label>
            <select>
              {field.options.map((option, optionIndex) => (
                <option key={optionIndex} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label>Tipo de Campo: {field.type}</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => this.handleFieldChange(index, 'label', e.target.value)}
            />
          </div>
        )}
      </div>
    ));
  }

  // Envía el formulario a la base de datos
  handleSubmitForm = () => {
    const formData = {
      title: this.state.formTitle,
      fields: this.state.formFields,
    };
    // Aquí puedes enviar 'formData' a tu base de datos (por ejemplo, Firebase).
    // Realiza la lógica de almacenamiento en tu base de datos aquí.
  };

  render() {
    return (
      <div>
        <h1>Crear Nuevo Formulario</h1>
        <label>Título del Formulario</label>
        <input
          type="text"
          value={this.state.formTitle}
          onChange={this.handleTitleChange}
        />
        <button onClick={() => this.addField('text')}>Agregar Campo de Texto</button>
        <button onClick={() => this.addField('number')}>Agregar Campo Numérico</button>
        <button onClick={() => this.addField('combobox')}>Agregar Combobox</button>
        <button onClick={() => this.addField('table')}>Agregar Tabla Editable</button>
        <div>
          {this.state.formFields.length > 0 && (
            <div>
              <h2>Campos Agregados</h2>
              {this.renderFields()}
            </div>
          )}
        </div>
        <button onClick={this.handleSubmitForm}>Guardar Formulario</button>
      </div>
    );
  }
}

export default FormBuilder;
