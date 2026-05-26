"use client";

import { useState } from "react";
import {
  useGetAllDistrictQuery,
  useDeleteDistrictMutation,
} from "@/redux/features/location/district.api";

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

import { TDistrict } from "@/types/location.type";
import { TablePagination } from "@/components/custom/TablePagination";
import { SortableTableHead } from "@/components/custom/SortableTableHead";
import { Loader2, Pencil, Trash2, Search } from "lucide-react";
import { useTableSort } from "@/hooks/useTableSort";
import { useTablePagination } from "@/hooks/useTablePagination";
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

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import CustomSelect, { SelectOption } from "@/components/custom/CustomSelect";
import { API_URL } from "@/redux/api/baseApi";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type SortableFields = "name";

interface DistrictTableProps {
  onEdit: (district: TDistrict) => void;
}

export default function DistrictTable({ onEdit }: DistrictTableProps) {
  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<SelectOption | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { handleSort, getSortIcon, getSortParams } = useTableSort<SortableFields>();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [districtToDelete, setDistrictToDelete] = useState<TDistrict | null>(null);
  const [deleteDistrict, { isLoading: isDeleting }] = useDeleteDistrictMutation();

  const { handlePageChange, handlePageSizeChange, getPaginationParams, resetPage } =
    useTablePagination({ initialPageNumber: 1, initialPageSize: 10 });

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm);

  //  buildQueryParams to:
  const buildQueryParams = () => {
    const params = [...getPaginationParams(), ...getSortParams()];

    if (debouncedSearchTerm) {
      params.push({ name: "searchTerm", value: debouncedSearchTerm });
    }

    if (selectedCountry?.value) {
      params.push({ name: "countryId", value: selectedCountry.value.toString() });
    }

    if (selectedDivision?.value) {
      params.push({ name: "divisionId", value: selectedDivision.value.toString() });
    }

    return params;
  };

  const { data, isLoading, isFetching, isError } = useGetAllDistrictQuery(buildQueryParams());

  const districts = data?.data || [];
  const hasNoData = districts.length === 0 && !isLoading;
  const isRefetching = isFetching && !isLoading;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    resetPage();
  };

  const handleFilterChange = () => {
    resetPage();
  };

  const clearFilters = () => {
    setSelectedCountry(null);
    setSelectedDivision(null);
    setSearchTerm("");
    resetPage();
  };

  const handleSortClick = (field: SortableFields) => {
    handleSort(field);
    resetPage();
  };

  const handleDeleteClick = (district: TDistrict) => {
    setDistrictToDelete(district);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!districtToDelete) return;

    try {
      const result = await deleteDistrict(districtToDelete.id).unwrap();
      toast.success(result?.message || "District deleted successfully");
      setDeleteDialogOpen(false);
      setDistrictToDelete(null);
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete District";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div>
        {/* Filters Section */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-80">
            <Search className="text-muted-foreground absolute top-1/2 left-3 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={`pl-9 ${searchTerm ? "border-primary bg-primary/5" : ""}`}
            />
          </div>

          <div className="flex items-center gap-x-4">
            {/* Country Filter */}
            <div
              className={`max-w-64 min-w-44 ${selectedCountry ? "[&_button]:border-primary [&_button]:bg-primary/5" : ""
                }`}
            >
              <CustomSelect
                endpoint={`${API_URL}/country`}
                fields={["id", "name"]}
                mapToOption={(item) => ({
                  value: item.id,
                  label: item.name,
                })}
                value={selectedCountry}
                onChange={(val) => {
                  const option = val as SelectOption | null;
                  setSelectedCountry(option);
                  setSelectedDivision(null);
                  handleFilterChange();
                }}
                searchable
                paginated
                loadingStyle="eager"
                placeholder="All Countries"
              />
            </div>

            {/* Division Filter */}
            <div
              className={`max-w-64 min-w-44 ${selectedDivision ? "[&_button]:border-primary [&_button]:bg-primary/5" : ""
                }`}
            >
              <CustomSelect
                endpoint={`${API_URL}/division`}
                fields={["id", "name"]}
                extraParams={{ countryId: selectedCountry?.value?.toString() || "" }}
                mapToOption={(item) => ({
                  value: item.id,
                  label: item.name,
                })}
                value={selectedDivision}
                onChange={(val) => {
                  const option = val as SelectOption | null;
                  setSelectedDivision(option);
                  handleFilterChange();
                }}
                searchable
                paginated
                loadingStyle="eager"
                placeholder="All Divisions"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          className={`relative transition-opacity duration-200 ${isRefetching ? "pointer-events-none opacity-60" : ""
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
                    label="District Name"
                    onSort={handleSortClick}
                    getSortIcon={getSortIcon}
                    disabled={hasNoData}
                  />
                  <TableHead className="w-24">Total Thanas</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableLoading colSpan={3} rows={5} />
                ) : isError ? (
                  <TableError colSpan={3}>Error loading District. Please try again.</TableError>
                ) : districts.length === 0 ? (
                  <TableEmpty colSpan={3}>No District found</TableEmpty>
                ) : (
                  districts.map((district: TDistrict) => (
                    <TableRow key={district.id}>
                      <TableCell className="font-medium">{district.name}</TableCell>
                      <TableCell>{district._count?.thanas ?? 0}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(district)}
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
                                onClick={() => handleDeleteClick(district)}
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
                This will permanently delete the district &quot;{districtToDelete?.name}&quot;. This
                action cannot be undone.
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
      </div>
    </>
  );
}
