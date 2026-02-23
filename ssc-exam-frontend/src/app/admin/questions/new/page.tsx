'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { questionsApi, type CreateQuestionRequest } from '@/lib/api/questions'
import { subjectsApi } from '@/lib/api/subjects'
import type { Subject } from '@/types'

const questionSchema = z.object({
  subjectId: z.number().min(1, 'Subject is required'),
  topicId: z.number().optional(),
  questionText: z.string().min(10, 'Question must be at least 10 characters'),
  questionType: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'NUMERICAL']),
  difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD']),
  marks: z.number().min(0.1, 'Marks must be positive'),
  negativeMarks: z.number().min(0, 'Negative marks must be non-negative'),
  solutionText: z.string().optional(),
  explanation: z.string().optional(),
  options: z.array(
    z.object({
      optionText: z.string().min(1, 'Option text is required'),
      optionOrder: z.number(),
      isCorrect: z.boolean(),
    })
  ).min(2, 'At least 2 options required'),
})

type QuestionFormData = z.infer<typeof questionSchema>

export default function NewQuestionPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      marks: 1,
      negativeMarks: 0.25,
      questionType: 'SINGLE_CHOICE',
      difficultyLevel: 'MEDIUM',
      options: [
        { optionText: '', optionOrder: 1, isCorrect: false },
        { optionText: '', optionOrder: 2, isCorrect: false },
        { optionText: '', optionOrder: 3, isCorrect: false },
        { optionText: '', optionOrder: 4, isCorrect: false },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  })

  const questionType = watch('questionType')

  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    try {
      const data = await subjectsApi.list()
      setSubjects(data)
    } catch (error) {
      console.error('Failed to load subjects:', error)
    }
  }

  const onSubmit = async (data: QuestionFormData) => {
    setLoading(true)
    setError(null)

    try {
      // Validate at least one correct answer for MCQs
      if (questionType !== 'NUMERICAL') {
        const correctCount = data.options.filter((opt) => opt.isCorrect).length
        if (correctCount === 0) {
          setError('At least one option must be marked as correct')
          setLoading(false)
          return
        }
        if (questionType === 'SINGLE_CHOICE' && correctCount > 1) {
          setError('Single choice questions can have only one correct option')
          setLoading(false)
          return
        }
      }

      await questionsApi.create(data as CreateQuestionRequest)
      router.push('/admin/questions')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Question</h1>
        <p className="text-gray-600">Add a new question to the question bank</p>
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
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subjectId">Subject *</Label>
                  <select
                    id="subjectId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...register('subjectId', { valueAsNumber: true })}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  {errors.subjectId && (
                    <p className="text-sm text-red-600 mt-1">{errors.subjectId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="questionType">Question Type *</Label>
                  <select
                    id="questionType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...register('questionType')}
                  >
                    <option value="SINGLE_CHOICE">Single Choice</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="NUMERICAL">Numerical</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
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
                  <Label htmlFor="marks">Marks *</Label>
                  <Input
                    id="marks"
                    type="number"
                    step="0.1"
                    {...register('marks', { valueAsNumber: true })}
                  />
                  {errors.marks && (
                    <p className="text-sm text-red-600 mt-1">{errors.marks.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="negativeMarks">Negative Marks *</Label>
                  <Input
                    id="negativeMarks"
                    type="number"
                    step="0.1"
                    {...register('negativeMarks', { valueAsNumber: true })}
                  />
                  {errors.negativeMarks && (
                    <p className="text-sm text-red-600 mt-1">{errors.negativeMarks.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="questionText">Question Text *</Label>
                <textarea
                  id="questionText"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register('questionText')}
                />
                {errors.questionText && (
                  <p className="text-sm text-red-600 mt-1">{errors.questionText.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          {questionType !== 'NUMERICAL' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Options</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({ optionText: '', optionOrder: fields.length + 1, isCorrect: false })
                    }
                  >
                    ➕ Add Option
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        {...register(`options.${index}.optionText`)}
                      />
                      {errors.options?.[index]?.optionText && (
                        <p className="text-sm text-red-600">
                          {errors.options[index]?.optionText?.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        {...register(`options.${index}.isCorrect`)}
                      />
                      <Label className="text-sm">Correct</Label>
                    </div>
                    {fields.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {errors.options?.root && (
                  <p className="text-sm text-red-600">{errors.options.root.message}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Solution */}
          <Card>
            <CardHeader>
              <CardTitle>Solution & Explanation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="solutionText">Solution</Label>
                <textarea
                  id="solutionText"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register('solutionText')}
                />
              </div>

              <div>
                <Label htmlFor="explanation">Explanation</Label>
                <textarea
                  id="explanation"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register('explanation')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Question'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/questions')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
