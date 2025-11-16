// src/components/Calendar/Calendar.jsx
import React, { useMemo } from "react";
import { Calendar as RBCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css"; 

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // lunes
  getDay,
  locales,
});

/**
 * props:
 * - mode: "alumno" | "entrenador"
 * - events?: { title:string, start:Date, end:Date, meta?:any }[]
 * - defaultView?: "month" | "week" | "day"
 */
export default function Calendar({
  mode = "alumno",
  events,
  defaultView = "month",
}) {
  // Datos mock mientras no hay backend:
  const demoEvents = useMemo(() => {
    const baseM = new Date().getMonth();
    const baseY = new Date().getFullYear();
    if (mode === "alumno") {
      return [
        {
          title: "Pecho y tríceps",
          start: new Date(baseY, baseM, 12, 10, 0),
          end: new Date(baseY, baseM, 12, 11, 0),
          kind: "entreno",
        },
        {
          title: "Piernas fuerza",
          start: new Date(baseY, baseM, 15, 9, 0),
          end: new Date(baseY, baseM, 15, 9, 45),
          kind: "entreno",
        },
        {
          title: "HIIT + Core",
          start: new Date(baseY, baseM, 20, 19, 0),
          end: new Date(baseY, baseM, 20, 19, 40),
          kind: "entreno",
        },
      ];
    }
    // entrenador: cada evento es un alumno
    return [
      {
        title: "Ana López",
        start: new Date(baseY, baseM, 13, 9, 0),
        end: new Date(baseY, baseM, 13, 9, 45),
        kind: "alumno",
      },
      {
        title: "Juan Pérez",
        start: new Date(baseY, baseM, 13, 10, 0),
        end: new Date(baseY, baseM, 13, 10, 30),
        kind: "alumno",
      },
      {
        title: "Luisa Martínez",
        start: new Date(baseY, baseM, 13, 11, 0),
        end: new Date(baseY, baseM, 13, 11, 40),
        kind: "alumno",
      },
      {
        title: "Ezequiel Gómez",
        start: new Date(baseY, baseM, 13, 12, 0),
        end: new Date(baseY, baseM, 13, 12, 30),
        kind: "alumno",
      },
      {
        title: "Marta Díaz",
        start: new Date(baseY, baseM, 13, 13, 0),
        end: new Date(baseY, baseM, 13, 13, 30),
        kind: "alumno",
      },
    ];
  }, [mode]);

  const data = events ?? demoEvents;

  // Colores distintos según modo (opcional)
  //   const eventPropGetter = (event) => {
  //     const bg =
  //       mode === "alumno" ? "#7c3aed" : "#2563eb"; // violeta alumno / azul entrenador
  //     return {
  //       style: {
  //         backgroundColor: bg,
  //         borderRadius: "6px",
  //         border: "none",
  //         color: "white",
  //         padding: "2px 6px",
  //       },
  //     };
  //   };

  return (
    <div style={{ height: "calc(100vh - 150px)", minHeight: 520 }}>
      <RBCalendar
        localizer={localizer}
        events={data}
        startAccessor="start"
        endAccessor="end"
        defaultView={defaultView}
        popup // <- habilita el popup “+N más”
        toolbar // toolbar con Mes/Semana/Día
        // eventPropGetter={eventPropGetter}
        messages={{
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          today: "Hoy",
          previous: "Anterior",
          next: "Siguiente",
          showMore: (total) => `+${total} más`,
          noEventsInRange: "Sin eventos en este rango",
        }}
      />
    </div>
  );
}
