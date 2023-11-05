import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import 'font-awesome/css/font-awesome.min.css';


import React from 'react';
//  <img src="..\assets\iconForm.png" alt="Logo" width="40" height="40" class="d-inline-block align-text-top mx-3"/>
function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark custom-navbar">
      <div className="container">
        <a className="navbar-brand custom-brand" href="#">
          <i className="fa fa-wpforms"></i> JN FORMS
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item mx-5 active">
              <a className="nav-link custom-link" href="#">Preguntas</a>
            </li>
            <li className="nav-item mx-5 custom-link">
              <a className="nav-link" href="#">Respuestas</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
