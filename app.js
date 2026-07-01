// ==========================================
// 1. REFERENCIAS A ELEMENTOS DEL HTML (DOM)
// ==========================================
const tituloInput = document.getElementById('nota-titulo');
const contenidoInput = document.getElementById('nota-contenido');
const btnGuardar = document.getElementById('btn-guardar');
const contenedorNotas = document.getElementById('contenedor-notas');
const buscador = document.getElementById('buscador');
// Seleccionamos todos los radios de color y sus etiquetas
const radiosColor = document.querySelectorAll('input[name="color-picker"]');

// ==========================================
// 2. ESTADO DE LA APLICACIÓN
// ==========================================
let notas = JSON.parse(localStorage.getItem('notas')) || [];

// Renderizar notas y activar el resaltador de colores al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    renderizarNotas(notas);
    inicializarResaltadoColores();
});

// ==========================================
// 3. EFECTO: RESALTAR CÍRCULO SELECCIONADO
// ==========================================
function inicializarResaltadoColores() {
    radiosColor.forEach(radio => {
        // Escuchar cuando cambie la selección
        radio.addEventListener('change', () => {
            // Primero, quitar el borde resaltado a todos los círculos
            radiosColor.forEach(r => {
                const label = document.querySelector(`label[for="${r.id}"]`);
                if (label) {
                    label.classList.remove('border-dark', 'border-3', 'shadow-lg');
                    label.classList.add('border'); // Devuelve el borde fino original
                }
            });

            // Segundo, añadir el borde grueso al círculo seleccionado actualmente
            if (radio.checked) {
                const labelActiva = document.querySelector(`label[for="${radio.id}"]`);
                if (labelActiva) {
                    labelActiva.classList.remove('border');
                    labelActiva.classList.add('border-dark', 'border-3', 'shadow-lg');
                }
            }
        });
    });

    // Ejecutarlo una vez al inicio para que el color blanco arranque resaltado
    document.getElementById('color-blanco').dispatchEvent(new Event('change'));
}

