import React, { useState, useEffect } from 'react'
import { Card, Typography, Row, Col, Tag, Button, Progress, Table, Timeline, Space, Switch, List, message, Divider, Alert, Spin } from 'antd'
import { BellOutlined, MedicineBoxOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography

const defaultTodayDoses = [
  { time: '08:00', herbs: ['???9g', '??6g', '??12g', '???12g'], taken: false },
  { time: '20:00', herbs: ['??15g', '??9g', '??9g', '??6g', '???6g', '??6g'], taken: false },
]

const defaultWeeklySchedule = [
  { day: '??', morning: true, evening: true },
  { day: '??', morning: true, evening: true },
  { day: '??', morning: true, evening: true },
  { day: '??', morning: true, evening: true },
  { day: '??', morning: true, evening: true },
  { day: '??', morning: true, evening: true },
  { day: '??', morning: true, evening: true },
]

export default function MedicationPage() {
  const [medicationComplete, setMedicationComplete] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [todayDoses, setTodayDoses] = useState(defaultTodayDoses)
  const [weeklySchedule, setWeeklySchedule] = useState(defaultWeeklySchedule)
  const [compliance, setCompliance] = useState(85)

  useEffect(() => {
    setLoading(true)
    request.get('/medication').then((res: any) => {
      const d = res.data || res
      if (d.todayDoses) setTodayDoses(d.todayDoses)
      if (d.weeklySchedule) setWeeklySchedule(d.weeklySchedule)
      if (d.compliance !== undefined) setCompliance(d.compliance)
      if (d.medicationComplete) setMedicationComplete(d.medicationComplete)
    }).catch(() => {
      message.error('???????????????')
    }).finally(() => setLoading(false))
  }, [])

  const handleTake = async (idx: number) => {
    try {
      await request.post('/medication/take', { time: todayDoses[idx].time })
      setMedicationComplete({ ...medicationComplete, [idx]: true })
      message.success(`???${todayDoses[idx].time}???`)
    } catch {
      message.error('??????')
    }
  }

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <MedicineBoxOutlined /> ????
      </Title>

      <Row gutter={16}>
        <Col span={8}>
          <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#fff' }}>{compliance}%</div>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>?????</Text>
            <Progress percent={compliance} strokeColor="#fff" trailColor="rgba(255,255,255,0.3)" size="small" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#8B4513' }}>7</div>
            <Text type="secondary">????</Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#8B4513' }}>14</div>
            <Text type="secondary">???</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          {/* ???? */}
          <Card title={<><BellOutlined /> ??????</>} style={{ marginBottom: 16 }}>
            <Alert message="???????????????? ? 7? ? ??1?" type="info" showIcon style={{ marginBottom: 16 }} />
            {todayDoses.map((dose, idx) => (
              <Card key={idx} size="small" style={{ marginBottom: 8 }}>
                <Row align="middle">
                  <Col span={3}>
                    <Tag color={medicationComplete[idx] ? 'green' : 'blue'} style={{ fontSize: 13, padding: '2px 8px' }}>
                      <ClockCircleOutlined /> {dose.time}
                    </Tag>
                  </Col>
                  <Col span={12}>
                    <Space wrap>
                      {dose.herbs.map((h, i) => <Tag key={i}>{h}</Tag>)}
                    </Space>
                  </Col>
                  <Col span={5} style={{ textAlign: 'center' }}>
                    {medicationComplete[idx] ? (
                      <Tag color="green"><CheckCircleOutlined /> ??</Tag>
                    ) : (
                      <Text type="secondary">???</Text>
                    )}
                  </Col>
                  <Col span={4}>
                    {!medicationComplete[idx] && (
                      <Button type="primary" size="small" onClick={() => handleTake(idx)}>????</Button>
                    )}
                  </Col>
                </Row>
              </Card>
            ))}
          </Card>

          {/* ???? */}
          <Card title={<><ClockCircleOutlined /> ??????</>}>
            <Row gutter={8}>
              {weeklySchedule.map((day, idx) => (
                <Col span={3} key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, marginBottom: 4 }}>{day.day}</div>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: day.morning ? '#27AE60' : '#f0f0f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 4px', color: day.morning ? '#fff' : '#999', fontSize: 16,
                  }}>
                    {day.morning ? '?' : '-'}
                  </div>
                  <Text style={{ fontSize: 11, color: '#999' }}>??</Text>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          {/* ???? */}
          <Card title="??????" style={{ marginBottom: 16 }}>
            <Timeline items={[
              { color: 'green', children: '06-23 20:00 ????' },
              { color: 'green', children: '06-23 08:00 ????' },
              { color: 'green', children: '06-22 20:00 ????' },
              { color: 'green', children: '06-22 08:00 ????' },
              { color: 'red', children: '06-21 20:00 ????' },
              { color: 'green', children: '06-21 08:00 ????' },
            ]} />
          </Card>

          {/* ?????? */}
          <Card title="????">
            <Space direction="vertical">
              <Text><MedicineBoxOutlined style={{ color: '#8B4513' }} /> ??1??????400ml????2???</Text>
              <Text><MedicineBoxOutlined style={{ color: '#8B4513' }} /> ??1???????????</Text>
              <Text><MedicineBoxOutlined style={{ color: '#C0392B' }} /> ???????????????</Text>
              <Text><MedicineBoxOutlined style={{ color: '#C0392B' }} /> ????????????????</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
    </Spin>
  )
}
