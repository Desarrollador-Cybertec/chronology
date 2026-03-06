import {
  HiOutlineTableCells,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlinePower,
  HiOutlineMagnifyingGlass,
  HiOutlineClock,
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiOutlineCheckBadge,
  HiOutlineFunnel,
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineArrowUpTray,
  HiOutlineDocumentArrowUp,
  HiOutlineArrowPath,
  HiOutlineListBullet,
  HiOutlineCog6Tooth,
  HiOutlineCalendarDays,
  HiOutlineUserPlus,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineAdjustmentsHorizontal,
} from 'react-icons/hi2';

const icon = (Icon: React.ComponentType<{ className?: string }>) => <Icon className="h-6 w-6" />;

/* ── Empleados: Lista ── */
export const employeeListSteps = [
  {
    title: 'Tabla de empleados',
    description: 'Cada fila muestra: ID interno, nombre completo, departamento, cargo y estado (activo/inactivo con badge de color). Haz clic en el nombre para ir al detalle del empleado.',
    icon: icon(HiOutlineTableCells),
  },
  {
    title: 'Ver detalle',
    description: 'El botón "Ver" te lleva al perfil completo del empleado donde encontrarás sus asignaciones de turno, excepciones de horario y acceso a su historial de asistencia.',
    icon: icon(HiOutlineEye),
  },
  {
    title: 'Paginación',
    description: 'Usa los botones de paginación al final de la tabla para navegar entre páginas. El sistema muestra 20 empleados por página.',
    icon: icon(HiOutlineMagnifyingGlass),
  },
];

export const employeeListAdminSteps = [
  ...employeeListSteps,
  {
    title: 'Editar empleado',
    description: 'Haz clic en "Editar" para modificar el nombre, apellido, departamento y cargo del empleado. Los cambios se guardan inmediatamente al confirmar.',
    icon: icon(HiOutlinePencilSquare),
  },
  {
    title: 'Activar / Desactivar',
    description: 'El botón "Desactivar" cambia el estado del empleado a inactivo (y viceversa). Los empleados inactivos no generan registros de asistencia al importar marcajes, pero sus datos históricos se conservan.',
    icon: icon(HiOutlinePower),
  },
];

/* ── Empleados: Detalle ── */
export const employeeDetailSteps = [
  {
    title: 'Información del empleado',
    description: 'Muestra los datos básicos: ID interno del biométrico, departamento, cargo y estado actual (activo/inactivo).',
    icon: icon(HiOutlineEye),
  },
  {
    title: 'Asignaciones de turno',
    description: 'Lista todos los turnos asignados al empleado con: nombre del turno, fecha de inicio, fecha de fin (si aplica) y los días laborables (Lun-Dom).',
    icon: icon(HiOutlineClock),
  },
  {
    title: 'Excepciones de horario',
    description: 'Muestra días especiales como feriados, permisos o días extra. Cada excepción indica la fecha, tipo (con badge de color), turno alternativo si aplica y el motivo.',
    icon: icon(HiOutlineCalendarDays),
  },
  {
    title: 'Asistencia reciente',
    description: 'Al final verás un enlace "Ver asistencia completa" que te lleva a la lista de asistencia filtrada por este empleado.',
    icon: icon(HiOutlineClipboardDocumentCheck),
  },
];

export const employeeDetailAdminSteps = [
  ...employeeDetailSteps.slice(0, 1),
  {
    title: 'Editar datos',
    description: 'Haz clic en "Editar" (arriba a la derecha) para modificar nombre, apellido, departamento y cargo del empleado.',
    icon: icon(HiOutlinePencilSquare),
  },
  {
    title: 'Asignar turno',
    description: 'Haz clic en "+ Asignar" para crear una nueva asignación de turno. Selecciona el turno, fecha de inicio, fecha fin opcional y los días laborables (por defecto Lun a Vie).',
    icon: icon(HiOutlineUserPlus),
  },
  ...employeeDetailSteps.slice(1),
];

/* ── Empleados: Editar ── */
export const employeeEditSteps = [
  {
    title: 'Formulario de edición',
    description: 'Modifica los datos del empleado: nombre, apellido, departamento y cargo. Todos los campos excepto departamento y cargo son obligatorios.',
    icon: icon(HiOutlinePencilSquare),
  },
  {
    title: 'Guardar o cancelar',
    description: 'Haz clic en "Guardar cambios" para confirmar las modificaciones. Usa "Cancelar" para volver al detalle del empleado sin guardar cambios.',
    icon: icon(HiOutlineCheckBadge),
  },
];

