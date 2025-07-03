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
          "--normal-bg": "#2F2F7F",
          "--normal-text": "#fff",
          "--normal-border": "#E62136",
          fontSize: "3rem",
          fontWeight: 600,
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          background: "#2F2F7F",
          color: "#fff",
          border: "1px solid #E62136",
          fontSize: "1rem", // Font size for toast content
          fontWeight: 600, // Font weight for toast content
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
