export default function SignupPage() {
  return (
    <div className="p-8 text-center bg-white border border-border rounded-xl shadow-sm w-full max-w-sm">
      <h1 className="text-xl font-bold text-text-primary mb-2">Create Account</h1>
      <p className="text-text-secondary text-sm mb-6">Demo environment only</p>
      <a href="/login" className="text-[var(--color-accent)] font-medium hover:underline">Back to Login</a>
    </div>
  );
}
