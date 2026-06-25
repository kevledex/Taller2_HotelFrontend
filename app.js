const CORE_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
    sincronizarTodo();
});

// UI: Cambiar de Formularios y Listas
function cambiarFormulario() {
    document.querySelectorAll('.form-section').forEach(el => el.classList.remove('active'));
    const val = document.getElementById('form-selector').value;
    document.getElementById(`form-${val}`).classList.add('active');
    document.getElementById("form-feedback").textContent = "";
}

function cambiarLista() {
    document.querySelectorAll('.grid-section').forEach(el => el.classList.remove('active'));
    const val = document.getElementById('grid-selector').value;
    document.getElementById(`grid-${val}`).classList.add('active');
}

function sincronizarTodo() {
    cargarEntidad("habitaciones", renderizarHabitaciones);
    cargarEntidad("reservas", renderizarReservas);
    cargarEntidad("huespedes", renderizarHuespedes);
    cargarEntidad("empleados", renderizarEmpleados);
    cargarEntidad("facturas", renderizarFacturas);
}

async function cargarEntidad(endpoint, renderCallback) {
    try {
        const r = await fetch(`${CORE_URL}/${endpoint}`);
        renderCallback(await r.json());
    } catch (e) {
        renderCallback([]);
    }
}

// ==========================================
// RENDERIZADORES
// ==========================================

function crearTarjeta(contenedorId, data, templateFn, msjVacio) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = "";
    if (!data || data.length === 0 || data.error) {
        contenedor.innerHTML = `<div class="col-span-full border border-iron-800 bg-iron-950/40 rounded-xl p-6 text-center text-xs text-iron-500 font-medium">${msjVacio}</div>`;
        return;
    }
    const lista = Array.isArray(data) ? data : [data];
    lista.forEach(item => {
        const div = document.createElement("div");
        div.className = "bg-iron-950/40 border border-iron-800 rounded-xl p-4 flex flex-col justify-between hover:bg-iron-950 transition-colors";
        div.innerHTML = templateFn(item);
        contenedor.appendChild(div);
    });
}

const renderizarHabitaciones = (data) => crearTarjeta("grid-hab", data, (h) => `
    <div>
        <div class="flex justify-between items-center mb-3">
            <span class="text-[10px] text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2 py-0.5 rounded font-bold">ID: ${h.id}</span>
            <span class="text-[10px] text-iron-400 font-semibold">Piso ${h.piso}</span>
        </div>
        <h4 class="text-sm font-bold text-white">Habitación ${h.numero}</h4>
        <p class="text-xs text-iron-400 mt-1 truncate">Tipo: ${h.tipo || 'N/A'} | Cap: ${h.capacidad}</p>
    </div>
`, "No hay habitaciones.");

const renderizarReservas = (data) => crearTarjeta("grid-res", data, (r) => `
    <div>
        <div class="flex justify-between items-center mb-3">
            <span class="text-[10px] text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2 py-0.5 rounded font-bold">ID: ${r.id}</span>
            <span class="text-[10px] uppercase font-bold text-emerald-400">${r.estadoReserva || 'S/E'}</span>
        </div>
        <h4 class="text-xs text-iron-300">Cliente ID: <span class="text-white font-bold">${r.huesped ? r.huesped.id : '-'}</span></h4>
        <p class="text-[10px] text-iron-500 mt-1">Total: $${r.precioTotal}</p>
    </div>
`, "No hay reservas.");

const renderizarHuespedes = (data) => crearTarjeta("grid-hue", data, (h) => `
    <div>
        <div class="flex justify-between items-center mb-3">
            <span class="text-[10px] text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2 py-0.5 rounded font-bold">ID: ${h.id}</span>
            <span class="text-[10px] text-iron-400 font-semibold">DNI: ${h.documentoIdentidad}</span>
        </div>
        <h4 class="text-sm font-bold text-white">${h.nombre} ${h.apellido}</h4>
        <p class="text-xs text-iron-400 mt-1 truncate">${h.email}</p>
    </div>
`, "No hay huéspedes.");

const renderizarEmpleados = (data) => crearTarjeta("grid-emp", data, (e) => `
    <div>
        <div class="flex justify-between items-center mb-3">
            <span class="text-[10px] text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2 py-0.5 rounded font-bold">ID: ${e.id}</span>
            <span class="text-[10px] text-amber-400 font-semibold truncate max-w-[100px]">${e.cargo}</span>
        </div>
        <h4 class="text-sm font-bold text-white">${e.nombre} ${e.apellido}</h4>
        <p class="text-xs text-iron-400 mt-1 truncate">${e.email}</p>
    </div>
`, "No hay empleados.");

const renderizarFacturas = (data) => crearTarjeta("grid-fac", data, (f) => {
    // Formatear la fecha ISO que llega de Spring
    const fecha = f.fechaEmision ? new Date(f.fechaEmision).toLocaleDateString() : 'Sin fecha';
    return `
    <div>
        <div class="flex justify-between items-center mb-3">
            <span class="text-[10px] text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2 py-0.5 rounded font-bold">ID: ${f.id}</span>
            <span class="text-[10px] text-iron-400 font-semibold">${fecha}</span>
        </div>
        <h4 class="text-sm font-bold text-white truncate">${f.numeroFactura}</h4>
        <p class="text-xs text-emerald-400 mt-1 font-bold">Total: $${f.total}</p>
    </div>
    `
}, "No hay facturas.");

