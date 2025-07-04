import { UpdatePasswordForm } from '@/components/update-password-form'

export const metadata = {
  title: "Update Password",
  description: "Secure your IELTSpeak account by updating your password. Enter a new password to keep your account safe.",
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm />
      </div>
    </div>
  )
}
