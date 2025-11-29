"use client"

import * as React from "react"
import { ColumnDef, ColumnFiltersState, PaginationState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plus, Eye } from "lucide-react"

import { DataTableViewOptions } from "./data-table-view-options"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableFilter } from "./data-table-filter"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data?: TData[]
    /** Optional column id for text filter */
    filterColumn?: string
    /** Optional dropdown filter configuration */
    dropdownColumn?: string
    dropdownOptions?: string[]
    /** Optional callbacks for CRUD actions */
    onAdd?: () => void
    onEdit?: (row: TData) => void
    onDelete?: (row: TData) => void
    onView?: (row: TData) => void
    tableName?: string
    tableNameClass?: string

    /* Server-side pagination props */
    manualPagination?: boolean
    pageCount?: number
    pagination?: PaginationState
    onPaginationChange?: (pagination: PaginationState) => void
    isLoading?: boolean
    totalRows?: number
}

export function DataTable<TData, TValue>({ columns,
    data,
    filterColumn,
    dropdownColumn,
    dropdownOptions = [],
    onAdd,
    onEdit,
    onDelete,
    onView,
    tableName,
    tableNameClass,

    /* Server-side pagination props */
    manualPagination,
    pageCount,
    pagination: externalPagination,  
    onPaginationChange,
    isLoading,
    totalRows,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10
    })

    // Use external pagination for manual mode, internal for client-side
    const pagination = manualPagination ? externalPagination || internalPagination : internalPagination
    
    // Handle pagination change with proper typing for TanStack Table
    const handlePaginationChange = React.useCallback((updaterOrValue: any) => {
        const newPagination = typeof updaterOrValue === 'function' 
            ? updaterOrValue(pagination) 
            : updaterOrValue
        
        if (manualPagination && onPaginationChange) {
            onPaginationChange(newPagination)
        } else {
            setInternalPagination(newPagination)
        }
    }, [pagination, manualPagination, onPaginationChange])

    React.useEffect(() => {
        if (manualPagination && onPaginationChange && externalPagination) {
            // Sync internal state with external when needed
            setInternalPagination(externalPagination)
        }
    }, [externalPagination, manualPagination, onPaginationChange])

    // Extend columns with an "Actions" column automatically
    const enhancedColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
        return [
            ...columns,
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <div className="flex gap-2 justify-center items-center">
                        {onView && (
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="View"
                                onClick={() => onView(row.original)}
                                className="hover:bg-blue-200"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        )}
                        {onEdit && (
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Edit"
                                onClick={() => onEdit(row.original)}
                                className="hover:bg-blue-200"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Delete"
                                onClick={() => onDelete(row.original)}
                                className="hover:bg-red-200"
                            >
                                <Trash2 className="h-4 w-4 stroke-red-500" />
                            </Button>
                        )}
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            },
        ]
    }, [columns, onView, onEdit, onDelete, tableName, tableNameClass])

    const table = useReactTable({
        data: data || [],
        columns: enhancedColumns,
        getCoreRowModel: getCoreRowModel(),
        // getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: handlePaginationChange,
        ...(manualPagination 
            ? { 
                manualPagination: true,
                pageCount: pageCount ?? -1
              }
            : { getPaginationRowModel: getPaginationRowModel() }
        ),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
    })
    // const totalRows = table.getRowModel().rows.length

    // const manualPagination = false; // Set to true if using server-side pagination

    return (
        <div className="w-full space-y-4">
            {/* {tableName && (
                <div className="px-2 py-2">
                    <h2 className={tableNameClass}>{tableName}</h2>
                </div>
            )} */}
            {/* Toolbar section */}
            <div className="flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-2">
                    {/* Filter and dropdown */}
                    {(filterColumn || dropdownColumn) && (
                        <DataTableFilter
                            table={table}
                            filterColumn={filterColumn}
                            dropdownColumn={dropdownColumn}
                            dropdownOptions={dropdownOptions}
                        />
                    )}
                    <DataTableViewOptions table={table} />
                </div>

                {/* Add button */}
                {onAdd && (
                    <Button variant='outline' onClick={onAdd} className="flex items-center gap-1">
                        <Plus className="h-4 w-4" />
                        Add
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader className="bg-gray-50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="font-medium text-gray-900">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={enhancedColumns.length}
                                    className="h-24 text-center"
                                >
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={enhancedColumns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <DataTablePagination 
                table={table} 
                totalRows={totalRows}
                isServerSide={manualPagination}
            />
        </div>
    )
}
