import React from 'react'
import { Card, Table, Tag, Typography, Timeline, Space, Button } from 'antd'
import { FileTextOutlined, MedicineBoxOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

const visitRecords = [
  { id: 1, date: '2026-06-23', doctor: '张医生', dept: '中医科', diagnosis: '脾肾阳虚证', status: 'completed', reportId: 1 },
  { id: 2, date: '2026-05-20', doctor: '张医生', dept: '中医科', diagnosis: '肝郁脾虚证', status: 'completed', reportId: 2 },
  { id: 3, date: '2026-04-15', doctor: '李医生', dept: '中医科', diagnosis: '初诊', status: 'completed', reportId: null },
]

export default function PatientRecordsPage() {
  const navigate = useNavigate()

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <FileTextOutlined /> 就诊记录
      </Title>

      <Card title="就诊时间线">
        <Timeline items={visitRecords.map(r => ({
          color: r.status === 'completed' ? 'green' : 'blue',
          children: (
            <div>
              <Text strong>{r.date}</Text>
              <Space style={{ marginLeft: 16 }}>
                <Tag color="blue">{r.doctor}</Tag>
                <Tag color="red">{r.diagnosis}</Tag>
              </Space>
              <div style={{ marginTop: 4 }}>
                <Button type="link" size="small" onClick={() => r.reportId && navigate(`/report/${r.reportId}`)}>
                  查看报告
                </Button>
              </div>
            </div>
          ),
        }))} />
      </Card>

      <Card title="详细记录" style={{ marginTop: 16 }}>
        <Table dataSource={visitRecords} rowKey="id" pagination={false} size="small"
          columns={[
            { title: '日期', dataIndex: 'date', key: 'date' },
            { title: '医生', dataIndex: 'doctor', key: 'doctor' },
            { title: '科室', dataIndex: 'dept', key: 'dept' },
            { title: '诊断', dataIndex: 'diagnosis', key: 'diagnosis', render: (v: string) => <Tag color="red">{v}</Tag> },
            { title: '状态', dataIndex: 'status', key: 'status', render: () => <Tag color="green">已完成</Tag> },
            {
              title: '操作', key: 'action',
              render: (_: any, record: any) => (
                <Button type="link" size="small"
                  onClick={() => record.reportId && navigate(`/report/${record.reportId}`)}>
                  查看报告
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
