import { NextResponse } from "next/server";
import { fetchWithAuth } from "@/app/lib/fetchWithAuth";

type OnetimePlan = {
  id: string;
  planNameEn: string;
  planNameSw: string;
  durationTable: string;
  price: string;
  planType: string;
  features: {
    boost: boolean;
    superLike: boolean;
    rewind: boolean;
  };

  currency: string;
  type: "one_time";
};  

export async function GET() {
  try {

    const serverRes = await fetchWithAuth(
      `${process.env.OPERATIONS}crm/crm-plans?type=one_time`,
      {
        method: "GET",
      },
    );

    const data = await serverRes.json();

    const rawPlans = Object.values(data.data).flat();

    const mapFeatures = (features: string[]) => ({
      superLike: features.includes("Super like"),
      rewind: features.includes("Rewind"),
      boost: features.includes("Boost"),
    });

    const shillingDisp = (country: string, price: string) => {
      let currencySymbol = country == "kenya" ? "KES" : "TZS";
      let finalPrice = `${currencySymbol} ${price}`;
      return finalPrice;
    };

    const mappedPlans: OnetimePlan[] = rawPlans.map((plan: any) => ({
      id: plan.id,
      planNameEn: plan.plan_name_en,
      planNameSw: plan.plan_name_sw,
      durationTable: `${plan.duration.value} ${plan.duration.unit_en}`,
      duration: `${plan.duration.value}_${plan.duration.unit_en}`,
      price: shillingDisp(plan.pricing.country, plan.pricing.amount),
      currency: plan.pricing.currency,
      planType: plan.duration.unit_en,
      features: mapFeatures(plan.features_en),
      type: "one_time",
      country: plan.pricing.country == "kenya" ? "Kenya" : "Tanzania",
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Data fetched successfully!!",
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

    const selectedFeature = body.features;
    body.features = {
      boost: selectedFeature === "boost",
      superlike: selectedFeature === "superLike",
      rewind: selectedFeature === "rewind",
    };

    

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
