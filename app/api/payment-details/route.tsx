import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  try {
    const res = await fetch(`${process.env.PAYMENT}crm/payment-details`, {
      method: "GET",
    });
   

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: "Service unavailable" },
        { status: 500 },
      );
    }

    const paymentData = await res.json();

    return NextResponse.json(
      {
        success: true,
        data: {
          ...paymentData.data,
          totalAmtTZS: Number(paymentData.data.totalAmtTZS).toLocaleString(),
          totalAmtKES: Number(paymentData.data.totalAmtKES).toLocaleString(),
          totalCancelTZS: Number(
            paymentData.data.totalCancelTZS,
          ).toLocaleString(),
          totalCancelKES: Number(
            paymentData.data.totalCancelKES,
          ).toLocaleString(),
          totalPaymentCount: Number(
            paymentData.data.totalCount,
          ).toLocaleString(),
          cancelledCount: Number(
            paymentData.data.totalCancelCount,
          ).toLocaleString(),
        },
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
