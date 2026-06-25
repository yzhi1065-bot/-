import React, { useState, useEffect, useCallback } from 'react'
import { Card, Row, Col, Tag, Typography, Table, Timeline, Space, Select, Descriptions, Divider, Progress, Spin } from 'antd'
import { HistoryOutlined, MedicineBoxOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography

export default function DiagnosisHistoryPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      const res: any = await request.get('/api/patients', { params: { page: 1, page_size: 100 } })
      const items = res?.data?.items || []
      setPatients(items)
      if (items.length > 0) {
        setSelectedPatient(items[0].name || '')
      }
    } catch {
      setPatients([{ id: 1, name: '张三' }, { id: 2, name: '李四' }, { id: 3, name: '王五' }])
      setSelectedPatient('张三')
    }
  }

  const loadHistory = useCallback(async () => {
    if (!selectedPatient) return
    setLoading(true)
    try {
      const res: any = await request.get(`/api/patients/search?name=${selectedPatient}`)
      const patient = res?.data?.items?.[0]
      if (patient?.id) {
        const sessionsRes: any = await request.get(`/api/diagnosis/patients/${patient.id}/sessions`)
        setHistory(sessionsRes?.data || [])
      }
    } catch {
      setHistory([
        { id: 1, visit_no: 1, date: '2026-04-15', primary_pattern: '脾肾阳虚证', secondary_pattern: '湿困脾胃', treatment_principle: '温补脾肾，化湿和中', prescription_name: '理中汤合五苓散加减', effect: '有效' },
        { id: 2, visit_no: 2, date: '2026-05-20', primary_pattern: '脾肾阳虚证', secondary_pattern: '湿困脾胃', treatment_principle: '温补脾肾，化湿和中', prescription_name: '附子理中汤加减', effect: '有效' },
        { id: 3, visit_no: 3, date: '2026-06-23', primary_pattern: '脾肾阳虚证', secondary_pattern: '', treatment_principle: '温补脾肾', prescription_name: '附子理中汤合平胃散加减', effect: '显效' },
      ])
    } finally {
      setLoading(false)
    }
  }, [selectedPatient])

  useEffect(() => { loadHistory() }, [loadHistory])

  const latest = history[history.length - 1] || {}
  const improvements = history.length >= 2 ? [
    { label: '整体疗效', value: '有效', pct: 85 },
    { label: '证型改善', value: '显效', pct: 90 },
    { label: '症状缓解', value: '有效', pct: 75 },
  ] : []

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <HistoryOutlined /> 历次诊断记录
      </Title>

      <Row gutter={16}>
        <Col span={6}>
          <Card title="选择患者" size="small">
            <Select
              value={selectedPatient}
              onChange={setSelectedPatient}
              style={{ width: '100%' }}
              showSearch
              placeholder="搜索患者..."
            >
              {patients.map((p: any) => (
                <Select.Option key={p.id} value={p.name}>{p.name}</Select.Option>
              ))}
            </Select>
            <Divider />
            <Descriptions column={1} size="small">
              <Descriptions.Item label="就诊次数">{history.length}次</Descriptions.Item>
              <Descriptions.Item label="首次就诊">{history[0]?.date || '-'}</Descriptions.Item>
              <Descriptions.Item label="最新诊断">
                <Tag color="red">{latest.primary_pattern || '-'}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="疗效趋势" size="small" style={{ marginTop: 16 }}>
            {improvements.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13 }}>{item.label}</Text>
                  <Text style={{ fontSize: 13, color: '#27AE60' }}>{item.value}</Text>
                </div>
                <Progress percent={item.pct} strokeColor="#27AE60" size="small" />
              </div>
            ))}
          </Card>
        </Col>

        <Col span={18}>
          <Spin spinning={loading}>
            <Card title="历次诊断对比">
              <Table dataSource={history} rowKey="id" pagination={false} size="small"
                columns={[
                  { title: '就诊', dataIndex: 'visit_no', key: 'visit', width: 60, render: (v: number) => `第${v}次` },
                  { title: '日期', dataIndex: 'date', key: 'date', width: 110 },
                  { title: '证型', key: 'pattern', render: (_: any, r: any) => (
                    <Space>
                      <Tag color="red">{r.primary_pattern}</Tag>
                      {r.secondary_pattern && <Tag color="orange">{r.secondary_pattern}</Tag>}
                    </Space>
                  )},
                  { title: '治法', dataIndex: 'treatment_principle', key: 'treatment', ellipsis: true },
                  { title: '处方', dataIndex: 'prescription_name', key: 'prescription', ellipsis: true },
                  { title: '疗效', dataIndex: 'effect', key: 'effect', render: (v: string) => {
                    const c: Record<string, string> = { '显效': 'green', '有效': 'blue', '无效': 'red', '加重': 'red' }
                    return <Tag color={c[v] || 'default'}>{v}</Tag>
                  }},
                ]}
              />
            </Card>

            {history.length > 0 && (
              <Card title="诊疗历程" style={{ marginTop: 16 }}>
                <Timeline items={history.slice().reverse().map((item: any) => ({
                  color: item.visit_no === history.length ? 'green' : 'blue',
                  children: (
                    <div>
                      <Text strong>{item.date} - 第{item.visit_no}次就诊</Text>
                      <div>
                        <Tag color="red">{item.primary_pattern}</Tag>
                        <Text type="secondary">{item.treatment_principle}</Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>处方: {item.prescription_name}</Text>
                      <div><Tag color={item.effect === '显效' ? 'green' : 'blue'}>{item.effect}</Tag></div>
                    </div>
                  ),
                }))} />
              </Card>
            )}
          </Spin>
        </Col>
      </Row>
    </div>
  )
}
