'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { materialsApi, type StudyMaterial } from '@/lib/api/materials'
import { subjectsApi, type Subject } from '@/lib/api/subjects'

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    subjectId: '',
    materialType: '',
  })
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    loadSubjects()
  }, [])

  useEffect(() => {
    loadMaterials()
  }, [page, filters, search])

  const loadSubjects = async () => {
    try {
      const data = await subjectsApi.list()
      setSubjects(data)
    } catch (error) {
      console.error('Failed to load subjects:', error)
    }
  }

  const loadMaterials = async () => {
    setLoading(true)
    try {
      const data = await materialsApi.list({
        subjectId: filters.subjectId ? parseInt(filters.subjectId) : undefined,
        materialType: filters.materialType || undefined,
        search: search || undefined,
        page,
        size: 20,
      })
      setMaterials(data.content)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Failed to load materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this material?')) return

    try {
      await materialsApi.delete(id)
      loadMaterials()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete material')
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Materials</h1>
          <p className="text-gray-600">Manage study materials, PDFs, and resources</p>
        </div>
        <Link href="/admin/materials/new">
          <Button>+ Add Material</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Input
              placeholder="Search materials..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
            />

            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.subjectId}
              onChange={(e) => {
                setFilters({ ...filters, subjectId: e.target.value })
                setPage(0)
              }}
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.materialType}
              onChange={(e) => {
                setFilters({ ...filters, materialType: e.target.value })
                setPage(0)
              }}
            >
              <option value="">All Types</option>
              <option value="PDF">PDF</option>
              <option value="ARTICLE">Article</option>
              <option value="NOTES">Notes</option>
              <option value="CHEAT_SHEET">Cheat Sheet</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setFilters({ subjectId: '', materialType: '' })
                setPage(0)
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Materials Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : materials.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No materials found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first study material</p>
            <Link href="/admin/materials/new">
              <Button>Add Material</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      File Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Downloads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {materials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{material.title}</p>
                          {material.isPremium && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded mt-1 inline-block">
                              Premium
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {material.subjectName || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {material.materialType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatFileSize(material.fileSizeBytes)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{material.viewCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {material.downloadCount}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(material.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 0}>
                ← Previous
              </Button>
              <span className="text-sm text-gray-600 px-4">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