/* ── Empleados: Asignar turno ── */
export const assignShiftSteps = [
  {
    title: 'Seleccionar turno',
    description: 'Elige un turno del listado desplegable. Cada opción muestra el nombre del turno junto con su horario de entrada y salida para facilitar la identificación.',
    icon: icon(HiOutlineClock),
  },
  {
    title: 'Fechas de vigencia',
    description: 'Indica la fecha de inicio (obligatoria). La fecha de fin es opcional: si la dejas vacía, la asignación queda vigente indefinidamente.',
    icon: icon(HiOutlineCalendarDays),
  },
  {
    title: 'Días laborables',
    description: 'Selecciona los días de la semana con los botones Lun-Dom. Por defecto están marcados Lun a Vie. Haz clic para activar/desactivar cada día. Se resaltan en indigo los días seleccionados.',
    icon: icon(HiOutlineUserPlus),
  },
];

/* ── Turnos: Lista ── */
export const shiftListSteps = [
  {
    title: 'Tabla de turnos',
    description: 'Cada turno muestra: nombre, horario de entrada/salida (con indicador "nocturno" si cruza medianoche), tolerancia en minutos, duración de almuerzo (o "No"), si tiene horas extra y su estado.',
    icon: icon(HiOutlineTableCells),
  },
];

export const shiftListAdminSteps = [
  ...shiftListSteps,
  {
    title: 'Crear nuevo turno',
    description: 'Haz clic en "Nuevo turno" (arriba a la derecha) para configurar un turno con todos sus parámetros: horarios, tolerancia, almuerzo y reglas de horas extra.',
    icon: icon(HiOutlinePlusCircle),
  },
  {
    title: 'Editar turno',
    description: 'Usa "Editar" en cualquier fila para modificar la configuración del turno. Los cambios aplican a los próximos cálculos de asistencia.',
    icon: icon(HiOutlinePencilSquare),
  },
  {
    title: 'Eliminar turno',
    description: 'Haz clic en "Eliminar" para borrar un turno. Se pedirá confirmación. No se puede eliminar un turno que tiene asignaciones activas.',
    icon: icon(HiOutlineTrash),
  },
];

/* ── Turnos: Crear / Editar ── */
export const shiftFormSteps = [
  {
    title: 'Datos básicos',
    description: 'Indica el nombre del turno, hora de entrada y hora de salida. Marca "Cruza medianoche" si el turno va de noche a madrugada (ej. 22:00 a 06:00).',
    icon: icon(HiOutlineClock),
  },
  {
    title: 'Tolerancia',
    description: 'Define los minutos de tolerancia para la entrada: el empleado no se marca como tardanza si llega dentro de este margen después de la hora de entrada.',
    icon: icon(HiOutlineAdjustmentsHorizontal),
  },
  {
    title: 'Almuerzo',
    description: 'Marca "Requiere almuerzo" para habilitar los campos de hora de inicio, hora de fin y duración del almuerzo. Los marcajes dentro de ese rango se detectan automáticamente como almuerzo.',
    icon: icon(HiOutlineCalendarDays),
  },
  {
    title: 'Horas extra',
    description: 'Activa "Horas extra habilitadas" para definir: bloque mínimo (minutos que se deben exceder para contar como HE) y máximo diario (tope de minutos de HE por día).',
    icon: icon(HiOutlineCheckBadge),
  },
];

/* ── Asistencia: Lista ── */
export const attendanceListSteps = [
  {
    title: 'Filtros de búsqueda',
    description: 'Usa la barra de filtros arriba: ID de empleado, rango de fechas (desde-hasta) y estado (presente, ausente, incompleto, descanso, feriado). Haz clic en "Filtrar" para aplicar. Los filtros se guardan en la URL.',
    icon: icon(HiOutlineFunnel),
  },
  {
    title: 'Columnas de la tabla',
    description: 'Cada registro muestra: fecha, empleado (enlace al perfil), turno, hora de entrada/salida, minutos trabajados, tardanza (en rojo si > 0), horas extra (en verde si > 0), estado con badge de color y un ícono ✎ si fue editado manualmente.',
    icon: icon(HiOutlineTableCells),
  },
  {
    title: 'Ver detalle',
    description: 'Haz clic en "Ver" para el desglose completo del registro: marcajes, cálculos detallados y historial de ediciones si fue modificado manualmente.',
    icon: icon(HiOutlineEye),
  },
];

export const attendanceListAdminSteps = [
  ...attendanceListSteps,
  {
    title: 'Editar registro',
    description: 'Haz clic en "Editar" para corregir un registro: puedes modificar horas, minutos trabajados, tardanza, horas extra y estado. Debes indicar el motivo de la edición para auditoría.',
    icon: icon(HiOutlinePencilSquare),
  },
];

