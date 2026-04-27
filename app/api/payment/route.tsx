import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/app/lib/fetchWithAuth";

type paymentRes = {
  sNo: number;
  userid: string;
  invoiceid: string;
  plantype: string;
  planname: string;
  satus: InvoiceStatus;
  date: string;
};

type InvoiceStatus = "pending" | "paid" | "failed" | "cancelled";

export async function GET(req: NextRequest) {
 
  try {


    const { searchParams } = new URL(req.url);

    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const search = searchParams.get("search") ?? "";

    if (!limit || !offset) {
      return NextResponse.json(
        { success: false, message: "limit or offset is required" },
        { status: 400 },
      );
    }

    const fetchOptions: RequestInit = {
      method: "GET",
    };

    const [paymentRes, planRes] = await Promise.all([
      fetch(
        `${process.env.PAYMENT}crm/payment?limit=${limit}&offset=${offset}&search=${encodeURIComponent(search)}`,
        fetchOptions,
      ),
      fetchWithAuth(`${process.env.OPERATIONS}crm/plans`, {
        method: "GET",
      }),
    ]);

    if (!paymentRes.ok || !planRes.ok) {
      return NextResponse.json(
        { success: false, message: "Service unavailable" },
        { status: 500 },
      );
    }

    const paymentData = await paymentRes.json();
    const planData = await planRes.json();

    const statusMap: Record<InvoiceStatus, string> = {
      paid: "Paid",
      cancelled: "Cancelled",
      failed: "Failed",
      pending: "Pending",
    };

    function formatDate(date: any) {
      const d = new Date(date);

      const day = d.getDate().toString().padStart(2, "0");
      const month = d.toLocaleString("en-GB", { month: "short" }).toUpperCase();
      const year = d.getFullYear();

      const time = d
        .toLocaleString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(":", ".");

      return `${day} ${month} ${year} ${time}`;
    }

    const totalKenyaCount = planData.data.reduce((acc: number, plan: any) => {
      if (plan.country?.toLowerCase() === "kenya") {
        return acc + 1;
      }
      return acc;
    }, 0);

    const totalTanzaniaCount = planData.data.reduce(
      (acc: number, plan: any) => {
        if (plan.country?.toLowerCase() === "tanzania") {
          return acc + 1;
        }
        return acc;
      },
      0,
    );
    const cancelledCount = paymentData.data.filter(
      (payment: any) => payment.status === "cancelled",
    ).length;

    const finalResponse = paymentData.data.map(
      (payment: any, index: number) => {
        const matchedPlan = planData.data.find(
          (plan: any) => plan.plan_id === payment.plan_id,
        );

        const d = new Date(payment.created_at);
        return {
          sNo: Number(offset) === 0 ? index + 1 : Number(offset) + (index + 1),

          userid: payment.user_id,
          invoiceid: payment.invoice_id,
          status: statusMap[payment.status as InvoiceStatus],

          planname: matchedPlan?.plan_name_en ?? "Coins",
          plantype:
            matchedPlan?.type == "one_time"
              ? "One Time"
              : matchedPlan?.type == "premium"
                ? "Premium"
                : "Gift",
          date: formatDate(payment.created_at),

          cancelledCount: cancelledCount,
          totalTanzaniaCount: totalTanzaniaCount,
          totalKenyaCount: totalKenyaCount,
        };
      },
    );

    return NextResponse.json(
      {
        success: true,
        count: paymentData.count,
        data: finalResponse,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
