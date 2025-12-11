export const getHomePath = (role) => {
  return role === "entrenador" ? "/entrenador" : "/alumno";
};
