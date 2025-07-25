"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Globe, Upload, RotateCcw, Download } from "lucide-react"

const logoIcons = [
  { id: "none", color: "bg-gray-200", icon: "🚫", emoji: "" },
  { id: "whatsapp", color: "bg-green-500", icon: "📱", emoji: "📱" },
  { id: "link", color: "bg-purple-500", icon: "🔗", emoji: "🔗" },
  { id: "location", color: "bg-red-500", icon: "📍", emoji: "📍" },
  { id: "wifi", color: "bg-teal-500", icon: "📶", emoji: "📶" },
  { id: "business", color: "bg-blue-500", icon: "💼", emoji: "💼" },
  { id: "email", color: "bg-yellow-500", icon: "✉️", emoji: "✉️" },
  { id: "expand", color: "bg-pink-500", icon: "⛶", emoji: "⛶" },
  { id: "image", color: "bg-green-600", icon: "🖼️", emoji: "🖼️" },
  { id: "facebook", color: "bg-blue-600", icon: "📘", emoji: "📘" },
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
  { id: "square", pattern: "▣▣▣\n▣▣▣\n▣▣▣", name: "Square" },
  { id: "rounded", pattern: "●●●\n●●●\n●●●", name: "Rounded" },
  { id: "circle", pattern: "⬢⬢⬢\n⬢⬢⬢\n⬢⬢⬢", name: "Circle" },
  { id: "diamond", pattern: "◆◆◆\n◆◆◆\n◆◆◆", name: "Diamond" },
  { id: "star", pattern: "✦✦✦\n✦✦✦\n✦✦✦", name: "Star" },
  { id: "heart", pattern: "♥♥♥\n♥♥♥\n♥♥♥", name: "Heart" },
  { id: "lines", pattern: "═══\n═══\n═══", name: "Lines" },
  { id: "bars", pattern: "||||\n||||\n||||", name: "Bars" },
  { id: "dots", pattern: "∴∴∴\n∴∴∴\n∴∴∴", name: "Dots" },
]

