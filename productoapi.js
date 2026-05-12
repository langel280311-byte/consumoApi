// ============================================================
// ProductoAPI.js
// Responsabilidad: manejar TODAS las llamadas a la API externa.
// Esta clase no sabe nada del DOM, solo trae datos.
// ============================================================

export class ProductoAPI {

    // Los campos con # son PRIVADOS — solo se pueden usar dentro de esta clase.
    // Nadie desde afuera puede hacer api.#limit, eso lanzaría un error.
    #limit;
    #baseUrl;

    // constructor: se ejecuta automáticamente cuando haces "new ProductoAPI()"
    // El parámetro limit tiene un valor por defecto de 12,
    // así que puedes llamarlo como new ProductoAPI() o new ProductoAPI(6)
    constructor(limit = 12) {
        this.#limit = limit;
        this.#baseUrl = "https://dummyjson.com/products";
    }

    // Método PÚBLICO: cualquiera puede llamarlo desde afuera.
    // Calcula el "skip" (cuántos productos saltar) según la página actual
    // y llama al método privado #fetchDatos con la URL armada.
    async obtenerPorPagina(pagina) {
        const skip = (pagina - 1) * this.#limit;
        // Ejemplo: página 2, limit 12 → skip = 12 → trae del producto 13 al 24
        const url = `${this.#baseUrl}?limit=${this.#limit}&skip=${skip}`;
        return await this.#fetchDatos(url);
    }

    // Método PÚBLICO: recibe un texto y consulta el endpoint de búsqueda de la API.
    async buscar(texto) {
        const url = `${this.#baseUrl}/search?q=${texto}`;
        return await this.#fetchDatos(url);
    }

    // Método PRIVADO (#): es un detalle interno de la clase.
    // Centraliza el fetch para no repetir el mismo bloque en cada método.
    // Si la respuesta no es exitosa (ej: 404, 500), lanza un error explícito.
    async #fetchDatos(url) {
        const response = await fetch(url);

        // response.ok es true si el status HTTP está entre 200-299
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();

        // La API devuelve { products: [...], total: ..., skip: ... }
        // Solo nos interesa el array de productos
        return data.products;
    }
}