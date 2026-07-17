import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import PurchaseOrdersContent from "@/components/purchase-orders/purchase-orders-content";
import { getPurchaseOrders } from "@/app/actions/po-actions";

export default async function PurchaseOrdersPage() {
  const pos = await getPurchaseOrders();

  return (
    <PageContainer>
      <PageHeader
        title="Purchase Orders"
        description="Manage purchase orders from draft through delivery and reconciliation."
        actions={
          <button className="px-4 py-2 bg-[var(--color-sidebar-bg)] text-white rounded-md text-[13px] font-medium hover:bg-black transition-colors shadow-sm">
            Create Order
          </button>
        }
      />
      <PurchaseOrdersContent initialOrders={pos} />
    </PageContainer>
  );
}
