"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Globe, Upload, RotateCcw } from "lucide-react"
import QRCode from "qrcode"

const logoIcons = [
  { id: "none", color: "bg-gray-200", icon: "🚫" },
  { id: "whatsapp", color: "bg-green-500", icon: "📱" },
  { id: "link", color: "bg-purple-500", icon: "🔗" },
  { id: "location", color: "bg-red-500", icon: "📍" },
  { id: "wifi", color: "bg-teal-500", icon: "📶" },
  { id: "business", color: "bg-blue-500", icon: "💼" },
  { id: "email", color: "bg-yellow-500", icon: "✉️" },
  { id: "expand", color: "bg-pink-500", icon: "⛶" },
  { id: "image", color: "bg-green-600", icon: "🖼️" },
  { id: "facebook", color: "bg-blue-600", icon: "📘" },
]

const frameStyles = [
  { id: "none", name: "None", icon: "🚫" },
  { id: "envelope", name: "Envelope", icon: "✉️" },
  { id: "document", name: "Document", icon: "📄" },
  { id: "business", name: "Business", icon: "💼" },
  { id: "mobile", name: "Mobile", icon: "📱" },
  { id: "tablet", name: "Tablet", icon: "📱" },
  { id: "laptop", name: "Laptop", icon: "💻" },
  { id: "delivery", name: "Delivery", icon: "🛵" },
  { id: "coffee", name: "Coffee", icon: "☕" },
]

const shapeStyles = [
  { id: "square", pattern: "▣▣▣\n▣▣▣\n▣▣▣" },
  { id: "rounded", pattern: "●●●\n●●●\n●●●" },
  { id: "circle", pattern: "⬢⬢⬢\n⬢⬢⬢\n⬢⬢⬢" },
  { id: "diamond", pattern: "◆◆◆\n◆◆◆\n◆◆◆" },
  { id: "star", pattern: "✦✦✦\n✦✦✦\n✦✦✦" },
  { id: "heart", pattern: "♥♥♥\n♥♥♥\n♥♥♥" },
  { id: "lines", pattern: "═══\n═══\n═══" },
  { id: "bars", pattern: "||||\n||||\n||||" },
  { id: "dots", pattern: "∴∴∴\n∴∴∴\n∴∴∴" },
]

