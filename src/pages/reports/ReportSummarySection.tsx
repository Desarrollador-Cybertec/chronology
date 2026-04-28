import type {
  Report,
  ReportRowHorasLaborales,
  ReportSummaryGeneral,
  ReportSummaryHorasLaborales,
  ReportSummaryIncompletas,
  ReportSummaryIndividual,
  ReportSummaryInformeTotal,
  ReportSummaryTardanzas,
} from '@/types/api';
import { formatMinutes } from '@/utils/formatting';

interface Props {
  report: Report;
}

export default function ReportSummarySection({ report }: Props) {
  const { summary, type } = report;
  if (!summary) return null;

  return (
    <div className="mt-6 rounded-xl bg-grafito p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-white">Resumen</h3>
      {type === 'individual' && (
        <p className="mb-4 text-sm text-gray-300">
          Empleado: <span className="font-medium text-white">{(summary as ReportSummaryIndividual).employee_name}</span>
          {' '}({(summary as ReportSummaryIndividual).employee_code})
        </p>
      )}
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {type === 'individual' && <IndividualCards s={summary as ReportSummaryIndividual} />}
        {type === 'general' && <GeneralCards s={summary as ReportSummaryGeneral} />}
        {type === 'tardanzas' && <TardanzasCards s={summary as ReportSummaryTardanzas} />}
        {type === 'incompletas' && <IncompletasCards s={summary as ReportSummaryIncompletas} />}
        {type === 'informe_total' && <InformeTotalCards s={summary as ReportSummaryInformeTotal} />}
        {type === 'horas_laborales' && (
          <HorasLaboralesCards
            s={summary as ReportSummaryHorasLaborales}
            totalIncomplete={(report.rows as ReportRowHorasLaborales[] | null ?? []).reduce((acc, r) => acc + r.days_incomplete, 0)}
          />
        )}
      </dl>
    </div>
  );
}

function IndividualCards({ s }: { s: ReportSummaryIndividual }) {
  return (
    <>
      <SummaryCard label="Días totales" value={s.total_days} />
      <SummaryCard label="Presentes" value={s.days_present} color="text-emerald-400" />
      <SummaryCard label="Ausentes" value={s.days_absent} color="text-red-400" />
      <SummaryCard label="Incompletos" value={s.days_incomplete} color="text-amber-400" />
      <SummaryCard label="Veces tarde" value={s.times_late} color="text-amber-400" />
      <SummaryCard label="Min. tardanza total" value={formatMinutes(s.total_late_minutes)} />
      <SummaryCard label="Tiempo trabajado" value={formatMinutes(s.total_worked_minutes)} />
      <SummaryCard label="Horas extra" value={formatMinutes(s.total_overtime_minutes)} color="text-sky-400" />
      <SummaryCard label="HE diurnas" value={formatMinutes(s.total_overtime_diurnal_minutes)} />
      <SummaryCard label="HE nocturnas" value={formatMinutes(s.total_overtime_nocturnal_minutes)} />
      <SummaryCard label="Salida temprana" value={formatMinutes(s.total_early_departure_minutes)} />
    </>
  );
}

function GeneralCards({ s }: { s: ReportSummaryGeneral }) {
  return (
    <>
      <SummaryCard label="Empleados" value={s.total_employees} />
      <SummaryCard label="Días totales" value={s.total_days} />
      <SummaryCard label="Presentes" value={s.days_present} color="text-emerald-400" />
      <SummaryCard label="Ausentes" value={s.days_absent} color="text-red-400" />
      <SummaryCard label="Incompletos" value={s.days_incomplete} color="text-amber-400" />
      <SummaryCard label="Entradas tarde" value={s.total_late_entries} color="text-amber-400" />
      <SummaryCard label="Min. tardanza total" value={formatMinutes(s.total_late_minutes)} />
      <SummaryCard label="Tiempo trabajado" value={formatMinutes(s.total_worked_minutes)} />
      <SummaryCard label="Horas extra" value={formatMinutes(s.total_overtime_minutes)} color="text-sky-400" />
      <SummaryCard label="HE diurnas" value={formatMinutes(s.total_overtime_diurnal_minutes)} />
      <SummaryCard label="HE nocturnas" value={formatMinutes(s.total_overtime_nocturnal_minutes)} />
      <SummaryCard label="Salida temprana" value={formatMinutes(s.total_early_departure_minutes)} />
    </>
  );
}

function TardanzasCards({ s }: { s: ReportSummaryTardanzas }) {
  return (
    <>
      <SummaryCard label="Empleados con tardanzas" value={s.total_employees_with_tardanzas} />
      <SummaryCard label="Total tardanzas" value={s.total_tardanzas} color="text-amber-400" />
      <SummaryCard label="Min. tardanza total" value={formatMinutes(s.total_late_minutes)} />
    </>
  );
}

function IncompletasCards({ s }: { s: ReportSummaryIncompletas }) {
  return (
    <>
      <SummaryCard label="Empleados con incompletas" value={s.total_employees_with_incompletas} />
      <SummaryCard label="Total incompletas" value={s.total_incompletas} color="text-orange-400" />
      <SummaryCard label="Tiempo trabajado" value={formatMinutes(s.total_worked_minutes)} />
    </>
  );
}

function InformeTotalCards({ s }: { s: ReportSummaryInformeTotal }) {
  return (
    <>
      <SummaryCard label="Empleados afectados" value={s.total_employees_affected} />
      <SummaryCard label="Total registros" value={s.total_records} />
      <SummaryCard label="Total tardanzas" value={s.total_tardanzas} color="text-amber-400" />
      <SummaryCard label="Salidas temprano" value={s.total_salidas_temprano} color="text-amber-400" />
      <SummaryCard label="Total incompletas" value={s.total_incompletas} color="text-orange-400" />
      <SummaryCard label="Min. tardanza total" value={formatMinutes(s.total_late_minutes)} />
      <SummaryCard label="Min. salida temprana" value={formatMinutes(s.total_early_departure_minutes)} />
    </>
  );
}

function HorasLaboralesCards({ s, totalIncomplete }: { s: ReportSummaryHorasLaborales; totalIncomplete: number }) {
  return (
    <>
      <SummaryCard label="Empleados" value={s.total_employees} />
      <SummaryCard label="Marcaciones incompletas" value={totalIncomplete} color={totalIncomplete > 0 ? 'text-amber-400' : undefined} />
    </>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex justify-between rounded-lg border border-white/5 bg-navy/40 px-4 py-3">
      <dt className="text-sm text-gray-400">{label}</dt>
      <dd className={`text-sm font-semibold ${color ?? 'text-white'}`}>{value}</dd>
    </div>
  );
}
