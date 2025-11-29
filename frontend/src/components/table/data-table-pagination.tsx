import { Table } from "@tanstack/react-table"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
    table: Table<TData>
    totalRows?: number
    isServerSide?: boolean
}

export function DataTablePagination<TData>({
    table,
    totalRows,
    isServerSide = false,
}: DataTablePaginationProps<TData>) {
    const currentPage = table.getState().pagination.pageIndex + 1;
    const pageSize = table.getState().pagination.pageSize;
    const totalPages = table.getPageCount();

    // Calculate display values for server-side pagination
    const getDisplayValues = () => {
        if (isServerSide && totalRows !== undefined) {
            const startRow = (currentPage - 1) * pageSize + 1;
            const endRow = Math.min(currentPage * pageSize, totalRows);
            return {
                showing: `${startRow}-${endRow} of ${totalRows.toLocaleString()}`,
                selectedInfo: `${table.getFilteredSelectedRowModel().rows.length} row(s) selected`
            };
        } else {
            // Client-side pagination
            const filteredRows = table.getFilteredRowModel().rows.length;
            return {
                showing: `${table.getFilteredSelectedRowModel().rows.length} of ${filteredRows}`,
                selectedInfo: `${table.getFilteredSelectedRowModel().rows.length} of ${filteredRows} row(s) selected`
            };
        }
    };

    const { showing, selectedInfo } = getDisplayValues();

    return (
        <div className="flex items-center justify-between px-2">
            <div className="text-muted-foreground flex-1 text-sm">
                {isServerSide ? (
                    <div className="flex flex-col gap-1">
                        <span>Showing {showing} rows</span>
                        <span className="text-xs">{selectedInfo}</span>
                    </div>
                ) : (
                    selectedInfo
                )}
            </div>

            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 25, 30, 40, 50, 100].map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {currentPage} of {totalPages === -1 ? '...' : totalPages}
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        title="Go to first page"
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        title="Go to previous page"
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        title="Go to next page"
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() => table.setPageIndex(totalPages - 1)}
                        disabled={!table.getCanNextPage() || totalPages === -1}
                        title="Go to last page"
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}