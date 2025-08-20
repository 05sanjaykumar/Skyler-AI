// apps/web/app/dashboard/gmail/page.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { Server, Copyright } from 'lucide-react'
import { useSession } from "next-auth/react";
import Link from "next/link";


type Instance = {
  id: string
  name: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [instances, setInstances] = useState<Instance[]>([])
  const [creditsLeft, setCreditsLeft] = useState(3) // example, fetch from API later
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
        const res = await fetch(`${backendUrl}/api/instances`, {
          headers: getAuthHeaders(),
        })
        if (!res.ok) throw new Error('Failed to fetch instances')
        const data: Instance[] = await res.json()
        console.log("Fetched instances:", data)
        setInstances(data)
        setCreditsLeft(20)
        const instanceCount = await fetch(`${backendUrl}/api/instances/count`, {
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
      const res = await fetch(`${backendUrl}/api/instances`, {
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
      const res = await fetch(`${backendUrl}/api/instances/${id}/name`, {
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
      const res = await fetch(`${backendUrl}/api/instances/${id}`, {
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
    } catch (err) {
      console.error(err)
      alert('Server error while deleting instance')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Email Instances</h1>

      <div className="flex justify-between mb-4">
        <div><Copyright /> Credits per month left: <strong>{creditsLeft}</strong></div>
        <div><Server /> Instances left: <strong>{instancesLeft}</strong></div>
      </div>

      <div className="mb-6">
        {creating ? (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="New instance name"
              className="border p-2 rounded flex-grow dark:text-black"
              value={newInstanceName}
              onChange={(e) => setNewInstanceName(e.target.value)}
            />
            <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded">
              Create
            </button>
            <button
              onClick={() => setCreating(false)}
              className="text-gray-600 px-3 py-2 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="bg-green-600 text-white px-5 py-3 rounded font-semibold hover:bg-green-700"
          >
            + New Instance
          </button>
        )}
      </div>

      <ul>
        {instances.map(({ id, name }) => (
          <li
            key={id}
            className="flex items-center justify-between border p-3 rounded mb-2 hover:bg-gray-50  dark:hover:bg-gray-700"
          >
            {editingId === id ? (
              <>
                <input
                  className="border p-1 rounded flex-grow dark:text-black"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  />
                <button
                  onClick={() => saveEdit(id)}
                  className="ml-2 bg-blue-500 text-white px-3 py-1 rounded"
                  >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="ml-2 text-gray-600 hover:text-black"
                  >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <Link href={`/dashboard/gmail/${id}`}>
                  <span>{name}</span>
                </Link>
                <div>
                  <button
                    onClick={() => startEditing(id, name)}
                    className="mr-3 text-blue-600 hover:underline"
                    >
                    Rename
                  </button>
                  <button
                    onClick={() => deleteInstance(id)}
                    className="text-red-600 hover:underline"
                    >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
