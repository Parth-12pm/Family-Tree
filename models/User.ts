import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

export interface DbUser {
  _id?: ObjectId;
  email: string;
  password: string;
  createdAt: string;
}

export class UserModel {
  static async create(email: string, hashedPassword: string): Promise<string> {
    const db = await getDatabase();
    const result = await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });
    return result.insertedId.toString();
  }

  static async findByEmail(email: string): Promise<DbUser | null> {
    const db = await getDatabase();
    const user = await db.collection("users").findOne({ email });
    return user as DbUser;
  }

  static async findById(id: string): Promise<DbUser | null> {
    const db = await getDatabase();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });
    return user as DbUser;
  }
}

export async function getUserFromDb(email: string, hashedPassword: string) {
  const db = await getDatabase();
  const user = await db
    .collection("users")
    .findOne({ email, password: hashedPassword });
  return user;
}
