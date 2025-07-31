"use client"

import { memo } from "react"
import { Handle, Position } from "reactflow"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, MapPin, User } from "lucide-react"
import type { FamilyMember } from "@/types/family"
import { getRelationById } from "@/lib/relations"

interface FamilyNodeProps {
  data: {
    member: FamilyMember
  }
}

export const FamilyNode = memo(({ data }: FamilyNodeProps) => {
  const { member } = data
  const relation = getRelationById(member.relation)

  return (
    <>
      <Handle type="target" position={Position.Top} />

      <Dialog>
        <DialogTrigger asChild>
          <Card className="w-48 cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-3">
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.profilePicture || "/placeholder.svg"} />
                  <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="text-center">
                  <h3 className="font-medium text-sm truncate w-full">{member.name}</h3>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {relation?.hindi || member.relation}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Family Member Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-20 w-20">
                <AvatarImage src={member.profilePicture || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">{member.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{member.name}</h2>
              <Badge variant="outline">
                {relation?.hindi} ({relation?.label})
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Date of Birth:</strong> {new Date(member.dateOfBirth).toLocaleDateString()}
                </span>
              </div>

              {member.gender && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Gender:</strong> {member.gender.charAt(0).toUpperCase() + member.gender.slice(1)}
                  </span>
                </div>
              )}

              {member.birthPlace && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Birth Place:</strong> {member.birthPlace}
                  </span>
                </div>
              )}

              {member.deathDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Death Date:</strong> {new Date(member.deathDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {member.notes && (
                <div className="space-y-1">
                  <strong className="text-sm">Notes:</strong>
                  <p className="text-sm text-muted-foreground">{member.notes}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Handle type="source" position={Position.Bottom} />
    </>
  )
})

FamilyNode.displayName = "FamilyNode"
