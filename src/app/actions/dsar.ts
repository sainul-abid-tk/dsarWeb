"use server";

import { prisma } from "@/lib/prisma";
import { DsarRequestSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function submitDsarRequest(
  companyId: string,
  data: any
) {
  try {
    const validated = DsarRequestSchema.parse(data);

    const request = await prisma.dsarRequest.create({
      data: {
        companyId,
        requesterName: validated.requesterName,
        requesterEmail: validated.requesterEmail,
        requesterPhone: validated.requesterPhone,
        requestText: validated.requestText,
        status: "open",
      },
    });

    // Log notification (stub)
    console.log(`[NOTIFICATION] New DSAR Request: ${request.id} from ${validated.requesterEmail}`);

    revalidatePath(`/owner`);
    revalidatePath(`/admin`);
    return { success: true, request };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function getCompanyDsarRequests(companyId: string, limit = 10, offset = 0) {
  try {
    const [requests, total] = await Promise.all([
      prisma.dsarRequest.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.dsarRequest.count({
        where: { companyId },
      }),
    ]);

    return { requests, total };
  } catch (error) {
    console.error("Error fetching DSAR requests:", error);
    return { requests: [], total: 0 };
  }
}

export async function getAllDsarRequests(limit = 10, offset = 0) {
  try {
    const [requests, total] = await Promise.all([
      prisma.dsarRequest.findMany({
        include: { company: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.dsarRequest.count(),
    ]);

    return { requests, total };
  } catch (error) {
    console.error("Error fetching DSAR requests:", error);
    return { requests: [], total: 0 };
  }
}

export async function updateDsarRequestStatus(
  requestId: string,
  status: string,
  notes?: string
) {
  try {
    const request = await prisma.dsarRequest.update({
      where: { id: requestId },
      data: {
        status,
        notes: notes || undefined,
      },
    });

    revalidatePath("/owner");
    revalidatePath("/admin");
    return { success: true, request };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
