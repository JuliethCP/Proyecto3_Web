import './App.css'
import FormBuilder from './components/FormBuilder';
import Navbar from './components/Navbar';
import ShowForm from './components/ShowForm'; // Importa el componente ShowForm
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ShowResponses from './components/ShowResponses';

function HomePage() {
  return (
    <div className="home-container" >

      <h1>Bienvenido a la Página Principal</h1>
      <h2>Usa la navbar para navegar en la aplicación</h2>
      <ul>
        <li><h3>En Forms puedes encontrar los formularios disponibles para responder o compartir</h3></li>
        <li><h3>En Create Form puedes crear los formularios</h3></li>
        <li><h3>En Answers puedes encontrar las respuestas a cada form que sea elegido</h3></li>
      </ul>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Switch>
          <Route path="/" exact component={HomePage} />
          <Route path="/formBuilder" component={FormBuilder} />
          <Route path="/responses/:formId" component={ShowResponses} />
          <Route path="/showForm/:formId" component={ShowForm} >
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
