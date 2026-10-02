// src/types/request.ts
export interface Request {
  id: number
  title: string
  overview: string
  hero_path: string | null
  backdrop_path: string | null
  todo_date: string
  bountyUSD: number
  priority: 1 | 2 | 3 | 4 | 5
}

export interface TMDBResponse {
  page: number
  results: Request[]
  total_pages: number
  total_results: number
}