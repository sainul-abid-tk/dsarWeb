"use server";

import { prisma } from "@/lib/prisma";
import { CompanyRegistrationInput, CompanyRegistrationSchema } from "@/lib/validation";
import { generateSlug } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function registerCompany(
  ownerId: string,
  data: Partial<CompanyRegistrationInput>
) {
  try {
    const validated = CompanyRegistrationSchema.parse(data);

    // Check if company already exists for this owner
    const existingCompany = await prisma.company.findUnique({
      where: { ownerId },
    });

    if (existingCompany) {
      return { success: false, error: "You already have a registered company" };
    }

    const company = await prisma.company.create({
      data: {
        ownerId,
        name: validated.name,
        address: validated.address,
        email: validated.email,
        phone: validated.phone,
        employeesCount: validated.employeesCount,
        field: validated.field,
        representation: validated.representation,
        logo: validated.logo,
        status: "pending",
      },
    });

    revalidatePath("/owner");
    return { success: true, company };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function getOwnerCompany(ownerId: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { ownerId },
      include: {
        owner: true,
      },
    });
    return company;
  } catch (error) {
    console.error("Error fetching owner company:", error);
    return null;
  }
}

export async function getCompanyBySlug(slug: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        owner: true,
      },
    });
    return company;
  } catch (error) {
    console.error("Error fetching company by slug:", error);
    return null;
  }
}

export async function updateCompany(
  companyId: string,
  data: Partial<CompanyRegistrationInput>
) {
  try {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: data.name,
        address: data.address,
        email: data.email,
        phone: data.phone,
        employeesCount: data.employeesCount,
        field: data.field,
        representation: data.representation,
        logo: data.logo,
      },
    });

    revalidatePath("/owner");
    return { success: true, company };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function approveCompany(companyId: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return { success: false, error: "Company not found" };
    }

    // generate unique slug: acme-corp-8f3a
    const slug = generateSlug(company.name);

    const updated = await prisma.company.update({
      where: { id: companyId },
      data: {
        status: "approved",
        slug,
      },
    });

    revalidatePath("/admin");
    return { success: true, company: updated };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}


export async function rejectCompany(companyId: string) {
  try {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: { status: "rejected" },
    });

    revalidatePath("/admin");
    return { success: true, company };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function getPendingCompanies() {
  try {
    const companies = await prisma.company.findMany({
      where: { status: "pending" },
      include: {
        owner: true,
      },
    });
    return companies;
  } catch (error) {
    console.error("Error fetching pending companies:", error);
    return [];
  }
}

export async function getAllCompanies() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        owner: true,
      },
    });
    return companies;
  } catch (error) {
    console.error("Error fetching all companies:", error);
    return [];
  }
}