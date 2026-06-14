"use client";

import { useState } from "react";
import {
  useDeleteShippingMethodMutation,
  useGetAllShippingMethodsQuery,
} from "@/redux/features/order/shipping-method.api";

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
import { Badge } from "@/components/ui/badge";
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
import { TShippingMethod } from "@/types/order.type";
import { TablePagination } from "@/components/custom/TablePagination";
import { SortableTableHead } from "@/components/custom/SortableTableHead";
import { Loader2, Search, Pencil, Trash2 } from "lucide-react";
import { useTableSort } from "@/hooks/useTableSort";
import { useTablePagination } from "@/hooks/useTablePagination";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type SortableFields = "name" | "cost";

interface ShippingMethodTableProps {
  onEdit: (shippingMethod: TShippingMethod) => void;
}

export default function ShippingMethodTable({ onEdit }: ShippingMethodTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<TShippingMethod | null>(null);

  const [deleteShippingMethod, { isLoading: isDeleting }] = useDeleteShippingMethodMutation();

  const debouncedSearchTerm = useDebounce(searchTerm);

  const { handleSort, getSortIcon, getSortParams } = useTableSort<SortableFields>();
  const { handlePageChange, handlePageSizeChange, getPaginationParams, resetPage } =
    useTablePagination({ initialPageNumber: 1, initialPageSize: 10 });

  const buildQueryParams = () => {
    const params = [...getPaginationParams(), ...getSortParams()];

    if (debouncedSearchTerm) {
      params.push({ name: "searchTerm", value: debouncedSearchTerm });
    }

    return params;
  };

  const { data, isLoading, isFetching, isError } =
    useGetAllShippingMethodsQuery(buildQueryParams());

  const shippingMethods = data?.data || [];
  const hasNoData = shippingMethods.length === 0 && !isLoading;
  const isRefetching = isFetching && !isLoading;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    resetPage();
  };

  const handleSortClick = (field: SortableFields) => {
    handleSort(field);
    resetPage();
  };

  const handleDeleteClick = (shippingMethod: TShippingMethod) => {
    setMethodToDelete(shippingMethod);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!methodToDelete) return;

    try {
      const result = await deleteShippingMethod(methodToDelete.id).unwrap();
      toast.success(result?.message || "Shipping method deleted successfully");
      setDeleteDialogOpen(false);
      setMethodToDelete(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to delete shipping method";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      {/* Filters Section */}
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative w-full max-w-80">
          <Search className="text-muted-foreground absolute top-1/2 left-3 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name or code..."
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
                  label="Name"
                  onSort={handleSortClick}
                  getSortIcon={getSortIcon}
                  disabled={hasNoData}
                />
                <TableHead>Code</TableHead>
                <SortableTableHead
                  field="cost"
                  label="Cost"
                  onSort={handleSortClick}
                  getSortIcon={getSortIcon}
                  disabled={hasNoData}
                />
                <TableHead>Estimated Days</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoading colSpan={6} rows={5} />
              ) : isError ? (
                <TableError colSpan={6}>
                  Error loading shipping methods. Please try again.
                </TableError>
              ) : shippingMethods.length === 0 ? (
                <TableEmpty colSpan={6}>No shipping method found</TableEmpty>
              ) : (
                shippingMethods.map((method: TShippingMethod) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell>{method.code}</TableCell>
                    <TableCell className="font-medium">{method.cost ?? "-"}</TableCell>
                    <TableCell>{method.estimatedDays ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant={method.isActive ? "default" : "secondary"}>
                        {method.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(method)}
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
                              onClick={() => handleDeleteClick(method)}
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
              This will permanently delete the shipping method &quot;
              {methodToDelete?.name}&quot;. This action cannot be undone.
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
