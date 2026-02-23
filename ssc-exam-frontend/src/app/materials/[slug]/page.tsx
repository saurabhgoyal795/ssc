'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { materialsApi, type StudyMaterial } from '@/lib/api/materials'

export default function MaterialDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [material, setMaterial] = useState<StudyMaterial | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMaterial()
  }, [params.slug])

  const loadMaterial = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await materialsApi.getBySlug(params.slug as string)
      setMaterial(data)
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'Material not found' : 'Failed to load material')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!material) return

    setDownloading(true)
    try {
      const downloadUrl = await materialsApi.getDownloadUrl(material.slug)
      window.open(downloadUrl, '_blank')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to download file')
    } finally {
      setDownloading(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const getMaterialIcon = (type: string) => {
    const icons: Record<string, string> = {
      PDF: '📄',
      ARTICLE: '📰',
      NOTES: '📝',
      CHEAT_SHEET: '📋',
    }
    return icons[type] || '📚'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !material) {
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
          <p className="text-gray-600 mb-6">The material you're looking for doesn't exist</p>
          <Link href="/materials">
            <Button>Browse All Materials</Button>
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
            <Link href="/materials">
              <Button variant="ghost">← Back to Materials</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Material Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{getMaterialIcon(material.materialType)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm px-3 py-1 rounded bg-gray-100 text-gray-800 font-medium">
                  {material.materialType}
                </span>
                {material.subjectName && (
                  <span className="text-sm px-3 py-1 rounded bg-blue-100 text-blue-700 font-medium">
                    {material.subjectName}
                  </span>
                )}
                {material.isPremium && (
                  <span className="text-sm px-3 py-1 rounded bg-purple-100 text-purple-700 font-medium">
                    Premium
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold">{material.title}</h1>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">👁️</div>
              <p className="text-2xl font-bold">{material.viewCount}</p>
              <p className="text-sm text-gray-600">Views</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">⬇️</div>
              <p className="text-2xl font-bold">{material.downloadCount}</p>
              <p className="text-sm text-gray-600">Downloads</p>
            </CardContent>
          </Card>

          {material.fileSizeBytes && (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl mb-2">📦</div>
                <p className="text-2xl font-bold">{formatFileSize(material.fileSizeBytes)}</p>
                <p className="text-sm text-gray-600">File Size</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Description */}
        {material.description && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About this Material</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{material.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{material.materialType}</span>
              </div>
              {material.subjectName && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-medium">{material.subjectName}</span>
                </div>
              )}
              {material.topicName && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Topic:</span>
                  <span className="font-medium">{material.topicName}</span>
                </div>
              )}
              {material.createdByName && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created by:</span>
                  <span className="font-medium">{material.createdByName}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Added on:</span>
                <span className="font-medium">
                  {new Date(material.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Button */}
        <Card className="border-2 border-blue-600">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Ready to download?</h3>
              <p className="text-gray-600 mb-6">
                Access this study material to enhance your preparation
              </p>
              {material.fileUrl ? (
                <Button size="lg" className="text-lg px-8 py-6" onClick={handleDownload} disabled={downloading}>
                  {downloading ? '⏳ Preparing Download...' : '⬇️ Download Now'}
                </Button>
              ) : (
                <p className="text-red-600">No file available for download</p>
              )}
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
