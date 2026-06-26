import React, { useState, useEffect, useCallback } from 'react'
import {
  Card, Table, Typography, Space, Button, Modal, Tag, Spin,
  Descriptions, message, Input, InputNumber, Form, Row, Col,
  Statistic, Empty, Divider, Alert
} from 'antd'
import {
  AuditOutlined, CheckCircleOutlined, CloseCircleOutlined,
  FileTextOutlined, SearchOutlined, ReloadOutlined,
  ExclamationCircleOutlined, MedicineBoxOutlined,
} from '@ant-design/icons'
import request from '../services/http'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

// 默认 mock 待审核处方数据
const defaultAuditQueue = [
  {
    id: 1, prescriptionNo: 'RX20260001', patientName: '张三', doctorName: '张医生',
    date: '2026-06-23 09:30', totalAmount: 156.00, status: 'pending',
    items: [
      { name: '附子', dosage: '15g', unitPrice: 0.5, quantity: 30, amount: 15 },
      { name: '人参', dosage: '10g', unitPrice: 2.0, quantity: 10, amount: 20 },
      { name: '干姜', dosage: '12g', unitPrice: 0.3, quantity: 15, amount: 4.5 },
      { name: '炙甘草', dosage: '6g', unitPrice: 0.2, quantity: 12, amount: 2.4 },
    ],
    diagnosis: '脾胃虚寒证',
    doctorNote: '温中散寒，补气健脾',
  },
  {
    id: 2, prescriptionNo: 'RX20260002', patientName: '李四', doctorName: '张医生',
    date: '2026-06-22 14:30', totalAmount: 120.00, status: 'pending',
    items: [
      { name: '当归', dosage: '12g', unitPrice: 0.8, quantity: 20, amount: 16 },
      { name: '白芍', dosage: '15g', unitPrice: 0.6, quantity: 18, amount: 10.8 },
      { name: '柴胡', dosage: '9g', unitPrice: 0.4, quantity: 12, amount: 4.8 },
    ],
    diagnosis: '肝郁脾虚证',
    doctorNote: '疏肝解郁，健脾养血',
  },
  {
    id: 3, prescriptionNo: 'RX20260006', patientName: '孙八', doctorName: '王医生',
    date: '2026-06-25 10:00', totalAmount: 420.00, status: 'pending',
    items: [
      { name: '鹿茸', dosage: '3g', unitPrice: 50.0, quantity: 3, amount: 150 },
      { name: '冬虫夏草', dosage: '5g', unitPrice: 40.0, quantity: 5, amount: 200 },
      { name: '枸杞', dosage: '15g', unitPrice: 0.2, quantity: 30, amount: 6 },
    ],
    diagnosis: '肾阳虚证',
    doctorNote: '温补肾阳，益精填髓',
  },
]

const itemColumns = [
  { title: '药品名称', dataIndex: 'name', key: 'name' },
  { title: '用量', dataIndex: 'dosage', key: 'dosage' },
  { title: '单价(¥)', dataIndex: 'unitPrice', key: 'unitPrice', render: (v: number) => v?.toFixed(2) || '-' },
  { title: '数量', dataIndex: 'quantity', key: 'quantity' },
  { title: '金额(¥)', dataIndex: 'amount', key: 'amount', render: (v: number) => v?.toFixed(2) || '-' },
]

