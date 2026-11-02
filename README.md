# MVP Admisión USM — Tarea 10 (React)

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Status](https://img.shields.io/badge/Entrega-Tarea_10_MVP-success?style=for-the-badge)

Este repositorio contiene el Producto Mínimo Viable (MVP) desarrollado para el curso de Diseño de Interfaces Usuarias. El objetivo principal es resolver las inconsistencias de usabilidad identificadas en las evaluaciones previas del portal de Admisión de la Universidad Técnica Federico Santa María (USM).

---

## Repositorio y Contexto
- **Integrantes:** Javiera Ibaca - Fernanda López - Lucas Morrison
- **Asignatura:** Diseño de Interfaces Usuarias (INF-295)
- **Entrega:** Tarea 10 - MVP en React

---

## Tecnologías Utilizadas
- **Frontend:** React (Vite / Create React App)
- **Estilos:** SCSS / CSS Modules (Mobile First)
- **Navegación:** React Router DOM

---

## Metas de los Usuarios Implementadas

El MVP aborda tres metas clave derivadas de las pruebas de usabilidad previas:

1. **HU-01 / Simulador de Puntaje de Corte:** Permite al postulante ingresar sus puntajes (NEM, Ranking y Pruebas de Competencias) para conocer automáticamente si queda seleccionado o no en las carreras de su interés, calculando la diferencia de puntos respecto al puntaje corte.
2. **HU-02 / Explorador Centralizado de Carreras:** Contiene en una sola vista responsiva la malla curricular interactiva (sin necesidad de PDF), aranceles, duración, campo laboral y puntajes de corte.
3. **HU-03 / Centro de Novedades y Actividades:** Agrupa las fechas clave del proceso de admisión, los eventos presenciales/online y los accesos directos a redes sociales oficiales desde la página principal.

---

## Mapa de Navegación

```text
Home
├── Próximas actividades ──► Detalle de actividad
├── Fechas clave
├── Explorar carreras ──► Ficha de carrera ──► Simulador (precargado)
├── Simulador de puntaje ──► Resultados ──► Ficha de carrera
└── Redes sociales (externo)
