import { type NextRequest, NextResponse } from "next/server"
import { FamilyTreeModel } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, members } = body

    // Validate required fields
    if (!name || !members || members.length === 0) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // In a real app, you'd get userId from authentication
    const userId = "user-1" // Mock user ID for now

    // Add unique IDs to members
    const membersWithIds = members.map((member: any) => ({
      ...member,
      id: member.id || `member-${Date.now()}-${Math.random()}`,
    }))

    const treeData = {
      name,
      members: membersWithIds,
      connections: [],
      userId,
    }

    const treeId = await FamilyTreeModel.create(treeData)

    return NextResponse.json({
      success: true,
      treeId,
      message: "Family tree created successfully",
    })
  } catch (error) {
    console.error("Forms API error:", error)
    return NextResponse.json({ success: false, error: "Failed to create family tree" }, { status: 500 })
  }
}
