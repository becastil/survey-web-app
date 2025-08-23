"use client"

import { useEffect, useRef } from 'react'

interface CompetitivePositionMatrixProps {
  data: {
    yourPosition: { cost: number; value: number }
    peers: Array<{ cost: number; value: number }>
  }
}

export default function CompetitivePositionMatrix({ data }: CompetitivePositionMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 600
    canvas.height = 400

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1

    // Draw horizontal lines
    for (let i = 0; i <= 4; i++) {
      const y = 50 + (i * 75)
      ctx.beginPath()
      ctx.moveTo(50, y)
      ctx.lineTo(550, y)
      ctx.stroke()
    }

    // Draw vertical lines
    for (let i = 0; i <= 4; i++) {
      const x = 50 + (i * 125)
      ctx.beginPath()
      ctx.moveTo(x, 50)
      ctx.lineTo(x, 350)
      ctx.stroke()
    }

    // Add labels
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px sans-serif'

    // Y-axis labels
    ctx.textAlign = 'right'
    ctx.fillText('Premium', 40, 55)
    ctx.fillText('Market', 40, 200)
    ctx.fillText('Value', 40, 345)

    // X-axis labels
    ctx.textAlign = 'center'
    ctx.fillText('Low', 112, 370)
    ctx.fillText('Mid', 300, 370)
    ctx.fillText('High', 487, 370)
    ctx.fillText('Cost →', 300, 390)

    // Draw axis labels
    ctx.fillStyle = '#374151'
    ctx.font = '14px sans-serif'
    ctx.save()
    ctx.translate(15, 200)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText('Value Offering', 0, 0)
    ctx.restore()

    // Plot peer positions
    ctx.fillStyle = '#d1d5db'
    data.peers.forEach(peer => {
      const x = 50 + (peer.cost / 100) * 500
      const y = 350 - (peer.value / 100) * 300
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fill()
    })

    // Plot your position (animated pulse effect)
    const x = 50 + (data.yourPosition.cost / 100) * 500
    const y = 350 - (data.yourPosition.value / 100) * 300
    
    // Outer glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20)
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.5)')
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, 20, 0, Math.PI * 2)
    ctx.fill()

    // Your position dot
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(x, y, 10, 0, Math.PI * 2)
    ctx.fill()

    // Add legend
    ctx.fillStyle = '#374151'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    
    // Your position legend
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(470, 25, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#374151'
    ctx.fillText('Your Position', 480, 30)

    // Peers legend
    ctx.fillStyle = '#d1d5db'
    ctx.beginPath()
    ctx.arc(470, 45, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#374151'
    ctx.fillText('Peer Organizations', 480, 50)

  }, [data])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="border border-gray-200 rounded-lg" />
      <p className="mt-4 text-sm text-gray-600 text-center">
        Your organization is offering <strong>less value for higher cost</strong> compared to peers.
        <br />
        Consider realigning benefits to improve competitive position.
      </p>
    </div>
  )
}