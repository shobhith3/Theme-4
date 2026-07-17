import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <SignUp path="/signup" routing="path" signInUrl="/login" fallbackRedirectUrl="/command-center" />
    </div>
  );
}
