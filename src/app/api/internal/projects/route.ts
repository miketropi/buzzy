import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { domainsFromJson } from "@/lib/json-domains";
import { ConflictError } from "@/lib/utils/errors";
import { requireOwnerId } from "@/lib/internal/project-access";
import { toProjectResponse } from "@/lib/internal/serialize-project";
import { defaultProjectSettings } from "@/lib/project-defaults";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import { createProjectBodySchema } from "@/lib/validators/project";

export async function GET() {
  try {
    const ownerId = await requireOwnerId();
    const projects = await prisma.project.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        widgetMode: true,
        allowedDomains: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return jsonSuccess(
      projects.map((p) => ({
        ...p,
        allowedDomains: domainsFromJson(p.allowedDomains),
      })),
    );
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: Request) {
  try {
    const ownerId = await requireOwnerId();
    const body = createProjectBodySchema.parse(await request.json());
    try {
      const project = await prisma.project.create({
        data: {
          name: body.name,
          slug: body.slug,
          ownerId,
          allowedDomains: body.allowedDomains as Prisma.InputJsonValue,
          widgetMode: body.widgetMode ?? "comment",
          settings: defaultProjectSettings() as Prisma.InputJsonValue,
        },
      });
      return jsonSuccess(toProjectResponse(project));
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictError("Slug already taken");
      }
      throw e;
    }
  } catch (e) {
    return jsonError(e);
  }
}
