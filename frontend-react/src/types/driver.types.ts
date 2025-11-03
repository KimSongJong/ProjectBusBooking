export interface Driver {
  id: number
  fullName: string
  phone: string
  licenseNumber: string
  experienceYears: number
  imageUrl?: string
  createdAt: string
}

export interface CreateDriverRequest {
  fullName: string
  phone: string
  licenseNumber: string
  experienceYears: number
  imageUrl?: string
}

export interface UpdateDriverRequest {
  fullName: string
  phone: string
  licenseNumber: string
  experienceYears: number
  imageUrl?: string
}
