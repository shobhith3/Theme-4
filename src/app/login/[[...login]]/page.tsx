import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <SignIn path="/login" routing="path" signUpUrl="/signup" fallbackRedirectUrl="/command-center" />
    </div>
  );
}