export default function QRGenerator() {
  const [qrType, setQrType] = useState("website")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [urlError, setUrlError] = useState("")
  const [selectedLogo, setSelectedLogo] = useState("none")
  const [selectedFrame, setSelectedFrame] = useState("none")
  const [selectedShape, setSelectedShape] = useState("square")
  const [borderColor, setBorderColor] = useState("#000000")
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")
  const [customLogo, setCustomLogo] = useState<File | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  const validateUrl = (url: string) => {
    if (!url.trim()) {
      setUrlError("Website URL is required")
      return false
    }

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    if (!urlPattern.test(url)) {
      setUrlError("Please enter a valid website URL")
      return false
    }

    setUrlError("")
    return true
  }

  const handleUrlChange = (value: string) => {
    setWebsiteUrl(value)
    if (value.trim()) {
      validateUrl(value)
    } else {
      setUrlError("")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const maxSize = 2 * 1024 * 1024 // 2MB
      if (file.size > maxSize) {
        alert("File size must be less than 2MB")
        return
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPG, JPEG, and PNG files are allowed")
        return
      }

      setCustomLogo(file)
    }
  }

  const invertColors = () => {
    const tempColor = borderColor
    setBorderColor(backgroundColor)
    setBackgroundColor(tempColor)
  }

  const generateQR = async () => {
    if (!validateUrl(websiteUrl)) {
      return
    }

    setIsGenerating(true)
    try {
      const qrOptions = {
        errorCorrectionLevel: "M" as const,
        type: "image/png" as const,
        quality: 0.92,
        margin: 1,
        color: {
          dark: borderColor,
          light: backgroundColor,
        },
        width: 256,
      }

      const qrDataUrl = await QRCode.toDataURL(websiteUrl, qrOptions)
      setQrCodeDataUrl(qrDataUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (websiteUrl && !urlError) {
      generateQR()
    }
  }, [websiteUrl, borderColor, backgroundColor])

  const downloadQR = () => {
    if (!qrCodeDataUrl) return

    const link = document.createElement("a")
    link.href = qrCodeDataUrl
    link.download = `qr-code-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* QR Type Selector */}
          <Card>
            <CardContent className="p-4">
              <Select value={qrType} onValueChange={setQrType}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <SelectValue placeholder="Select QR type" />
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Step 1: Complete the content */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h2 className="text-xl font-semibold">Complete the content</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website-url">Enter your Website</Label>
                <Input
                  id="website-url"
                  type="url"
                  placeholder="E.g. https://www.myweb.com/"
                  value={websiteUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className={urlError ? "border-red-500" : ""}
                />
                {urlError && <p className="text-sm text-red-500">{urlError}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Design your QR */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h2 className="text-xl font-semibold">Design your QR</h2>
              </div>

              <Tabs defaultValue="logo" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="frame">Frame</TabsTrigger>
                  <TabsTrigger value="shape">Shape</TabsTrigger>
                  <TabsTrigger value="logo">Logo</TabsTrigger>
                </TabsList>

                <TabsContent value="frame" className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    {frameStyles.map((frame) => (
                      <button
                        key={frame.id}
                        onClick={() => setSelectedFrame(frame.id)}
                        className={`p-4 border-2 rounded-lg text-center hover:border-blue-500 transition-colors ${
                          selectedFrame === frame.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <div className="text-2xl mb-2">{frame.icon}</div>
                        <div className="text-xs text-gray-600">{frame.name}</div>
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="shape" className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3">Shape style</h3>
                    <div className="grid grid-cols-5 gap-3 mb-6">
                      {shapeStyles.map((shape) => (
                        <button
                          key={shape.id}
                          onClick={() => setSelectedShape(shape.id)}
                          className={`p-3 border-2 rounded-lg text-center hover:border-blue-500 transition-colors ${
                            selectedShape === shape.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                          }`}
                        >
                          <div className="text-xs font-mono whitespace-pre-line">{shape.pattern}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="border-color">Border colour</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          id="border-color"
                          type="text"
                          value={borderColor}
                          onChange={(e) => setBorderColor(e.target.value)}
                          className="flex-1"
                        />
                        <div className="w-8 h-8 rounded border" style={{ backgroundColor: borderColor }} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="background-color">Background colour</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          id="background-color"
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="flex-1"
                        />
                        <div className="w-8 h-8 rounded border" style={{ backgroundColor: backgroundColor }} />
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" onClick={invertColors} className="flex items-center gap-2 bg-transparent">
                    <RotateCcw className="w-4 h-4" />
                    Invert
                  </Button>
                </TabsContent>

                <TabsContent value="logo" className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3">Select a logo</h3>
                    <div className="grid grid-cols-5 gap-3 mb-6">
                      {logoIcons.map((logo) => (
                        <button
                          key={logo.id}
                          onClick={() => setSelectedLogo(logo.id)}
                          className={`p-3 border-2 rounded-lg text-center hover:border-blue-500 transition-colors ${
                            selectedLogo === logo.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 ${logo.color} rounded-full flex items-center justify-center mx-auto text-white text-sm`}
                          >
                            {logo.icon}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-2">Drag and drop or click to upload a logo</p>
                    <p className="text-sm text-gray-500">(JPG, JPEG, or PNG / 2MB max)</p>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <Button variant="outline" className="mt-2 bg-transparent" asChild>
                        <span>Choose File</span>
                      </Button>
                    </Label>
                    {customLogo && <p className="text-sm text-green-600 mt-2">Uploaded: {customLogo.name}</p>}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview and Download */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h2 className="text-xl font-semibold text-gray-600">Download your QR</h2>
              </div>

              {/* QR Code Preview */}
              <div className="bg-white p-6 rounded-lg border mb-4">
                <div className="w-48 h-48 mx-auto flex items-center justify-center">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl || "/placeholder.svg"}
                      alt="Generated QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div
                      className="w-32 h-32 border-2 flex items-center justify-center text-gray-400"
                      style={{
                        borderColor: borderColor,
                        backgroundColor: backgroundColor,
                      }}
                    >
                      {isGenerating ? "Generating..." : "Enter URL to generate QR"}
                    </div>
                  )}
                </div>
              </div>

              <Button className="w-full" onClick={downloadQR} disabled={!websiteUrl || !!urlError || !qrCodeDataUrl}>
                <ChevronDown className="w-4 h-4 mr-2" />
                Download QR
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