// ==========================================
// ACCIONES DE CREAR / MODIFICAR (EL CORE)
// ==========================================

async function ejecutarAccion(isUpdate) {
    const feedback = document.getElementById("form-feedback");
    const mode = document.getElementById('form-selector').value;
    feedback.textContent = "";

    let endpoint = "";
    let payload = {};
    let id = null;

    // Recolectar datos según el modo activo
    switch(mode) {
        case 'hab':
            id = document.getElementById("f-hab-id").value;
            endpoint = "habitaciones";
            payload = {
                numero: parseInt(document.getElementById("f-hab-num").value) || null,
                piso: parseInt(document.getElementById("f-hab-piso").value) || null,
                tipo: document.getElementById("f-hab-tipo").value || null,
                capacidad: parseInt(document.getElementById("f-hab-cap").value) || 1
            };
            break;
        case 'res':
            id = document.getElementById("f-res-id").value;
            endpoint = "reservas";
            payload = {
                estadoReserva: document.getElementById("f-res-estado").value || null,
                cantidadPersonas: parseInt(document.getElementById("f-res-per").value) || 1,
                precioTotal: parseFloat(document.getElementById("f-res-precio").value) || 0.0,
                huesped: { id: parseInt(document.getElementById("f-res-hue").value) || null },
                habitaciones: [] // Previene error de null pointer en backend
            };
            const empId = parseInt(document.getElementById("f-res-emp").value);
            if (empId) payload.empleado = { id: empId };
            break;
        case 'hue':
            id = document.getElementById("f-hue-id").value;
            endpoint = "huespedes";
            payload = {
                nombre: document.getElementById("f-hue-nom").value,
                apellido: document.getElementById("f-hue-ape").value,
                documentoIdentidad: document.getElementById("f-hue-dni").value,
                email: document.getElementById("f-hue-mail").value,
                telefono: document.getElementById("f-hue-tel").value
            };
            break;
        case 'emp':
            id = document.getElementById("f-emp-id").value;
            endpoint = "empleados";
            payload = {
                nombre: document.getElementById("f-emp-nom").value,
                apellido: document.getElementById("f-emp-ape").value,
                cargo: document.getElementById("f-emp-cargo").value,
                email: document.getElementById("f-emp-mail").value,
                telefono: document.getElementById("f-emp-tel").value
            };
            break;
        case 'fac':
            id = document.getElementById("f-fac-id").value;
            endpoint = "facturas";
            payload = {
                numeroFactura: document.getElementById("f-fac-num").value,
                fechaEmision: document.getElementById("f-fac-fecha").value || new Date().toISOString().slice(0, 16),
                subtotal: parseFloat(document.getElementById("f-fac-sub").value) || null,
                iva: parseFloat(document.getElementById("f-fac-iva").value) || null,
                total: parseFloat(document.getElementById("f-fac-tot").value) || null,
                reserva: { id: parseInt(document.getElementById("f-fac-res").value) || null }
            };
            break;
    }

    if (isUpdate && !id) { 
        feedback.className = "text-amber-400"; 
        feedback.textContent = "Se requiere especificar el ID para actualizar."; 
        return; 
    }

    const url = isUpdate ? `${CORE_URL}/${endpoint}/${id}` : `${CORE_URL}/${endpoint}`;
    
    try {
        const response = await fetch(url, {
            method: isUpdate ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            feedback.className = "text-emerald-400";
            feedback.textContent = `Registro en '${endpoint}' guardado exitosamente.`;
            sincronizarTodo();
            // Limpiar inputs del div activo
            document.querySelectorAll(`#form-${mode} input`).forEach(i => i.value = '');
        } else {
            const errorData = await response.json();
            console.error("Errores Spring Boot:", errorData);
            feedback.className = "text-red-400";
            feedback.textContent = "Falló la validación. Revisa la consola (F12).";
        }
    } catch (e) {
        feedback.className = "text-red-500";
        feedback.textContent = "Error de conexión con el servidor.";
    }
}

// ==========================================
// BAJA DE DATOS (ELIMINADOR UNIVERSAL)
// ==========================================

async function eliminarEntidadGlobal() {
    const endpoint = document.getElementById("del-tipo").value;
    const id = document.getElementById("del-id").value;
    const fb = document.getElementById("purge-feedback");
    
    fb.textContent = "";
    if (!id) return;

    try {
        const response = await fetch(`${CORE_URL}/${endpoint}/${id}`, { method: "DELETE" });
        
        if (response.ok) {
            fb.className = "text-emerald-400";
            fb.textContent = `ID ${id} eliminado de ${endpoint}.`;
            sincronizarTodo();
            document.getElementById("del-id").value = '';
        } else {
            fb.className = "text-red-400";
            fb.textContent = "No se pudo eliminar (ID no encontrado o en uso).";
        }
    } catch (e) {
        fb.className = "text-red-500";
        fb.textContent = "Error al conectar con la base de datos.";
    }
}