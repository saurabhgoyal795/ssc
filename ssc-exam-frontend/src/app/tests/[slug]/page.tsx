'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { testsApi } from '@/lib/api/tests'
import { useAuthStore } from '@/store'
import type { Test } from '@/types'

export default function TestDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTest()
  }, [params.slug])

  const loadTest = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await testsApi.getBySlug(params.slug as string)
      setTest(data)
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'Test not found' : 'Failed to load test')
    } finally {
      setLoading(false)
    }
  }

  const handleStartTest = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/tests/${params.slug}`)
      return
    }

    if (!test) return

    try {
      setLoading(true)
      const { testAttemptsApi } = await import('@/lib/api/testAttempts')
      const attempt = await testAttemptsApi.startTest(test.id)
      router.push(`/tests/attempt/${attempt.uuid}`)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to start test')
      setLoading(false)
    }
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
      EASY: 'text-green-600 bg-green-50',
      MEDIUM: 'text-yellow-600 bg-yellow-50',
      HARD: 'text-red-600 bg-red-50',
    }
    return colors[level] || 'text-gray-600 bg-gray-50'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-blue-600">SSC Exam Prep</h1>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading test...</p>
        </div>
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-blue-600">SSC Exam Prep</h1>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">{error}</h2>
          <p className="text-gray-600 mb-6">The test you're looking for doesn't exist or has been removed</p>
          <Link href="/tests">
            <Button>Browse All Tests</Button>
          </Link>
        </div>
      </div>
    )
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
            <Link href="/tests">
              <Button variant="ghost">← Back to Tests</Button>
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Test Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium border ${getTypeColor(
                test.testType
              )}`}
            >
              {test.testType.replace('_', ' ')}
            </span>
            <span className={`text-sm px-3 py-1 rounded font-medium ${getDifficultyColor(test.difficultyLevel)}`}>
              {test.difficultyLevel}
            </span>
            {test.isPremium && (
              <span className="text-sm px-3 py-1 rounded bg-purple-100 text-purple-700 font-medium">
                Premium
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-4">{test.title}</h1>
          {test.description && <p className="text-lg text-gray-600">{test.description}</p>}
        </div>

        {/* Test Info Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">⏱️</div>
              <p className="text-2xl font-bold">{test.durationMinutes}</p>
              <p className="text-sm text-gray-600">Minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">❓</div>
              <p className="text-2xl font-bold">{test.totalQuestions}</p>
              <p className="text-sm text-gray-600">Questions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-2xl font-bold">{test.totalMarks}</p>
              <p className="text-sm text-gray-600">Total Marks</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-2xl font-bold">{test.passingMarks || '-'}</p>
              <p className="text-sm text-gray-600">Passing Marks</p>
            </CardContent>
          </Card>
        </div>

        {/* Sections */}
        {test.sections && test.sections.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Test Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {test.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{section.sectionName}</p>
                        <p className="text-sm text-gray-600">{section.subjectName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      {section.durationMinutes && (
                        <span>⏱️ {section.durationMinutes} min</span>
                      )}
                      <span>📊 {section.totalMarks} marks</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {test.instructions && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                  {test.instructions}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Important Information */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Important Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-2">
            <p>✓ This test contains {test.totalQuestions} questions</p>
            <p>✓ Total duration: {test.durationMinutes} minutes</p>
            <p>✓ You can attempt the test multiple times</p>
            <p>✓ Your progress will be saved automatically</p>
            {!isAuthenticated && (
              <p className="font-semibold">⚠️ Please login to attempt this test</p>
            )}
          </CardContent>
        </Card>

        {/* Start Test Button */}
        <Card className="border-2 border-blue-600">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Ready to start?</h3>
              <p className="text-gray-600 mb-6">
                {isAuthenticated
                  ? 'Click the button below to begin your test'
                  : 'Login to start this test'}
              </p>
              <Button size="lg" className="text-lg px-8 py-6" onClick={handleStartTest}>
                {isAuthenticated ? '🚀 Start Test Now' : '🔐 Login to Start'}
              </Button>
            </div>
          </CardContent>
        </Card>
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
