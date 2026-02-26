import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { Header } from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { siloRecords, type SiloRecord } from '@/data/sampleData';
import {
    ArrowLeft,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Filter,
    Download,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

function StatusBadge({ status }: { status: SiloRecord['status'] }) {
    const variantMap = {
        Matched: 'matched' as const,
        'To Review': 'review' as const,
        'Not Matched': 'notMatched' as const,
    };

    return <Badge variant={variantMap[status]}>{status}</Badge>;
}

export function TablePage() {
    const navigate = useNavigate();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});

    const columns = useMemo<ColumnDef<SiloRecord>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <input
                        type="checkbox"
                        checked={table.getIsAllRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                        className="rounded border-gray-300 accent-primary cursor-pointer"
                    />
                ),
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                        className="rounded border-gray-300 accent-primary cursor-pointer"
                    />
                ),
                size: 40,
                enableSorting: false,
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ getValue }) => (
                    <StatusBadge status={getValue() as SiloRecord['status']} />
                ),
                size: 120,
            },
            {
                accessorKey: 'recordId',
                header: 'Record ID',
                size: 110,
            },
            {
                accessorKey: 'timestamp',
                header: 'Timestamp',
                size: 170,
            },
            {
                accessorKey: 'siloName',
                header: 'Silo Name',
                size: 100,
            },
            {
                accessorKey: 'product',
                header: 'Product',
                size: 100,
            },
            {
                accessorKey: 'quantity',
                header: 'Quantity',
                cell: ({ getValue }) => (getValue() as number).toLocaleString(),
                size: 100,
            },
            {
                accessorKey: 'unit',
                header: 'Unit',
                size: 60,
            },
            {
                accessorKey: 'vendor',
                header: 'Vendor',
                size: 120,
            },
            {
                accessorKey: 'batchNo',
                header: 'Batch No',
                size: 130,
            },
            {
                accessorKey: 'loadDate',
                header: 'Load Date',
                size: 110,
            },
            {
                accessorKey: 'moisture',
                header: 'Moisture %',
                cell: ({ getValue }) => `${getValue()}`,
                size: 100,
            },
        ],
        []
    );

    const table = useReactTable({
        data: siloRecords,
        columns,
        state: { sorting, globalFilter, rowSelection },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            pagination: { pageSize: 5 },
        },
    });

    const getRowBg = (status: string) => {
        switch (status) {
            case 'Matched':
                return 'bg-status-matched/10 hover:bg-status-matched/20';
            case 'To Review':
                return 'bg-status-review/10 hover:bg-status-review/20';
            case 'Not Matched':
                return 'bg-status-not-matched/10 hover:bg-status-not-matched/20';
            default:
                return '';
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header title="Home Page" subtitle="Manage your reviews" />

            <main className="max-w-[1400px] mx-auto p-6">
                {/* Table Header */}
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
                            <h2 className="text-xl font-bold text-foreground">
                                Silo Matching Review
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Detailed matching data table
                            </p>
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

                {/* Table */}
                <div className="rounded-xl border border-border overflow-hidden shadow-sm bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id} className="bg-primary">
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="px-3 py-3 text-left text-xs font-semibold text-primary-foreground whitespace-nowrap"
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
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
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
                                {table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={`border-b border-border/50 transition-colors duration-150 ${getRowBg(
                                            row.original.status
                                        )}`}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="px-3 py-3 whitespace-nowrap text-foreground"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                        {Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            table.getFilteredRowModel().rows.length
                        )}{' '}
                        of {table.getFilteredRowModel().rows.length} records
                    </p>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            className="h-8 w-8"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground px-2">
                            Page {table.getState().pagination.pageIndex + 1} of{' '}
                            {table.getPageCount()}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-8 w-8"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            className="h-8 w-8"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Status Legend */}
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
