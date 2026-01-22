import { getCompanyBySlug } from "@/app/actions/company";
import { Badge, Button, Card } from "@/components/ui";
import { notFound } from "next/navigation";
import PublicCompanyClient from "./client";

interface Props {
  params: {
    slug: string;
  };
}

export default async function PublicCompanyPage({ params }: Props) {
   const { slug } = await params; // 👈 unwrap the promise

  const company = await getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const isActive = company.status === "approved" && ["active", "trialing"].includes(company.subscriptionStatus);

  return (
    <PublicCompanyClient company={company} isActive={isActive} />
  );
}
