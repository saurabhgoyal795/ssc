'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { testsApi } from '@/lib/api/tests'
import type { Test } from '@/types'

export default function TestsPage() {
  const router = useRouter()
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    loadTests()
  }, [page])

  const loadTests = async () => {
    setLoading(true)
    try {
      const data = await testsApi.listAdmin({ page, size: 20 })
      setTests(data.content)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Failed to load tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (id: number) => {
    try {
      await testsApi.publish(id)
      loadTests()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to publish test')
    }
  }

  const handleUnpublish = async (id: number) => {
    if (!confirm('Are you sure you want to unpublish this test?')) return

    try {
      await testsApi.unpublish(id)
      loadTests()
    } catch (error) {
      alert('Failed to unpublish test')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this test?')) return

    try {
      await testsApi.delete(id)
      loadTests()
    } catch (error) {
      alert('Failed to delete test')
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      MOCK_TEST: 'bg-blue-50 text-blue-700',
      SECTION_TEST: 'bg-green-50 text-green-700',
      TOPIC_TEST: 'bg-purple-50 text-purple-700',
      PREVIOUS_YEAR: 'bg-orange-50 text-orange-700',
      PRACTICE: 'bg-gray-50 text-gray-700',
    }
    return colors[type] || 'bg-gray-50 text-gray-700'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tests</h1>
          <p className="text-gray-600">Manage your tests</p>
        </div>
        <Link href="/admin/tests/new">
          <Button>➕ Create Test</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading tests...</p>
        </div>
      ) : tests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">No tests found</p>
            <Link href="/admin/tests/new">
              <Button>Create your first test</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {tests.map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${getTypeColor(test.testType)}`}>
                          {test.testType.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-600">{test.difficultyLevel}</span>
                        {test.isPublished ? (
                          <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700 font-medium">
                            Published
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 font-medium">
                            Draft
                          </span>
                        )}
                        {test.isPremium && (
                          <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">
                            Premium
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-2">{test.title}</CardTitle>
                      {test.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{test.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>⏱️ {test.durationMinutes} min</span>
                        <span>📊 {test.totalMarks} marks</span>
                        <span>❓ {test.totalQuestions} questions</span>
                        {test.sections && test.sections.length > 0 && (
                          <span>📑 {test.sections.length} sections</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!test.isPublished ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handlePublish(test.id)}
                        >
                          Publish
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnpublish(test.id)}
                        >
                          Unpublish
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/tests/${test.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(test.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
