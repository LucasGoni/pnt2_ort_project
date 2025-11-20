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
  const demoEvents = useMemo(() => {
    const baseM = new Date().getMonth();
    const baseY = new Date().getFullYear();

    if (mode === "alumno") {
      return [
        {
          title: "Pecho y tr\u00edceps",
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
        title: "Ana L\u00f3pez",
        start: new Date(baseY, baseM, 13, 9, 0),
        end: new Date(baseY, baseM, 13, 9, 45),
        kind: "alumno",
      },
      {
        title: "Juan P\u00e9rez",
        start: new Date(baseY, baseM, 13, 10, 0),
        end: new Date(baseY, baseM, 13, 10, 30),
        kind: "alumno",
      },
      {
        title: "Luisa Mart\u00ednez",
        start: new Date(baseY, baseM, 13, 11, 0),
        end: new Date(baseY, baseM, 13, 11, 40),
        kind: "alumno",
      },
      {
        title: "Ezequiel G\u00f3mez",
        start: new Date(baseY, baseM, 13, 12, 0),
        end: new Date(baseY, baseM, 13, 12, 30),
        kind: "alumno",
      },
      {
        title: "Marta D\u00edaz",
        start: new Date(baseY, baseM, 13, 13, 0),
        end: new Date(baseY, baseM, 13, 13, 30),
        kind: "alumno",
      },
    ];
  }, [mode]);

  const data = events ?? demoEvents;

  return (
    <div className="calendar-container">
      <RBCalendar
        localizer={localizer}
        events={data}
        startAccessor="start"
        endAccessor="end"
        defaultView={defaultView}
        popup // muestra el "+N m\u00e1s" en la vista mes
        toolbar // toolbar con Mes/Semana/D\u00eda
        // eventPropGetter={eventPropGetter}
        messages={{
          month: "Mes",
          week: "Semana",
          day: "D\u00eda",
          agenda: "Agenda",
          today: "Hoy",
          previous: "Anterior",
          next: "Siguiente",
          showMore: (total) => `+${total} m\u00e1s`,
          noEventsInRange: "Sin eventos en este rango",
        }}
      />
    </div>
  );
}
