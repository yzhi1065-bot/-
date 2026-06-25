import React, { useRef, useEffect, useState } from 'react'
import { Card, Row, Col, Typography, Tag, Space, Divider } from 'antd'

const { Title, Text } = Typography

// 模拟生成脉波数据
function generatePulseWave(rate: number, duration: number = 2, samples: number = 400): number[] {
  const wave: number[] = []
  const beatInterval = samples / (rate / 60 * duration)

  for (let i = 0; i < samples; i++) {
    const pos = i % beatInterval
    const beatPos = pos / beatInterval

    // 主波
    let value = Math.exp(-((beatPos - 0.1) ** 2) / 0.002) * 1.0
    // 重搏波
    value += Math.exp(-((beatPos - 0.35) ** 2) / 0.003) * 0.3
    // 降中峡
    value += Math.exp(-((beatPos - 0.25) ** 2) / 0.001) * -0.15
    // 噪声
    value += (Math.random() - 0.5) * 0.05

    wave.push(value)
  }
  return wave
}

interface PulseWaveChartProps {
  pulseRate?: number
  waveData?: number[]
  width?: number
  height?: number
}

export default function PulseWaveChart({ pulseRate = 72, width = 600, height = 180 }: PulseWaveChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [wave, setWave] = useState<number[]>([])

  useEffect(() => {
    setWave(generatePulseWave(pulseRate))
  }, [pulseRate])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || wave.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // 清空
    ctx.clearRect(0, 0, width, height)

    // 背景网格
    ctx.strokeStyle = '#f0e8e0'
    ctx.lineWidth = 0.5
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // 基线
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()
    ctx.setLineDash([])

    // 脉波曲线
    const padding = 30
    const plotWidth = width - padding * 2
    const step = wave.length / plotWidth

    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 2.5
    ctx.shadowColor = 'rgba(139,69,19,0.2)'
    ctx.shadowBlur = 4
    ctx.beginPath()

    for (let x = 0; x < plotWidth; x++) {
      const idx = Math.floor(x * step)
      const value = wave[idx] || 0
      const y = height / 2 - value * (height * 0.4)

      if (x === 0) ctx.moveTo(x + padding, y)
      else ctx.lineTo(x + padding, y)
    }
    ctx.stroke()
    ctx.shadowBlur = 0

    // 标注重要参数
    ctx.fillStyle = '#C0392B'
    ctx.font = '11px sans-serif'
    ctx.fillText('主波', padding + plotWidth * 0.08, 25)
    ctx.fillStyle = '#D4A574'
    ctx.fillText('重搏波', padding + plotWidth * 0.32, height - 10)
    ctx.fillStyle = '#999'
    ctx.fillText(`脉率: ${pulseRate}次/分`, width - 90, 20)

  }, [wave, width, height, pulseRate])

  // 计算脉象参数
  const params = {
    rate: pulseRate,
    depth: pulseRate < 65 ? '沉' : pulseRate < 80 ? '中' : '浮',
    strength: pulseRate < 70 ? '无力' : '有力',
    rhythm: '整齐',
    shape: pulseRate < 70 ? '细' : pulseRate > 90 ? '数' : '平',
  }

  return (
    <div>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid rgba(139,69,19,0.10)',
        padding: 16,
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 8, left: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <span style={{ color: '#8B4513', fontWeight: 600 }}>●</span> 脉波图实时监测
          </Text>
        </div>
        <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', marginTop: 8 }} />
      </div>

      <Row gutter={8} style={{ marginTop: 12 }}>
        <Col span={4}>
          <Card size="small" style={{ textAlign: 'center', background: '#FFF9F5' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>脉率</Text>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#8B4513' }}>{params.rate}</div>
            <Text style={{ fontSize: 11 }}>次/分</Text>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ textAlign: 'center', background: '#FFF9F5' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>脉位</Text>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#C0392B' }}>{params.depth}</div>
            <Text style={{ fontSize: 11 }}>浮/中/沉</Text>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ textAlign: 'center', background: '#FFF9F5' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>脉势</Text>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#27AE60' }}>{params.strength}</div>
            <Text style={{ fontSize: 11 }}>有力/无力</Text>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ textAlign: 'center', background: '#FFF9F5' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>节律</Text>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#5B8DEF' }}>{params.rhythm}</div>
            <Text style={{ fontSize: 11 }}>整齐/不齐</Text>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ textAlign: 'center', background: '#FFF9F5' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>脉形</Text>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#E67E22' }}>{params.shape}</div>
            <Text style={{ fontSize: 11 }}>弦/细/滑</Text>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ textAlign: 'center', background: '#FFF9F5' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>整体评估</Text>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#8B4513' }}>正常脉</div>
            <Text style={{ fontSize: 11 }}>参考范围</Text>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
