"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Globe, Maximize2, Minimize2 } from "lucide-react"

interface SearchResultsProps {
  searchUrl: string
  keywords: string
}

export function SearchResults({ searchUrl, keywords }: SearchResultsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Globe className="h-5 w-5 mr-2 text-primary" />
            Search Results
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              Google Search
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="sr-only">{isExpanded ? "Minimize" : "Expand"} search results</span>
            </Button>
            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
              <a href={searchUrl} target="_blank" rel="noopener noreferrer" aria-label="Open search results in new tab">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Searching for: <span className="font-medium">{keywords}</span>
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t bg-muted/20">
          <div className="p-4 border-b bg-background/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Results powered by Google Search</span>
              <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs">
                <a href={searchUrl} target="_blank" rel="noopener noreferrer">
                  Open in Google
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>

          <div className={`transition-all duration-300 ${isExpanded ? "h-[80vh]" : "h-[500px]"}`}>
            <iframe
              src={searchUrl}
              className="w-full h-full border-0"
              title={`Search results for: ${keywords}`}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              loading="lazy"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
