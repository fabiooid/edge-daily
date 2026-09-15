import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  formatPostDate,
  getPostLinks,
  getPostParagraphs,
  themeLabel,
  type Post,
} from '@/lib/posts'

interface PostBodyProps {
  post: Post
}

export default function PostBody({ post }: PostBodyProps) {
  const paragraphs = getPostParagraphs(post.content)
  const links = getPostLinks(post.links)

  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit font-medium">
          {themeLabel(post.theme)}
        </Badge>
        <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight">
          {post.title}
        </h1>
        <p className="text-sm text-muted-foreground">{formatPostDate(post.date)}</p>
      </header>

      <div className="flex flex-col gap-6 text-base leading-7">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {links.length > 0 && (
        <section className="flex flex-col gap-5">
          <Separator />
          <h2 className="font-heading text-lg font-semibold">Further Reading</h2>
          <ul className="flex flex-col gap-3">
            {links.map((link, index) => (
              <li key={index}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-foreground/20 pb-px text-[0.9375rem] transition-colors hover:border-foreground"
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
