import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">SSC Exam Prep</h1>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            Master SSC & Government Exams
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            World-class preparation platform with mock tests, study materials, and expert guidance
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg">Start Learning Free</Button>
            </Link>
            <Link href="/tests">
              <Button size="lg" variant="outline">
                Browse Tests
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>📝 Mock Tests</CardTitle>
              <CardDescription>Full-length and sectional tests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Practice with realistic test environments, timed sections, and detailed solutions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📚 Study Materials</CardTitle>
              <CardDescription>Comprehensive notes and PDFs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Access subject-wise notes, formula sheets, and previous year question papers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Analytics</CardTitle>
              <CardDescription>Track your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Get detailed insights on strengths, weaknesses, and improvement areas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8">Prepare for Top Exams</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['SSC CGL', 'SSC CHSL', 'SSC MTS', 'Railways', 'Banking'].map((exam) => (
              <div
                key={exam}
                className="bg-white border rounded-lg px-6 py-3 font-medium text-gray-700"
              >
                {exam}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 SSC Exam Preparation Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
