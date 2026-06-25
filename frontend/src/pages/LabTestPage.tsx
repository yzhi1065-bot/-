import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Row, Col, Statistic, Tabs, Upload, message, Spin } from 'antd'
import { FileTextOutlined, PlusOutlined, UploadOutlined, ExperimentOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { TabPane } = Tabs

const defaultTests = [
    { id: 1, date: '2026-06-23', patient: '张三', type: '血常规', doctor: '张医生', items: 'WBC 6.5×10⁹/L, RBC 4.5×10¹²/L', abnormal: false, status: 'completed' },
    { id: 2, date: '2026-06-22', patient: '李四', type: '肝功能', doctor: '张医生', items: 'ALT 45U/L, AST 38U/L', abnormal: true, status: 'completed' },
    { id: 3, date: '2026-06-20', patient: '王五', type: '肾功能', doctor: '李医生', items: 'Cr 85μmol/L, BUN 6.2mmol/L', abnormal: false, status: 'completed' },
    { id: 4, date: '2026-06-18', patient: '张三', type: '尿常规', doctor: '张医生', items: '各项指标正常', abnormal: false, status: 'completed' },
  ]

export default function LabTestPage() {
  const [tests, setTests] = useState(defaultTests)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 86, abnormal: 3, monthly: 12, completed: 86 })

  useEffect(() => {
    setLoading(true)
    request.get('/lab-tests').then((res: any) => {
      const d = res.data || res
      if (d.list) setTests(d.list)
      if (d.stats) setStats(d.stats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <ExperimentOutlined /> 检查检验管理
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="检验总数" value={stats.total} prefix={<FileTextOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="异常结果" value={stats.abnormal} prefix={<WarningOutlined />} valueStyle={{ color: '#C0392B' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="本月新增" value={stats.monthly} prefix={<PlusOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="已完成" value={stats.completed} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#27AE60' }} /></Card></Col>
      </Row>

      <Card title="检验记录" extra={<Space>
        <Upload beforeUpload={(file) => { message.success(`${file.name} 上传成功`); return false }} showUploadList={false}>
          <Button icon={<UploadOutlined />}>上传检验单</Button>
        </Upload>
        <Button type="primary" icon={<PlusOutlined />}>新增检验</Button>
      </Space>}>
        <Table dataSource={tests} rowKey="id" pagination={false} size="small"
          columns={[
            { title: '日期', dataIndex: 'date', key: 'date' },
            { title: '患者', dataIndex: 'patient', key: 'patient' },
            { title: '检验类型', dataIndex: 'type', key: 'type', render: (v: string) => <Tag color="blue">{v}</Tag> },
            { title: '医生', dataIndex: 'doctor', key: 'doctor' },
            { title: '结果摘要', dataIndex: 'items', key: 'items', ellipsis: true },
            { title: '异常', dataIndex: 'abnormal', key: 'abnormal', render: (v: boolean) => v ? <Tag color="red">异常</Tag> : <Tag color="green">正常</Tag> },
            { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'completed' ? 'green' : 'orange'}>{v === 'completed' ? '已完成' : '进行中'}</Tag> },
            { title: '操作', key: 'action', render: () => <Space><Button size="small">查看</Button><Button size="small">打印</Button></Space> },
          ]} />
      </Card>
    </div>
    </Spin>
  )
}
