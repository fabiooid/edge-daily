export default function BriefPanel({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null

  return (
    <section className="rounded-2xl border border-foreground/10 bg-muted px-6 py-8 md:px-10 md:py-10">
      <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
        The brief
      </p>
      <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight">This week in 30 seconds</h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-2">
        {lines.map((line, index) => (
          <li key={line} className="flex gap-3 text-base leading-7">
            <span className="font-heading text-sm font-semibold text-muted-foreground">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
