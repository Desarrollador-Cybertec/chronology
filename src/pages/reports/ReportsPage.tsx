import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { sileo } from 'sileo';
import { reports, employees as employeesApi } from '@/api/endpoints';
import { isSubscriptionError } from '@/api/client';
import type { Report, PaginationMeta, EmployeeSummary } from '@/types/api';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import ReportProcessingIndicator from '@/components/ui/ReportProcessingIndicator';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { useDateBounds } from '@/hooks/useDateBounds';
import { INPUT_BASE } from '@/constants/ui';
import {
  HiOutlineDocumentChartBar,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlinePlusCircle,
} from 'react-icons/hi2';

export default function ReportsPage() {
  const [data, setData] = useState<Report[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<string>('general');
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formDateFrom, setFormDateFrom] = useState('');
  const [formDateTo, setFormDateTo] = useState('');
  const [creating, setCreating] = useState(false);
  const [processingReport, setProcessingReport] = useState<Report | null>(null);

  // Employee search for individual reports
  const [employeeList, setEmployeeList] = useState<EmployeeSummary[]>([]);
  const [empLoading, setEmpLoading] = useState(false);

  const { minDate, maxDate } = useDateBounds();

  const fetchReports = () => {
    setLoading(true);
    const params: Record<string, string | number> = { page };
    if (filterType) params.type = filterType;
    if (filterStatus) params.status = filterStatus;
    reports.list(params)
      .then((res) => { setData(res.data); setMeta(res.meta); })
      .catch(() => sileo.error({ title: 'Error al cargar reportes' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, [page, filterType, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (formType === 'individual' && employeeList.length === 0 && !empLoading) {
      setEmpLoading(true);
      employeesApi.allIds({ active_only: true })
        .then((res) => setEmployeeList(
          [...res.data].sort((a, b) => Number(a.internal_id) - Number(b.internal_id))
        ))
        .catch(() => {})
        .finally(() => setEmpLoading(false));
    }
  }, [formType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    if (!formDateFrom || !formDateTo) {
      sileo.error({ title: 'Selecciona las fechas del rango' });
      return;
    }
    if (formType === 'individual' && !formEmployeeId) {
      sileo.error({ title: 'Selecciona un empleado' });
      return;
    }

    setCreating(true);
    try {
      const res = await reports.create({
        type: formType,
        employee_id: formType === 'individual' ? Number(formEmployeeId) : undefined,
        date_from: formDateFrom,
        date_to: formDateTo,
      });
      sileo.success({ title: 'Reporte solicitado', description: 'Se está generando en segundo plano.' });
      setProcessingReport(res.data);
      setShowForm(false);
      setFormDateFrom('');
      setFormDateTo('');
      setFormEmployeeId('');
    } catch (err) {
      if (!isSubscriptionError(err)) {
        sileo.error({ title: 'Error al crear reporte' });
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este reporte?')) return;
    try {
      await reports.delete(id);
      sileo.success({ title: 'Reporte eliminado' });
      fetchReports();
    } catch {
      sileo.error({ title: 'Error al eliminar' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineDocumentChartBar className="h-6 w-6 text-radar" />
          <h2 className="text-2xl font-bold text-white">Reportes</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-radar px-4 py-2 text-sm font-semibold text-white hover:bg-radar-dark cursor-pointer"
        >
          <HiOutlinePlusCircle className="h-4 w-4" />
          Nuevo reporte
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mt-6 rounded-xl bg-grafito p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">Generar reporte</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-40">
              <label className="mb-1 block text-xs font-medium text-gray-300">Tipo</label>
              <select value={formType} onChange={(e) => setFormType(e.target.value)} className={INPUT_BASE}>
                <option value="general">General</option>
                <option value="individual">Individual</option>
                <option value="tardanzas">Tardanzas</option>
                <option value="incompletas">Marcaciones incompletas</option>
                <option value="informe_total">Informe total de novedades</option>
                <option value="horas_laborales">Horas laborales</option>
              </select>
            </div>

            {formType === 'individual' && (
              <div className="min-w-52">
                <label className="mb-1 block text-xs font-medium text-gray-300">Empleado</label>
                <select value={formEmployeeId} onChange={(e) => setFormEmployeeId(e.target.value)} className={INPUT_BASE}>
                  <option value="">Seleccionar empleado...</option>
                  {employeeList.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.internal_id} — {emp.full_name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="min-w-37.5">
              <label className="mb-1 block text-xs font-medium text-gray-300">Desde</label>
              <input type="date" value={formDateFrom} onChange={(e) => setFormDateFrom(e.target.value)} min={minDate} max={maxDate} className={INPUT_BASE} />
            </div>

            <div className="min-w-37.5">
              <label className="mb-1 block text-xs font-medium text-gray-300">Hasta</label>
              <input type="date" value={formDateTo} onChange={(e) => setFormDateTo(e.target.value)} min={formDateFrom || minDate} max={maxDate} className={INPUT_BASE} />
            </div>

            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="rounded-lg bg-radar px-5 py-2 text-sm font-semibold text-white hover:bg-radar-dark disabled:opacity-50 cursor-pointer"
            >
              {creating ? 'Generando...' : 'Generar'}
            </button>
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {processingReport && (
        <div className="mt-4">
          <ReportProcessingIndicator
            report={processingReport}
            onComplete={() => {
              setProcessingReport(null);
              fetchReports();
            }}
          />
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="w-44">
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className={INPUT_BASE}>
            <option value="">Todos los tipos</option>
            <option value="general">General</option>
            <option value="individual">Individual</option>
            <option value="tardanzas">Tardanzas</option>
            <option value="incompletas">Incompletas</option>
            <option value="informe_total">Informe total</option>
            <option value="horas_laborales">Horas laborales</option>
          </select>
        </div>
        <div className="w-44">
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className={INPUT_BASE}>
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="processing">Procesando</option>
            <option value="completed">Completado</option>
            <option value="failed">Fallido</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable cols={6} rows={5} />
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-xl bg-grafito shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 text-xs uppercase text-gray-400">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Rango</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Creado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((r) => (
                  <tr key={r.id} className="hover:bg-grafito-lighter">
                    <td className="px-4 py-3">{r.id}</td>
                    <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        r.type === 'general' ? 'bg-sky-500/20 text-sky-400'
                        : r.type === 'individual' ? 'bg-violet-500/20 text-violet-400'
                        : r.type === 'tardanzas' ? 'bg-amber-500/20 text-amber-400'
                        : r.type === 'incompletas' ? 'bg-orange-500/20 text-orange-400'
                        : r.type === 'horas_laborales' ? 'bg-teal-500/20 text-teal-400'
                        : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {r.type === 'general' ? 'General'
                          : r.type === 'individual' ? 'Individual'
                          : r.type === 'tardanzas' ? 'Tardanzas'
                          : r.type === 'incompletas' ? 'Incompletas'
                          : r.type === 'horas_laborales' ? 'Horas laborales'
                          : 'Informe total'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{r.date_from} → {r.date_to}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-gray-400">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="flex gap-2 px-4 py-3">
                      {r.status === 'completed' && (
                        <Link to={`/reports/${r.id}`} className="flex items-center gap-1 text-sm text-radar hover:underline">
                          <HiOutlineEye className="h-4 w-4" /> Ver
                        </Link>
                      )}
                      <button
                        type="button"
                        className="flex items-center gap-1 text-sm text-red-400 hover:underline cursor-pointer"
                        onClick={() => handleDelete(r.id)}
                      >
                        <HiOutlineTrash className="h-4 w-4" /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400">No hay reportes.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
