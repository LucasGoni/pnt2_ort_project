import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RoleRoute from "./components/RoleRoute";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import HomeEntrenador from "./pages/HomeEntrenador/HomeEntrenador.jsx";
import HomeAlumno from "./pages/HomeAlumno/HomeAlumno.jsx";
import EntrenadorAlumnos from "./pages/EntrenadorAlumnos/EntrenadorAlumnos.jsx";
import CalendarAlumnoPage from "./pages/Calendar/CalendarAlumnoPage.jsx";
import CalendarEntrenadorPage from "./pages/Calendar/CalendarEntrenadorPage.jsx";
import EntrenadorRutinas from "./pages/EntrenadorRutinas/EntrenadorRutinas.jsx";
import EntrenadorEjercicios from "./pages/EntrenadorEjercicios/EntrenadorEjercicios.jsx";
import CrearPlan from "./pages/PlanEntrenador/CrearPlan.jsx";
import PerfilEntrenador from "./pages/PerfilEntrenador/PerfilEntrenador.jsx";
import PerfilAlumno from "./pages/PerfilAlumno/PerfilAlumno.jsx";


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
        <Route path="/entrenador/plan" element={<CrearPlan />} />
        <Route path="/entrenador/alumnos" element={<EntrenadorAlumnos />} />
        <Route path="/entrenador/rutinas" element={<EntrenadorRutinas />} />
        <Route path="/entrenador/ejercicios" element={<EntrenadorEjercicios />} />
        <Route path="/entrenador/perfil" element={<PerfilEntrenador />} />
        <Route path="/alumno/perfil" element={<PerfilAlumno />} />

        <Route path="*" element={<h2 style={{ textAlign: "center" }}>404 - Página no encontrada</h2>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
