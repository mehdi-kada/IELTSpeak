"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "bg-[#374151]",
          "--normal-text": "#fff",
          "--normal-border": "#E91E63",
          fontSize: "3rem",
          fontWeight: 600,
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          background: "#374151",
          color: "#fff",
          border: "2px solid #E91E63",
          fontSize: "1rem", // Font size for toast content
          fontWeight: 600, // Font weight for toast content
          textAlign: "center",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
