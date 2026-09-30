// src/routes/__root.tsx
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  notFound,
} from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', 
        content: 'width=device-width, initial-scale=1' },
      { title: 'OnlyJah' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <nav>
          <a href="/">OnlyJah.com</a>
          <span />
           ------------- 
          <span />
          <a href="/">Home</a> = 
          <a href="/forge">Forge</a> = 
          <a href="/explore">Explore</a>
          <span />
           ------------- 
          <span />
          <a href="/login">Log In</a>/
          <a href="/signup">Sign Up</a>
        </nav>
        {children}
        <footer>
          <a href="/">OnlyJah.com</a>
          <p>Copyright 2026 OnlyJah</p>
          <ul>
            <li><a href="/policy">Policy</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </footer>
        <Scripts />
      </body>
    </html>
  )
}