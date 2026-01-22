import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPendingCompanies } from "@/app/actions/company";
import { getAllDsarRequests } from "@/app/actions/dsar";
import AdminDashboardClient from "./client";

export default async function AdminDashboard() {
  const cookieStore = cookies();
  const sessionCookie = (await cookieStore).get("session");

  if (!sessionCookie) {
    redirect("/auth/login");
  }

  let session: any;
  try {
    session = JSON.parse(decodeURIComponent(sessionCookie.value));
  } catch {
    redirect("/auth/login");
  }

  if (session.role !== "admin") {
    redirect("/unauthorized"); // or "/"
  }

  const pendingCompanies = await getPendingCompanies();
  const allDsarRequests = await getAllDsarRequests(100);

  return (
    <AdminDashboardClient
      pendingCompanies={pendingCompanies}
      dsarRequests={allDsarRequests.requests}
    />
  );
}
