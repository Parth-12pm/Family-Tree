import { type NextRequest, NextResponse } from "next/server"
import { ShareModel, FamilyTreeModel } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { treeId } = body

    if (!treeId) {
      return NextResponse.json({ success: false, error: "Tree ID required" }, { status: 400 })
    }

    // Verify tree exists
    const tree = await FamilyTreeModel.findById(treeId)
    if (!tree) {
      return NextResponse.json({ success: false, error: "Tree not found" }, { status: 404 })
    }

    // Generate shareable link
    const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/shared/${shareId}`

    await ShareModel.create(treeId, shareId)

    return NextResponse.json({
      success: true,
      shareUrl,
      shareId,
    })
  } catch (error) {
    console.error("Share API error:", error)
    return NextResponse.json({ success: false, error: "Failed to create share link" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shareId = searchParams.get("shareId")

  if (!shareId) {
    return NextResponse.json({ success: false, error: "Share ID required" }, { status: 400 })
  }

  try {
    const share = await ShareModel.findByShareId(shareId)
    if (!share) {
      return NextResponse.json({ success: false, error: "Share not found" }, { status: 404 })
    }

    const tree = await FamilyTreeModel.findById(share.treeId)
    if (!tree) {
      return NextResponse.json({ success: false, error: "Tree not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      tree: {
        id: tree._id?.toString(),
        name: tree.name,
        members: tree.members,
        connections: tree.connections,
      },
    })
  } catch (error) {
    console.error("Share GET API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch shared tree" }, { status: 500 })
  }
}
