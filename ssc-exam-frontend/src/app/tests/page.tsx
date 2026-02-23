'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { testsApi } from '@/lib/api/tests'
import type { Test } from '@/types'

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    testType: '',
    difficultyLevel: '',
  })
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    loadTests()
  }, [page, filters, search])

  const loadTests = async () => {
    setLoading(true)
    try {
      const data = await testsApi.list({
        testType: filters.testType || undefined,
        difficultyLevel: filters.difficultyLevel || undefined,
        search: search || undefined,
        page,
        size: 12,
      })
      setTests(data.content)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Failed to load tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
    setPage(0)
  }

  const clearFilters = () => {
    setFilters({ testType: '', difficultyLevel: '' })
    setSearch('')
    setPage(0)
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      MOCK_TEST: 'bg-blue-100 text-blue-800 border-blue-200',
      SECTION_TEST: 'bg-green-100 text-green-800 border-green-200',
      TOPIC_TEST: 'bg-purple-100 text-purple-800 border-purple-200',
      PREVIOUS_YEAR: 'bg-orange-100 text-orange-800 border-orange-200',
      PRACTICE: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getDifficultyColor = (level: string) => {
    const colors: Record<string, string> = {
      EASY: 'text-green-600',
      MEDIUM: 'text-yellow-600',
      HARD: 'text-red-600',
    }
    return colors[level] || 'text-gray-600'
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
          <h1 className="text-4xl font-bold mb-2">Mock Tests & Practice</h1>
          <p className="text-gray-600 text-lg">
            Prepare for SSC and Government exams with our comprehensive test series
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Input
                placeholder="Search tests..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
              />

              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.testType}
                onChange={(e) => handleFilterChange('testType', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="MOCK_TEST">Mock Test</option>
                <option value="SECTION_TEST">Section Test</option>
                <option value="TOPIC_TEST">Topic Test</option>
                <option value="PREVIOUS_YEAR">Previous Year</option>
                <option value="PRACTICE">Practice</option>
              </select>

              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.difficultyLevel}
                onChange={(e) => handleFilterChange('difficultyLevel', e.target.value)}
              >
                <option value="">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>

              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tests Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading tests...</p>
          </div>
        ) : tests.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">No tests found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or check back later
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test) => (
                <Link key={test.id} href={`/tests/${test.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium border ${getTypeColor(
                            test.testType
                          )}`}
                        >
                          {test.testType.replace('_', ' ')}
                        </span>
                        {test.isPremium && (
                          <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 font-medium">
                            Premium
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-2 line-clamp-2">{test.title}</CardTitle>
                      {test.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{test.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Difficulty:</span>
                          <span className={`font-medium ${getDifficultyColor(test.difficultyLevel)}`}>
                            {test.difficultyLevel}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{test.durationMinutes} minutes</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Marks:</span>
                          <span className="font-medium">{test.totalMarks}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Questions:</span>
                          <span className="font-medium">{test.totalQuestions}</span>
                        </div>
                        {test.sections && test.sections.length > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Sections:</span>
                            <span className="font-medium">{test.sections.length}</span>
                          </div>
                        )}
                      </div>
                      <Button className="w-full mt-4">View Details →</Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
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
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-3">About</h3>
              <p className="text-sm text-gray-600">
                Comprehensive exam preparation platform for SSC and Government exams
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/tests" className="text-gray-600 hover:text-blue-600">
                    Browse Tests
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="text-gray-600 hover:text-blue-600">
                    Register
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Exams</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>SSC CGL</li>
                <li>SSC CHSL</li>
                <li>SSC MTS</li>
                <li>Railways</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-gray-600 pt-8 border-t">
            © 2024 SSC Exam Preparation Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
