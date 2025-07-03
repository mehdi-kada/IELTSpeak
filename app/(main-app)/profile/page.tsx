import { ProfileForm } from "@/components/profile/ProfileForm";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import React from "react";

const metadata: Metadata = {
  title: "Profile",
  description: "",
};

async function page() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    console.log("error , couldnt fetch user for user info ", error);
    return null;
  }
  return <ProfileForm userId={user.id} />;
}

export default page;
