// ============================================================
// UI.js
// Responsabilidad: manejar TODO lo relacionado con el DOM.
// Esta clase no sabe nada de fetch ni de la API, solo muestra datos.
// ============================================================

export class UI {

    // Campo privado: referencia al elemento HTML donde se renderizan las cards
    #contenedor;

    // constructor: recibe el ID del contenedor en el HTML
    // Ejemplo de uso: new UI("contenedor")
    constructor(contenedorId) {
        this.#contenedor = document.getElementById(contenedorId);
    }

    // Método PÚBLICO: recibe el array de productos y los pinta en el DOM.
    // Diferencia clave vs tu código original:
    //   ANTES: productos.forEach(p => contenedor.innerHTML += ...)
    //          Esto toca el DOM en cada iteración → lento con muchos productos
    //   AHORA: .map().join("") construye TODO el HTML en memoria primero,
    //          y luego lo asigna UNA sola vez → mucho más eficiente
    mostrarProductos(productos) {
        if (productos.length === 0) {
            this.#contenedor.innerHTML = "<p>No se encontraron productos</p>";
            return; // salimos temprano, no hay nada más que hacer
        }

        // .map() transforma cada producto en un string HTML (su card)
        // .join("") une todos esos strings en uno solo sin separador
        this.#contenedor.innerHTML = productos
            .map(p => this.#crearCard(p))
            .join("");
    }

    // Método PÚBLICO: muestra un mensaje de error en el contenedor.
    // Se llama desde app.js cuando falla el fetch.
    mostrarError(mensaje) {
        this.#contenedor.innerHTML = `<p class="error">${mensaje}</p>`;
    }

    // Método PRIVADO (#): convierte un objeto producto en un string HTML.
    // Es privado porque es un detalle de cómo la UI construye sus cards,
    // nadie de afuera necesita saber cómo se arma el HTML interno.
    // Recibe un objeto producto con la forma:
    //   { title, price, thumbnail, description, ... }
    #crearCard(producto) {
        return `
        <div class="card">
            <img src="${producto.thumbnail}" alt="${producto.title}">
            <h2>${producto.title}</h2>
            <p class="precio">$${producto.price}</p>
            <p class="descripcion">${producto.description}</p>
        </div>`;
    }
}