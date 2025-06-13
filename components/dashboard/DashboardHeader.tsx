interface DashboardHeaderProps {
  title: string;
  description: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
      <p className="text-gray-400 mt-1">{description}</p>
    </header>
  );
}
