import './App.css';
import FormBuilder from './components/FormBuilder';
import Navbar from './components/Navbar';
import ShowForm from './components/ShowForm'; // Importa el componente ShowForm
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ShowResponses from './components/ShowResponses';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Switch>
          <Route path="/formBuilder" component={FormBuilder} />
          <Route path="/responses" component={ShowResponses} /> 
          <Route path="/showForm/:formId" component={ShowForm}  exact>
           
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
