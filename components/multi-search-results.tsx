"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExternalLink, Maximize2, Minimize2, RefreshCw, Grid3X3, List } from "lucide-react"
import { searchEngines } from "@/lib/search-engines"
import type { SearchEngine } from "@/types/search-engines"

interface MultiSearchResultsProps {
  searchQuery: string
  selectedEngines: string[]
  onEngineRemove?: (engineId: string) => void
}

export function MultiSearchResults({ searchQuery, selectedEngines, onEngineRemove }: MultiSearchResultsProps) {
  const [activeEngine, setActiveEngine] = useState<string>("")
  const [expandedEngines, setExpandedEngines] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"tabs" | "grid">("tabs")
  const [refreshKey, setRefreshKey] = useState(0)

  const activeSearchEngines = searchEngines.filter((engine) => selectedEngines.includes(engine.id))

  useEffect(() => {
    if (activeSearchEngines.length > 0 && !activeEngine) {
      setActiveEngine(activeSearchEngines[0].id)
    }
  }, [activeSearchEngines, activeEngine])

  const toggleExpanded = (engineId: string) => {
    const newExpanded = new Set(expandedEngines)
    if (newExpanded.has(engineId)) {
      newExpanded.delete(engineId)
    } else {
      newExpanded.add(engineId)
    }
    setExpandedEngines(newExpanded)
  }

  const refreshResults = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const SearchFrame = ({ engine, isExpanded = false }: { engine: SearchEngine; isExpanded?: boolean }) => {
    const searchUrl = engine.searchUrl(searchQuery)
    const height = isExpanded ? "h-[80vh]" : "h-[400px]"

    return (
      <div className={`${height} transition-all duration-300`}>
        <iframe
          key={`${engine.id}-${refreshKey}`}
          src={searchUrl}
          className="w-full h-full border-0 rounded-lg"
          title={`${engine.name} search results for: ${searchQuery}`}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          loading="lazy"
        />
      </div>
    )
  }

  const EngineHeader = ({ engine }: { engine: SearchEngine }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`w-6 h-6 rounded ${engine.color} flex items-center justify-center text-white text-sm`}>
          {engine.icon}
        </div>
        <div>
          <h3 className="font-medium">{engine.name}</h3>
          <p className="text-xs text-muted-foreground">{engine.description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => toggleExpanded(engine.id)} className="h-8 w-8 p-0">
          {expandedEngines.has(engine.id) ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
          <a
            href={engine.searchUrl(searchQuery)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${engine.name} in new tab`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  )

  if (activeSearchEngines.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No search engines selected</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {activeSearchEngines.length} search engine{activeSearchEngines.length !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="outline">Query: {searchQuery}</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={refreshResults} className="h-8 w-8 p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "tabs" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("tabs")}
              className="h-8 px-2"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 px-2"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {viewMode === "tabs" ? (
        <Tabs value={activeEngine} onValueChange={setActiveEngine} className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-auto p-1 space-x-1 bg-muted/50">
              {activeSearchEngines.map((engine) => (
                <TabsTrigger key={engine.id} value={engine.id} className="flex items-center space-x-2 px-3 py-2">
                  <span className="text-sm">{engine.icon}</span>
                  <span className="hidden sm:inline text-sm">{engine.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {activeSearchEngines.map((engine) => (
            <TabsContent key={engine.id} value={engine.id} className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <EngineHeader engine={engine} />
                </CardHeader>
                <CardContent className="p-0">
                  <SearchFrame engine={engine} isExpanded={expandedEngines.has(engine.id)} />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeSearchEngines.map((engine) => (
            <Card key={engine.id}>
              <CardHeader className="pb-3">
                <EngineHeader engine={engine} />
              </CardHeader>
              <CardContent className="p-0">
                <SearchFrame engine={engine} isExpanded={expandedEngines.has(engine.id)} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
