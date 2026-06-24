const CORE_URL = "http://localhost:8080/api";
let currentMode = 'hab';

document.addEventListener("DOMContentLoaded", () => {
    sincronizarTodo();
});

function sincronizarTodo() {
    cargarHabitaciones();
    cargarReservas();
}

function setFormMode(mode) {
    currentMode = mode;
    const btnHab = document.getElementById("btn-mode-hab");
    const btnRes = document.getElementById("btn-mode-res");
    const inputsHab = document.getElementById("form-hab-inputs");
    const inputsRes = document.getElementById("form-res-inputs");
    const feedback = document.getElementById("form-feedback");
    
    feedback.textContent = "";

    if (mode === 'hab') {
        btnHab.className = "w-full py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all bg-sky-600 text-white shadow-md";
        btnRes.className = "w-full py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-slate-400 hover:text-white";
        inputsHab.classList.replace("hidden", "block");
        inputsRes.classList.replace("block", "hidden");
    } else {
        btnRes.className = "w-full py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all bg-sky-600 text-white shadow-md";
        btnHab.className = "w-full py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-slate-400 hover:text-white";
        inputsRes.classList.replace("hidden", "block");
        inputsHab.classList.replace("block", "hidden");
    }
}

// ==========================================
// RENDERIZADO EXCLUSIVO (TEXTOS LIMPIOS)
// ==========================================

function renderizarHabitaciones(data) {
    const contenedor = document.getElementById("grid-habitaciones");
    contenedor.innerHTML = "";

    if (!data || data.length === 0 || data.error) {
        contenedor.innerHTML = `<div class="col-span-full border border-iron-800 bg-iron-950/40 rounded-xl p-6 text-center text-xs text-iron-500 font-medium">No se encontraron habitaciones registradas.</div>`;
        return;
    }

    const lista = Array.isArray(data) ? data : [data];
    lista.forEach(h => {
        const div = document.createElement("div");
        div.className = "bg-iron-950/40 border border-iron-800 rounded-xl p-4 flex flex-col justify-between hover:bg-iron-950 transition-colors";
        div.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-3">
                    <span class="text-[10px] text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2 py-0.5 rounded font-bold">ID: ${h.id}</span>
                    <span class="text-[10px] text-iron-400 font-semibold">Piso ${h.piso}</span>
                </div>
                <h4 class="text-sm font-bold text-white">Habitación ${h.numero}</h4>
                <p class="text-xs text-iron-400 mt-1 truncate">${h.tipo || 'Sin categoría'}</p>
            </div>
        `;
        contenedor.appendChild(div);
    });
}

function renderizarReservas(data) {
    const contenedor = document.getElementById("grid-reservas");
    contenedor.innerHTML = "";

    if (!data || data.length === 0 || data.error) {
        contenedor.innerHTML = `<div class="col-span-full border border-iron-800 bg-iron-950/40 rounded-xl p-6 text-center text-xs text-iron-500 font-medium">No se encontraron reservas registradas.</div>`;
        return;
    }

    const lista = Array.isArray(data) ? data : [data];
    lista.forEach(r => {
        const div = document.createElement("div");
        div.className = "bg-iron-950/40 border border-iron-800 rounded-xl p-4 flex flex-col justify-between hover:bg-iron-950 transition-colors";
        div.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-3">
                    <span class="text-[10px] text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2 py-0.5 rounded font-bold">ID: ${r.id}</span>
                    <span class="text-[10px] uppercase font-bold text-emerald-400">${r.estado}</span>
                </div>
                <h4 class="text-xs text-iron-300">ID Cliente: <span class="text-white font-bold">${r.huespedId || 'No asignado'}</span></h4>
            </div>
        `;
        contenedor.appendChild(div);
    });
}

// ==========================================
// CONSULTAS FETCH
// ==========================================

async function cargarHabitaciones() {
    try {
        const r = await fetch(`${CORE_URL}/habitaciones`);
        renderizarHabitaciones(await r.json());
    } catch (e) { renderizarHabitaciones([]); }
}

