"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactFlow, {
  type Node,
  type Edge,
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";

import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save, Plus, ArrowLeft, Share, Eye } from "lucide-react";
import { toast } from "sonner";

import type { FamilyMember, FamilyTree } from "@/types/family";
import { RELATIONS } from "@/lib/relations";
import { FamilyNode } from "@/components/family-node";

const nodeTypes = {
  familyMember: FamilyNode,
};

export default function FamilyTreeEditor() {
  const params = useParams();
  const router = useRouter();
  const treeId = params.id as string;

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  // New member form state
  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    name: "",
    dateOfBirth: "",
    relationId: "",
    gender: undefined,
  });

  useEffect(() => {
    fetchTreeData();
  }, [treeId]);

  const fetchTreeData = async () => {
    try {
      const response = await fetch(`/api/editor?treeId=${treeId}`);
      const data = await response.json();
      if (data.success) {
        setTree(data.tree);

        // Modified node positioning logic for top-to-bottom layout
        const flowNodes: Node[] = data.tree.members.map(
          (member: FamilyMember, index: number) => ({
            id: member.id,
            type: "familyMember",
            // Changed positioning to be more spread out vertically
            position: {
              x: (index % 3) * 300,
              y: Math.floor(index / 3) * 300, // Increased vertical spacing
            },
            data: { member },
          })
        );

        // Convert connections based on relations
        const flowEdges: Edge[] = data.tree.connections.map((conn: any) => ({
          id: `${conn.from}-${conn.to}`,
          source: conn.from,
          target: conn.to,
          type: "smoothstep",
          label: conn.type,
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
      } else {
        toast.error("Failed to load family tree");
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching tree:", error);
      toast.error("Failed to load family tree");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: "smoothstep",
        label: "Related",
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.dateOfBirth || !newMember.relationId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const member: FamilyMember = {
      id: `member-${Date.now()}`,
      name: newMember.name,
      dateOfBirth: newMember.dateOfBirth,
      relationId: newMember.relationId,
      gender: newMember.gender,
      profilePicture: newMember.profilePicture,
      birthPlace: newMember.birthPlace,
    };

    // Add new node to the flow
    const newNode: Node = {
      id: member.id,
      type: "familyMember",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { member },
    };

    setNodes((nds) => [...nds, newNode]);
    setNewMember({
      name: "",
      dateOfBirth: "",
      relationId: "",
      gender: undefined,
    });
    setShowAddMember(false);
    toast.success("Family member added successfully");
  };

  const handleSave = async () => {
    if (!tree) return;

    setSaving(true);
    try {
      // Convert nodes back to members
      const members = nodes.map((node) => node.data.member);

      // Convert edges back to connections
      const connections = edges.map((edge) => ({
        id: edge.id,
        from: edge.source,
        to: edge.target,
        type: edge.label || "related",
      }));

      const response = await fetch("/api/editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          treeId,
          members,
          connections,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Family tree saved successfully");
      } else {
        toast.error("Failed to save family tree");
      }
    } catch (error) {
      console.error("Error saving tree:", error);
      toast.error("Failed to save family tree");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewMember({
        ...newMember,
        profilePicture: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading family tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{tree?.name}</h1>
              <p className="text-sm text-muted-foreground">
                {nodes.length} family members
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Family Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={newMember.profilePicture || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {newMember.name
                          ? newMember.name.charAt(0).toUpperCase()
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <Label
                      htmlFor="upload-new"
                      className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                    >
                      Upload Photo
                      <Input
                        id="upload-new"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      placeholder="Full name"
                      value={newMember.name || ""}
                      onChange={(e) =>
                        setNewMember({ ...newMember, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <Input
                      type="date"
                      value={newMember.dateOfBirth || ""}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Relation *</Label>
                    <Select
                      value={newMember.relationId || ""}
                      onValueChange={(value) =>
                        setNewMember({ ...newMember, relationId: value })
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
                      value={newMember.gender || ""}
                      onValueChange={(value) =>
                        setNewMember({
                          ...newMember,
                          gender: value as "male" | "female",
                        })
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

                  <div className="space-y-2">
                    <Label>Birth Place</Label>
                    <Input
                      placeholder="Place of birth"
                      value={newMember.birthPlace || ""}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          birthPlace: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddMember(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddMember} className="flex-1">
                      Add Member
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/share/${treeId}`)}
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/view/${treeId}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </div>
        </div>
      </div>

      {/* React Flow Editor */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          // Add these properties for top-to-bottom direction
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: true,
          }}
          // Set direction to top-to-bottom
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