// ==========================================
// 4. EVENTO: AÑADIR NUEVA TARJETA
// ==========================================
btnGuardar.addEventListener('click', () => {
    const titulo = tituloInput.value.trim();
    const contenido = contenidoInput.value.trim();
    const colorSeleccionado = document.querySelector('input[name="color-picker"]:checked').value;

    if (!titulo && !contenido) {
        // REEMPLAZO: Alerta de SweetAlert en lugar del alert() nativo
        Swal.fire({
            icon: 'warning',
            title: 'Campos vacíos',
            text: 'Por favor, introduce un título o una descripción para la tarjeta.'
        });
        return;
    }

    const nuevaNota = {
        id: Date.now(),
        titulo: titulo || 'Tarjeta sin título',
        contenido: contenido || '',
        color: colorSeleccionado
    };

    notas.push(nuevaNota);
    actualizarApp();
    limpiarFormulario();

    // NUEVO: Alerta de éxito al crear una nota
    Swal.fire({
        icon: 'success',
        title: '¡Nota guardada!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });
});

// ==========================================
// 5. FUNCIÓN: RENDERIZAR / PINTAR TARJETAS
// ==========================================
function renderizarNotas(notasParaMostrar) {
    contenedorNotas.innerHTML = '';

    if (notasParaMostrar.length === 0) {
        // REEMPLAZO: Añadimos flexbox y w-100 para centrar forzosamente el contenido
        contenedorNotas.innerHTML = `
            <div class="col-12 w-100 d-flex flex-column align-items-center justify-content-center text-muted" style="min-height: 40vh;" id="estado-vacio">
                <i class="bi bi-layout-three-columns display-3 text-black-50"></i>
                <p class="mt-3 fs-5 mb-0 fw-semibold text-center">No se encontraron notas</p>
                <p class="small text-secondary text-center">Intenta con otra búsqueda o añade una nota nueva.</p>
            </div>
        `;
        return;
    }

    notasParaMostrar.forEach(nota => {
        const col = document.createElement('div');
        col.className = 'col'; 

        col.innerHTML = `
            <div class="card h-100 shadow border-0" style="background-color: ${nota.color};">
                <div class="rounded-top" style="height: 8px; background-color: rgba(0,0,0,0.1);"></div>
                
                <div class="card-body d-flex flex-column p-4">
                    <h4 class="card-title fw-bold text-dark mb-3 fs-5">${nota.titulo}</h4>
                    
                    <p class="card-text text-dark fs-6 flex-grow-1 mb-4" style="white-space: pre-line; opacity: 0.9;">${nota.contenido}</p>
                    
                    <div class="d-flex justify-content-between align-items-center mt-auto pt-3 border-top" style="border-color: rgba(0,0,0,0.08) !important;">
                        
                        <button onclick="editarNota(${nota.id})" class="btn btn-sm text-primary p-0 border-0 bg-transparent fw-bold" title="Editar nota">
                            <i class="bi bi-pencil-square"></i> Editar
                        </button>

                        <button onclick="eliminarNota(${nota.id})" class="btn btn-sm text-danger p-0 border-0 bg-transparent fw-bold" title="Eliminar nota">
                            <i class="bi bi-trash3-fill"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        contenedorNotas.appendChild(col);
    });
}

// ==========================================
// 6. FUNCIÓN: EDICIÓN DE NOTAS
// ==========================================
function editarNota(id) {
    const notaAEditar = notas.find(nota => nota.id === id);
    if (!notaAEditar) return;

    tituloInput.value = notaAEditar.titulo === 'Tarjeta sin título' ? '' : notaAEditar.titulo;
    contenidoInput.value = notaAEditar.contenido;
    
    const radioColor = document.querySelector(`input[name="color-picker"][value="${notaAEditar.color}"]`);
    if (radioColor) {
        radioColor.checked = true;
        // Forzar al sistema a actualizar el borde resaltado al editar
        radioColor.dispatchEvent(new Event('change'));
    }

    tituloInput.focus();
    
    // NUEVO: Le pasamos 'true' a eliminarNota para que NO muestre la alerta de borrado al editar
    eliminarNota(id, true);

    // NUEVO: Alerta indicando que la nota está lista para editarse
    Swal.fire({
        icon: 'info',
        title: 'Modo edición',
        text: 'Puedes modificar tu nota en el formulario.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });
}

// ==========================================
// 7. FUNCIÓN: ELIMINAR TARJETA
// ==========================================
// NUEVO: Añadimos 'omitirAlerta' por defecto en false
function eliminarNota(id, omitirAlerta = false) {
    if (omitirAlerta) {
        // Lógica de eliminación silenciosa (cuando se llama desde editarNota)
        notas = notas.filter(nota => nota.id !== id);
        actualizarApp();
        filtrarNotas();
    } else {
        // NUEVO: Alerta de confirmación al usuario antes de eliminar
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                notas = notas.filter(nota => nota.id !== id);
                actualizarApp();
                filtrarNotas();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminada',
                    text: 'La nota ha sido borrada.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    }
}

// ==========================================
// 8. BUSCADOR EN TIEMPO REAL
// ==========================================
buscador.addEventListener('input', filtrarNotas);

function filtrarNotas() {
    const texto = buscador.value.toLowerCase();
    const notasFiltradas = notas.filter(nota => {
        return nota.titulo.toLowerCase().includes(texto) || 
               nota.contenido.toLowerCase().includes(texto);
    });
    renderizarNotas(notasFiltradas);
}

// ==========================================
// 9. FUNCIONES AUXILIARES / LIMPIEZA
// ==========================================
function actualizarApp() {
    localStorage.setItem('notas', JSON.stringify(notas));
    renderizarNotas(notas);
}

function limpiarFormulario() {
    tituloInput.value = '';
    contenidoInput.value = '';
    
    // Resetear al color blanco y disparar el evento para mover el borde visualmente
    const radioBlanco = document.getElementById('color-blanco');
    radioBlanco.checked = true;
    radioBlanco.dispatchEvent(new Event('change'));
}