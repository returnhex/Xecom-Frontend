"use client";

import { useState } from "react";
import {
  useDeleteCountryMutation,
  useGetAllCountriesQuery,
} from "@/redux/features/location/country.api";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { TCountry } from "@/types/location.type";
import { TablePagination } from "@/components/custom/TablePagination";
import { SortableTableHead } from "@/components/custom/SortableTableHead";
import { Loader2, Search, Pencil, Trash2 } from "lucide-react";
import { useTableSort } from "@/hooks/useTableSort";
import { useTablePagination } from "@/hooks/useTablePagination";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type SortableFields = "name";

interface CountryTableProps {
  onEdit: (country: TCountry) => void;
}

export default function CountryTable({ onEdit }: CountryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<TCountry | null>(null);

  const [deleteCountry, { isLoading: isDeleting }] = useDeleteCountryMutation();

  const debouncedSearchTerm = useDebounce(searchTerm);

  const { handleSort, getSortIcon, getSortParams } = useTableSort<SortableFields>();
  const { handlePageChange, handlePageSizeChange, getPaginationParams, resetPage } =
    useTablePagination({ initialPageNumber: 1, initialPageSize: 10 });

  //   const buildQueryParams = () => {
  //     const params = [...getPaginationParams(), ...getSortParams()];

  //     if (debouncedSearchTerm)
  //       params.push({ name: "searchTerm", value: debouncedSearchTerm });
  //     if (selectedCountry) params.push({ name: "sort", value: selectedCountry });
  //     return params;
  //   };

  const buildQueryParams = () => {
    const params = [...getPaginationParams(), ...getSortParams()];

    // priority: select > search input
    const finalSearchTerm = selectedCountry || debouncedSearchTerm;

    if (finalSearchTerm) {
      params.push({ name: "searchTerm", value: finalSearchTerm });
    }

    return params;
  };

  const { data, isLoading, isFetching, isError } = useGetAllCountriesQuery(buildQueryParams());

  const countries = data?.data || [];
  const hasNoData = countries.length === 0 && !isLoading;
  const isRefetching = isFetching && !isLoading;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    resetPage();
  };

  const handleFilterChange = () => {
    resetPage();
  };

  const handleSortClick = (field: SortableFields) => {
    handleSort(field);
    resetPage();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCountry("");
    resetPage();
  };

  const handleDeleteClick = (country: TCountry) => {
    setCountryToDelete(country);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!countryToDelete) return;

    try {
      const result = await deleteCountry(countryToDelete.id).unwrap();
      toast.success(result?.message || "Country deleted successfully");
      setDeleteDialogOpen(false);
      setCountryToDelete(null);
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete Country";
      toast.error(errorMessage);
    }
  };

  const hasActiveFilters = debouncedSearchTerm || selectedCountry;

  return (
    <>
      {/* Filters Section */}

      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative w-full max-w-80">
          <Search className="text-muted-foreground absolute top-1/2 left-3 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={`pl-9 ${searchTerm ? "border-primary bg-primary/5" : ""}`}
          />
        </div>
      </div>

      <div
        className={`relative transition-opacity duration-200 ${
          isRefetching ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {isRefetching && (
          <div className="absolute top-3 right-3 z-10">
            <Loader2 className="text-primary h-5 w-5 animate-spin" />
          </div>
        )}

        <div className="border-border rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  field="name"
                  label="Country Name"
                  onSort={handleSortClick}
                  getSortIcon={getSortIcon}
                  disabled={hasNoData}
                />
                <TableHead>Total Divisions</TableHead>
                <TableHead className="w-24">Total Districts</TableHead>
                <TableHead className="w-32">Total Thanas</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoading colSpan={5} rows={5} />
              ) : isError ? (
                <TableError colSpan={5}>Error loading countries. Please try again.</TableError>
              ) : countries.length === 0 ? (
                <TableEmpty colSpan={5}>No country found</TableEmpty>
              ) : (
                countries.map((country: TCountry) => (
                  <TableRow key={country.id}>
                    <TableCell className="font-medium">
                      {country.code ? (
                        <p>
                          {country.name} {`(${country.code})`}
                        </p>
                      ) : (
                        <p>{country.name}</p>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{country._count?.divisions ?? 0}</TableCell>
                    <TableCell className="font-medium">{country._count?.districts ?? 0}</TableCell>
                    <TableCell className="font-medium">{country._count?.thanas ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(country)}
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
                              onClick={() => handleDeleteClick(country)}
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
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the country &quot;
              {countryToDelete?.name}&quot;. This action cannot be undone.
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
