import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import index from '@/content/dictionary.json'
import { remarkDisplayText } from '@/lib/display-text'
import { remarkDictionaryLinks } from '@/lib/remark-dictionary'

export function Markdown({ children }: { children: string }) {
  return (
    <div className="max-w-prose space-y-6 text-pretty leading-7">
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkDisplayText,
          [remarkDictionaryLinks, { entries: index.entries }],
        ]}
        skipHtml
        components={{
          h1: ({ children }) => (
            <h1 className="text-4xl font-semibold tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="pt-6 text-2xl font-semibold tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="pt-4 text-xl font-semibold">{children}</h3>
          ),
          p: ({ children }) => <p className="leading-7">{children}</p>,
          a: ({ children, href }) => (
            <a
              href={href}
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) =>
            src ? (
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {alt || 'Open linked image'}
              </a>
            ) : null,
          blockquote: ({ children }) => (
            <Card className="border-l-2 border-l-primary bg-muted/30 shadow-none">
              <CardContent className="space-y-4 text-lg leading-8">
                {children}
              </CardContent>
            </Card>
          ),
          ul: ({ children }) => (
            <ul className="list-disc space-y-2 pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-2 pl-6">{children}</ol>
          ),
          pre: ({ children }) => (
            <pre className="overflow-auto rounded-md border bg-muted p-4 text-sm">
              {children}
            </pre>
          ),
          code: ({ children }) => (
            <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-sm">
              {children}
            </code>
          ),
          table: ({ children }) => <Table>{children}</Table>,
          thead: ({ children }) => <TableHeader>{children}</TableHeader>,
          tbody: ({ children }) => <TableBody>{children}</TableBody>,
          tr: ({ children }) => <TableRow>{children}</TableRow>,
          th: ({ children }) => <TableHead>{children}</TableHead>,
          td: ({ children }) => (
            <TableCell className="whitespace-normal">{children}</TableCell>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
