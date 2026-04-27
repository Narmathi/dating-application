import { NextResponse, NextRequest } from "next/server";
import { fetchWithAuth } from "@/app/lib/fetchWithAuth";

type ContentData = {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  featureImage: string;
  authorImage: string;
  language: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.formData();

    const serverRes = await fetchWithAuth(`${process.env.OPERATIONS}crm/content`, {
      method: "POST",
      body: body,
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

export async function GET() {
  const CDN = process.env.CDN;
  try {
    const serverRes = await fetchWithAuth(`${process.env.OPERATIONS}crm/content`, {
      method: "GET",
    });

    const data = await serverRes.json();

    const mappedResponse: ContentData[] = data.data.map(
      (content: any, index: number) => ({
        id: content.content_id,
        title: content.blog_title,
        content: content.content,
        summary: content.short_summary,
        date: content.created_at,
        featureImage: `${CDN}${content.blog_image}`,
        author: {
          name: content.author,
          avatar: `${CDN}${content.author_image}`,
        },
      }),
    );

    return NextResponse.json(
      {
        success: true,
        data: mappedResponse,
        message: "Data fetched successfully!",
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
