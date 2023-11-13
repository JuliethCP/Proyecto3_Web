import './App.css';
import FormBuilder from './components/FormBuilder';
import Navbar from './components/Navbar';
import ShowForm from './components/ShowForm'; // Importa el componente ShowForm
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Switch>
          <Route path="/formBuilder" component={FormBuilder} />
          <Route path="/showForm/:formId" component={ShowForm} /> {/* Ruta para mostrar formularios */}
          <Route path="/" exact>
            <h1>Bienvenido a la aplicación de formularios</h1>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
