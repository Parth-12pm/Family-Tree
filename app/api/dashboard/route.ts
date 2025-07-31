import { NextResponse } from "next/server"
import { FamilyTreeModel } from "@/lib/models"

export async function GET() {
  try {
    // In a real app, you'd get userId from authentication
    const userId = "user-1" // Mock user ID for now

    const trees = await FamilyTreeModel.findByUserId(userId)

    const treeSummaries = trees.map((tree) => ({
      id: tree.id || tree._id?.toString(),
      name: tree.name,
      memberCount: tree.members.length,
      createdAt: tree.createdAt,
      lastModified: tree.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      trees: treeSummaries,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch trees" }, { status: 500 })
  }
}
