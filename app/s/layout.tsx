export default function SagaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono selection:bg-accent selection:text-white flex flex-col">
      {/* Mobile "Store Closed" View */}
      <div className="md:hidden flex flex-col items-center justify-center min-h-screen p-6 text-center bg-dots">
        <div className="bg-background border-4 border-border p-8 shadow-[8px_8px_0_var(--color-border)] dark:shadow-[8px_8px_0_#fff] max-w-sm w-full relative">
          <div className="absolute -top-4 -left-4 bg-accent text-white font-black px-3 py-1 border-[3px] border-border -rotate-12 shadow-[4px_4px_0_var(--color-border)] dark:shadow-[4px_4px_0_#fff]">
            CLOSED
          </div>
          <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">
            Saga
          </h1>
          <div className="w-full h-0.75 bg-border mb-6"></div>
          <div className="text-6xl font-black mb-6 select-none">(X_X)</div>
          <p className="text-lg font-black uppercase tracking-widest mb-4">
            Mobile View
            <br />
            Under Construction
          </p>
          <p className="text-xs font-bold tracking-widest text-muted border-t-[3px] border-border border-dashed pt-4 mt-4">
            Please visit on a tablet or desktop device to read the codebase.
          </p>
        </div>
      </div>

      {/* Desktop App View */}
      <div className="hidden md:flex flex-col min-h-screen">
        {/* Main Interface */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
