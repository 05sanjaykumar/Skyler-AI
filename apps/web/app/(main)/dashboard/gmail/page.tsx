// apps/web/app/dashboard/gmail/page.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { Server, SquarePen, Trash2, X, Plus, Check  } from 'lucide-react'
import { useSession } from "next-auth/react";


type Instance = {
  id: string
  name: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [instances, setInstances] = useState<Instance[]>([])
  const [instancesLeft, setInstancesLeft] = useState(1) // example, fetch from API later
  const [newInstanceName, setNewInstanceName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const token = session?.appToken;

  // Helper to get the auth token if using something like JWT
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // or wherever your token is
  })

  useEffect(() => {
    console.log("Backend URL", backendUrl);
    async function fetchInstancesAndQuota() {
      try {
        const res = await fetch(`${backendUrl}/api/gmail/instances`, {
          headers: getAuthHeaders(),
        })
        if (!res.ok) throw new Error('Failed to fetch instances')
        const data: Instance[] = await res.json()
        console.log("Fetched instances:", data)
        setInstances(data)
        const instanceCount = await fetch(`${backendUrl}/api/gmail/instances/count`, {
          headers: getAuthHeaders(),
          credentials:'include'
        })
        const { count } = await instanceCount.json()
        console.log("Fetched instance count:", count)
        setInstancesLeft(count)
      } catch (err) {
        console.error(err)
      }
    }
    fetchInstancesAndQuota()
  }, [backendUrl])

  const handleCreate = async () => {
    if (!newInstanceName.trim()) return
    if (instancesLeft <= 0) {
      alert('Instance limit reached for your plan')
      return
    }
    try {
      const res = await fetch(`${backendUrl}/api/gmail/instances`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ name: newInstanceName }),
      })
      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to create instance')
        return
      }
      const newInstance = await res.json()
      setInstances((prev) => [...prev, newInstance])
      setNewInstanceName('')
      setCreating(false)
      setInstancesLeft((prev) => prev - 1)
    } catch (err) {
      console.error(err)
      alert('Server error while creating instance')
    }
  }

  const startEditing = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return
    try {
      const res = await fetch(`${backendUrl}/api/gmail/instances/${id}/name`, {
        method: 'PATCH',
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: editName }),
      })
      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to update instance')
        return
      }
      const updated = await res.json()
      setInstances((prev) =>
        prev.map((inst) => (inst.id === id ? updated : inst))
      )
      setEditingId(null)
    } catch (err) {
      console.error(err)
      alert('Server error while updating instance')
    }
  }

  const deleteInstance = async (id: string) => {
    if (!confirm('Delete this instance?')) return
    try {
      const res = await fetch(`${backendUrl}/api/gmail/instances/${id}`, {
        method: 'DELETE',
        credentials: "include",
        headers: getAuthHeaders(),
      })
      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to delete instance')
        return
      }
      setInstances((prev) => prev.filter((inst) => inst.id !== id))
      setInstancesLeft((prev) => prev + 1)
    } catch (err) {
      console.error(err)
      alert('Server error while deleting instance')
    }
  }

    const MockLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => {
    return (
      <a href={href}  className={className}>
        {children}
      </a>
    );
  };

  return (
    <div className="bg-background min-h-screen font-sans antialiased">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Your Email Instances
            </h1>
            <div className="flex items-center text-sm font-medium text-muted-foreground">
                <Server className="h-4 w-4 mr-2 text-primary" />
                Instances left:
                <strong className="text-foreground ml-1">
                    {instancesLeft}
                </strong>
            </div>
        </div>

        <div className="mb-6">
            {creating ? (
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <input
                        type="text"
                        placeholder="New instance name"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newInstanceName}
                        onChange={(e) => setNewInstanceName(e.target.value)}
                    />
                    <div className="flex w-full sm:w-auto gap-2">
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                        >
                            Create
                        </button>
                        <button
                            onClick={() => setCreating(false)}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground w-full"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setCreating(true)}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                >
                    <Plus className="h-4 w-4 mr-2" /> New Instance
                </button>
            )}
        </div>

        <div className="space-y-4">
            {instances.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    No instances found. Create your first one to get started!
                </div>
            ) : (
                instances.map(({ id, name }) => (
                    <div
                        key={id}
                        className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-colors hover:bg-muted/50"
                    >
                        {editingId === id ? (
                            <div className="flex flex-col sm:flex-row gap-2 w-full items-center">
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                                <div className="flex w-full sm:w-auto gap-2">
                                    <button
                                        onClick={() => saveEdit(id)}
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <MockLink href={`/dashboard/gmail/${id}`} className="flex-1 w-full truncate">
                                    <span className="font-semibold text-lg hover:underline">{name}</span>
                                </MockLink>
                                <div className="flex-shrink-0 flex gap-2 mt-2 sm:mt-0">
                                    <button
                                        onClick={() => startEditing(id, name)}
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 py-2 text-primary hover:bg-accent hover:text-accent-foreground"
                                    >
                                        <SquarePen className="h-4 w-4 mr-2" />
                                        Rename
                                    </button>
                                    <button
                                        onClick={() => deleteInstance(id)}
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 py-2 text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  )
}
