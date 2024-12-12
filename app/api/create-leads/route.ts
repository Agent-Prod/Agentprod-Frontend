import { createClient } from "@supabase/supabase-js";
import { Lead } from "@/context/lead-user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { leads } = await req.json();
  console.log(...leads);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  const { error } = await supabase
    .from("sales_rep.contacts")
    .insert([...leads], { defaultToNull: true });

  if (error) {
    console.log("error", JSON.stringify(error));
    return NextResponse.json({ error });
  } else {
    return NextResponse.json({ status: 200, leads });
  }
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      db: { schema: "sales_rep" },
    }
  );

  const { data, error } = await supabase.from("contacts").select();

  console.log(data);
  return NextResponse.json({ status: 200, data, error });
}
