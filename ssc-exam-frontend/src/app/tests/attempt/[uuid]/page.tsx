'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { testAttemptsApi, type TestAttemptResponse, type QuestionAttemptResponse } from '@/lib/api/testAttempts'
import { useAuthStore } from '@/store'

export default function TestAttemptPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [attempt, setAttempt] = useState<TestAttemptResponse | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, number[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    loadAttempt()
  }, [params.uuid, isAuthenticated])

  useEffect(() => {
    if (attempt && attempt.status === 'IN_PROGRESS') {
      startTimer()
      setupVisibilityTracking()
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [attempt])

  const loadAttempt = async () => {
    setLoading(true)
    try {
      const data = await testAttemptsApi.getAttemptDetails(params.uuid as string)

      if (data.status === 'SUBMITTED') {
        router.push(`/tests/result/${params.uuid}`)
        return
      }

      setAttempt(data)

      // Calculate remaining time
      const startedAt = new Date(data.startedAt).getTime()
      const now = Date.now()
      const elapsedSeconds = Math.floor((now - startedAt) / 1000)
      const totalSeconds = data.durationMinutes * 60
      const remaining = Math.max(0, totalSeconds - elapsedSeconds)
      setTimeRemaining(remaining)

      // Load existing answers
      const answers = new Map<number, number[]>()
      data.questions.forEach((q) => {
        if (q.selectedOptionIds && q.selectedOptionIds.length > 0) {
          answers.set(q.id, q.selectedOptionIds)
        }
      })
      setSelectedAnswers(answers)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to load test')
      router.push('/tests')
    } finally {
      setLoading(false)
    }
  }

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const setupVisibilityTracking = () => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1
          if (newCount === 1) {
            alert('Warning: Tab switching is being monitored')
          }
          return newCount
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  const handleAutoSubmit = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    await handleSubmit()
  }

  const currentQuestion = attempt?.questions[currentQuestionIndex]

  const handleAnswerSelect = async (optionId: number) => {
    if (!currentQuestion || !attempt) return

    let newAnswer: number[]

    if (currentQuestion.questionType === 'SINGLE_CHOICE') {
      newAnswer = [optionId]
    } else {
      // Multiple choice
      const current = selectedAnswers.get(currentQuestion.id) || []
      if (current.includes(optionId)) {
        newAnswer = current.filter((id) => id !== optionId)
      } else {
        newAnswer = [...current, optionId]
      }
    }

    // Update local state
    setSelectedAnswers((prev) => {
      const updated = new Map(prev)
      if (newAnswer.length === 0) {
        updated.delete(currentQuestion.id)
      } else {
        updated.set(currentQuestion.id, newAnswer)
      }
      return updated
    })

    // Auto-save to backend
    try {
      await testAttemptsApi.submitAnswer(attempt.uuid, {
        questionId: currentQuestion.id,
        selectedOptionIds: newAnswer.length > 0 ? newAnswer : undefined,
      })
    } catch (error) {
      console.error('Failed to save answer:', error)
    }
  }

  const handleToggleBookmark = async () => {
    if (!currentQuestion || !attempt) return

    try {
      const newBookmarkState = !currentQuestion.isBookmarked
      await testAttemptsApi.submitAnswer(attempt.uuid, {
        questionId: currentQuestion.id,
        isBookmarked: newBookmarkState,
      })

      setAttempt((prev) => {
        if (!prev) return prev
        const updated = { ...prev }
        updated.questions = updated.questions.map((q) =>
          q.id === currentQuestion.id ? { ...q, isBookmarked: newBookmarkState } : q
        )
        return updated
      })
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    }
  }

  const handleToggleReview = async () => {
    if (!currentQuestion || !attempt) return

    try {
      const newReviewState = !currentQuestion.isMarkedForReview
      await testAttemptsApi.submitAnswer(attempt.uuid, {
        questionId: currentQuestion.id,
        isMarkedForReview: newReviewState,
      })

      setAttempt((prev) => {
        if (!prev) return prev
        const updated = { ...prev }
        updated.questions = updated.questions.map((q) =>
          q.id === currentQuestion.id ? { ...q, isMarkedForReview: newReviewState } : q
        )
        return updated
      })
    } catch (error) {
      console.error('Failed to toggle review:', error)
    }
  }

  const handleSubmit = async () => {
    if (!attempt) return

    const confirmed = confirm(
      'Are you sure you want to submit the test? You cannot change your answers after submission.'
    )
    if (!confirmed) return

    setSubmitting(true)
    try {
      await testAttemptsApi.submitTest(attempt.uuid)
      router.push(`/tests/result/${attempt.uuid}`)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit test')
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  const getQuestionStatus = (question: QuestionAttemptResponse) => {
    const hasAnswer = selectedAnswers.has(question.id)
    if (question.isBookmarked) return 'bookmarked'
    if (question.isMarkedForReview) return 'review'
    if (hasAnswer) return 'answered'
    return 'not-visited'
  }

  const countByStatus = () => {
    if (!attempt) return { answered: 0, notAnswered: 0, marked: 0, bookmarked: 0 }

    const answered = attempt.questions.filter((q) => selectedAnswers.has(q.id)).length
    const marked = attempt.questions.filter((q) => q.isMarkedForReview).length
    const bookmarked = attempt.questions.filter((q) => q.isBookmarked).length
    const notAnswered = attempt.totalQuestions - answered

    return { answered, notAnswered, marked, bookmarked }
  }

  if (loading || !attempt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = countByStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{attempt.testTitle}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {attempt.totalQuestions}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`text-2xl font-bold ${
                timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'
              }`}
            >
              ⏱️ {formatTime(timeRemaining)}
            </div>
            <Button onClick={handleSubmit} disabled={submitting} variant="destructive">
              {submitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Question Area */}
        <div className="flex-1 p-6">
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Question {currentQuestionIndex + 1}
                  <span className="text-sm text-gray-600 ml-3">
                    ({currentQuestion?.marks} marks, -{currentQuestion?.negativeMarks} for wrong)
                  </span>
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={currentQuestion?.isBookmarked ? 'default' : 'outline'}
                    onClick={handleToggleBookmark}
                  >
                    {currentQuestion?.isBookmarked ? '⭐ Bookmarked' : '☆ Bookmark'}
                  </Button>
                  <Button
                    size="sm"
                    variant={currentQuestion?.isMarkedForReview ? 'default' : 'outline'}
                    onClick={handleToggleReview}
                  >
                    {currentQuestion?.isMarkedForReview ? '🚩 Marked' : '🏳️ Mark for Review'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-lg whitespace-pre-wrap">{currentQuestion?.questionText}</p>
              </div>

              <div className="space-y-3">
                {currentQuestion?.options.map((option) => {
                  const isSelected = selectedAnswers
                    .get(currentQuestion.id)
                    ?.includes(option.id)

                  return (
                    <div
                      key={option.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }`}
                      onClick={() => handleAnswerSelect(option.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {currentQuestion.questionType === 'SINGLE_CHOICE' ? (
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-blue-500' : 'border-gray-400'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              )}
                            </div>
                          ) : (
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                              }`}
                            >
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="flex-1">{option.optionText}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.min(attempt.totalQuestions - 1, prev + 1))
              }
              disabled={currentQuestionIndex === attempt.totalQuestions - 1}
            >
              Next →
            </Button>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <aside className="w-80 bg-white border-l p-4 max-h-screen overflow-y-auto sticky top-[57px]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question Palette</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Status Legend */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded"></div>
                  <span>Answered ({stats.answered})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  <span>Not Answered ({stats.notAnswered})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded"></div>
                  <span>Marked for Review ({stats.marked})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500 rounded"></div>
                  <span>Bookmarked ({stats.bookmarked})</span>
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2">
                {attempt.questions.map((question, index) => {
                  const status = getQuestionStatus(question)
                  let bgColor = 'bg-gray-300'

                  if (status === 'answered') bgColor = 'bg-green-500'
                  else if (status === 'review') bgColor = 'bg-yellow-500'
                  else if (status === 'bookmarked') bgColor = 'bg-purple-500'

                  return (
                    <button
                      key={question.id}
                      className={`w-full aspect-square rounded flex items-center justify-center font-semibold text-white ${bgColor} ${
                        index === currentQuestionIndex ? 'ring-2 ring-blue-600' : ''
                      }`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
