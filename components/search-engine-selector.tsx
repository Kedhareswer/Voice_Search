"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { searchCategories, getEnginesByCategory } from "@/lib/search-engines"
import type { SearchEngine } from "@/types/search-engines"

interface SearchEngineSelectorProps {
  selectedEngines: string[]
  onEngineToggle: (engineId: string) => void
  onCategorySelect?: (category: string) => void
}

export function SearchEngineSelector({ selectedEngines, onEngineToggle, onCategorySelect }: SearchEngineSelectorProps) {
  const [activeCategory, setActiveCategory] = useState("all")

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    onCategorySelect?.(category)
  }

  const isEngineSelected = (engineId: string) => selectedEngines.includes(engineId)

  const EngineCard = ({ engine }: { engine: SearchEngine }) => (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isEngineSelected(engine.id) ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
      onClick={() => onEngineToggle(engine.id)}
    >
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg ${engine.color} flex items-center justify-center text-white text-sm`}>
            {engine.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-sm truncate">{engine.name}</h3>
              {isEngineSelected(engine.id) && (
                <Badge variant="secondary" className="text-xs">
                  Selected
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{engine.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex h-auto p-1 space-x-1 bg-muted/50">
            {searchCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center space-x-1 px-3 py-2 text-xs"
              >
                <span>{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {searchCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {getEnginesByCategory(category.id).map((engine) => (
                <EngineCard key={engine.id} engine={engine} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {selectedEngines.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">
            {selectedEngines.length} search engine{selectedEngines.length !== 1 ? "s" : ""} selected
          </span>
          <Button variant="outline" size="sm" onClick={() => selectedEngines.forEach((id) => onEngineToggle(id))}>
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}