/* ── Asistencia: Detalle ── */
export const attendanceDetailSteps = [
  {
    title: 'Datos del empleado y turno',
    description: 'La primera sección muestra el nombre del empleado (enlace a su perfil) y el turno asignado para ese día.',
    icon: icon(HiOutlineUsers),
  },
  {
    title: 'Marcajes',
    description: 'Muestra la primera entrada y la última salida registradas por el biométrico, junto con el total de minutos trabajados calculados.',
    icon: icon(HiOutlineClipboardDocumentCheck),
  },
  {
    title: 'Cálculos detallados',
    description: 'Desglose completo: tardanza, salida temprana, horas extra totales, horas extra diurnas, horas extra nocturnas y el estado final del registro (presente, ausente, etc.).',
    icon: icon(HiOutlineDocumentMagnifyingGlass),
  },
  {
    title: 'Historial de ediciones',
    description: 'Si el registro fue editado manualmente, aparece una tabla con: campo modificado, valor anterior, valor nuevo, motivo de la edición, nombre del editor y fecha/hora del cambio.',
    icon: icon(HiOutlineShieldCheck),
  },
];

/* ── Asistencia: Editar ── */
export const attendanceEditSteps = [
  {
    title: 'Corregir marcajes',
    description: 'Modifica la hora de entrada y/o salida usando los campos de fecha y hora. El formato es datetime completo (fecha + hora).',
    icon: icon(HiOutlineClock),
  },
  {
    title: 'Ajustar minutos',
    description: 'Puedes corregir manualmente: minutos trabajados, tardanza, salida temprana, horas extra totales, horas extra diurnas y horas extra nocturnas.',
    icon: icon(HiOutlineAdjustmentsHorizontal),
  },
  {
    title: 'Cambiar estado',
    description: 'Selecciona el estado correcto: Presente, Ausente, Incompleto, Descanso o Feriado. El estado determina cómo se contabiliza el día.',
    icon: icon(HiOutlineCheckBadge),
  },
  {
    title: 'Motivo obligatorio',
    description: 'Debes escribir un motivo para la edición. Este texto queda registrado en el historial de auditoría y es visible en el detalle del registro.',
    icon: icon(HiOutlinePencilSquare),
  },
];

/* ── Import: Página principal ── */
export const importPageSteps = [
  {
    title: 'Subir archivo',
    description: 'Arrastra un archivo CSV a la zona punteada o haz clic para seleccionarlo. El formato esperado tiene columnas "ID de persona" y "Hora", con un tamaño máximo de 10 MB.',
    icon: icon(HiOutlineDocumentArrowUp),
  },
  {
    title: 'Procesamiento automático',
    description: 'Al subir el archivo, el sistema procesa los marcajes automáticamente: identifica empleados, asigna turnos y genera registros de asistencia. El progreso se refleja en el historial.',
    icon: icon(HiOutlineArrowUpTray),
  },
  {
    title: 'Historial de importaciones',
    description: 'Debajo del área de subida verás todas las importaciones con: nombre del archivo, filas totales, procesadas, fallidas (en rojo si > 0) y estado. Haz clic en "Ver" para detalles.',
    icon: icon(HiOutlineListBullet),
  },
];

export const importPageAdminSteps = [
  ...importPageSteps,
  {
    title: 'Reprocesar batches',
    description: 'En batches con estado "Completado", haz clic en "Reprocesar" para recalcular toda la asistencia desde los marcajes originales. Las ediciones manuales no se pierden. Útil al cambiar configuraciones de turno.',
    icon: icon(HiOutlineArrowPath),
  },
];

/* ── Import: Detalle ── */
export const importDetailSteps = [
  {
    title: 'Información del batch',
    description: 'Muestra: archivo original, total de filas detectadas, filas procesadas exitosamente, fecha/hora de procesamiento, estado actual (pendiente, procesando, completado, fallido) y cantidad de filas con errores.',
    icon: icon(HiOutlineDocumentMagnifyingGlass),
  },
  {
    title: 'Lista de errores',
    description: 'Si hay filas con problemas, se listan los mensajes de error específicos. Úsalos para corregir el CSV y volver a importarlo.',
    icon: icon(HiOutlineListBullet),
  },
];

/* ── Configuración ── */
export const settingsSteps = [
  {
    title: 'Ventana de ruido',
    description: 'Define en minutos la ventana para filtrar marcajes duplicados. Si un empleado marca dos veces en menos de este tiempo, la segunda marcación se ignora.',
    icon: icon(HiOutlineAdjustmentsHorizontal),
  },
  {
    title: 'Auto-asignación de turno',
    description: 'Si está habilitado, el sistema asigna automáticamente un turno según la hora de entrada del empleado. La tolerancia define la ventana alrededor del inicio de cada turno para hacer match.',
    icon: icon(HiOutlineClock),
  },
  {
    title: 'Almuerzo y horarios',
    description: 'El margen de almuerzo define el rango para detectar marcajes de almuerzo. Los períodos diurno/nocturno separan las horas extra en diurnas y nocturnas para cálculos laborales.',
    icon: icon(HiOutlineCalendarDays),
  },
  {
    title: 'Retención de datos',
    description: 'Define cuántos meses se conservan los datos históricos de asistencia. Los registros más antiguos que este período pueden ser purgados por el sistema.',
    icon: icon(HiOutlineCog6Tooth),
  },
];
