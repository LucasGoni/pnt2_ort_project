import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RoleRoute from "./components/RoleRoute";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import HomeEntrenador from "./pages/HomeEntrenador/HomeEntrenador";
import HomeAlumno from "./pages/HomeAlumno/HomeAlumno";
import CalendarAlumnoPage from "./pages/Calendar/CalendarAlumnoPage.jsx";
import CalendarEntrenadorPage from "./pages/Calendar/CalendarEntrenadorPage.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/entrenador"
          element={
            <RoleRoute allowedRoles={["entrenador"]}>
              <HomeEntrenador />
            </RoleRoute>
          }
        />

        <Route
          path="/alumno"
          element={
            <RoleRoute allowedRoles={["alumno"]}>
              <HomeAlumno />
            </RoleRoute>
          }
        />

        <Route
          path="/calendario/alumno"
          element={
            <RoleRoute allowedRoles={["alumno"]}>
              <CalendarAlumnoPage />
            </RoleRoute>
          }
        />

        <Route
          path="/calendario/entrenador"
          element={
            <RoleRoute allowedRoles={["entrenador"]}>
              <CalendarEntrenadorPage />
            </RoleRoute>
          }
        />

        <Route path="*" element={<h2 style={{ textAlign: "center" }}>404 - Página no encontrada</h2>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
