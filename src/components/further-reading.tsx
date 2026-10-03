import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function FurtherReading({
  links,
}: {
  links: { title: string; url: string }[]
}) {
  if (links.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Further Reading</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {links.map((link) => (
            <li key={link.url}>
              <Button
                variant="link"
                className="h-auto px-0 text-left whitespace-normal"
                render={<a href={link.url} target="_blank" rel="noopener noreferrer" />}
                nativeButton={false}
              >
                {link.title}
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
