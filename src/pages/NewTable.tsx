import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';

import { Header } from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    ArrowLeft,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Filter,
    Download,
    Search,
} from 'lucide-react';
import { getAccessToken } from '@/auth/getAccessToken';
type AnyRecord = Record<string, unknown>;

// --- Helpers ---

const isDateLike = (v: unknown) =>
    typeof v === 'string' &&
    // Simple ISO-ish detection. You can adjust to your formats.
    /^\d{4}-\d{2}-\d{2}/.test(v);

const formatValue = (v: unknown): string => {
    if (v == null) return '—';
    if (typeof v === 'number') return v.toLocaleString();
    if (typeof v === 'boolean') return v ? 'True' : 'False';
    if (isDateLike(v)) return String(v); // keep as is; or use toLocaleString if needed
    if (Array.isArray(v)) return v.length ? JSON.stringify(v) : '[]';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
};

type NormalizedStatus = 'Matched' | 'Not Matched' | 'To Review' | 'Not Validate';

const normalizeStatus = (raw: unknown): NormalizedStatus | null => {
    if (raw == null) return null;
    const s = String(raw).trim().toUpperCase();
    if (s === 'MATCHED') return 'Matched';
    if (s === 'NO MATCH' || s === 'NOT MATCHED') return 'Not Matched';    if (s === 'NOT VALIDATE' || s === 'NOT VALIDATED') return 'Not Validate';
    if (['TO REVIEW', 'REVIEW', 'PENDING'].includes(s)) return 'To Review';
    return null;
};

function StatusBadge({ value }: { value: unknown }) {
    const norm = normalizeStatus(value);
    if (!norm) return <span>{formatValue(value)}</span>;
    const variantMap = {
        Matched: 'matched' as const,
        'To Review': 'review' as const,
        'Not Matched': 'notMatched' as const,
    };
    return <Badge variant={variantMap[norm]}>{norm}</Badge>;
}

const getRowBg = (row: AnyRecord) => {
  const norm = normalizeStatus(row?.status);
  switch (norm) {
    case 'Matched':
      return 'bg-status-matched/10 hover:bg-status-matched/20';
    case 'To Review':
      return 'bg-status-review/10 hover:bg-status-review/20';
    case 'Not Matched':
      return 'bg-status-not-matched/10 hover:bg-status-not-matched/20';
    case 'Not Validate':
      return 'bg-gray-100 hover:bg-gray-200';
    default:
      return '';
  }
};


// --- Infinite Scroll Hook ---

function useInfiniteScroll({
    hasMore,
    onLoadMore,
    rootRef,
}: {
    hasMore: boolean;
    onLoadMore: () => void;
    rootRef: React.RefObject<HTMLDivElement>;
}) {
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!hasMore) return;
        const root = rootRef.current ?? undefined;
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const io = new IntersectionObserver(
            (entries) => {
                const [e] = entries;
                if (e.isIntersecting) onLoadMore();
            },
            { root, rootMargin: '200px', threshold: 0 }
        );

        io.observe(sentinel);
        return () => io.disconnect();
    }, [hasMore, onLoadMore, rootRef]);

    return { sentinelRef };
}

// --- Sub-components for Cells to fix Hooks Violated ---
function StatusSelect({
    value,
    onChange,
}: {
    value: unknown;
    onChange: (next: NormalizedStatus) => void;
}) {
    const current = normalizeStatus(value) ?? 'To Review';

    const options: NormalizedStatus[] = [
        'Matched',
        'Not Matched',
        'To Review',
        'Not Validate',
    ];

    // Tailwind color classes for each status
    const colorMap: Record<NormalizedStatus, string> = {
        'Matched': 'bg-green-100 text-green-900 border-green-300',
        'Not Matched': 'bg-red-100 text-red-900 border-red-300',
        'To Review': 'bg-yellow-100 text-yellow-900 border-yellow-300',
        'Not Validate': 'bg-gray-100 text-gray-900 border-gray-300',
    };

    return (
        <select
            value={current}
            onChange={(e) => onChange(e.target.value as NormalizedStatus)}
            className={`px-2 py-1 rounded text-sm border focus:outline-none focus:ring-1 transition-colors ${colorMap[current]}`}
        >
            {options.map((o) => (
                <option key={o} value={o}>
                    {o}
                </option>
            ))}
        </select>
    );
}

