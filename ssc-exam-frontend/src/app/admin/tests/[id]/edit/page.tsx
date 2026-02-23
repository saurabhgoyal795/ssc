'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { testsApi } from '@/lib/api/tests'
import type { Test } from '@/types'

export default function EditTestPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [test, setTest] = useState<Test | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    testType: 'MOCK_TEST',
    difficultyLevel: 'MEDIUM',
    durationMinutes: 60,
    totalMarks: 100,
    passingMarks: 40,
    instructions: '',
    isPremium: false,
  })

  useEffect(() => {
    loadTest()
  }, [])

  const loadTest = async () => {
    try {
      const data = await testsApi.getById(Number(params.id))
      setTest(data)
      setFormData({
        title: data.title,
        slug: data.slug,
        description: data.description || '',
        testType: data.testType,
        difficultyLevel: data.difficultyLevel,
        durationMinutes: data.durationMinutes,
        totalMarks: Number(data.totalMarks),
        passingMarks: data.passingMarks ? Number(data.passingMarks) : 0,
        instructions: data.instructions || '',
        isPremium: data.isPremium,
      })
    } catch (error) {
      alert('Failed to load test')
      router.push('/admin/tests')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await testsApi.update(Number(params.id), {
        ...formData,
        questionIds: [], // Keep existing questions
      })
      alert('Test updated successfully!')
      router.push('/admin/tests')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update test')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading test...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/tests">
            <Button variant="ghost" size="sm">← Back to Tests</Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-2">Edit Test</h1>
        <p className="text-gray-600">Update test information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Test Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="testType">Test Type *</Label>
                <select
                  id="testType"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.testType}
                  onChange={(e) => setFormData({ ...formData, testType: e.target.value as any })}
                  required
                >
                  <option value="MOCK_TEST">Mock Test</option>
                  <option value="SECTION_TEST">Section Test</option>
                  <option value="TOPIC_TEST">Topic Test</option>
                  <option value="PREVIOUS_YEAR">Previous Year</option>
                  <option value="PRACTICE">Practice</option>
                </select>
              </div>

              <div>
                <Label htmlFor="difficultyLevel">Difficulty Level *</Label>
                <select
                  id="difficultyLevel"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.difficultyLevel}
                  onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value as any })}
                  required
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
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalMarks">Total Marks *</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="passingMarks">Passing Marks</Label>
                <Input
                  id="passingMarks"
                  type="number"
                  value={formData.passingMarks}
                  onChange={(e) => setFormData({ ...formData, passingMarks: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <textarea
                id="instructions"
                className="w-full px-3 py-2 border rounded-md min-h-[150px]"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Enter test instructions..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPremium"
                checked={formData.isPremium}
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
              />
              <Label htmlFor="isPremium">Premium Test</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-6">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Link href="/admin/tests">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
