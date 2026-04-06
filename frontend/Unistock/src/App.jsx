import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./feature/shared/AuthContext";
import { RouterApp } from "./routers/routers.jsx";

function App() {
  return (
     <BrowserRouter>
      <AuthProvider>
        <RouterApp />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
