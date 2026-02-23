'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { testsApi, type CreateTestRequest } from '@/lib/api/tests'
import { questionsApi, type Question } from '@/lib/api/questions'
import { subjectsApi } from '@/lib/api/subjects'
import type { Subject } from '@/types'

const testSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  testType: z.enum(['MOCK_TEST', 'SECTION_TEST', 'TOPIC_TEST', 'PREVIOUS_YEAR', 'PRACTICE']),
  difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD']),
  durationMinutes: z.number().min(1, 'Duration must be at least 1 minute'),
  totalMarks: z.number().min(0.1, 'Total marks must be positive'),
  passingMarks: z.number().min(0).optional(),
  instructions: z.string().optional(),
  isPremium: z.boolean().optional(),
})

type TestFormData = z.infer<typeof testSchema>

export default function NewTestPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questionFilters, setQuestionFilters] = useState({ subjectId: 0, page: 0 })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      testType: 'MOCK_TEST',
      difficultyLevel: 'MEDIUM',
      durationMinutes: 60,
      totalMarks: 100,
      isPremium: false,
    },
  })

  const title = watch('title')

  useEffect(() => {
    loadSubjects()
  }, [])

  useEffect(() => {
    loadQuestions()
  }, [questionFilters])

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      setValue('slug', slug)
    }
  }, [title, setValue])

  const loadSubjects = async () => {
    try {
      const data = await subjectsApi.list()
      setSubjects(data)
    } catch (error) {
      console.error('Failed to load subjects:', error)
    }
  }

  const loadQuestions = async () => {
    try {
      const data = await questionsApi.list({
        subjectId: questionFilters.subjectId || undefined,
        page: questionFilters.page,
        size: 50,
      })
      setQuestions(data.content)
    } catch (error) {
      console.error('Failed to load questions:', error)
    }
  }

  const handleQuestionToggle = (questionId: number) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    )
  }

  const onSubmit = async (data: TestFormData) => {
    if (selectedQuestions.length === 0) {
      setError('Please select at least one question')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const testData: CreateTestRequest = {
        ...data,
        questionIds: selectedQuestions,
      }

      await testsApi.create(testData)
      router.push('/admin/tests')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create test')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Test</h1>
        <p className="text-gray-600">Create a new test for students</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., SSC CGL Tier 1 Mock Test 1"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="slug">Slug * (auto-generated)</Label>
                <Input
                  id="slug"
                  placeholder="e.g., ssc-cgl-tier-1-mock-test-1"
                  {...register('slug')}
                />
                {errors.slug && (
                  <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Brief description of the test"
                  {...register('description')}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="testType">Test Type *</Label>
                  <select
                    id="testType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...register('testType')}
                  >
                    <option value="MOCK_TEST">Mock Test</option>
                    <option value="SECTION_TEST">Section Test</option>
                    <option value="TOPIC_TEST">Topic Test</option>
                    <option value="PREVIOUS_YEAR">Previous Year</option>
                    <option value="PRACTICE">Practice</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="difficultyLevel">Difficulty *</Label>
                  <select
                    id="difficultyLevel"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...register('difficultyLevel')}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="durationMinutes">Duration (minutes) *</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    {...register('durationMinutes', { valueAsNumber: true })}
                  />
                  {errors.durationMinutes && (
                    <p className="text-sm text-red-600 mt-1">{errors.durationMinutes.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalMarks">Total Marks *</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    step="0.1"
                    {...register('totalMarks', { valueAsNumber: true })}
                  />
                  {errors.totalMarks && (
                    <p className="text-sm text-red-600 mt-1">{errors.totalMarks.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="passingMarks">Passing Marks</Label>
                  <Input
                    id="passingMarks"
                    type="number"
                    step="0.1"
                    {...register('passingMarks', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <textarea
                  id="instructions"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Instructions for test takers"
                  {...register('instructions')}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPremium"
                  className="h-4 w-4"
                  {...register('isPremium')}
                />
                <Label htmlFor="isPremium">Premium Test</Label>
              </div>
            </CardContent>
          </Card>

          {/* Select Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Select Questions ({selectedQuestions.length} selected)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={questionFilters.subjectId}
                  onChange={(e) => setQuestionFilters({ ...questionFilters, subjectId: Number(e.target.value), page: 0 })}
                >
                  <option value="0">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {questions.length === 0 ? (
                  <p className="text-center py-8 text-gray-600">No questions available</p>
                ) : (
                  <div className="divide-y">
                    {questions.map((question) => (
                      <div
                        key={question.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleQuestionToggle(question.id)}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => {}}
                            className="mt-1 h-4 w-4"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-600">{question.subjectName}</span>
                              <span className="text-xs text-gray-400">{question.difficultyLevel}</span>
                            </div>
                            <p className="text-sm">
                              {question.questionText.substring(0, 150)}
                              {question.questionText.length > 150 && '...'}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                              <span>Marks: {question.marks}</span>
                              <span>{question.options.length} options</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading || selectedQuestions.length === 0}>
              {loading ? 'Creating...' : 'Create Test'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/tests')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
