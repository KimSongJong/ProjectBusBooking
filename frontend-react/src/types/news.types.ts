export interface News {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  imageUrl: string
  publishedDate: string
  category: string
  views: number
}

export interface NewsCategory {
  id: string
  name: string
}