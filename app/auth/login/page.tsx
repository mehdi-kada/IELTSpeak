import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="py-6">
          <div className="flex items-center justify-center mb-2 gap-1">
            <Image src={"/images/logo2.png"} alt="logo" width={40} height={40} />
            <h1 className="text-4xl text-center font-bold">IELTSpeak</h1>
          </div>

          <p className="text-gray-400 text-center">
            Welcome back! Please sign in to your account.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