export default function AuditPage() {
  const [auditQueue, setAuditQueue] = useState<any[]>(defaultAuditQueue)
  const [loading, setLoading] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [auditModalOpen, setAuditModalOpen] = useState(false)
  const [auditAction, setAuditAction] = useState<'approve' | 'reject'>('approve')
  const [rejectReason, setRejectReason] = useState('')
  const [auditing, setAuditing] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [stats, setStats] = useState({ pending: 5, approvedToday: 3, rejectedToday: 0 })

  // 加载待审核列表
  const loadAuditQueue = useCallback(() => {
    setLoading(true)
    request.get('/api/prescriptions/audit-queue')
      .then((res: any) => {
        const d = res.data || res
        if (Array.isArray(d)) setAuditQueue(d)
        else if (d.list) setAuditQueue(d.list)
        if (d.stats) setStats(d.stats)
      })
      .catch(() => { /* 使用 mock 数据保底 */ })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadAuditQueue()
  }, [loadAuditQueue])

  // 查看处方详情
  const handleViewDetail = (record: any) => {
    setSelectedPrescription(record)
    setDetailModalOpen(true)
  }

  // 打开审核确认
  const handleOpenAudit = (action: 'approve' | 'reject') => {
    setAuditAction(action)
    setRejectReason('')
    setDetailModalOpen(false)
    setAuditModalOpen(true)
  }

  // 执行审核操作
  const handleAudit = async () => {
    if (!selectedPrescription) return
    if (auditAction === 'reject' && !rejectReason.trim()) {
      message.warning('请填写驳回原因')
      return
    }

    setAuditing(true)
    try {
      await request.post(`/api/prescriptions/${selectedPrescription.id}/audit`, {
        action: auditAction,
        reason: auditAction === 'reject' ? rejectReason : undefined,
      })
      message.success(auditAction === 'approve' ? '审核通过' : '已驳回')
      setAuditModalOpen(false)
      setSelectedPrescription(null)
      setRejectReason('')
      loadAuditQueue()
    } catch {
      // mock 保底
      message.success(auditAction === 'approve' ? '审核通过（模拟）' : '已驳回（模拟）')
      setAuditQueue(prev => prev.filter(p => p.id !== selectedPrescription.id))
      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        [auditAction === 'approve' ? 'approvedToday' : 'rejectedToday']:
          prev[auditAction === 'approve' ? 'approvedToday' : 'rejectedToday'] + 1,
      }))
      setAuditModalOpen(false)
      setSelectedPrescription(null)
      setRejectReason('')
    } finally {
      setAuditing(false)
    }
  }

  // 过滤
  const filteredList = auditQueue.filter(r =>
    !searchText ||
    r.patientName?.includes(searchText) ||
    r.prescriptionNo?.includes(searchText) ||
    r.doctorName?.includes(searchText)
  )

  return (
    <Spin spinning={loading}>
      <div>
        <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
          <AuditOutlined /> 药师审核工作台
        </Title>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic title="待审核" value={stats.pending} suffix="张" valueStyle={{ color: '#E67E22' }} prefix={<ExclamationCircleOutlined />} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="今日已通过" value={stats.approvedToday} suffix="张" valueStyle={{ color: '#27AE60' }} prefix={<CheckCircleOutlined />} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="今日已驳回" value={stats.rejectedToday} suffix="张" valueStyle={{ color: '#E74C3C' }} prefix={<CloseCircleOutlined />} />
            </Card>
          </Col>
        </Row>

        {/* 待审核处方列表 */}
        <Card
          title={
            <Space>
              <FileTextOutlined />
              <span>待审核处方</span>
            </Space>
          }
          extra={
            <Space>
              <Input
                placeholder="搜索患者/处方号/医生"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 240 }}
                allowClear
              />
              <Button icon={<ReloadOutlined />} onClick={loadAuditQueue}>刷新</Button>
            </Space>
          }
        >
          <Table
            dataSource={filteredList}
            rowKey="id"
            pagination={false}
            size="middle"
            locale={{ emptyText: <Empty description="暂无待审核处方" /> }}
            columns={[
              { title: '处方号', dataIndex: 'prescriptionNo', key: 'prescriptionNo', width: 130 },
              { title: '患者', dataIndex: 'patientName', key: 'patientName', width: 100 },
              { title: '医生', dataIndex: 'doctorName', key: 'doctorName', width: 100 },
              { title: '日期', dataIndex: 'date', key: 'date', width: 170 },
              {
                title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 100,
                render: (v: number) => <Text strong>¥{v?.toFixed(2)}</Text>,
              },
              {
                title: '状态', dataIndex: 'status', key: 'status', width: 90,
                render: (v: string) => {
                  const m: Record<string, { color: string; label: string }> = {
                    pending: { color: 'orange', label: '待审核' },
                    approved: { color: 'green', label: '已通过' },
                    rejected: { color: 'red', label: '已驳回' },
                  }
                  return <Tag color={m[v]?.color}>{m[v]?.label || v}</Tag>
                },
              },
              {
                title: '操作', key: 'action', width: 200,
                render: (_: any, r: any) => (
                  <Space>
                    <Button size="small" icon={<FileTextOutlined />} onClick={() => handleViewDetail(r)}>
                      查看详情
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>

        {/* 处方详情 Modal */}
        <Modal
          title={
            <Space>
              <MedicineBoxOutlined style={{ color: '#8B4513' }} />
              <span>处方详情 - {selectedPrescription?.prescriptionNo}</span>
            </Space>
          }
          open={detailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          footer={
            selectedPrescription?.status === 'pending' ? (
              <Space>
                <Button icon={<CheckCircleOutlined />} type="primary"
                  style={{ background: '#27AE60', borderColor: '#27AE60' }}
                  onClick={() => handleOpenAudit('approve')}>
                  审核通过
                </Button>
                <Button icon={<CloseCircleOutlined />} danger
                  onClick={() => handleOpenAudit('reject')}>
                  驳回
                </Button>
              </Space>
            ) : (
              <Button onClick={() => setDetailModalOpen(false)}>关闭</Button>
            )
          }
          width={750}
        >
          {selectedPrescription && (
            <>
              <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
                <Descriptions.Item label="处方号">{selectedPrescription.prescriptionNo}</Descriptions.Item>
                <Descriptions.Item label="患者">{selectedPrescription.patientName}</Descriptions.Item>
                <Descriptions.Item label="医生">{selectedPrescription.doctorName}</Descriptions.Item>
                <Descriptions.Item label="日期">{selectedPrescription.date}</Descriptions.Item>
                <Descriptions.Item label="诊断">{selectedPrescription.diagnosis}</Descriptions.Item>
                <Descriptions.Item label="金额">
                  <Text strong style={{ color: '#E74C3C' }}>¥{selectedPrescription.totalAmount?.toFixed(2)}</Text>
                </Descriptions.Item>
              </Descriptions>

              <Text strong style={{ display: 'block', marginBottom: 8 }}>医生嘱托</Text>
              <Paragraph style={{ background: '#FFF9F0', padding: '8px 12px', borderRadius: 6, marginBottom: 16 }}>
                {selectedPrescription.doctorNote || '无'}
              </Paragraph>

              <Text strong style={{ display: 'block', marginBottom: 8 }}>药品明细</Text>
              <Table
                dataSource={selectedPrescription.items || []}
                rowKey="name"
                columns={itemColumns}
                pagination={false}
                size="small"
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <Text strong style={{ float: 'right' }}>合计：</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong style={{ color: '#E74C3C' }}>
                        ¥{selectedPrescription.totalAmount?.toFixed(2)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            </>
          )}
        </Modal>

        {/* 审核确认 Modal */}
        <Modal
          title={
            <Space>
              {auditAction === 'approve' ? (
                <CheckCircleOutlined style={{ color: '#27AE60' }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#E74C3C' }} />
              )}
              <span>{auditAction === 'approve' ? '确认审核通过' : '确认驳回'}</span>
            </Space>
          }
          open={auditModalOpen}
          onCancel={() => setAuditModalOpen(false)}
          onOk={handleAudit}
          confirmLoading={auditing}
          okText={auditAction === 'approve' ? '确认通过' : '确认驳回'}
          okButtonProps={{
            danger: auditAction === 'reject',
            style: auditAction === 'approve' ? { background: '#27AE60', borderColor: '#27AE60' } : undefined,
          }}
          cancelText="取消"
        >
          {auditAction === 'approve' ? (
            <Alert
              type="success"
              showIcon
              message="审核通过"
              description={`确认通过处方 ${selectedPrescription?.prescriptionNo}（${selectedPrescription?.patientName}）？通过后将自动扣减库存。`}
            />
          ) : (
            <>
              <Alert
                type="warning"
                showIcon
                message="驳回处方"
                description={`确认驳回处方 ${selectedPrescription?.prescriptionNo}（${selectedPrescription?.patientName}）？`}
                style={{ marginBottom: 16 }}
              />
              <div>
                <Text strong>驳回原因 <Text type="danger">*</Text></Text>
                <TextArea
                  rows={3}
                  placeholder="请输入驳回原因..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              </div>
            </>
          )}
        </Modal>
      </div>
    </Spin>
  )
}
