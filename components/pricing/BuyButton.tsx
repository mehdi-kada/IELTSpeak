"use client";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface CheckoutButtonProps {
  children?: React.ReactNode;
  checkoutUrl?: string;
}

export default function CheckoutButton({
  children,
  checkoutUrl,
}: CheckoutButtonProps) {
  console.log(checkoutUrl);
  useEffect(() => {
    if (typeof window.createLemonSqueezy === "function") {
      window.createLemonSqueezy();
    }
  }, []);
  const handleClick = () => {
    window.LemonSqueezy.Url.Open(checkoutUrl);
  };
  return <Button onClick={handleClick}>{children}</Button>;
}