async function buscarHabPorPiso() {
    const val = document.getElementById("f-hab-piso").value;
    if (!val) return cargarHabitaciones();
    try {
        const r = await fetch(`${CORE_URL}/habitaciones/piso/${val}`);
        renderizarHabitaciones(await r.json());
    } catch (e) { renderizarHabitaciones([]); }
}

async function buscarHabPorNumero() {
    const val = document.getElementById("f-hab-num").value;
    if (!val) return cargarHabitaciones();
    try {
        const r = await fetch(`${CORE_URL}/habitaciones/numero/${val}`);
        renderizarHabitaciones(await r.json());
    } catch (e) { renderizarHabitaciones([]); }
}

async function cargarReservas() {
    try {
        const r = await fetch(`${CORE_URL}/reservas`);
        renderizarReservas(await r.json());
    } catch (e) { renderizarReservas([]); }
}

async function buscarResPorEstado() {
    const val = document.getElementById("f-res-estado").value;
    if (!val) return cargarReservas();
    try {
        const r = await fetch(`${CORE_URL}/reservas/estado/${val}`);
        renderizarReservas(await r.json());
    } catch (e) { renderizarReservas([]); }
}

async function buscarResPorHuesped() {
    const val = document.getElementById("f-res-huesped").value;
    if (!val) return cargarReservas();
    try {
        const r = await fetch(`${CORE_URL}/reservas/huesped/${val}`);
        renderizarReservas(await r.json());
    } catch (e) { renderizarReservas([]); }
}

// ==========================================
// ACCIONES DE CREAR / MODIFICAR
// ==========================================

async function ejecutarAccion(isUpdate) {
    const feedback = document.getElementById("form-feedback");
    feedback.textContent = "";

    let url = "";
    let method = isUpdate ? "PUT" : "POST";
    let payload = {};

    if (currentMode === 'hab') {
        const id = document.getElementById("form-hab-id").value;
        if (isUpdate && !id) { feedback.className="text-amber-400"; feedback.textContent = "Se requiere especificar el ID."; return; }
        
        url = isUpdate ? `${CORE_URL}/habitaciones/${id}` : `${CORE_URL}/habitaciones`;
        payload = {
            numero: parseInt(document.getElementById("form-hab-numero").value) || null,
            piso: parseInt(document.getElementById("form-hab-piso").value) || null,
            tipo: document.getElementById("form-hab-tipo").value || null
        };
    } else {
        const id = document.getElementById("form-res-id").value;
        if (isUpdate && !id) { feedback.className="text-amber-400"; feedback.textContent = "Se requiere especificar el ID."; return; }
        
        url = isUpdate ? `${CORE_URL}/reservas/${id}` : `${CORE_URL}/reservas`;
        payload = {
            estado: document.getElementById("form-res-estado").value || null,
            huespedId: parseInt(document.getElementById("form-res-huesped").value) || null
        };
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (response.ok) {
            feedback.className = "text-emerald-400";
            feedback.textContent = "Cambios guardados correctamente.";
            sincronizarTodo();
        } else {
            feedback.className = "text-red-400";
            feedback.textContent = "Verifique los campos ingresados.";
        }
    } catch (e) {
        feedback.className = "text-red-500";
        feedback.textContent = "Error de conexión con el servidor.";
    }
}

// ==========================================
// BAJA DE DATOS (ELIMINAR)
// ==========================================

async function eliminarEntidad(endpoint, inputId) {
    const id = document.getElementById(inputId).value;
    const fb = document.getElementById("purge-feedback");
    fb.textContent = "";

    if (!id) return;

    try {
        const response = await fetch(`${CORE_URL}/${endpoint}/${id}`, { method: "DELETE" });
        const data = await response.json();

        if (response.ok) {
            fb.className = "text-emerald-400";
            fb.textContent = `Registro número ${id} eliminado con éxito.`;
            sincronizarTodo();
        } else {
            fb.className = "text-red-400";
            fb.textContent = "No se encontró un registro con ese ID.";
        }
    } catch (e) {
        fb.className = "text-red-500";
        fb.textContent = "Error al conectar.";
    }
}