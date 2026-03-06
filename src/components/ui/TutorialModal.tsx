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
        className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition cursor-pointer"
      >
        <HiOutlineQuestionMarkCircle className="h-4 w-4" />
        {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer">
              <HiXMark className="h-5 w-5" />
            </button>

            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-indigo-500">
              Paso {current + 1} de {steps.length}
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                {step.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{step.description}</p>
              </div>
            </div>

            {/* Progress dots */}
            <div className="mt-6 flex items-center justify-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${i === current ? 'w-6 bg-indigo-500' : 'w-2 bg-gray-200 hover:bg-gray-300'}`}
                />
              ))}
            </div>

            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setCurrent((c) => c - 1)}
                disabled={isFirst}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:invisible cursor-pointer"
              >
                <HiChevronLeft className="h-4 w-4" /> Anterior
              </button>
              {isLast ? (
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                >
                  ¡Entendido!
                </button>
              ) : (
                <button
                  onClick={() => setCurrent((c) => c + 1)}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 cursor-pointer"
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
