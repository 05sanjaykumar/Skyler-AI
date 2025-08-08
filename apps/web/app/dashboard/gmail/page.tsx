// apps/web/app/dashboard/gmail/page.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { Server, PencilLine } from 'lucide-react';

type Instance = {
  id: string
  name: string
}

const MOCK_INSTANCES: Instance[] = [
  { id: '1', name: 'Bug Reports' },
  { id: '2', name: 'Feature Requests' },
]

export default function DashboardPage() {
  const [instances, setInstances] = useState<Instance[]>([])
  const [editsLeft, setEditsLeft] = useState(3) // example free quota
  const [instancesLeft, setInstancesLeft] = useState(1) // free tier
  const [newInstanceName, setNewInstanceName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    // TODO: fetch instances & quota from API
    setInstances(MOCK_INSTANCES)
  }, [])

  const handleCreate = () => {
    if (!newInstanceName.trim()) return
    if (instances.length >= instancesLeft) {
      alert('Instance limit reached for your plan')
      return
    }
    // TODO: Call API to create instance
    setInstances((prev) => [...prev, { id: Date.now().toString(), name: newInstanceName }])
    setNewInstanceName('')
    setCreating(false)
  }

  const startEditing = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const saveEdit = (id: string) => {
    if (!editName.trim()) return
    // TODO: Call API to update instance name and deduct edits quota
    setInstances((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, name: editName } : inst))
    )
    setEditingId(null)
  }

  const deleteInstance = (id: string) => {
    if (!confirm('Delete this instance?')) return
    // TODO: Call API to delete instance
    setInstances((prev) => prev.filter((inst) => inst.id !== id))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Email Instances</h1>

      <div className="flex justify-between mb-4">
        <div><PencilLine /> Edits left this week: <strong>{editsLeft}</strong></div>
        <div> <Server /> Instances left: <strong>{instancesLeft - instances.length}</strong></div>
      </div>

      <div className="mb-6">
        {creating ? (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="New instance name"
              className="border p-2 rounded flex-grow"
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
            className="flex items-center justify-between border p-3 rounded mb-2 hover:bg-gray-50"
          >
            {editingId === id ? (
              <>
                <input
                  className="border p-1 rounded flex-grow"
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
                <span>{name}</span>
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
