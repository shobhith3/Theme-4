import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import SuppliersContent from "@/components/suppliers/suppliers-content";
import { getSuppliers } from "@/app/actions/supplier-actions";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <PageContainer>
      <PageHeader
        title="Suppliers"
        description="Monitor supplier reliability, lead times, and fulfillment performance."
        actions={
          <button className="px-4 py-2 bg-[var(--color-sidebar-bg)] text-white rounded-md text-[13px] font-medium hover:bg-black transition-colors shadow-sm">
            Add Supplier
          </button>
        }
      />
      <SuppliersContent initialSuppliers={suppliers} />
    </PageContainer>
  );
}
