# consumoApi
// ===============================
// db.json
// ===============================

{
  "users": [],
  "reservations": [],
  "workspaces": [
    {
      "id": 1,
      "name": "Sala A",
      "type": "Sala de reuniones",
      "capacity": 10,
      "location": "Piso 1",
      "status": "available"
    },
    {
      "id": 2,
      "name": "Sala B",
      "type": "Sala de reuniones",
      "capacity": 8,
      "location": "Piso 2",
      "status": "available"
    },
    {
      "id": 3,
      "name": "Oficina 1",
      "type": "Oficina privada",
      "capacity": 4,
      "location": "Piso 1",
      "status": "available"
    },
    {
      "id": 4,
      "name": "Auditorio",
      "type": "Auditorio",
      "capacity": 50,
      "location": "Piso 3",
      "status": "available"
    }
  ]
}


// ===============================
// src/router/router.js
// ===============================

import loginView from "@/views/loginView";
import homeView from "@/views/homeView";
import notFound from "@/views/notFound";
import { isAuthenticated } from "@/utils";

const routes = {
  "/": loginView,
  "/home": homeView,
};

export const navigateTo = (path) => {
  history.pushState({}, "", path);
  router();
};

export const router = () => {
  const app = document.querySelector("#app");
  let path = window.location.pathname;

  if (path !== "/" && !isAuthenticated()) {
    history.pushState({}, "", "/");
    path = "/";
  }

  if (path === "/" && isAuthenticated()) {
    history.pushState({}, "", "/home");
    path = "/home";
  }

  const view = routes[path] || notFound;
  app.innerHTML = view();
};

window.addEventListener("popstate", router);


// ===============================
// src/services/reservations.js
// ===============================

import { http } from "@/api/http";

export const getReservations = () => http.get("/reservations");

export const getReservationsByUser = (userId) =>
  http.get(`/reservations?userId=${userId}`);

export const createReservation = (data) =>
  http.post("/reservations", data);

export const updateReservation = (id, data) =>
  http.patch(`/reservations/${id}`, data);

export const deleteReservation = (id) =>
  http.delete(`/reservations/${id}`);


// ===============================
// src/services/workspaces.js
// ===============================

import { http } from "@/api/http";

export const getWorkspaces = () => http.get("/workspaces");


// ===============================
// src/controllers/home.controller.js
// ===============================

import ReservationCard from "@components/ReservationCard";
import {
  getReservations,
  getReservationsByUser,
  deleteReservation,
  updateReservation
} from "@services/reservation.service";

import { getSession, isAdmin } from "@/utils";
import { navigateTo } from "@/router/router";

export const homeController = async () => {
  const container = document.querySelector("#reservationsContainer");
  const user = getSession();

  await loadReservations(container, user);

  document
    .querySelector("#btnNewReservation")
    ?.addEventListener("click", () => {
      navigateTo("/reservations/new");
    });
};

export const loadReservations = async (container, user) => {
  try {
    const reservations = isAdmin()
      ? await getReservations()
      : await getReservationsByUser(user.id);

    container.innerHTML = reservations.length
      ? reservations.map((r) => ReservationCard(r, user)).join("")
      : `
        <div class="col-span-2 text-center py-8 text-slate-500">
          No hay reservas disponibles
        </div>
      `;

    container.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (confirm("¿Eliminar esta reserva?")) {
          await deleteReservation(btn.dataset.id);
          await loadReservations(container, user);
        }
      });
    });

    container.querySelectorAll(".btn-cancel").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await updateReservation(btn.dataset.id, {
          status: "cancelled",
        });

        await loadReservations(container, user);
      });
    });

    container.querySelectorAll(".btn-approve").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await updateReservation(btn.dataset.id, {
          status: "approved",
        });

        await loadReservations(container, user);
      });
    });
  } catch (error) {
    container.innerHTML = `
      <p class="text-red-500">
        Error cargando reservas
      </p>
    `;
  }
};


// ===============================
// src/components/ReservationCard.js
// ===============================

import { isAdmin } from "@/utils";

export default function ReservationCard(reservation, user) {
  const {
    id,
    workspace,
    date,
    startHour,
    endHour,
    reason,
    status,
    userId,
  } = reservation;

  const canEdit =
    isAdmin() ||
    (String(userId) === String(user?.id) &&
      status === "pending");

  const canDelete = isAdmin();

  const canCancel =
    String(userId) === String(user?.id) &&
    (status === "pending" ||
      status === "approved");

  const canApprove =
    isAdmin() &&
    status === "pending";

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-600",
  };

  return `
    <article class="bg-white border rounded-lg p-4 shadow-sm">
      <h3 class="font-bold text-lg mb-2">${workspace}</h3>

      <p class="text-sm text-slate-600">
        📅 ${date} | ⏰ ${startHour} - ${endHour}
      </p>

      <p class="text-sm mt-1">
        📝 ${reason}
      </p>

      <span
        class="inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
          statusColors[status] || ""
        }"
      >
        ${status}
      </span>

      <div class="flex gap-2 mt-3 flex-wrap">
        ${
          canApprove
            ? `<button class="btn-approve text-xs bg-green-500 text-white px-3 py-1 rounded" data-id="${id}">Aprobar</button>`
            : ""
        }

        ${
          canEdit
            ? `<button class="btn-edit text-xs bg-blue-500 text-white px-3 py-1 rounded" data-id="${id}">Editar</button>`
            : ""
        }

        ${
          canCancel
            ? `<button class="btn-cancel text-xs bg-yellow-500 text-white px-3 py-1 rounded" data-id="${id}">Cancelar</button>`
            : ""
        }

        ${
          canDelete
            ? `<button class="btn-delete text-xs bg-red-500 text-white px-3 py-1 rounded" data-id="${id}">Eliminar</button>`
            : ""
        }
      </div>
    </article>
  `;
}


// ===============================
// src/components/Sidebar.js
// ===============================

import { removeSession } from "@/utils";
import { navigateTo } from "@/router/router";

export default function Sidebar() {
  setTimeout(() => {
    document
      .querySelector("#logoutBtn")
      ?.addEventListener("click", () => {
        removeSession();
        navigateTo("/");
      });
  });

  // ...el resto igual
}