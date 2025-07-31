"use client"

import { useState, useEffect } from "react"
import { Plus, TreePine, Share, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface TreeSummary {
  id: string
  name: string
  memberCount: number
  createdAt: string
  lastModified: string
}

export function DashboardContent() {
  const [trees, setTrees] = useState<TreeSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrees()
  }, [])

  const fetchTrees = async () => {
    try {
      const response = await fetch("/api/dashboard")
      const data = await response.json()
      setTrees(data.trees || [])
    } catch (error) {
      console.error("Failed to fetch trees:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Family Trees</h1>
          <p className="text-muted-foreground">Create and manage your family trees</p>
        </div>
        <Link href="/form">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create New Tree
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : trees.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <TreePine className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No family trees yet</h3>
            <p className="text-muted-foreground mb-4">Create your first family tree to get started</p>
            <Link href="/form">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Tree
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trees.map((tree) => (
            <Card key={tree.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {tree.name}
                  <Badge variant="secondary">{tree.memberCount} members</Badge>
                </CardTitle>
                <CardDescription>Created {new Date(tree.createdAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Link href={`/editor/${tree.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      <TreePine className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/view/${tree.id}`}>
                    <Button variant="outline" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/share/${tree.id}`}>
                    <Button variant="outline" size="icon">
                      <Share className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}