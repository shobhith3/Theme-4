"use server";

import prisma from "@/lib/prisma";
import { validateUserAccess } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function updateOrganizationSettings(input: {
  name: string;
  currency: string;
  leadTimeBuffer: number;
}) {
  const { user } = await validateUserAccess();
  
  await prisma.organization.update({
    where: { id: user.organizationId },
    data: {
      name: input.name,
      currency: input.currency,
      leadTimeBuffer: input.leadTimeBuffer,
    }
  });

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}

export async function toggleAutoApprovalRule(ruleId: string, isEnabled: boolean) {
  const { user } = await validateUserAccess();
  
  // Verify rule belongs to org
  const rule = await prisma.autoApprovalRule.findUnique({
    where: { id: ruleId }
  });

  if (!rule || rule.organizationId !== user.organizationId) {
    throw new Error("Rule not found or access denied.");
  }

  await prisma.autoApprovalRule.update({
    where: { id: ruleId },
    data: { active: isEnabled }
  });

  revalidatePath("/settings");
  return { success: true };
}
