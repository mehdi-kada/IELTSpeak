"use client";

import { useCurrentUserImage } from "@/hooks/supabase/use-current-user-image";
import { useCurrentUserName } from "@/hooks/supabase/use-current-user-name";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const CurrentUserAvatar = () => {
  const profileImage = useCurrentUserImage();
  const name = useCurrentUserName();
  const initials = name
    ?.split(" ")
    ?.map((word) => word[0])
    ?.join("")
    ?.toUpperCase();

  return (
    <Avatar className="h-10 w-10 border-2 border-[#E91E63]">
      {profileImage && <AvatarImage src={profileImage} alt={initials} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
};