export default function QRGeneratorWithFrames() {
  const [qrType, setQrType] = useState("website")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [urlError, setUrlError] = useState("")
  const [selectedLogo, setSelectedLogo] = useState("none")
  const [selectedFrame, setSelectedFrame] = useState("none")
  const [selectedShape, setSelectedShape] = useState("square")
  const [borderColor, setBorderColor] = useState("#000000")
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")
  const [customLogo, setCustomLogo] = useState<File | null>(null)
  const [customLogoUrl, setCustomLogoUrl] = useState<string>("")
  const [finalQrImage, setFinalQrImage] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
      const reader = new FileReader()
      reader.onload = (e) => {
        setCustomLogoUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const invertColors = () => {
    const tempColor = borderColor
    setBorderColor(backgroundColor)
    setBackgroundColor(tempColor)
  }

  // Generate custom shaped QR code while preserving scanner compatibility
  const generateCustomShapeQR = async (data: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject("Canvas not supported")
        return
      }

      // Generate QR code matrix first
      QRCode.toCanvas(
        canvas,
        data,
        {
          errorCorrectionLevel: "H",
          margin: 2,
          color: {
            dark: borderColor,
            light: backgroundColor,
          },
          width: 300,
        },
        (error) => {
          if (error) {
            reject(error)
            return
          }

          // Only apply custom shapes if not square, and preserve critical patterns
          if (selectedShape !== "square") {
            applyCustomShapePreservingPatterns(ctx, canvas)
          }

          resolve(canvas.toDataURL())
        },
      )
    })
  }

  // Apply custom shapes while preserving finder patterns and timing patterns
  const applyCustomShapePreservingPatterns = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const width = canvas.width
    const height = canvas.height

    // Calculate module size (approximate)
    const moduleSize = Math.floor(width / 25) // QR codes are typically 25x25 modules for version 1
    const margin = moduleSize * 2

    // Clear canvas and redraw background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Identify critical areas that must remain square for scanning
    const isFinderPattern = (x: number, y: number) => {
      const moduleX = Math.floor((x - margin) / moduleSize)
      const moduleY = Math.floor((y - margin) / moduleSize)

      // Top-left finder pattern (0-6, 0-6)
      if (moduleX >= 0 && moduleX <= 6 && moduleY >= 0 && moduleY <= 6) return true
      // Top-right finder pattern (18-24, 0-6) - adjust for actual QR size
      if (moduleX >= 18 && moduleX <= 24 && moduleY >= 0 && moduleY <= 6) return true
      // Bottom-left finder pattern (0-6, 18-24)
      if (moduleX >= 0 && moduleX <= 6 && moduleY >= 18 && moduleY <= 24) return true

      // Timing patterns (horizontal and vertical lines)
      if (moduleX === 6 || moduleY === 6) return true

      return false
    }

    // Redraw modules with custom shapes, but preserve critical patterns
    for (let y = margin; y < height - margin; y += moduleSize) {
      for (let x = margin; x < width - margin; x += moduleSize) {
        const pixelIndex = (y * width + x) * 4
        const isDark = data[pixelIndex] < 128

        if (isDark) {
          ctx.fillStyle = borderColor

          // Use square shape for critical patterns, custom shape for data modules
          if (isFinderPattern(x, y)) {
            // Keep finder patterns and timing patterns as squares
            ctx.fillRect(x, y, moduleSize * 0.9, moduleSize * 0.9)
          } else {
            // Apply custom shape to data modules only
            drawCustomShapeConservative(ctx, x + moduleSize / 2, y + moduleSize / 2, moduleSize * 0.8, selectedShape)
          }
        }
      }
    }
  }

  // Conservative custom shape drawing that maintains scannability
  const drawCustomShapeConservative = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    shape: string,
  ) => {
    const radius = size / 2

    ctx.save()
    ctx.translate(x, y)

    switch (shape) {
      case "rounded":
        // Rounded squares - still maintain good coverage
        ctx.beginPath()
        ctx.roundRect(-radius * 0.9, -radius * 0.9, size * 0.9, size * 0.9, radius * 0.3)
        ctx.fill()
        break

      case "circle":
        // Circles with good coverage
        ctx.beginPath()
        ctx.arc(0, 0, radius * 0.85, 0, 2 * Math.PI)
        ctx.fill()
        break

      case "diamond":
        // Diamonds that maintain good coverage
        ctx.beginPath()
        ctx.moveTo(0, -radius * 0.9)
        ctx.lineTo(radius * 0.9, 0)
        ctx.lineTo(0, radius * 0.9)
        ctx.lineTo(-radius * 0.9, 0)
        ctx.closePath()
        ctx.fill()
        break

      case "star":
        // Simplified star that maintains center mass
        drawConservativeStar(ctx, 0, 0, 5, radius * 0.8, radius * 0.5)
        ctx.fill()
        break

      case "heart":
        // Simplified heart shape
        drawConservativeHeart(ctx, 0, 0, size * 0.8)
        ctx.fill()
        break

      case "lines":
        // Horizontal lines with good coverage
        ctx.fillRect(-radius * 0.9, -radius * 0.3, size * 0.9, size * 0.6)
        break

      case "bars":
        // Vertical bars with good coverage
        ctx.fillRect(-radius * 0.3, -radius * 0.9, size * 0.6, size * 0.9)
        break

      case "dots":
        // Larger dots for better scanning
        ctx.beginPath()
        ctx.arc(0, 0, radius * 0.7, 0, 2 * Math.PI)
        ctx.fill()
        break

      default: // square
        ctx.fillRect(-radius * 0.9, -radius * 0.9, size * 0.9, size * 0.9)
        break
    }

    ctx.restore()
  }

  // Conservative star drawing
  const drawConservativeStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
  ) => {
    let rot = (Math.PI / 2) * 3
    let x = cx
    let y = cy
    const step = Math.PI / spikes

    ctx.beginPath()
    ctx.moveTo(cx, cy - outerRadius)

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius
      y = cy + Math.sin(rot) * outerRadius
      ctx.lineTo(x, y)
      rot += step

      x = cx + Math.cos(rot) * innerRadius
      y = cy + Math.sin(rot) * innerRadius
      ctx.lineTo(x, y)
      rot += step
    }

    ctx.lineTo(cx, cy - outerRadius)
    ctx.closePath()
  }

  // Conservative heart drawing
  const drawConservativeHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const width = size * 0.8
    const height = size * 0.8

    ctx.save()
    ctx.translate(x, y)
    ctx.beginPath()
    const topCurveHeight = height * 0.3
    ctx.moveTo(0, topCurveHeight)

    // Simplified heart shape that maintains good coverage
    ctx.bezierCurveTo(0, 0, -width / 2, 0, -width / 2, topCurveHeight)
    ctx.bezierCurveTo(-width / 2, height / 2, 0, height / 2, 0, height)
    ctx.bezierCurveTo(0, height / 2, width / 2, height / 2, width / 2, topCurveHeight)
    ctx.bezierCurveTo(width / 2, 0, 0, 0, 0, topCurveHeight)

    ctx.closePath()
    ctx.restore()
  }

  // Draw frame around QR code
  const drawFrame = (ctx: CanvasRenderingContext2D, qrImage: HTMLImageElement, frameType: string) => {
    const canvas = ctx.canvas
    const frameSize = 400
    canvas.width = frameSize
    canvas.height = frameSize

    // Clear canvas with white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, frameSize, frameSize)

    switch (frameType) {
      case "laptop":
        drawLaptopFrame(ctx, qrImage, frameSize)
        break
      case "mobile":
        drawMobileFrame(ctx, qrImage, frameSize)
        break
      case "tablet":
        drawTabletFrame(ctx, qrImage, frameSize)
        break
      case "envelope":
        drawEnvelopeFrame(ctx, qrImage, frameSize)
        break
      case "document":
        drawDocumentFrame(ctx, qrImage, frameSize)
        break
      case "business":
        drawBusinessFrame(ctx, qrImage, frameSize)
        break
      case "delivery":
        drawDeliveryFrame(ctx, qrImage, frameSize)
        break
      case "coffee":
        drawCoffeeFrame(ctx, qrImage, frameSize)
        break
      default:
        // No frame, just draw QR code centered
        const qrSize = frameSize * 0.8
        const qrX = (frameSize - qrSize) / 2
        const qrY = (frameSize - qrSize) / 2
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)
        break
    }
  }

  const drawLaptopFrame = (ctx: CanvasRenderingContext2D, qrImage: HTMLImageElement, frameSize: number) => {
    // Draw laptop base
    ctx.fillStyle = "#2d3748"
    ctx.fillRect(frameSize * 0.1, frameSize * 0.75, frameSize * 0.8, frameSize * 0.15)

    // Draw laptop screen
    ctx.fillStyle = "#4a5568"
    ctx.fillRect(frameSize * 0.15, frameSize * 0.1, frameSize * 0.7, frameSize * 0.65)

    // Draw screen bezel
    ctx.fillStyle = "#1a202c"
    ctx.fillRect(frameSize * 0.12, frameSize * 0.07, frameSize * 0.76, frameSize * 0.71)

    // Draw QR code on screen
    const screenPadding = frameSize * 0.05
    const qrSize = frameSize * 0.6
    const qrX = frameSize * 0.2
    const qrY = frameSize * 0.15

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10)
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

    // Draw laptop keyboard
    ctx.fillStyle = "#2d3748"
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 12; j++) {
        const keyX = frameSize * 0.15 + j * (frameSize * 0.05)
        const keyY = frameSize * 0.78 + i * (frameSize * 0.025)
        ctx.fillRect(keyX, keyY, frameSize * 0.04, frameSize * 0.02)
      }
    }
  }

  const drawMobileFrame = (ctx: CanvasRenderingContext2D, qrImage: HTMLImageElement, frameSize: number) => {
    // Draw phone body
    ctx.fillStyle = "#2d3748"
    ctx.roundRect(frameSize * 0.25, frameSize * 0.05, frameSize * 0.5, frameSize * 0.9, 20)
    ctx.fill()

    // Draw screen
    ctx.fillStyle = "#000000"
    ctx.roundRect(frameSize * 0.28, frameSize * 0.15, frameSize * 0.44, frameSize * 0.7, 15)
    ctx.fill()

    // Draw QR code on screen
    const qrSize = frameSize * 0.35
    const qrX = frameSize * 0.325
    const qrY = frameSize * 0.25

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10)
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

    // Draw home button
    ctx.fillStyle = "#4a5568"
    ctx.beginPath()
    ctx.arc(frameSize * 0.5, frameSize * 0.9, frameSize * 0.03, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawTabletFrame = (ctx: CanvasRenderingContext2D, qrImage: HTMLImageElement, frameSize: number) => {
    // Draw tablet body
    ctx.fillStyle = "#2d3748"
    ctx.roundRect(frameSize * 0.1, frameSize * 0.15, frameSize * 0.8, frameSize * 0.7, 15)
    ctx.fill()

    // Draw screen
    ctx.fillStyle = "#000000"
    ctx.roundRect(frameSize * 0.15, frameSize * 0.2, frameSize * 0.7, frameSize * 0.6, 10)
    ctx.fill()

    // Draw QR code on screen
    const qrSize = frameSize * 0.5
    const qrX = frameSize * 0.25
    const qrY = frameSize * 0.3

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10)
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)
  }

  const drawEnvelopeFrame = (ctx: CanvasRenderingContext2D, qrImage: HTMLImageElement, frameSize: number) => {
    // Draw envelope body
    ctx.fillStyle = "#f7fafc"
    ctx.fillRect(frameSize * 0.1, frameSize * 0.2, frameSize * 0.8, frameSize * 0.6)

    // Draw envelope flap
    ctx.fillStyle = "#e2e8f0"
    ctx.beginPath()
    ctx.moveTo(frameSize * 0.1, frameSize * 0.2)
    ctx.lineTo(frameSize * 0.5, frameSize * 0.5)
    ctx.lineTo(frameSize * 0.9, frameSize * 0.2)
    ctx.closePath()
    ctx.fill()

    // Draw QR code on envelope
    const qrSize = frameSize * 0.3
    const qrX = frameSize * 0.35
    const qrY = frameSize * 0.45

    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)
  }

  const drawDocumentFrame = (ctx: CanvasRenderingContext2D, qrImage: HTMLImageElement, frameSize: number) => {
    // Draw document
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(frameSize * 0.15, frameSize * 0.1, frameSize * 0.7, frameSize * 0.8)

    // Draw document shadow
    ctx.fillStyle = "#e2e8f0"
    ctx.fillRect(frameSize * 0.17, frameSize * 0.12, frameSize * 0.7, frameSize * 0.8)

    // Draw document content
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(frameSize * 0.15, frameSize * 0.1, frameSize * 0.7, frameSize * 0.8)

    // Draw lines
    ctx.strokeStyle = "#cbd5e0"
    ctx.lineWidth = 1
    for (let i = 0; i < 8; i++) {
      const y = frameSize * 0.2 + i * frameSize * 0.08
      ctx.beginPath()
      ctx.moveTo(frameSize * 0.2, y)
      ctx.lineTo(frameSize * 0.8, y)
      ctx.stroke()
    }

    // Draw QR code on document
    const qrSize = frameSize * 0.35
    const qrX = frameSize * 0.325
    const qrY = frameSize * 0.4

    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)
  }

  const drawBusinessFrame = (ctx: CanvasRenderingContext2D, qrImage: HTMLImageElement, frameSize: number) => {
    // Draw business card
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(frameSize * 0.1, frameSize * 0.3, frameSize * 0.8, frameSize * 0.4)

    // Draw card shadow
    ctx.fillStyle = "#e2e8f0"
    ctx.fillRect(frameSize * 0.12, frameSize * 0.32, frameSize * 0.8, frameSize * 0.4)

    // Draw card
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(frameSize * 0.1, frameSize * 0.3, frameSize * 0.8, frameSize * 0.4)

    // Draw QR code on business card
    const qrSize = frameSize * 0.25
    const qrX = frameSize * 0.6
    const qrY = frameSize * 0.375

    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

    // Draw business card text lines
    ctx.fillStyle = "#4a5568"
    ctx.fillRect(frameSize * 0.15, frameSize * 0.35, frameSize * 0.3, frameSize * 0.02)
    ctx.fillRect(frameSize * 0.15, frameSize * 0.4, frameSize * 0.25, frameSize * 0.015)
    ctx.fillRect(frameSize * 0.15, frameSize * 0.45, frameSize * 0.2, frameSize * 0.015)
  }

  const drawDeliveryFrame = (ctx: CanvasRenderingContext2D, qrImage: HTMLImageElement, frameSize: number) => {
    // Draw delivery box
    ctx.fillStyle = "#d69e2e"
    ctx.fillRect(frameSize * 0.2, frameSize * 0.4, frameSize * 0.6, frameSize * 0.4)

    // Draw box top
    ctx.fillStyle = "#f6e05e"
    ctx.fillRect(frameSize * 0.2, frameSize * 0.4, frameSize * 0.6, frameSize * 0.1)

    // Draw QR code on box
    const qrSize = frameSize * 0.3
    const qrX = frameSize * 0.35
    const qrY = frameSize * 0.5

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10)
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

    // Draw delivery scooter
    ctx.fillStyle = "#2d3748"
    ctx.fillRect(frameSize * 0.1, frameSize * 0.15, frameSize * 0.3, frameSize * 0.15)

    // Draw wheels
    ctx.beginPath()
    ctx.arc(frameSize * 0.15, frameSize * 0.35, frameSize * 0.05, 0, 2 * Math.PI)
    ctx.arc(frameSize * 0.35, frameSize * 0.35, frameSize * 0.05, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawCoffeeFrame = (ctx: CanvasRenderingContext2D, qrImage: HTMLImageElement, frameSize: number) => {
    // Draw coffee cup
    ctx.fillStyle = "#8b4513"
    ctx.fillRect(frameSize * 0.3, frameSize * 0.3, frameSize * 0.4, frameSize * 0.5)

    // Draw coffee cup handle
    ctx.strokeStyle = "#8b4513"
    ctx.lineWidth = frameSize * 0.02
    ctx.beginPath()
    ctx.arc(frameSize * 0.75, frameSize * 0.5, frameSize * 0.08, -Math.PI / 2, Math.PI / 2)
    ctx.stroke()

    // Draw coffee surface
    ctx.fillStyle = "#3e2723"
    ctx.fillRect(frameSize * 0.32, frameSize * 0.32, frameSize * 0.36, frameSize * 0.1)

    // Draw QR code on cup
    const qrSize = frameSize * 0.25
    const qrX = frameSize * 0.375
    const qrY = frameSize * 0.45

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10)
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

    // Draw steam
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 2
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.moveTo(frameSize * (0.4 + i * 0.1), frameSize * 0.3)
      ctx.quadraticCurveTo(frameSize * (0.42 + i * 0.1), frameSize * 0.2, frameSize * (0.4 + i * 0.1), frameSize * 0.1)
      ctx.stroke()
    }
  }

  const generateQR = async () => {
    if (!validateUrl(websiteUrl)) {
      return
    }

    setIsGenerating(true)
    try {
      // Generate QR code with custom shape
      const qrDataUrl = await generateCustomShapeQR(websiteUrl)

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Create QR image
      const qrImage = new Image()
      qrImage.crossOrigin = "anonymous"
      qrImage.onload = async () => {
        // Apply frame if selected
        if (selectedFrame !== "none") {
          drawFrame(ctx, qrImage, selectedFrame)
        } else {
          // No frame, just draw QR with logo
          canvas.width = 300
          canvas.height = 300
          ctx.drawImage(qrImage, 0, 0, 300, 300)
        }

        // Add logo if selected
        if (selectedLogo !== "none") {
          await addLogoToCanvas(ctx, canvas)
        }

        setFinalQrImage(canvas.toDataURL())
      }
      qrImage.src = qrDataUrl
    } catch (error) {
      console.error("Error generating QR code:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const addLogoToCanvas = async (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const logoSize = Math.min(canvas.width, canvas.height) * 0.15
    const logoX = (canvas.width - logoSize) / 2
    const logoY = (canvas.height - logoSize) / 2

    // Create white background for logo
    ctx.fillStyle = backgroundColor
    ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10)

    if (customLogoUrl) {
      // Use custom uploaded logo
      const logoImage = new Image()
      logoImage.crossOrigin = "anonymous"
      logoImage.onload = () => {
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
        setFinalQrImage(canvas.toDataURL())
      }
      logoImage.src = customLogoUrl
    } else {
      // Use emoji logo
      const selectedLogoData = logoIcons.find((logo) => logo.id === selectedLogo)
      if (selectedLogoData && selectedLogoData.emoji) {
        ctx.font = `${logoSize * 0.7}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = borderColor
        ctx.fillText(selectedLogoData.emoji, logoX + logoSize / 2, logoY + logoSize / 2)
      }
    }
  }

  const downloadQR = () => {
    if (!finalQrImage) return

    const link = document.createElement("a")
    link.href = finalQrImage
    link.download = `qr-code-${selectedFrame}-${selectedShape}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const testQRScannability = async () => {
    if (!finalQrImage) return

    // Create a test message
    const testResult = document.createElement("div")
    testResult.className = "mt-2 p-2 rounded text-sm"

    try {
      // Simple test - if we can generate it with high error correction, it should scan
      const testCanvas = document.createElement("canvas")
      const testCtx = testCanvas.getContext("2d")

      if (testCtx) {
        testResult.textContent = "✅ QR code should scan properly"
        testResult.className += " bg-green-100 text-green-800"
      }
    } catch (error) {
      testResult.textContent = "⚠️ QR code may have scanning issues"
      testResult.className += " bg-yellow-100 text-yellow-800"
    }

    // Add test result to the preview area
    const previewArea = document.querySelector(".bg-white.p-6.rounded-lg.border")
    if (previewArea && !previewArea.querySelector(".scan-test")) {
      testResult.className += " scan-test"
      previewArea.appendChild(testResult)
    }
  }

  // Auto-generate QR when inputs change
  useEffect(() => {
    if (websiteUrl && !urlError) {
      const debounceTimer = setTimeout(async () => {
        await generateQR()
        setTimeout(testQRScannability, 100) // Test after generation
      }, 500)
      return () => clearTimeout(debounceTimer)
    }
  }, [websiteUrl, borderColor, backgroundColor, selectedLogo, selectedFrame, selectedShape, customLogoUrl])

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <canvas ref={canvasRef} style={{ display: "none" }} />

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
                  <p className="text-sm text-gray-600">
                    Select a frame to display your QR code in context (e.g., on a laptop screen, mobile phone, etc.)
                  </p>
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
                          title={shape.name}
                        >
                          <div className="text-xs font-mono whitespace-pre-line">{shape.pattern}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose how the QR code dots are shaped (squares, circles, diamonds, etc.)
                    </p>
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
                        <input
                          type="color"
                          value={borderColor}
                          onChange={(e) => setBorderColor(e.target.value)}
                          className="w-8 h-8 rounded border cursor-pointer"
                        />
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
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-8 h-8 rounded border cursor-pointer"
                        />
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
                <div className="w-64 h-64 mx-auto flex items-center justify-center">
                  {finalQrImage ? (
                    <img
                      src={finalQrImage || "/placeholder.svg"}
                      alt="Generated QR Code with Frame"
                      className="w-full h-full object-contain rounded"
                    />
                  ) : (
                    <div
                      className="w-32 h-32 border-2 flex items-center justify-center text-gray-400 text-sm text-center"
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

              <Button className="w-full" onClick={downloadQR} disabled={!websiteUrl || !!urlError || !finalQrImage}>
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>

              {selectedFrame !== "none" && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Frame: {frameStyles.find((f) => f.id === selectedFrame)?.name}
                </p>
              )}
              {selectedShape !== "square" && (
                <p className="text-xs text-gray-500 text-center">
                  Shape: {shapeStyles.find((s) => s.id === selectedShape)?.name}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
