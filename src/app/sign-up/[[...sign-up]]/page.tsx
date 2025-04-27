import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md rounded-xl p-6">
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-gray-800 shadow-xl border border-gray-700",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-gray-700 hover:bg-gray-600 text-white border-gray-600",
              formFieldLabel: "text-gray-300",
              formFieldInput: "bg-gray-700 border-gray-600 text-white",
              footerActionText: "text-gray-400",
              footerActionLink: "text-purple-400 hover:text-purple-300",
              formButtonPrimary: "bg-purple-600 hover:bg-purple-500 text-white",
            },
          }}
          routing="path"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
} 