"use client";

import { useState, useMemo } from "react";
import {
  useGetAllDivisonQuery,
  useDeleteDivisionMutation,
} from "@/redux/features/location/division.api";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableEmpty,
  TableLoading,
  TableError,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { TDivision } from "@/types/location.type";
import { TablePagination } from "@/components/custom/TablePagination";
import { SortableTableHead } from "@/components/custom/SortableTableHead";

import { Pencil, Trash2, Search } from "lucide-react";

import { useTableSort } from "@/hooks/useTableSort";
import { useTablePagination } from "@/hooks/useTablePagination";
import { useDebounce } from "@/hooks/useDebounce";

import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import CustomSelect, { SelectOption } from "@/components/custom/CustomSelect";

import { API_URL } from "@/redux/api/baseApi";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type SortableFields = "name";

interface DivisionTableProps {
  onEdit: (division: TDivision) => void;
}

export default function DivisionTable({ onEdit }: DivisionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<SelectOption[]>([]);

  const { handleSort, getSortIcon, getSortParams } = useTableSort<SortableFields>();

  const { handlePageChange, handlePageSizeChange, getPaginationParams, resetPage } =
    useTablePagination({
      initialPageNumber: 1,
      initialPageSize: 10,
    });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [divisionToDelete, setDivisionToDelete] = useState<TDivision | null>(null);

  const [deleteDivision, { isLoading: isDeleting }] = useDeleteDivisionMutation();

  /* ---------------- Search ---------------- */

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    resetPage();
  };

  /* ---------------- Filter ---------------- */

  const handleFilterChange = () => {
    resetPage();
  };

  /* ---------------- Sort ---------------- */

  const handleSortClick = (field: SortableFields) => {
    handleSort(field);
    resetPage();
  };

  /* ---------------- Query Params ---------------- */

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm);

  //  buildQueryParams to:
  const buildQueryParams = () => {
    const params = [...getPaginationParams(), ...getSortParams()];

    if (debouncedSearchTerm) {
      params.push({ name: "searchTerm", value: debouncedSearchTerm });
    }

    // single object handle
    if (selectedCountry && "value" in selectedCountry) {
      params.push({ name: "countryId", value: selectedCountry.value.toString() });
    }

    return params;
  };
  const { data, isLoading, isError } = useGetAllDivisonQuery(buildQueryParams());

  const divisions = data?.data || [];

  const hasNoData = divisions.length === 0 && !isLoading;

  /* ---------------- Delete ---------------- */

  const handleDeleteClick = (division: TDivision) => {
    setDivisionToDelete(division);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!divisionToDelete) return;

    try {
      const result = await deleteDivision(divisionToDelete.id).unwrap();

      toast.success(result?.message || "Division deleted successfully");

      setDeleteDialogOpen(false);
      setDivisionToDelete(null);
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete Division";

      toast.error(errorMessage);
    }
  };

  return (
    <>
      {/* -------- Filters ---- */}

      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}

        <div className="relative w-full max-w-80">
          <Search className="text-muted-foreground absolute top-1/2 left-3 w-4 -translate-y-1/2" />

          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={`pl-9 ${searchTerm ? "border-primary bg-primary/5" : ""}`}
          />
        </div>

        {/* Country Filter */}

        <div
          className={`max-w-64 min-w-44 ${
            selectedCountry?.length ? "[&_button]:border-primary [&_button]:bg-primary/5" : ""
          }`}
        >
          <CustomSelect
            endpoint={`${API_URL}/country`}
            fields={["name", "id"]}
            mapToOption={(item) => ({
              value: item.id,
              label: item.name,
            })}
            value={selectedCountry}
            onChange={(vals) => {
              setSelectedCountry(vals as SelectOption[]);
              handleFilterChange();
            }}
            searchable
            paginated
            placeholder="All Countries"
          />
        </div>
      </div>

      {/* -------- Table -------- */}

      <div className="border-border rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                field="name"
                label="Division Name"
                onSort={handleSortClick}
                getSortIcon={getSortIcon}
                disabled={hasNoData}
              />

              <TableHead className="w-24">Total Districts</TableHead>

              <TableHead className="w-24">Total Thanas</TableHead>

              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableLoading colSpan={4} rows={5} />
            ) : isError ? (
              <TableError colSpan={4}>Error loading division.</TableError>
            ) : divisions.length === 0 ? (
              <TableEmpty colSpan={4}>No division found</TableEmpty>
            ) : (
              divisions.map((division: TDivision) => (
                <TableRow key={division.id}>
                  <TableCell className="font-medium">{division.name}</TableCell>

                  <TableCell>{division._count?.districts ?? 0}</TableCell>

                  <TableCell>{division._count?.thanas ?? 0}</TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(division)}
                            className="hover:bg-primary/10 hover:text-primary h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(division)}
                            className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {data?.meta && (
          <TablePagination
            meta={data.meta}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            disabled={hasNoData}
          />
        )}
      </div>

      {/* -------- Delete Dialog -------- */}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete division "{divisionToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
