"use client";

import { useMemo, useState } from "react";
import {
  useGetAllDistrictQuery,
  useDeleteDistrictMutation,
} from "@/redux/features/location/district.api";
import { useGetAllCountriesQuery } from "@/redux/features/location/country.api";
import { useGetAllDivisonQuery } from "@/redux/features/location/division.api";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TDistrict } from "@/types/location.type";
import { TablePagination } from "@/components/custom/TablePagination";
import { SortableTableHead } from "@/components/custom/SortableTableHead";
import { X, Pencil, Trash2, Search } from "lucide-react";
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
  const [selectedCountry, setSelectedCountry] = useState<SelectOption[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<SelectOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { handleSort, getSortIcon, getSortParams } = useTableSort<SortableFields>();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [districtToDelete, setDistrictToDelete] = useState<TDistrict | null>(null);
  const [deleteDistrict, { isLoading: isDeleting }] = useDeleteDistrictMutation();

  const { handlePageChange, handlePageSizeChange, getPaginationParams, resetPage } =
    useTablePagination({ initialPageNumber: 1, initialPageSize: 10 });

  const { data: countryData } = useGetAllCountriesQuery([]);
  const countries = countryData?.data || [];

  const { data: divisionData } = useGetAllDivisonQuery([]);
  const divisions = divisionData?.data || [];

  const getDivisionName = (divisionId: string) => {
    const division = divisions.find((d: any) => String(d.id) === String(divisionId));
    return division?.name || "N/A";
  };

  const getCountryName = (divisionId: string) => {
    const division = divisions.find((d: any) => String(d.id) === String(divisionId));
    const country = countries.find((c: any) => String(c.id) === String(division?.countryId));
    return country?.name || "N/A";
  };

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

    if (selectedDivision && "value" in selectedDivision) {
      params.push({ name: "divisionId", value: selectedDivision.value.toString() });
    }

    return params;
  };

  const { data, isLoading, isError } = useGetAllDistrictQuery(buildQueryParams());

  const districts = data?.data || [];
  const hasNoData = districts.length === 0 && !isLoading;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    resetPage();
  };

  const handleFilterChange = () => {
    resetPage();
  };

  const clearFilters = () => {
    setSelectedCountry([]);
    setSelectedDivision([]);
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

            {/* division Filter */}
            <div
              className={`max-w-64 min-w-44 ${
                selectedDivision?.length ? "[&_button]:border-primary [&_button]:bg-primary/5" : ""
              }`}
            >
              <CustomSelect
                endpoint={`${API_URL}/division`}
                fields={["name", "id"]}
                mapToOption={(item) => ({
                  value: item.id,
                  label: item.name,
                })}
                value={selectedDivision}
                onChange={(vals) => {
                  setSelectedDivision(vals as SelectOption[]);
                  handleFilterChange();
                }}
                searchable
                paginated
                placeholder="All Divisions"
              />
            </div>
          </div>
        </div>

        {/* Table */}
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
                <TableHead>Division</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="w-24">Total Thanas</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableLoading colSpan={4} rows={5} />
              ) : isError ? (
                <TableError colSpan={4}>Error loading District. Please try again.</TableError>
              ) : districts.length === 0 ? (
                <TableEmpty colSpan={4}>No District found</TableEmpty>
              ) : (
                districts.map((district: TDistrict) => (
                  <TableRow key={district.id}>
                    <TableCell className="font-medium">{district.name}</TableCell>
                    <TableCell>{getDivisionName(district.divisionId)}</TableCell>
                    <TableCell>{getCountryName(district.divisionId)}</TableCell>
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
