"use client";

import { useState } from "react";
import {
  useDeleteCouponMutation,
  useGetAllCouponsQuery,
} from "@/redux/features/marketing/coupon.api";

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
import { TCoupon } from "@/types/marketing.type";
import { CouponType } from "@/constants/enum";
import { TablePagination } from "@/components/custom/TablePagination";
import { SortableTableHead } from "@/components/custom/SortableTableHead";
import { Loader2, Search, Pencil, Trash2 } from "lucide-react";
import { useTableSort } from "@/hooks/useTableSort";
import { useTablePagination } from "@/hooks/useTablePagination";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type SortableFields = "name" | "code";

interface CouponTableProps {
  onEdit: (coupon: TCoupon) => void;
}

const typeLabels: Record<CouponType, string> = {
  [CouponType.PERCENTAGE]: "Percentage",
  [CouponType.FIXED_AMOUNT]: "Fixed Amount",
  [CouponType.FREE_SHIPPING]: "Free Shipping",
  [CouponType.BUY_X_GET_Y]: "Buy X Get Y",
};

const formatValue = (coupon: TCoupon) => {
  if (coupon.type === CouponType.PERCENTAGE) return `${coupon.value}%`;
  if (coupon.type === CouponType.FREE_SHIPPING) return "Free Shipping";
  return coupon.value;
};

export default function CouponTable({ onEdit }: CouponTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<TCoupon | null>(null);

  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

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

  const { data, isLoading, isFetching, isError } = useGetAllCouponsQuery(buildQueryParams());

  const coupons = data?.data || [];
  const hasNoData = coupons.length === 0 && !isLoading;
  const isRefetching = isFetching && !isLoading;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    resetPage();
  };

  const handleSortClick = (field: SortableFields) => {
    handleSort(field);
    resetPage();
  };

  const handleDeleteClick = (coupon: TCoupon) => {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;

    try {
      const result = await deleteCoupon(couponToDelete.id).unwrap();
      toast.success(result?.message || "Coupon deleted successfully");
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete coupon";
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
                <SortableTableHead
                  field="code"
                  label="Code"
                  onSort={handleSortClick}
                  getSortIcon={getSortIcon}
                  disabled={hasNoData}
                />
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-24">Usage</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoading colSpan={7} rows={5} />
              ) : isError ? (
                <TableError colSpan={7}>Error loading coupons. Please try again.</TableError>
              ) : coupons.length === 0 ? (
                <TableEmpty colSpan={7}>No coupon found</TableEmpty>
              ) : (
                coupons.map((coupon: TCoupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{coupon.code}</Badge>
                    </TableCell>
                    <TableCell>{typeLabels[coupon.type] ?? coupon.type}</TableCell>
                    <TableCell className="font-medium">{formatValue(coupon)}</TableCell>
                    <TableCell>
                      {coupon.usageCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                    </TableCell>
                    <TableCell>
                      <Badge variant={coupon.isActive ? "default" : "secondary"}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(coupon)}
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
                              onClick={() => handleDeleteClick(coupon)}
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
              This will permanently delete the coupon &quot;
              {couponToDelete?.name}&quot;. This action cannot be undone.
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
