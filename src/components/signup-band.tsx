import NewsletterSignup from '@/components/newsletter-signup'

export default function SignupBand() {
  return (
    <section id="subscribe" className="scroll-mt-24 border-y border-border bg-muted">
      <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-14 md:grid-cols-[1.2fr_1fr] md:items-center md:px-8 md:py-16">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Tuesday morning · Hong Kong
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Get the AI week, wherever it lands
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
            One short briefing a week. Hand-picked stories, not a dump of headlines,
            with a local read on the place each one lands.
          </p>
        </div>
        <NewsletterSignup idPrefix="band" />
      </div>
    </section>
  )
}
