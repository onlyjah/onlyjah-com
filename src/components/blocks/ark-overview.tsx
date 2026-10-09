import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
// Jah Noah [Q006]: "when I add a new feature, I don't got to edit 15 different projects at once"
// Engineering: framing and source copy arrive as props; this block never fetches private data or decides permissions.
export type ArkCopy = {
  version: string
  title: string
  quote: string
  author: string
  quote_id: string
}
export function ArkOverview({
  copy,
  workspaceUrl,
}: {
  copy: ArkCopy
  workspaceUrl: string
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <blockquote className="border-l-2 border-primary pl-4">
          <p className="break-words text-xl">{copy.quote}</p>
          <cite className="text-sm text-muted-foreground">
            {copy.author} · {copy.quote_id}
          </cite>
        </blockquote>
        <Button
          className="min-h-11 whitespace-normal"
          render={<a href={workspaceUrl} />}
        >
          Open workspace
        </Button>
      </CardContent>
    </Card>
  )
}
