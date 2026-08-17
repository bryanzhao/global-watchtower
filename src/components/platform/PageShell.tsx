import type { ReactNode } from "react";
import { Eyebrow } from "./Primitives";

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 py-8">
      <header className="mb-6 border-b border-border pb-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      </header>
      {children}
    </main>
  );
}