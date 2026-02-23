'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { questionsApi, type Question } from '@/lib/api/questions'
import { subjectsApi } from '@/lib/api/subjects'
import type { Subject } from '@/types'

export default function QuestionsPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    loadSubjects()
    loadQuestions()
  }, [page, selectedSubject, search])

  const loadSubjects = async () => {
    try {
      const data = await subjectsApi.list()
      setSubjects(data)
    } catch (error) {
      console.error('Failed to load subjects:', error)
    }
  }

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const data = await questionsApi.list({
        subjectId: selectedSubject || undefined,
        search: search || undefined,
        page,
        size: 20,
      })
      setQuestions(data.content)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Failed to load questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      await questionsApi.delete(id)
      loadQuestions()
    } catch (error) {
      console.error('Failed to delete question:', error)
      alert('Failed to delete question')
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'EASY':
        return 'text-green-600 bg-green-50'
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50'
      case 'HARD':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Questions</h1>
          <p className="text-gray-600">Manage your question bank</p>
        </div>
        <Link href="/admin/questions/new">
          <Button>➕ Create Question</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
            />

            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedSubject || ''}
              onChange={(e) => {
                setSelectedSubject(e.target.value ? Number(e.target.value) : null)
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

            <Button variant="outline" onClick={() => {
              setSearch('')
              setSelectedSubject(null)
              setPage(0)
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">No questions found</p>
            <Link href="/admin/questions/new">
              <Button>Create your first question</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {questions.map((question) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          {question.subjectName}
                        </span>
                        {question.topicName && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-xs text-gray-600">{question.topicName}</span>
                          </>
                        )}
                        <span className="text-gray-400">•</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(question.difficultyLevel)}`}>
                          {question.difficultyLevel}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-600">{question.questionType.replace('_', ' ')}</span>
                      </div>
                      <CardTitle className="text-base font-medium mb-2">
                        {question.questionText.substring(0, 200)}
                        {question.questionText.length > 200 && '...'}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Marks: {question.marks}</span>
                        <span>Negative: {question.negativeMarks}</span>
                        <span>{question.options.length} options</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/questions/${question.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(question.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Pagination */}
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
