import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { RouterApp } from "./routers/routers.jsx";

function App() {
  return (
    <BrowserRouter>
      <RouterApp />
    </BrowserRouter>
  );
}

export default App;
