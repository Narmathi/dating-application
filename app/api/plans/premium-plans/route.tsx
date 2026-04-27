import { NextResponse } from "next/server";
import { fetchWithAuth } from "@/app/lib/fetchWithAuth";



type PremiumPlan = {
  id: string;
  planNameEn: string;
  planNameSw: string;
  durationTable: string;
  price: string;
  planType: string;
  features: {
    unlimitedSwipe: boolean;
    seeLikes: boolean;
    rewind: boolean;
    travelMode: boolean;
    ghostMode: boolean;
  };
  currency: string;
  type: "premium";
};

export async function GET() {
  try {


    const serverRes = await fetchWithAuth(
      `${process.env.OPERATIONS}crm/crm-plans?type=premium`,
      {
        method: "GET",
      },
    );

    const data = await serverRes.json();

    const mapFeatures = (features: string[]) => ({
      unlimitedSwipe: features.includes("Unlimited swipes"),
      seeLikes: features.includes("See likes"),
      rewind: features.includes("Rewind"),
      travelMode: features.includes("Travel mode"),
      ghostMode: features.includes("Ghost mode"),
    });

    const formatDuration = (duration: { unit_en: string; value: number }) => {
      const unitMap: Record<string, string> = {
        week: "Week",
        month: "Month",
        year: "Year",
      };

      return `${duration.value} ${unitMap[duration.unit_en]}`;
    };

    const shillingDisp = (country: string, price: string) => {
      let currencySymbol = country == "kenya" ? "KES" : "TZS";
      let finalPrice = `${currencySymbol} ${price}`;
      return finalPrice;
    };

    const mappedPlans: PremiumPlan[] = data.data.map((plan: any) => ({
      id: plan.id,
      planNameEn: plan.plan_name_en,
      planNameSw: plan.plan_name_sw,
      durationTable: formatDuration(plan.duration),
      duration: plan.duration.value + "_" + plan.duration.unit_en,

      price: shillingDisp(plan.pricing.country, plan.pricing.amount),
      planType: plan.duration.unit_en,
      features: mapFeatures(plan.features_en),
      currency: plan.pricing.currency,
      type: "premium",
      country: plan.pricing.country == "kenya" ? "Kenya" : "Tanzania",
    }));

    // mappedPlans.forEach((plan, i) => {
    //   console.log(`Plan ${i + 1}:`);
    //   console.log(JSON.stringify(plan, null, 2));
    // });

    return NextResponse.json(
      {
        success: true,
        message: "Data Fetched successfully!!",
        plans: mappedPlans,
      },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {

    const body = await req.json();

    const serverRes = await fetchWithAuth(`${process.env.OPERATIONS}crm/plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await serverRes.json();

    if (!serverRes.ok) {
      return NextResponse.json(
        { success: false, message: data.message },
        { status: serverRes.status },
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
