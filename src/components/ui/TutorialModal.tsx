import { useState } from 'react';
import { HiOutlineQuestionMarkCircle, HiXMark, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface TutorialModalProps {
  steps: TutorialStep[];
  buttonLabel?: string;
}

export default function TutorialModal({ steps, buttonLabel = 'Tutorial' }: TutorialModalProps) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  const step = steps[current];
  const isFirst = current === 0;
  const isLast = current === steps.length - 1;

  return (
    <>
      <button
        onClick={() => { setOpen(true); setCurrent(0); }}
        className="flex items-center gap-1.5 rounded-lg bg-radar px-3 py-1.5 text-sm font-semibold text-white hover:bg-radar-dark shadow transition cursor-pointer"
      >
        <HiOutlineQuestionMarkCircle className="h-4 w-4" />
        {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div className="relative w-full max-w-lg rounded-2xl bg-grafito p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-400 cursor-pointer">
              <HiXMark className="h-5 w-5" />
            </button>

            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-radar">
              Paso {current + 1} de {steps.length}
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-radar/10 text-radar">
                {step.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-400">{step.description}</p>
              </div>
            </div>

            {/* Progress dots */}
            <div className="mt-6 flex items-center justify-center gap-1.5">
              {steps.map((s, i) => (
                <button
                  key={s.title}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${i === current ? 'w-6 bg-radar' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>

            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setCurrent((c) => c - 1)}
                disabled={isFirst}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-300 disabled:invisible cursor-pointer"
              >
                <HiChevronLeft className="h-4 w-4" /> Anterior
              </button>
              {isLast ? (
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-radar px-4 py-1.5 text-sm font-semibold text-white hover:bg-radar-dark cursor-pointer"
                >
                  ¡Entendido!
                </button>
              ) : (
                <button
                  onClick={() => setCurrent((c) => c + 1)}
                  className="flex items-center gap-1 rounded-lg bg-radar px-3 py-1.5 text-sm font-semibold text-white hover:bg-radar-dark cursor-pointer"
                >
                  Siguiente <HiChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
