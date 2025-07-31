import { type NextRequest, NextResponse } from "next/server";
import { FamilyTreeModel } from "@/lib/models";
import type { FamilyMember, FamilyConnection } from "@/types/family";
import { getRelationById } from "@/lib/relations";

export async function GET(request: NextRequest) {
  // const session = await auth();
  // if (!session?.user) {
  //   return NextResponse.json(
  //     { success: false, error: "Unauthorized" },
  //     { status: 401 }
  //   );
  // }

  const { searchParams } = new URL(request.url);
  const treeId = searchParams.get("treeId");

  if (!treeId) {
    return NextResponse.json(
      { success: false, error: "Tree ID required" },
      { status: 400 }
    );
  }

  try {
    const tree = await FamilyTreeModel.findById(treeId);

    if (!tree) {
      return NextResponse.json(
        { success: false, error: "Tree not found" },
        { status: 404 }
      );
    }

    // if (tree.userId !== session.user.id) {
    //   return NextResponse.json(
    //     { success: false, error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    // Process relationships and positions
    const members = tree.members.map((member: FamilyMember, index: number) => ({
      ...member,
      position: {
        x: (index % 3) * 300,
        y: Math.floor(index / 3) * 200,
      },
    }));

    // Create auto-connections based on relations
    const connections = createFamilyConnections(members);

    return NextResponse.json({
      success: true,
      tree: {
        ...tree,
        id: tree._id?.toString(),
        members,
        connections,
      },
    });
  } catch (error) {
    console.error("Editor GET API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tree data" },
      { status: 500 }
    );
  }
}

function createFamilyConnections(members: FamilyMember[]): FamilyConnection[] {
  const connections: FamilyConnection[] = [];

  for (let i = 0; i < members.length; i++) {
    for (let j = 0; j < members.length; j++) {
      if (i !== j) {
        const member1 = members[i];
        const member2 = members[j];
        const relation1 = getRelationById(member1.relationId);
        const relation2 = getRelationById(member2.relationId);

        if (!relation1 || !relation2) continue;

        // Parent-child connections
        if (relation1.category === "parent" && relation2.category === "child") {
          connections.push({
            id: `${member1.id}-${member2.id}`,
            from: member1.id,
            to: member2.id,
            type: "parent-child",
          });
        }

        // Spouse connections
        if (
          relation1.category === "spouse" &&
          relation2.category === "spouse" &&
          relation1.gender !== relation2.gender
        ) {
          connections.push({
            id: `${member1.id}-${member2.id}`,
            from: member1.id,
            to: member2.id,
            type: "spouse",
          });
        }

        // Sibling connections
        if (
          relation1.category === "sibling" &&
          relation2.category === "sibling"
        ) {
          connections.push({
            id: `${member1.id}-${member2.id}`,
            from: member1.id,
            to: member2.id,
            type: "sibling",
          });
        }
      }
    }
  }

  return connections;
}
