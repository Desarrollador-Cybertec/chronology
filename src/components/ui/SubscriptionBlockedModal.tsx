import { useState, useEffect } from 'react';
import { onSubscriptionBlocked } from '@/utils/subscriptionEvents';
import { HiOutlineExclamationTriangle, HiOutlineLockClosed, HiOutlineNoSymbol } from 'react-icons/hi2';

const ERROR_CONFIG: Record<string, {
  title: string;
  message: string;
  showUpgrade: boolean;
  icon: React.ReactNode;
  upgradeLabel: string;
}> = {
  license_denied: {
    title: 'Límite mensual alcanzado',
    message: 'El límite del plan actual ha sido alcanzado. Para continuar, actualiza tu suscripción.',
    showUpgrade: true,
    icon: <HiOutlineExclamationTriangle className="h-7 w-7 text-amber-400" />,
    upgradeLabel: 'Actualizar plan',
  },
  license_expired: {
    title: 'Suscripción vencida',
    message: 'La suscripción ha vencido. Para continuar usando el sistema, renueva tu plan.',
    showUpgrade: true,
    icon: <HiOutlineLockClosed className="h-7 w-7 text-amber-400" />,
    upgradeLabel: 'Renovar plan',
  },
  license_suspended: {
    title: 'Instalación suspendida',
    message: 'La suscripción está suspendida. Contacta al administrador de tu cuenta para resolver el problema.',
    showUpgrade: false,
    icon: <HiOutlineNoSymbol className="h-7 w-7 text-red-400" />,
    upgradeLabel: '',
  },
};

const UPGRADE_URL = import.meta.env.VITE_UPGRADE_URL as string | undefined;

export default function SubscriptionBlockedModal() {
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    return onSubscriptionBlocked((code) => {
      setErrorCode(code);
    });
  }, []);

  if (!errorCode || !(errorCode in ERROR_CONFIG)) return null;

  const config = ERROR_CONFIG[errorCode];

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-md rounded-2xl bg-grafito p-8 shadow-xl">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
          {config.icon}
        </div>

        {/* Title */}
        <h3 className="text-center text-xl font-bold text-white">{config.title}</h3>

        {/* Message */}
        <p className="mt-3 text-center text-sm leading-relaxed text-gray-400">
          {config.message}
        </p>

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          {config.showUpgrade && UPGRADE_URL && (
            <a
              href={UPGRADE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-radar px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-radar-dark transition"
            >
              {config.upgradeLabel}
            </a>
          )}
          <button
            type="button"
            onClick={() => setErrorCode(null)}
            className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
