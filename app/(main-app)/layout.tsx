import NavBar from "@/components/NavBar"; // Adjust path to your component

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      {/* The NavBar goes here, in the sub-layout */}
      <NavBar />
      
      {/* The 'children' will be the pages inside the (dashboard) group */}
      <main className="p-8">{children}</main>
    </section>
  );
}