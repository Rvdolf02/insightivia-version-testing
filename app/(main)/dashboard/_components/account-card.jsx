"use client";

import { updateDefaultAccount } from "@/actions/accounts";
import { deleteAccount } from "@/actions/dashboard";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import useFecth from "@/hooks/use-fetch";
import {
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AccountCard = ({ account }) => {
  const { name, type, balance, id, isDefault } = account;
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error: updateError,
  } = useFecth(updateDefaultAccount);

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deletedAccount,
    error: deleteError,
  } = useFecth(deleteAccount);

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
      router.refresh();
    }
  }, [updatedAccount, router]);

  useEffect(() => {
    if (updateError) toast.error(updateError.message || "Failed to update default account");
  }, [updateError]);


  const handleDefaultChange = async (e) => {
    e.preventDefault();
    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }
    await updateDefaultFn(id);
  };

  // Called from DropdownMenuItem -> opens dialog after dropdown closes
  const handleOpenDeleteDialog = () => {
    if (isDefault) {
      // prevent opening dialog for default account, show helpful toast
      toast.warning("You cannot delete the default account. Set another account as default first.");
      return;
    }

    // Wait a tick to let the dropdown close (avoids overlapping focus traps)
    // 50ms is safe; you can reduce to 0 if you prefer but keep a small delay if you had issues.
    setTimeout(() => setOpenDialog(true), 50);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteFn(id); // just trigger, don't handle toast here
    } catch (err) {
      toast.error(err?.message || "Failed to delete account");
    } finally {
      setOpenDialog(false); // always close dialog
    }
  };

  useEffect(() => {
    if (deletedAccount?.success) {
      toast.success("Account deleted successfully");
      router.refresh();
    }
  }, [deletedAccount, router]);

  useEffect(() => {
    if (deleteError) {
      toast.error(deleteError.message || "Failed to delete account");
    }
  }, [deleteError]);



  return (
    <>
      <Card className="hover:shadow-lg transition-shadow group relative rounded-2xl border p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold capitalize">{name}</h3>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <MoreHorizontal className="h-5 w-5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-15">
                <Link href={`/account/${id}`}>
                  <div className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                    <Eye className="h-4 w-4 text-gray-600" />
                    <span>View</span>
                  </div>
                </Link>

                <CreateAccountDrawer
                  mode="edit"
                  account={account}
                  onSuccess={() => router.refresh()}
                >
                  <div className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                    <Pencil className="h-4 w-4 text-gray-600" />
                    <span>Edit</span>
                  </div>
                </CreateAccountDrawer>

                {/* Delete item: opens dialog after short delay so dropdown closes first */}
                <DropdownMenuItem
                  onClick={handleOpenDeleteDialog}
                  className="text-red-600 focus:text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <Trash className="h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Switch
              checked={isDefault}
              onClick={handleDefaultChange}
              disabled={updateDefaultLoading}
              className="scale-90"
            />
          </div>
        </div>

        {/* Balance */}
        <div className="mb-4">
          <p className="text-2xl font-bold tracking-tight">
            ₱{parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-sm text-muted-foreground">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-3 text-xs font-medium text-muted-foreground border-t">
          <div className="flex items-center gap-1 text-green-500">
            <ArrowUpRight className="h-4 w-4" /> Income
          </div>
          <div className="flex items-center gap-1 text-red-500">
            <ArrowDownRight className="h-4 w-4" /> Expense
          </div>
        </div>
      </Card>

    {/* AlertDialog (controlled) placed outside the menu */}
    <AlertDialog open={openDialog} onOpenChange={(val) => setOpenDialog(val)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete account "{name}"?
          </AlertDialogTitle>
          <p className="text-sm text-muted-foreground">
            This action will permanently delete the account <strong className="font-semibold">{name}&nbsp;</strong> 
             and all its transactions. This cannot be undone.
          </p>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <button className="px-3 py-1 rounded-md border">Cancel</button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <button
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              className="px-3 py-1 rounded-md bg-red-600 text-white disabled:opacity-60"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default AccountCard;
