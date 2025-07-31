import { getDatabase } from "./mongodb"
import { ObjectId } from "mongodb"
import type { FamilyTree, FamilyMember } from "@/types/family"

export interface DbFamilyTree extends Omit<FamilyTree, "id"> {
  _id?: ObjectId
  userId: string
}

export interface DbFamilyMember extends Omit<FamilyMember, "id"> {
  _id?: ObjectId
}

export class FamilyTreeModel {
  static async create(tree: Omit<DbFamilyTree, "_id">): Promise<string> {
    const db = await getDatabase()
    const result = await db.collection("familytrees").insertOne({
      ...tree,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    return result.insertedId.toString()
  }

  static async findByUserId(userId: string): Promise<DbFamilyTree[]> {
    const db = await getDatabase()
    const trees = await db.collection("familytrees").find({ userId }).toArray()
    return trees.map((tree) => ({
      ...tree,
      id: tree._id.toString(),
    })) as DbFamilyTree[]
  }

  static async findById(id: string): Promise<DbFamilyTree | null> {
    const db = await getDatabase()
    const tree = await db.collection("familytrees").findOne({ _id: new ObjectId(id) })
    if (!tree) return null

    return {
      ...tree,
      id: tree._id.toString(),
    } as DbFamilyTree
  }

  static async update(id: string, updates: Partial<DbFamilyTree>): Promise<boolean> {
    const db = await getDatabase()
    const result = await db.collection("familytrees").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      },
    )
    return result.modifiedCount > 0
  }

  static async delete(id: string): Promise<boolean> {
    const db = await getDatabase()
    const result = await db.collection("familytrees").deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }
}

export class ShareModel {
  static async create(treeId: string, shareId: string): Promise<void> {
    const db = await getDatabase()
    await db.collection("shares").insertOne({
      treeId,
      shareId,
      createdAt: new Date().toISOString(),
    })
  }

  static async findByShareId(shareId: string): Promise<{ treeId: string } | null> {
    const db = await getDatabase()
    const share = await db.collection("shares").findOne({ shareId })
    return share ? { treeId: share.treeId } : null
  }
}
