'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { materialsApi, type StudyMaterial } from '@/lib/api/materials'
import { subjectsApi, type Subject } from '@/lib/api/subjects'

export default function MaterialsPage() {
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
        size: 12,
      })
      setMaterials(data.content)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Failed to load materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const getMaterialIcon = (type: string) => {
    const icons: Record<string, string> = {
      PDF: '📄',
      ARTICLE: '📰',
      NOTES: '📝',
      CHEAT_SHEET: '📋',
    }
    return icons[type] || '📚'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-600">SSC Exam Prep</h1>
          </Link>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Study Materials</h1>
          <p className="text-gray-600 text-lg">
            Download PDFs, notes, and cheat sheets to boost your preparation
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
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
                <option value="PDF">PDFs</option>
                <option value="ARTICLE">Articles</option>
                <option value="NOTES">Notes</option>
                <option value="CHEAT_SHEET">Cheat Sheets</option>
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

        {/* Materials Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading materials...</p>
          </div>
        ) : materials.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">No materials found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material) => (
                <Link key={material.id} href={`/materials/${material.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-4xl">{getMaterialIcon(material.materialType)}</div>
                        {material.isPremium && (
                          <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 font-medium">
                            Premium
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-2 line-clamp-2">{material.title}</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {material.materialType}
                        </span>
                        {material.subjectName && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {material.subjectName}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {material.description && (
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                          {material.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>👁️ {material.viewCount} views</span>
                        <span>⬇️ {material.downloadCount} downloads</span>
                      </div>
                      {material.fileSizeBytes && (
                        <p className="text-xs text-gray-500 mt-2">
                          {formatFileSize(material.fileSizeBytes)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
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
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-600">
          © 2024 SSC Exam Preparation Platform. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
