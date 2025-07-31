import type { Relation } from "@/lib/relations"

export interface FamilyMember {
  id: string
  name: string
  dateOfBirth: string
  relationId: string // Maps to Relation.id
  gender?: "male" | "female"
  profilePicture?: string
  birthPlace?: string
  position?: {
    x: number
    y: number
  }
}

export interface FamilyConnection {
  id: string
  from: string
  to: string
  type: "parent-child" | "spouse" | "sibling"
}

export interface FamilyTree {
  id: string
  name: string
  members: FamilyMember[]
  connections: FamilyConnection[]
  createdAt: string
  updatedAt: string
}