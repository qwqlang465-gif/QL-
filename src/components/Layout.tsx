import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-reader-shelf text-reader-ink">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 pb-12 pt-8 sm:px-8 lg:px-10">
        {children}
      </main>
    </div>
  );
}
