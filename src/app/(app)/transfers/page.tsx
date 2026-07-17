import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import TransfersContent from "@/components/transfers/transfers-content";
import { getTransfers } from "@/app/actions/transfer-actions";

export default async function TransfersPage() {
  const transfers = await getTransfers();

  return (
    <PageContainer>
      <PageHeader
        title="Inter-Branch Transfers"
        description="Monitor and manage stock moving between your locations."
      />
      <TransfersContent initialTransfers={transfers} />
    </PageContainer>
  );
}
