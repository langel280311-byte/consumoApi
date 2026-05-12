// ============================================================
// app.js — Punto de entrada principal
// Responsabilidad: conectar las clases y manejar los eventos.
// Este archivo no hace fetch ni toca el DOM directamente,
// solo COORDINA lo que hacen ProductoAPI y UI.
// ============================================================

// import: trae las clases desde sus archivos correspondientes.
// Las llaves {} indican que son exportaciones nombradas (no default exports).
import { ProductoAPI } from "./ProductoAPI.js";
import { UI } from "./UI.js";


// --- Instancias ---
// Creamos UN solo objeto de cada clase para usar en todo el archivo.
// api: sabe hablar con la API externa
// ui: sabe pintar cosas en el DOM
const api = new ProductoAPI(12); // 12 productos por página
const ui = new UI("contenedor"); // le pasamos el id del div en el HTML


// --- Estado de la aplicación ---
// Variables que representan "qué está pasando" en la app en este momento.
let pagina = 1;       // página actual de la paginación
let buscando = false; // indica si el usuario está usando el buscador


// --- Referencias al DOM ---
// Solo las necesitamos aquí para agregar los event listeners más abajo.
const btnSiguiente = document.getElementById("siguiente");
const btnAnterior = document.getElementById("anterior");
const inputBuscar = document.getElementById("buscar");


// --- Función: cargarPagina ---
// Pide los productos de la página actual a la API y los muestra.
// Es async porque espera la respuesta del fetch (que es una Promesa).
// El try/catch captura cualquier error de red y lo muestra en pantalla
// en vez de que la app se rompa silenciosamente.
async function cargarPagina() {
    try {
        const productos = await api.obtenerPorPagina(pagina);
        ui.mostrarProductos(productos);
    } catch (error) {
        ui.mostrarError("Error al cargar los productos.");
        console.error(error); // también lo imprimimos en consola para depuración
    }
}


// --- Función: buscar ---
// Maneja la búsqueda en tiempo real mientras el usuario escribe.
// Si el campo queda vacío, vuelve al modo de paginación normal.
async function buscar(texto) {
    if (texto.trim() === "") {
        // .trim() elimina espacios en blanco al inicio y al final
        // Si el texto está vacío (o solo espacios), salimos del modo búsqueda
        buscando = false;
        cargarPagina(); // volvemos a mostrar la página normal
        return;
    }

    buscando = true; // activamos la bandera: estamos en modo búsqueda
    try {
        const productos = await api.buscar(texto);
        ui.mostrarProductos(productos);
    } catch (error) {
        ui.mostrarError("Error al buscar productos.");
        console.error(error);
    }
}


// --- Eventos ---

// "input" se dispara con cada tecla que el usuario escribe o borra.
// Es diferente a "change" que solo se dispara al perder el foco.
inputBuscar.addEventListener("input", (e) => buscar(e.target.value));

btnSiguiente.addEventListener("click", () => {
    // Si estamos buscando, los botones de paginación no hacen nada.
    // Esto corrige un bug del código original donde podías paginar
    // mientras había resultados de búsqueda activos.
    if (buscando) return;
    pagina++;
    cargarPagina();
});

btnAnterior.addEventListener("click", () => {
    // Dos condiciones para ignorar el click:
    // 1. Si estamos buscando
    // 2. Si ya estamos en la página 1 (no existe página 0)
    if (buscando || pagina <= 1) return;
    pagina--;
    cargarPagina();
});


// --- Inicio ---
// Llamada inicial para cargar los productos cuando la página abre por primera vez.
cargarPagina();