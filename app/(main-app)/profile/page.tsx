import { ProfileForm } from "@/components/profile/ProfileForm";
import { Metadata } from "next";
import React from "react";

const metadata : Metadata = {
  title: "Profile",
  description: ""
}

function page() {
  return <ProfileForm />;
}

export default page;
