'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { testAttemptsApi, type TestResultResponse } from '@/lib/api/testAttempts'
import { useAuthStore } from '@/store'

export default function TestResultPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [result, setResult] = useState<TestResultResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    loadResult()
  }, [params.uuid, isAuthenticated])

  const loadResult = async () => {
    setLoading(true)
    try {
      const data = await testAttemptsApi.getTestResult(params.uuid as string)
      setResult(data)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to load results')
      router.push('/tests')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${mins}m ${secs}s`
  }

  const getScorePercentage = () => {
    if (!result) return 0
    return Math.round((result.totalScore / result.maxScore) * 100)
  }

  const getPerformanceColor = () => {
    const percentage = getScorePercentage()
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-blue-600'
    if (percentage >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceEmoji = () => {
    const percentage = getScorePercentage()
    if (percentage >= 80) return '🎉'
    if (percentage >= 60) return '👍'
    if (percentage >= 40) return '😊'
    return '📚'
  }

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const scorePercentage = getScorePercentage()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-600">SSC Exam Prep</h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Result Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{getPerformanceEmoji()}</div>
          <h1 className="text-4xl font-bold mb-2">{result.testTitle}</h1>
          <p className="text-gray-600 text-lg">Test Completed</p>
        </div>

        {/* Score Card */}
        <Card className="mb-6 border-2 border-blue-600">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getPerformanceColor()}`}>
                {result.totalScore.toFixed(2)} / {result.maxScore.toFixed(2)}
              </div>
              <div className="text-2xl text-gray-600 mb-4">{scorePercentage}%</div>
              <p className="text-lg text-gray-700">{result.performanceSummary}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-3xl font-bold text-green-600">{result.correctAnswers}</p>
              <p className="text-sm text-gray-600">Correct Answers</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">❌</div>
              <p className="text-3xl font-bold text-red-600">{result.incorrectAnswers}</p>
              <p className="text-sm text-gray-600">Incorrect Answers</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">⏭️</div>
              <p className="text-3xl font-bold text-gray-600">{result.unanswered}</p>
              <p className="text-sm text-gray-600">Unanswered</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-3xl font-bold text-blue-600">
                {result.accuracyPercentage ? result.accuracyPercentage.toFixed(1) : '0.0'}%
              </p>
              <p className="text-sm text-gray-600">Accuracy</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-3xl font-bold text-purple-600">
                {result.percentile ? result.percentile.toFixed(1) : '0.0'}
              </p>
              <p className="text-sm text-gray-600">Percentile</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-3xl font-bold text-orange-600">
                {result.rank || 0} / {result.totalAttempts || 0}
              </p>
              <p className="text-sm text-gray-600">Rank</p>
            </CardContent>
          </Card>
        </div>

        {/* Time Taken */}
        <Card className="mb-8">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <p className="text-2xl font-bold text-gray-700">
              {formatTime(result.timeTakenSeconds)}
            </p>
            <p className="text-sm text-gray-600">Time Taken</p>
          </CardContent>
        </Card>

        {/* Performance Analysis */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Total Questions:</span>
                <span className="font-semibold">
                  {result.correctAnswers + result.incorrectAnswers + result.unanswered}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Questions Attempted:</span>
                <span className="font-semibold">
                  {result.correctAnswers + result.incorrectAnswers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Your Percentile:</span>
                <span className="font-semibold text-purple-600">
                  Top {(100 - result.percentile).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/tests/attempt/${params.uuid}/solutions`} className="flex-1">
            <Button className="w-full" size="lg">
              📖 View Solutions
            </Button>
          </Link>
          <Link href="/tests" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              Browse More Tests
            </Button>
          </Link>
        </div>
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
