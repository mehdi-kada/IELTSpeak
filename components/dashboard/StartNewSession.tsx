import Link from "next/link";

interface StartNewSessionProps {
  href: string;
}

export default function StartNewSession({ href }: StartNewSessionProps) {
  return (
    <Link
      href={href}
      className="block w-full text-center bg-[#E62136] hover:shadow-md hover:shadow-[#E62136]/30 hover:-translate-y-px transition-all duration-200 text-white font-bold py-2 px-2 rounded-lg"
    >
      Start New Practice Session
    </Link>
  );
}
