export interface School {
  id: string
  name: string
  nameRw: string
  location: string
  type: "Public" | "Private"
  level: "Primary" | "Secondary" | "Primary & Secondary"
  students: number
  established: number
  image_urls: string[]
  rating_total?: number
  rating_count?: number
  average_rating?: number
  created_at?: string
}

export interface Student {
  id: string
  name: string
  schoolId: string
  grade: string
  age: number
}
