"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Settings, Zap, Shield, Clock } from "lucide-react"

interface SearchPreferencesProps {
  preferences: {
    autoSearch: boolean
    openInNewTab: boolean
    saveHistory: boolean
    defaultEngines: string[]
  }
  onPreferenceChange: (key: string, value: any) => void
}

export function SearchPreferences({ preferences, onPreferenceChange }: SearchPreferencesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Settings className="h-5 w-5 mr-2" />
          Search Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto Search */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-primary" />
              <Label htmlFor="auto-search" className="font-medium">
                Auto Search
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">Automatically search when voice input stops</p>
          </div>
          <Switch
            id="auto-search"
            checked={preferences.autoSearch}
            onCheckedChange={(checked) => onPreferenceChange("autoSearch", checked)}
          />
        </div>

        <Separator />

        {/* Open in New Tab */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="new-tab" className="font-medium">
              Open in New Tab
            </Label>
            <p className="text-sm text-muted-foreground">Open search results in new browser tabs</p>
          </div>
          <Switch
            id="new-tab"
            checked={preferences.openInNewTab}
            onCheckedChange={(checked) => onPreferenceChange("openInNewTab", checked)}
          />
        </div>

        <Separator />

        {/* Save History */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <Label htmlFor="save-history" className="font-medium">
                Save Search History
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">Keep a local history of your searches</p>
          </div>
          <Switch
            id="save-history"
            checked={preferences.saveHistory}
            onCheckedChange={(checked) => onPreferenceChange("saveHistory", checked)}
          />
        </div>

        <Separator />

        {/* Privacy Notice */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Privacy First</p>
              <p className="text-xs text-muted-foreground">
                All preferences are stored locally in your browser. No data is sent to external servers.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