function LdcIdCell({
    value,
    rowId,
    onSave
}: {
    value: unknown;
    rowId: string;
    onSave: (val: string) => void
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editingValue, setEditingValue] = useState(String(value ?? ''));

    if (isEditing) {
        return (
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="h-8 w-32"
                    autoFocus
                />
                <Button
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => {
                        onSave(editingValue);
                        setIsEditing(false);
                    }}
                >
                    ✔
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => setIsEditing(false)}
                >
                    ✕
                </Button>
            </div>
        );
    }

    return (
        <div
            onClick={() => {
                setEditingValue(String(value ?? ''));
                setIsEditing(true);
            }}
            className="cursor-pointer hover:bg-black/5 px-2 py-1 rounded transition-colors min-h-[2rem] flex items-center"
        >
            {String(value ?? '')}
        </div>
    );
}

// --- Main Component ---

/**
 * Use it like: <DynamicTablePage records={payload.data} />
 */
export function DynamicTablePage({ records }: { records: AnyRecord[] }) {
    const navigate = useNavigate();

    // Guard
    const safeRecords = Array.isArray(records) ? records : [];

    // Table state
    const [tableData, setTableData] = useState<AnyRecord[]>(() =>
        safeRecords.map(r => ({ ...r, validated: false }))
    );
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});

    // Infinite scroll (client-slice)
    const INITIAL = 20;
    const STEP = 20;
    const [visibleCount, setVisibleCount] = useState(INITIAL);

    // Reset visible count when filter/sort changes
    useEffect(() => {
        setVisibleCount(INITIAL);
    }, [globalFilter, sorting]);

    const handleLdcIdUpdate = async (rowId: string, newValue: string, rowData: AnyRecord) => {
        // Optimistic update
        setTableData((prev) =>
            prev.map((r) => (String(r['id']) === String(rowId) ? { ...r, ldc_id: newValue } : r))
        );

        // Trigger API update
        await handleUpdate(rowId, { ldc_id: newValue }, rowData.batch_id as string);
    };

    const handleToggleValidated = async (rowId: string, rowData: AnyRecord) => {
        const newValidated = !rowData['validated'];

        // Optimistic update
        setTableData((prev) =>
            prev.map((r) => (String(r['id']) === String(rowId) ? { ...r, validated: newValidated } : r))
        );

        // Trigger API update
        await handleUpdate(rowId, { validated: newValidated }, rowData.batch_id as string);
    };


    // Add this below handleToggleValidated
    const handleStatusChange = async (
        rowId: string,
        nextStatus: NormalizedStatus,
        rowData: AnyRecord
    ) => {
        // Optimistic update
        setTableData((prev) =>
            prev.map((r) =>
                String(r['id']) === String(rowId) ? { ...r, status: nextStatus } : r
            )
        );

        // Persist to backend (if API expects other casing/keys, map here)
        await handleUpdate(rowId, { status: nextStatus } as any, rowData.batch_id as string);
    };

    // Build dynamic columns
    const dynamicKeys = useMemo(() => {
        if (!tableData.length) return [];
        // Extract all keys from the first record, but filter out hidden ones
        const keys = Object.keys(tableData[0]);
        return keys
            .filter((key) => key !== 'id' && key !== 'batch_id' && key !== 'validated')
            .sort((a, b) => {
                if (a === 'status') return -1;
                if (b === 'status') return 1;
                return 0;
            });
    }, [tableData]);

    const columns: ColumnDef<AnyRecord>[] = useMemo(() => {
        const baseColumns: ColumnDef<AnyRecord>[] = [
            {
  id: 'validated',
  header: () => (
    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
      Val
    </span>
  ),
  cell: ({ row }) => {
    const status = normalizeStatus(row.original.status);
    const disabled = status !== 'Matched';

    return (
      <input
        type="checkbox"
        checked={!!row.original.validated}
        disabled={disabled}
        onChange={() => {
          if (!disabled) {
            handleToggleValidated(row.id as string, row.original as AnyRecord);
          }
        }}
        className={`rounded border-gray-300 w-4 h-4 ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'accent-primary cursor-pointer'
        }`}
        title={disabled ? 'Validation allowed only for Matched' : 'Mark as validated'}
      />
    );
  },
  size: 50,
  enableSorting: false,
}
        ];

        const dynCols: ColumnDef<AnyRecord>[] = dynamicKeys.map((key) => ({
            accessorKey: key,
            header: key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase()),
            size: 160,
            cell: ({ getValue, row }) => {
                const val = getValue();

                if (key.toLowerCase() === 'status') {
                    return (
                        <StatusSelect
                            value={val}
                            onChange={(next) => handleStatusChange(row.id, next, row.original as AnyRecord)}
                        />
                    );
                }

                if (key.toLowerCase() === 'ldc_id') {
                    return (
                        <LdcIdCell
                            value={val}
                            rowId={row.id}
                            onSave={(newVal) => handleLdcIdUpdate(row.id, newVal, row.original as AnyRecord)}
                        />
                    );
                }

                return <span>{formatValue(val)}</span>;
            },
        }));

        return [...baseColumns, ...dynCols];
    }, [dynamicKeys]);

    const table = useReactTable({
        data: tableData,
        columns,
        state: { sorting, globalFilter, rowSelection },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getRowId: (row) => String(row.id),
    });

    const filteredRows = table.getFilteredRowModel().rows;
    const hasMore = visibleCount < filteredRows.length;
    const onLoadMore = () => setVisibleCount((c) => Math.min(c + STEP, filteredRows.length));

    const scrollRootRef = useRef<HTMLDivElement>(null);
    const { sentinelRef } = useInfiniteScroll({ hasMore, onLoadMore, rootRef: scrollRootRef as React.RefObject<HTMLDivElement> });

    const rowsToRender = filteredRows.slice(0, visibleCount);

    // patch call to update table data on edit

    const handleUpdate = async (
        matchId: string,
        updates: { ldc_id?: string; validated?: boolean; status?: NormalizedStatus | string },
        batchId: string
    ) => {
        try {
            const response = await fetch(
                `http://127.0.0.1:8020/api/dxo/pa/ldc/v1/customer-ldc-match/${matchId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...updates,
                        batch_id: batchId,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update');
            }

            const updatedRow = await response.json();

            // 🔄 Replace updated row in table
            setTableData((prev) =>
                prev.map((r) =>
                    String(r['id']) === String(updatedRow.id) ? (updatedRow as AnyRecord) : r
                )
            );
        } catch (error) {
            console.error('Update failed:', error);
        }
    };


    return (
        <div className="min-h-screen bg-background">
            <Header title="Home Page" subtitle="Manage your reviews" />

            <main className="max-w-[1400px] mx-auto p-6">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/')}
                            className="gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Review
                        </Button>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Silo Matching Review</h2>
                            <p className="text-sm text-muted-foreground">Detailed matching data table</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <Filter className="w-4 h-4" />
                            Filter
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search records..."
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-10 max-w-sm"
                    />
                </div>

                {/* Table (Scrollable + Infinite) */}
                <div className="rounded-xl border border-border overflow-hidden shadow-sm bg-card">
                    <div ref={scrollRootRef} className="overflow-auto max-h-[70vh]">
                        <table className="w-full text-sm">
                            <thead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id} className="bg-primary shadow-sm border-b border-white/10">
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-tight whitespace-nowrap"
                                                style={{ width: header.getSize() }}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        className={`flex items-center gap-1 ${header.column.getCanSort()
                                                            ? 'cursor-pointer select-none hover:opacity-80'
                                                            : ''
                                                            }`}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        {header.column.getCanSort() && (
                                                            <span className="ml-0.5">
                                                                {{
                                                                    asc: <ArrowUp className="w-3.5 h-3.5" />,
                                                                    desc: <ArrowDown className="w-3.5 h-3.5" />,
                                                                }[header.column.getIsSorted() as string] ?? (
                                                                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                                                                    )}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>

                            <tbody>
                                {rowsToRender.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={`border-b border-border/50 transition-colors duration-150 ${getRowBg(
                                            row.original as AnyRecord
                                        )}`}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-3 py-3 whitespace-nowrap text-foreground">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Infinite Scroll Sentinel */}
                        <div
                            ref={sentinelRef}
                            className="h-10 flex items-center justify-center text-xs text-muted-foreground"
                        >
                            {hasMore ? 'Loading more…' : rowsToRender.length === 0 ? 'No records found' : 'End of list'}
                        </div>
                    </div>
                </div>

                {/* Optional Legend (only meaningful if a 'status' field exists) */}
                <div className="mt-6 flex items-center gap-6">
                    <p className="text-sm font-semibold text-foreground">Status Legend</p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm bg-status-matched" />
                            <span className="text-xs text-muted-foreground">Matched</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm bg-status-review" />
                            <span className="text-xs text-muted-foreground">To Review</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm bg-status-not-matched" />
                            <span className="text-xs text-muted-foreground">Not Matched</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

