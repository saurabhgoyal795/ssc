'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { materialsApi } from '@/lib/api/materials'
import { subjectsApi, type Subject } from '@/lib/api/subjects'

export default function NewMaterialPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    materialType: 'PDF',
    isPremium: false,
  })

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title) {
      alert('Title is required')
      return
    }

    setLoading(true)

    try {
      // Create material
      const material = await materialsApi.create({
        title: formData.title,
        description: formData.description || undefined,
        subjectId: formData.subjectId ? parseInt(formData.subjectId) : undefined,
        materialType: formData.materialType as 'PDF' | 'ARTICLE' | 'NOTES' | 'CHEAT_SHEET',
        isPremium: formData.isPremium,
      })

      // Upload file if selected
      if (selectedFile) {
        setUploadProgress(50)
        await materialsApi.uploadFile(material.id, selectedFile)
        setUploadProgress(100)
      }

      alert('Study material created successfully!')
      router.push('/admin/materials')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create material')
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/materials">
          <Button variant="ghost" className="mb-2">
            ← Back to Materials
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Study Material</h1>
        <p className="text-gray-600">Upload PDFs, notes, or other study resources</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Material Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Quantitative Aptitude Formula Sheet"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Describe the content and what students will learn..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.subjectId}
                      onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    >
                      <option value="">Select subject (optional)</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Material Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.materialType}
                      onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                      required
                    >
                      <option value="PDF">PDF</option>
                      <option value="ARTICLE">Article</option>
                      <option value="NOTES">Notes</option>
                      <option value="CHEAT_SHEET">Cheat Sheet</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPremium"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPremium" className="text-sm font-medium">
                    Mark as Premium Content
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File Upload */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upload File</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>

                  {selectedFile && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800 font-medium">
                        Selected: {selectedFile.name}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-600 mt-3">
                    Accepted formats: PDF, JPEG, PNG (Max 10MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Material'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
