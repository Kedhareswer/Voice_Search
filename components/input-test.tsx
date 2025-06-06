"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function InputTest() {
  const [value, setValue] = useState("")
  
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Input Test Component</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="test-input" className="block text-sm font-medium mb-1">
            Test Input Field
          </label>
          <Input
            id="test-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type here to test input..."
            className="w-full"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            Current value: <span className="font-mono">{value}</span>
          </div>
          <Button onClick={() => setValue("")}>Clear</Button>
        </div>
      </div>
    </div>
  )
}
