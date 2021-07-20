import { Route, BrowserRouter as Router } from "react-router-dom";
import Home from "./pages/Home";

const App = () => (
  <Router>
    <Route exact path="/">
      <Home />
    </Route>
  </Router>
);

export default App;
