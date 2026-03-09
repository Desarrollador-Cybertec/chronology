import { HiOutlineChevronUp, HiOutlineChevronDown, HiOutlineChevronUpDown } from 'react-icons/hi2';
import type { SortDirection } from '@/hooks/useTableSort';

interface SortableHeaderProps {
  label: string;
  column: string;
  sortKey: string | null;
  sortDir: SortDirection;
  onSort: (key: string) => void;
  className?: string;
}

export default function SortableHeader({ label, column, sortKey, sortDir, onSort, className = '' }: SortableHeaderProps) {
  const isActive = sortKey === column;

  return (
    <th
      className={`px-4 py-3 cursor-pointer select-none hover:text-white transition-colors ${className}`}
      onClick={() => onSort(column)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (
          sortDir === 'asc' ? (
            <HiOutlineChevronUp className="h-3.5 w-3.5 text-radar" />
          ) : (
            <HiOutlineChevronDown className="h-3.5 w-3.5 text-radar" />
          )
        ) : (
          <HiOutlineChevronUpDown className="h-3.5 w-3.5 opacity-40" />
        )}
      </span>
    </th>
  );
}
