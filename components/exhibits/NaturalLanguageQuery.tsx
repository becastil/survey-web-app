"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Send, Sparkles, Loader2 } from 'lucide-react'

interface NaturalLanguageQueryProps {
  onQuery: (query: string) => void
  loading: boolean
}

export default function NaturalLanguageQuery({ onQuery, loading }: NaturalLanguageQueryProps) {
  const [query, setQuery] = useState('')

  const sampleQueries = [
    "How do our health benefits compare to similar hospitals?",
    "What benefits are causing retention issues?",
    "Show me where we're losing talent",
    "Compare our 401k match to tech companies"
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onQuery(query)
    }
  }

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery)
    onQuery(sampleQuery)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Natural Language Query
        </CardTitle>
        <CardDescription>
          Ask questions about your benefits data in plain English
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            placeholder="e.g., 'How competitive is our health insurance?'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !query.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Try these example queries:</p>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sampleQuery, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSampleQuery(sampleQuery)}
              >
                {sampleQuery}
              </Badge>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing your query with AI...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}