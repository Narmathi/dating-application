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

export async function GET(req: NextRequest) {
  const CDN = process.env.CDN;

  const { searchParams } = new URL(req.url);
  const blogID = searchParams.get("id");

  try {
    const serverRes = await fetchWithAuth(
      `${process.env.OPERATIONS}crm/content/get/${blogID}`,

      {
        method: "GET",
      },
    );

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
