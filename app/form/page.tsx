"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Plus, ArrowRight } from "lucide-react";
import type { FamilyMember } from "@/types/family";
import { RELATIONS } from "@/lib/relations";

export default function FamilyForm() {
  const router = useRouter();
  const [treeName, setTreeName] = useState("");
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);

  const addMember = () => {
    const newMember: FamilyMember = {
      id: `member-${Date.now()}`,
      name: "",
      dateOfBirth: "",
      relationId: "",
    };
    setMembers([...members, newMember]);
  };

  const updateMember = (
    id: string,
    field: keyof FamilyMember,
    value: string
  ) => {
    setMembers(
      members.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const removeMember = (id: string) => {
    setMembers(members.filter((member) => member.id !== id));
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateMember(id, "profilePicture", e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!treeName.trim()) {
      alert("Please enter a tree name");
      return;
    }

    const validMembers = members.filter(
      (m) => m.name && m.dateOfBirth && m.relationId
    );
    if (validMembers.length === 0) {
      alert("Please add at least one family member with required details");
      return;
    }

    // Create connections based on relations
    const connections = [];
    for (let i = 0; i < validMembers.length; i++) {
      for (let j = i + 1; j < validMembers.length; j++) {
        const member1 = validMembers[i];
        const member2 = validMembers[j];

        // Add logic to determine relationships
        if (member1.relationId === "father" && member2.relationId === "son") {
          connections.push({
            from: member1.id,
            to: member2.id,
            type: "parent-child",
          });
        }
        // Add more relationship conditions as needed
      }
    }

    setLoading(true);
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: treeName,
          members: validMembers,
          connections: connections,
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/editor/${data.treeId}`);
      } else {
        alert("Failed to create family tree");
      }
    } catch (error) {
      console.error("Error creating tree:", error);
      alert("Failed to create family tree");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Family Tree</h1>
        <p className="text-muted-foreground">
          Start by adding basic family members. You can add more relations later
          in the editor.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tree Information</CardTitle>
          <CardDescription>Give your family tree a name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="treeName">Tree Name *</Label>
            <Input
              id="treeName"
              placeholder="e.g., Sharma Family Tree"
              value={treeName}
              onChange={(e) => setTreeName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Family Members
            <Button onClick={addMember} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </CardTitle>
          <CardDescription>
            Add family members with their basic information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {members.map((member, index) => (
              <Card key={member.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={member.profilePicture || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {member.name
                          ? member.name.charAt(0).toUpperCase()
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <Label
                      htmlFor={`upload-${member.id}`}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        <Upload className="h-3 w-3" />
                        Upload
                      </div>
                      <Input
                        id={`upload-${member.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(member.id, file);
                        }}
                      />
                    </Label>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        placeholder="Full name"
                        value={member.name}
                        onChange={(e) =>
                          updateMember(member.id, "name", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        value={member.dateOfBirth}
                        onChange={(e) =>
                          updateMember(member.id, "dateOfBirth", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Relation *</Label>
                      <Select
                        value={member.relationId}
                        onValueChange={(value) =>
                          updateMember(member.id, "relationId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relation" />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATIONS.map((relation) => (
                            <SelectItem key={relation.id} value={relation.id}>
                              {relation.hindi} ({relation.label})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                        value={member.gender || ""}
                        onValueChange={(value) =>
                          updateMember(member.id, "gender", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Birth Place</Label>
                      <Input
                        placeholder="Place of birth"
                        value={member.birthPlace || ""}
                        onChange={(e) =>
                          updateMember(member.id, "birthPlace", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMember(member.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}

            {members.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No family members added yet.</p>
                <p className="text-sm">Click &quot;Add Member&quot; to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.push("/")}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading} className="flex-1">
          {loading ? "Creating..." : "Continue to Editor"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
