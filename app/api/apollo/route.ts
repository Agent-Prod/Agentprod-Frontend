import axiosInstance from "@/utils/axiosInstance";
// import type { NextApiRequest, NextApiResponse } from "next";

export async function POST(req: Request, res: Response) {
  // console.log("REQ: ", req.body);
  const { url, body } = await req.json();
  // console.log("URL: ", url);
  try {
    const result = await axiosInstance.post(
      url,
      {
        api_key: process.env.APOLLO_API_KEY ?? "",
        ...body,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("RESULT: ", result.data);

    return Response.json({ result: result.data });
  } catch (err) {
    console.log("ERR: ", err);
    return Response.error();
  }
}
