import { NextRequest } from "next/server";
import { requireContractor } from "@/lib/auth/server";
import {
  getContractorOrganization,
  getContractorProjects,
  createContractorProject,
} from "@/lib/supabase/db/contractors";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET(request: NextRequest) {
  try {
    const user = await requireContractor();
    const org = await getContractorOrganization(user.id);
    if (!org) {
      return createSuccessResponse([]);
    }

    const projects = await getContractorProjects(org.id);
    return createSuccessResponse(projects);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireContractor();
    const org = await getContractorOrganization(user.id);
    if (!org) {
      return handleApiError(new Error("You must create a contractor organization first."));
    }

    const body = await request.json();
    const { title, clientName, location, budget, startDate, endDate, status } = body;

    if (!title || !clientName || !location || !startDate) {
      return handleApiError(
        new Error("Title, Client Name, Location, and Start Date are required.")
      );
    }

    const project = await createContractorProject(org.id, {
      title,
      client_name: clientName,
      location,
      budget: budget ? Number(budget) : null,
      start_date: startDate,
      end_date: endDate || null,
      status: status || "planning",
    });

    return createSuccessResponse(project, {
      message: "Contractor project created successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
