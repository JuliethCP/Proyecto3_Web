import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import 'font-awesome/css/font-awesome.min.css';
import React, { useState } from 'react';

//  <img src="..\assets\iconForm.png" alt="Logo" width="40" height="40" class="d-inline-block align-text-top mx-3"/>
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark custom-navbar">
      <div className="container">
        <a className="navbar-brand custom-brand" href="#">
          <i className="fa fa-wpforms"></i> JN FORMS
        </a>
        <button className="navbar-toggler" type="button" onClick={toggleMenu}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item mx-3">
              <a className="nav-link custom-link" href="#">
                Preguntas
              </a>
            </li>
            <li className="nav-item mx-3">
              <a className="nav-link custom-link" href="#">
                Respuestas
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
