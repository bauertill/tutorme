import { SignInButton } from "./_components/SignInButton";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Welcome</h1>
        <SignInButton />
      </div>
    </main>
  );
}
