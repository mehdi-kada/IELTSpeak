// create payments checkout

import { createClient } from "@/lib/supabase/server";
import { spawn } from "child_process";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // get the current user
    const supabase = await createClient();
    const { data: user, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("couldnt get user for checkout");
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    

  } catch (error) {}
}
