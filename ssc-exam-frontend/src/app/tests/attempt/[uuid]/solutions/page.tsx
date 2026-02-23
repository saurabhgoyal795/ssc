'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { testAttemptsApi, type TestAttemptResponse, type QuestionAttemptResponse } from '@/lib/api/testAttempts'
import { useAuthStore } from '@/store'

export default function TestSolutionsPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [attempt, setAttempt] = useState<TestAttemptResponse | null>(null)
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    loadAttempt()
  }, [params.uuid, isAuthenticated])

  const loadAttempt = async () => {
    setLoading(true)
    try {
      const data = await testAttemptsApi.getAttemptDetails(params.uuid as string)

      if (data.status !== 'SUBMITTED') {
        alert('Test must be submitted to view solutions')
        router.push('/tests')
        return
      }

      setAttempt(data)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to load solutions')
      router.push('/tests')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredQuestions = (): QuestionAttemptResponse[] => {
    if (!attempt) return []

    switch (filter) {
      case 'correct':
        return attempt.questions.filter((q) => q.isCorrect === true)
      case 'incorrect':
        return attempt.questions.filter((q) => q.isCorrect === false && q.selectedOptionIds && q.selectedOptionIds.length > 0)
      case 'unanswered':
        return attempt.questions.filter((q) => !q.selectedOptionIds || q.selectedOptionIds.length === 0)
      default:
        return attempt.questions
    }
  }

  const getQuestionStats = () => {
    if (!attempt) return { correct: 0, incorrect: 0, unanswered: 0, total: 0 }

    const correct = attempt.correctAnswers || 0
    const incorrect = attempt.incorrectAnswers || 0
    const unanswered = attempt.unanswered || 0
    const total = attempt.totalQuestions

    return { correct, incorrect, unanswered, total }
  }

  if (loading || !attempt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const filteredQuestions = getFilteredQuestions()
  const stats = getQuestionStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <h1 className="text-2xl font-bold text-blue-600">SSC Exam Prep</h1>
              </Link>
              <p className="text-sm text-gray-600 mt-1">Solutions - {attempt.testTitle}</p>
            </div>
            <Link href={`/tests/result/${params.uuid}`}>
              <Button variant="outline">← Back to Results</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Filter Tabs */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All ({stats.total})
              </Button>
              <Button
                variant={filter === 'correct' ? 'default' : 'outline'}
                onClick={() => setFilter('correct')}
                className="text-green-700 border-green-700"
              >
                ✅ Correct ({stats.correct})
              </Button>
              <Button
                variant={filter === 'incorrect' ? 'default' : 'outline'}
                onClick={() => setFilter('incorrect')}
                className="text-red-700 border-red-700"
              >
                ❌ Incorrect ({stats.incorrect})
              </Button>
              <Button
                variant={filter === 'unanswered' ? 'default' : 'outline'}
                onClick={() => setFilter('unanswered')}
                className="text-gray-700 border-gray-700"
              >
                ⏭️ Unanswered ({stats.unanswered})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-gray-600">No questions match the selected filter</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((question, index) => {
              const isAnswered = question.selectedOptionIds && question.selectedOptionIds.length > 0
              const isCorrect = question.isCorrect

              return (
                <Card
                  key={question.id}
                  className={`border-2 ${
                    isCorrect
                      ? 'border-green-500'
                      : !isAnswered
                      ? 'border-gray-300'
                      : 'border-red-500'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-semibold text-gray-600">
                            Q{question.questionOrder}
                          </span>
                          <span
                            className={`text-sm px-2 py-1 rounded font-medium ${
                              isCorrect
                                ? 'bg-green-100 text-green-800'
                                : !isAnswered
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {isCorrect ? '✅ Correct' : !isAnswered ? '⏭️ Unanswered' : '❌ Incorrect'}
                          </span>
                          <span className="text-sm text-gray-600">
                            ({question.marks} marks)
                          </span>
                        </div>
                        <p className="text-lg whitespace-pre-wrap">{question.questionText}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {question.marksObtained !== undefined ? (
                            <span
                              className={
                                question.marksObtained > 0
                                  ? 'text-green-600'
                                  : question.marksObtained < 0
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                              }
                            >
                              {question.marksObtained > 0 ? '+' : ''}
                              {question.marksObtained.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-600">0.00</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Options */}
                    <div className="space-y-3 mb-6">
                      {question.options.map((option) => {
                        const isSelectedByUser = question.selectedOptionIds?.includes(option.id)
                        const isCorrectOption = option.isCorrect

                        let bgColor = 'bg-white'
                        let borderColor = 'border-gray-300'

                        if (isCorrectOption) {
                          bgColor = 'bg-green-50'
                          borderColor = 'border-green-500'
                        }

                        if (isSelectedByUser && !isCorrectOption) {
                          bgColor = 'bg-red-50'
                          borderColor = 'border-red-500'
                        }

                        return (
                          <div
                            key={option.id}
                            className={`p-4 border-2 rounded-lg ${bgColor} ${borderColor}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {isCorrectOption && (
                                  <span className="text-green-600 font-bold">✓</span>
                                )}
                                {isSelectedByUser && !isCorrectOption && (
                                  <span className="text-red-600 font-bold">✗</span>
                                )}
                                {!isSelectedByUser && !isCorrectOption && (
                                  <span className="text-gray-400">○</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{option.optionText}</p>
                                {isSelectedByUser && (
                                  <p className="text-sm text-gray-600 mt-1">Your answer</p>
                                )}
                                {isCorrectOption && (
                                  <p className="text-sm text-green-700 mt-1 font-medium">
                                    Correct answer
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Solution */}
                    {question.explanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">📚 Explanation:</h4>
                        <p className="text-blue-900 text-sm whitespace-pre-wrap">
                          {question.explanation}
                        </p>
                      </div>
                    )}

                    {question.solutionText && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-3">
                        <h4 className="font-semibold text-gray-900 mb-2">💡 Solution:</h4>
                        <p className="text-gray-800 text-sm whitespace-pre-wrap">
                          {question.solutionText}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link href={`/tests/result/${params.uuid}`}>
            <Button size="lg">← Back to Results</Button>
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
