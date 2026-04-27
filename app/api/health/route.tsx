import { NextResponse } from "next/server";

export type ServiceHealthStatus = "operational" | "error";
type ServiceHealth = {
  id: string;
  name: string;
  status: ServiceHealthStatus;
  message: string;
};
const Service = {
  TEST_USER_SERVICE: process.env.USERS_HEALTH || "",
  TEST_WHATSAPP_SERVICE: process.env.TEST_WHATSAPP_SERVICE || "",
  TEST_PAYMENT_SERVICE: process.env.PAYMENT_HEALTH || "",
  TEST_LOCATION_SERVICE: process.env.LOCATION_HEALTH || "",
};

const HEALTH_CHECKS = [
  {
    id: "1",
    name: "User Service",
    url: Service.TEST_USER_SERVICE,
  },
  {
    id: "2",
    name: "Whatsapp Cloud",
    url: Service.TEST_WHATSAPP_SERVICE,
  },
  {
    id: "3",
    name: "Payment Service",
    url: Service.TEST_PAYMENT_SERVICE,
  },
  {
    id: "4",
    name: "Location Service",
    url: Service.TEST_LOCATION_SERVICE,
  },
];

export async function GET() {
  try {
    const results = await Promise.allSettled(
      HEALTH_CHECKS.map((service) =>
        fetch(service.url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(3000),
        }),
      ),
    );

    const services: ServiceHealth[] = await Promise.all(
      results.map(async (result, index): Promise<ServiceHealth> => {
        const meta = HEALTH_CHECKS[index];

        if (result.status === "rejected") {
          return {
            id: meta.id,
            name: meta.name,
            status: "error",
            message: "Service unreachable",
          };
        }

        const res = result.value;

        const HTTP_STATUS_MESSAGES: Record<number, string> = {
          502: "Service is down",
          503: "Service unavailable",
          504: "Gateway timeout",
          500: "Internal server error",
          404: "Service endpoint not found",
          401: "Unauthorized",
          403: "Forbidden",
        };

        if (!res.ok) {
          return {
            id: meta.id,
            name: meta.name,
            status: "error",
            message:
              HTTP_STATUS_MESSAGES[res.status] ?? "Service returned an error",
          };
        }

        const data = await res.json();

        let finalStatus = "error";
        if (meta.name === "Location Service") {
          const locationStatus = data?.status?.description?.toLowerCase();
          finalStatus = locationStatus?.includes("operational")
            ? "operational"
            : "error";
        } else {
          const allowedStatuses = ["ok", "operational"];
          finalStatus = allowedStatuses.includes(data?.status)
            ? "operational"
            : "error";
        }
        return {
          id: meta.id,
          name: meta.name,
          status: finalStatus as ServiceHealthStatus,
          message:
            finalStatus == "operational"
              ? "Module is performing normally"
              : "Service returned unhealthy status",
        };
      }),
    );

    return NextResponse.json(
      {
        success: true,
        data: services,
        message: "Data fetched successfully!",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
