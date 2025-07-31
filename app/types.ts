export interface School {
  id: string
  name: string
  nameRw: string
  location: string
  type: "Public" | "Private"
  level: "Primary" | "Secondary" | "Primary & Secondary"
  students: number
  established: number
}

export interface Student {
  id: string
  name: string
  schoolId: string
  grade: string
  age: number
}
