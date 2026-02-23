'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api/client'

export default function EditQuestionPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [subjects, setSubjects] = useState<any[]>([])
  const [formData, setFormData] = useState({
    subjectId: 0,
    topicId: null,
    questionText: '',
    questionType: 'SINGLE_CHOICE',
    difficultyLevel: 'MEDIUM',
    marks: 1,
    negativeMarks: 0.25,
    solutionText: '',
    explanation: '',
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
    ],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [subjectsRes, questionRes] = await Promise.all([
        apiClient.get('/subjects'),
        apiClient.get(`/admin/questions/${params.id}`),
      ])

      setSubjects(subjectsRes.data.data)
      const q = questionRes.data.data
      setFormData({
        subjectId: q.subjectId,
        topicId: q.topicId,
        questionText: q.questionText,
        questionType: q.questionType,
        difficultyLevel: q.difficultyLevel,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        solutionText: q.solutionText || '',
        explanation: q.explanation || '',
        options: q.options?.length ? q.options : formData.options,
      })
    } catch (error) {
      alert('Failed to load question')
      router.push('/admin/questions')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await apiClient.put(`/admin/questions/${params.id}`, formData)
      alert('Question updated!')
      router.push('/admin/questions')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div>
      <Link href="/admin/questions">
        <Button variant="ghost" size="sm" className="mb-4">← Back</Button>
      </Link>
      <h1 className="text-3xl font-bold mb-6">Edit Question</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Question Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Subject *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: Number(e.target.value) })}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Difficulty *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.difficultyLevel}
                  onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Question Text *</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Marks *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>Negative Marks</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.negativeMarks}
                  onChange={(e) => setFormData({ ...formData, negativeMarks: Number(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Options</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {formData.options.map((opt, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  placeholder={`Option ${idx + 1}`}
                  value={opt.optionText}
                  onChange={(e) => {
                    const newOpts = [...formData.options]
                    newOpts[idx].optionText = e.target.value
                    setFormData({ ...formData, options: newOpts })
                  }}
                  required
                />
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={opt.isCorrect}
                    onChange={() => {
                      const newOpts = formData.options.map((o, i) => ({
                        ...o,
                        isCorrect: i === idx,
                      }))
                      setFormData({ ...formData, options: newOpts })
                    }}
                  />
                  <span className="text-sm">Correct</span>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Solution</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Solution Text</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                value={formData.solutionText}
                onChange={(e) => setFormData({ ...formData, solutionText: e.target.value })}
              />
            </div>
            <div>
              <Label>Explanation</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Link href="/admin/questions">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
