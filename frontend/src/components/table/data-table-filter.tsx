"use client";

import * as React from "react";
import  Input  from "@/components/customUi/customInput";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X, Filter } from "lucide-react";
import { Table } from "@tanstack/react-table";

interface DataTableFilterProps<TData> {
    table: Table<TData>;
    filterColumn?: string; // column to apply search filter
    dropdownColumn?: string; // optional column for dropdown filter
    dropdownOptions?: string[];
}

export function DataTableFilter<TData>({
    table,
    filterColumn,
    dropdownColumn,
    dropdownOptions = [],
}: DataTableFilterProps<TData>) {
    const [search, setSearch] = React.useState("");
    const [selectedFilter, setSelectedFilter] = React.useState<string | null>(
        null
    );

    // Handle text filter
    React.useEffect(() => {
        if (filterColumn) {
            table.getColumn(filterColumn)?.setFilterValue(search);
        }
    }, [search, filterColumn, table]);

    // Handle dropdown filter
    React.useEffect(() => {
        if (dropdownColumn) {
            table
                .getColumn(dropdownColumn)
                ?.setFilterValue(selectedFilter || undefined);
        }
    }, [selectedFilter, dropdownColumn, table]);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-2">
            {/* 🔍 Search filter */}
            {filterColumn && (
                <div className="flex items-center gap-2 w-auto">
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-[250px]"
                    />
                    {search && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSearch("")}
                            className="shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            )}

            {/* 🧩 Dropdown filter */}
            {dropdownColumn && dropdownOptions.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            {selectedFilter || "Filter"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {dropdownOptions.map((option) => (
                            <DropdownMenuItem
                                key={option}
                                onClick={() =>
                                    setSelectedFilter(
                                        selectedFilter === option ? null : option
                                    )
                                }
                            >
                                {option}
                            </DropdownMenuItem>
                        ))}
                        {selectedFilter && (
                            <DropdownMenuItem
                                onClick={() => setSelectedFilter(null)}
                                className="text-muted-foreground"
                            >
                                Clear Filter
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}
