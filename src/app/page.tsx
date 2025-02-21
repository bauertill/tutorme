import { SignInButton } from "@/components/SignInButton";
import "@/app/globals.css";

export default function Home() {
  return (
    <main className="min-h-screen p-8 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Welcome</h1>
        <SignInButton />
      </div>
    </main>
  );
}
