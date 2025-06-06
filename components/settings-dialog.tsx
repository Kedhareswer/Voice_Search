"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, ExternalLink, Shield, Zap, Info, Check } from "lucide-react"
import { aiProviders, getProviderModels } from "@/lib/ai-providers"
import type { AIProvider } from "@/types/ai-provider"

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  config: {
    provider: AIProvider
    apiKey: string
    model: string
  }
  onSave: (config: {
    provider: AIProvider
    apiKey: string
    model: string
  }) => void
}

export function SettingsDialog({ isOpen, onClose, config, onSave }: SettingsDialogProps) {
  const [provider, setProvider] = useState<AIProvider>(config.provider)
  const [apiKey, setApiKey] = useState(config.apiKey)
  const [model, setModel] = useState(config.model)
  const [showApiKey, setShowApiKey] = useState(false)
  const [activeTab, setActiveTab] = useState<"cloud" | "local">("cloud")
  const [azureEndpoint, setAzureEndpoint] = useState("")

  // Extract Azure endpoint from combined API key if present
  useEffect(() => {
    if (provider === "azure" && config.apiKey) {
      const parts = config.apiKey.split("|")
      if (parts.length > 1) {
        setApiKey(parts[0])
        setAzureEndpoint(parts[1])
      }
    }
  }, [provider, config.apiKey])

  const handleSave = () => {
    let finalApiKey = apiKey

    // For Azure, combine API key and endpoint
    if (provider === "azure" && azureEndpoint) {
      finalApiKey = `${apiKey}|${azureEndpoint}`
    }

    onSave({
      provider,
      apiKey: finalApiKey,
      model,
    })
  }

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider)

    // Set default model for the selected provider
    const models = getProviderModels(newProvider)
    if (models.length > 0) {
      setModel(models[0].value)
    }

    // Switch tabs if needed
    if (newProvider === "local") {
      setActiveTab("local")
    } else if (activeTab === "local") {
      setActiveTab("cloud")
    }
  }

  const currentProvider = aiProviders.find((p) => p.id === provider)
  const requiresApiKey = currentProvider?.requiresApiKey ?? true

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            AI Provider Settings
          </DialogTitle>
          <DialogDescription>
            Configure your AI provider to enable enhanced keyword extraction. You can also use local processing without
            an API key.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "cloud" | "local")}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="cloud" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Cloud AI
            </TabsTrigger>
            <TabsTrigger value="local" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Local Processing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cloud" className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-3">
              <Label htmlFor="provider" className="text-base font-medium">
                AI Provider
              </Label>
              <Select value={provider} onValueChange={(value) => handleProviderChange(value as AIProvider)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select AI provider" />
                </SelectTrigger>
                <SelectContent>
                  {aiProviders
                    .filter((p) => p.id !== "local")
                    .map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${provider.color} mr-2`} />
                          {provider.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Provider Info Card */}
              {currentProvider && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center">
                        <div className={`w-3 h-3 rounded-full ${currentProvider.color} mr-2`} />
                        {currentProvider.name}
                      </CardTitle>
                      {currentProvider.website && (
                        <Button variant="ghost" size="sm" asChild className="h-auto p-1">
                          <a
                            href={currentProvider.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-xs"
                          >
                            Get API Key
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                    <CardDescription className="text-xs">{currentProvider.description}</CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>

            <Separator />

            {/* API Key Input */}
            {requiresApiKey && (
              <div className="space-y-3">
                <Label htmlFor="apiKey" className="text-base font-medium">
                  API Key
                </Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showApiKey ? "Hide" : "Show"} API key</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally in your browser and never transmitted to our servers.
                </p>
              </div>
            )}

            {/* Azure-specific settings */}
            {provider === "azure" && (
              <div className="space-y-3">
                <Label htmlFor="azureEndpoint" className="text-base font-medium">
                  Azure Endpoint
                </Label>
                <Input
                  id="azureEndpoint"
                  type="text"
                  value={azureEndpoint}
                  onChange={(e) => setAzureEndpoint(e.target.value)}
                  placeholder="https://your-resource.openai.azure.com"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your Azure OpenAI endpoint URL from the Azure portal.
                </p>
              </div>
            )}

            <Separator />

            {/* Model Selection */}
            <div className="space-y-3">
              <Label htmlFor="model" className="text-base font-medium">
                Model
              </Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {getProviderModels(provider).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        {option.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {option.badge}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="local" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Check className="h-5 w-5 mr-2 text-green-600" />
                  Local Processing
                </CardTitle>
                <CardDescription>
                  Use client-side processing without requiring any API keys. This option processes your voice input
                  directly in your browser.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">About Local Processing</h4>
                  <p className="text-sm text-muted-foreground">
                    Local processing uses simple algorithms to extract keywords from your voice input. While not as
                    sophisticated as AI models, it works without requiring any API keys or sending data to external
                    servers.
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">No API key required</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Complete privacy - no data sent to servers</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Works offline</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setProvider("local")
                setModel("keyword-extraction")
                setApiKey("")
              }}
              className="w-full"
              variant="default"
            >
              Use Local Processing
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={requiresApiKey && !apiKey.trim() && provider !== "local"}>
            <Zap className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
