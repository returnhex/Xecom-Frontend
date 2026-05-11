"use client";

import { useState } from "react";
import { useGetAllThanasQuery, useDeleteThanaMutation } from "@/redux/features/location/thana.api";
import { useGetAllCountriesQuery } from "@/redux/features/location/country.api";
import { useGetAllDivisonQuery } from "@/redux/features/location/division.api";
import { useGetAllDistrictQuery } from "@/redux/features/location/district.api";

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

import { TThana } from "@/types/location.type";
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
import CustomSelect, { SelectOption } from "@/components/custom/CustomSelect";
import { API_URL } from "@/redux/api/baseApi";
import { useDebounce } from "@/hooks/useDebounce";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type SortableFields = "name";

interface ThanaTableProps {
  onEdit: (thana: TThana) => void;
}

export default function ThanaTable({ onEdit }: ThanaTableProps) {
  const [selectedCountry, setSelectedCountry] = useState<SelectOption[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<SelectOption[]>([]);

  const [selectedDistrict, setSelectedDistrict] = useState<SelectOption[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const { handleSort, getSortIcon, getSortParams } = useTableSort<SortableFields>();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [thanaToDelete, setThanaToDelete] = useState<TThana | null>(null);

  const [deleteThana, { isLoading: isDeleting }] = useDeleteThanaMutation();

  const { handlePageChange, handlePageSizeChange, getPaginationParams, resetPage } =
    useTablePagination({ initialPageNumber: 1, initialPageSize: 10 });

  const { data: countryData } = useGetAllCountriesQuery([]);
  const countries = countryData?.data || [];

  const { data: divisionData } = useGetAllDivisonQuery([]);
  const divisions = divisionData?.data || [];

  const { data: districtData } = useGetAllDistrictQuery([]);
  const districts = districtData?.data || [];

  const getDistrict = (districtId: string) =>
    districts.find((d) => String(d.id) === String(districtId));

  const getDivision = (districtId: string) => {
    const district = getDistrict(districtId);
    return divisions.find((div) => div.id === district?.divisionId);
  };

  const getCountry = (districtId: string) => {
    const division = getDivision(districtId);
    return countries.find((c) => c.id === division?.countryId);
  };

  const getDistrictName = (districtId: string) => getDistrict(districtId)?.name || "N/A";
  const getDivisionName = (districtId: string) => getDivision(districtId)?.name || "N/A";
  const getCountryName = (districtId: string) => getCountry(districtId)?.name || "N/A";

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
    if (selectedDistrict && "value" in selectedDistrict) {
      params.push({ name: "districtId", value: selectedDistrict.value.toString() });
    }

    return params;
  };

  const { data, isLoading, isError } = useGetAllThanasQuery(buildQueryParams());
  const thanas = data?.data || [];
  const hasNoData = thanas.length === 0 && !isLoading;

  const clearFilters = () => {
    setSelectedCountry([]);
    setSelectedDivision([]);
    setSelectedDistrict([]);
    resetPage();
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    resetPage();
  };

  const handleSortClick = (field: SortableFields) => {
    handleSort(field);
    resetPage();
  };

  const handleFilterChange = () => {
    resetPage();
  };

  const handleDeleteClick = (thana: TThana) => {
    setThanaToDelete(thana);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!thanaToDelete) return;

    try {
      const result = await deleteThana(thanaToDelete.id).unwrap();
      toast.success(result?.message || "Thana deleted successfully");
      setDeleteDialogOpen(false);
      setThanaToDelete(null);
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete thana";
      toast.error(errorMessage);
    }
  };

  return (
    <>
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
          <div
            className={`max-w-64 min-w-44 ${
              selectedDivision?.length ? "[&_button]:border-primary [&_button]:bg-primary/5" : ""
            }`}
          >
            <CustomSelect
              endpoint={`${API_URL}/district`}
              fields={["name", "id"]}
              mapToOption={(item) => ({
                value: item.id,
                label: item.name,
              })}
              value={selectedDistrict}
              onChange={(vals) => {
                setSelectedDistrict(vals as SelectOption[]);
                handleFilterChange();
              }}
              searchable
              paginated
              placeholder="All District"
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
                label="Thana Name"
                onSort={handleSortClick}
                getSortIcon={getSortIcon}
                disabled={hasNoData}
              />
              <TableHead>Country</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>District</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableLoading colSpan={5} rows={5} />
            ) : isError ? (
              <TableError colSpan={5}>Error loading thana. Please try again.</TableError>
            ) : thanas.length === 0 ? (
              <TableEmpty colSpan={5}>No thana found</TableEmpty>
            ) : (
              thanas.map((thana: TThana) => (
                <TableRow key={thana.id}>
                  <TableCell className="font-medium">{thana.name}</TableCell>
                  <TableCell>{getCountryName(thana.districtId)}</TableCell>
                  <TableCell>{getDivisionName(thana.districtId)}</TableCell>
                  <TableCell>{getDistrictName(thana.districtId)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(thana)}
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
                            onClick={() => handleDeleteClick(thana)}
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
              This will permanently delete the thana &quot;{thanaToDelete?.name}&quot;. This action
              cannot be undone.
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
