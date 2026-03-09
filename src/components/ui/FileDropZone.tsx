import { useState, useRef, type DragEvent } from 'react';
import { HiOutlineArrowUpTray } from 'react-icons/hi2';

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  compact?: boolean;
}

export default function FileDropZone({ onFileSelected, accept = '.csv,.txt', disabled, compact }: FileDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items.length > 0) setDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;
    const file = e.dataTransfer.files[0];
    if (file) onFileSelected(file);
  };

  const handleChange = () => {
    const file = inputRef.current?.files?.[0];
    if (file) {
      onFileSelected(file);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  if (compact) {
    return (
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !disabled && inputRef.current?.click(); } }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 transition ${
          dragging
            ? 'border-radar bg-radar/10'
            : 'border-white/10 hover:border-radar hover:bg-grafito-lighter'
        } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      >
        <HiOutlineArrowUpTray className={`h-5 w-5 shrink-0 ${dragging ? 'text-radar' : 'text-gray-400'}`} />
        <span className="text-sm text-gray-400">
          {dragging ? 'Suelta el archivo aquí' : 'Arrastra un CSV o haz clic para seleccionar'}
        </span>
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !disabled && inputRef.current?.click(); } }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition ${
        dragging
          ? 'border-radar bg-radar/10'
          : 'border-white/10 hover:border-radar hover:bg-grafito-lighter'
      } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <HiOutlineArrowUpTray className={`h-10 w-10 ${dragging ? 'text-radar' : 'text-gray-400'}`} />
      <p className="mt-3 text-sm font-medium text-gray-300">
        {dragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo CSV aquí'}
      </p>
      <p className="mt-1 text-xs text-gray-400">o haz clic para seleccionar · Máx 10 MB</p>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
    </div>
  );
}
