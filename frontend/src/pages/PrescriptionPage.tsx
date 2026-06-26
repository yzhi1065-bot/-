import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card, Descriptions, Table, Button, Tag, Typography, Space,
  Divider, Input, InputNumber, message, Alert, Form, Modal, Spin,
} from 'antd'
import {
  PrinterOutlined, CheckCircleOutlined, ArrowLeftOutlined,
  ProfileOutlined, MedicineBoxOutlined,
} from '@ant-design/icons'
import request from '../services/http'
import { API_ENDPOINTS } from '../services/api'

const { Title, Text, Paragraph } = Typography

export default function PrescriptionPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [prescription, setPrescription] = useState<any>(null)
  const [aiResult, setAiResult] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [signModal, setSignModal] = useState(false)

  useEffect(() => {
    if (sessionId) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [sessionId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [presRes, aiRes] = await Promise.all([
        request.get(API_ENDPOINTS.PRESCRIPTION_BY_SESSION(Number(sessionId))).catch(() => null),
        request.get(API_ENDPOINTS.AI_RESULT(Number(sessionId))).catch(() => null),
      ])
      if (presRes) setPrescription((presRes as any).data)
      if (aiRes) setAiResult((aiRes as any).data)
    } catch (e) {
      message.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      await request.post(API_ENDPOINTS.PRESCRIPTIONS, {
        session_id: Number(sessionId),
        name: values.name,
        principle: values.principle,
        method: values.method,
        dosage_form: '汤剂',
        decoction_method: values.decoction_method,
        administration: values.administration,
        total_days: values.total_days,
        items: values.items?.map((item: any, idx: number) => ({
          herb_name: item.herb_name,
          dosage: item.dosage,
          unit: item.unit || 'g',
          special_preparation: item.special_preparation || '',
          sort_order: idx,
        })) || [],
      })
      message.success('处方保存成功')
      setEditing(false)
      loadData()
    } catch (e: any) {
      message.error(e?.response?.data?.message || '处方保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleSign = async () => {
    if (!prescription) return
    setSaving(true)
    try {
      // 签署时重新提交处方，状态标记为已签署
      await request.post(API_ENDPOINTS.PRESCRIPTIONS, {
        session_id: Number(sessionId),
        name: prescription.name,
        principle: prescription.principle,
        method: prescription.method,
        dosage_form: prescription.dosage_form || '汤剂',
        decoction_method: prescription.decoction_method,
        administration: prescription.administration,
        total_days: prescription.total_days,
        status: 'signed',
        items: prescription.items?.map((item: any, idx: number) => ({
          herb_name: item.herb_name,
          dosage: item.dosage,
          unit: item.unit || 'g',
          special_preparation: item.special_preparation || '',
          sort_order: idx,
        })) || [],
      })
      message.success('处方签署完成')
      setSignModal(false)
      loadData()
    } catch (e: any) {
      message.error(e?.response?.data?.message || '签署失败')
    } finally {
      setSaving(false)
    }
  }

  // 计算药物总量
  const totalHerbs = prescription?.items?.length || 0
  const totalDosage = prescription?.items?.reduce((sum: number, item: any) => {
    const d = parseFloat(item.dosage) || 0
    return sum + d
  }, 0) || 0

  // 计算编辑表单中的药物统计
  const getEditingStats = () => {
    const items = form.getFieldValue('items') || []
    const count = items.length
    const totalD = items.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.dosage) || 0)
    }, 0)
    return { count, totalDosage: totalD }
  }

  const itemsWatch = Form.useWatch('items', form)
  const editStats = getEditingStats()

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
        <Title level={4} style={{ marginTop: 24, color: '#8B4513' }}>加载处方数据...</Title>
      </div>
    )
  }

  const recommendedPrescription = aiResult?.recommended_prescription

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
      </Space>

      <Title level={4} style={{ marginBottom: 16 }}>
        <ProfileOutlined /> 处方管理
      </Title>

      {aiResult && !editing && (
        <>
          <Card title="诊断摘要" size="small" style={{ marginBottom: 16 }}>
            <Space>
              <Tag color="red">{aiResult.primary_pattern}</Tag>
              {aiResult.secondary_pattern && <Tag>{aiResult.secondary_pattern}</Tag>}
              <Text>{aiResult.treatment_principle}</Text>
            </Space>
          </Card>

          {recommendedPrescription && (
            <Card
              title={`推荐方剂: ${recommendedPrescription.name}`}
              extra={<Button type="primary" onClick={() => setEditing(true)}>采纳并编辑</Button>}
              style={{ marginBottom: 16 }}
            >
              <Table
                dataSource={recommendedPrescription.composition || []}
                columns={[
                  { title: '序号', key: 'idx', width: 60, render: (_: any, __: any, idx: number) => idx + 1 },
                  { title: '药名', dataIndex: 'herb', key: 'herb' },
                  { title: '剂量', dataIndex: 'dosage', key: 'dosage' },
                  { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
                  { title: '特殊煎法', dataIndex: 'special', key: 'special', render: (v: string) => v || '-' },
                ]}
                rowKey="herb"
                pagination={false}
                size="small"
              />
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">共 {recommendedPrescription.composition?.length || 0} 味药</Text>
              </div>
              {recommendedPrescription.usage && (
                <Paragraph style={{ marginTop: 16 }}><Text strong>用法: </Text>{recommendedPrescription.usage}</Paragraph>
              )}
            </Card>
          )}
        </>
      )}

      {/* 已保存处方 */}
      {prescription && !editing && (
        <Card
          title="已保存处方"
          extra={
            <Tag color={prescription.status === 'draft' ? 'orange' : 'green'}>
              {prescription.status === 'draft' ? '草稿' : '已签署'}
            </Tag>
          }
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="方名">{prescription.name}</Descriptions.Item>
            <Descriptions.Item label="剂数">{prescription.total_days} 剂</Descriptions.Item>
            <Descriptions.Item label="治则">{prescription.principle}</Descriptions.Item>
            <Descriptions.Item label="药物总数">{totalHerbs} 味</Descriptions.Item>
            {totalDosage > 0 && (
              <Descriptions.Item label="日均总剂量">约 {totalDosage.toFixed(0)}g</Descriptions.Item>
            )}
            <Descriptions.Item label="签署状态">
              <Tag color={prescription.status === 'draft' ? 'orange' : 'green'}>
                {prescription.status === 'draft' ? '待签署' : '已签署'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
          <Divider />
          <Table
            dataSource={prescription.items || []}
            columns={[
              { title: '序号', key: 'idx', width: 60, render: (_: any, __: any, idx: number) => idx + 1 },
              { title: '药名', dataIndex: 'herb_name', key: 'herb_name' },
              { title: '剂量', dataIndex: 'dosage', key: 'dosage' },
              { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
              { title: '特殊煎法', dataIndex: 'special_preparation', key: 'special', render: (v: string) => v || '-' },
              { title: '备注', dataIndex: 'notes', key: 'notes', render: (v: string) => v || '-' },
            ]}
            rowKey="herb_name"
            pagination={false}
            size="small"
          />
          <Space style={{ marginTop: 16 }}>
            {prescription.status !== 'signed' && (
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => setSignModal(true)}>
                签署处方
              </Button>
            )}
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>打印处方</Button>
            <Button onClick={() => setEditing(true)}>编辑处方</Button>
          </Space>
        </Card>
      )}

      {/* 编辑处方 */}
      {editing && (
        <Card title="编辑处方">
          <Alert message="请在 AI 建议基础上进行调整" type="info" showIcon style={{ marginBottom: 16 }} />
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{
              name: recommendedPrescription?.name || prescription?.name || '',
              principle: aiResult?.treatment_principle || prescription?.principle || '',
              method: aiResult?.treatment_method || prescription?.method || '',
              decoction_method: prescription?.decoction_method || '水煎',
              administration: recommendedPrescription?.usage || prescription?.administration || '',
              total_days: prescription?.total_days || 7,
              items: (prescription?.items?.map((i: any) => ({
                herb_name: i.herb_name,
                dosage: i.dosage,
                unit: i.unit || 'g',
                special_preparation: i.special_preparation || '',
              })) || recommendedPrescription?.composition?.map((c: any) => ({
                herb_name: c.herb,
                dosage: c.dosage,
                unit: c.unit || 'g',
                special_preparation: c.special || '',
              })) || []),
            }}
          >
            <Form.Item name="name" label="方剂名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Space style={{ width: '100%' }}>
              <Form.Item name="total_days" label="剂数">
                <InputNumber min={1} max={30} />
              </Form.Item>
              <Form.Item name="principle" label="治则" style={{ flex: 1 }}>
                <Input />
              </Form.Item>
            </Space>
            <Form.Item name="method" label="治法">
              <Input />
            </Form.Item>
            <Space style={{ width: '100%' }}>
              <Form.Item name="decoction_method" label="煎法" style={{ flex: 1 }}>
                <Input />
              </Form.Item>
              <Form.Item name="administration" label="服法" style={{ flex: 3 }}>
                <Input />
              </Form.Item>
            </Space>

            <Divider>药物组成</Divider>

            {/* 药物统计信息 */}
            {itemsWatch && itemsWatch.length > 0 && (
              <Card size="small" style={{ marginBottom: 16, background: '#F5F0EB' }}>
                <Space>
                  <Text strong>药物总数:</Text>
                  <Text style={{ color: '#8B4513', fontSize: 16 }}>{itemsWatch.length} 味</Text>
                  <Divider type="vertical" />
                  <Text strong>总剂量:</Text>
                  <Text style={{ color: '#8B4513', fontSize: 16 }}>
                    {itemsWatch.reduce((sum: number, item: any) => sum + (parseFloat(item.dosage) || 0), 0).toFixed(0)}g
                  </Text>
                </Space>
              </Card>
            )}

            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...rest }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item {...rest} name={[name, 'herb_name']} rules={[{ required: true, message: '请输入药名' }]}>
                        <Input placeholder="药名" style={{ width: 120 }} />
                      </Form.Item>
                      <Form.Item {...rest} name={[name, 'dosage']}>
                        <Input placeholder="剂量" style={{ width: 80 }} />
                      </Form.Item>
                      <Form.Item {...rest} name={[name, 'unit']}>
                        <Input placeholder="单位" style={{ width: 60 }} />
                      </Form.Item>
                      <Form.Item {...rest} name={[name, 'special_preparation']}>
                        <Input placeholder="特殊煎法" style={{ width: 120 }} />
                      </Form.Item>
                      <Button type="link" danger onClick={() => remove(name)}>删除</Button>
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<MedicineBoxOutlined />}>
                      添加药物
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>保存处方</Button>
              <Button onClick={() => setEditing(false)}>取消</Button>
            </Space>
          </Form>
        </Card>
      )}

      {!prescription && !editing && !recommendedPrescription && (
        <Card>
          <Space direction="vertical" style={{ width: '100%', textAlign: 'center', padding: 40 }}>
            <ProfileOutlined style={{ fontSize: 48, color: '#D4A574' }} />
            <Text type="secondary">暂无处方信息，请先在 AI 诊断页面生成诊断结果。</Text>
            {sessionId && (
              <Button type="primary" onClick={() => navigate(`/diagnosis/${sessionId}`)}>
                前往 AI 诊断
              </Button>
            )}
          </Space>
        </Card>
      )}

      {/* 签署确认弹窗 */}
      <Modal
        title="确认签署处方"
        open={signModal}
        onOk={handleSign}
        onCancel={() => setSignModal(false)}
        confirmLoading={saving}
        okText="确认签署"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="签署后将确认处方生效"
            description="请仔细核对处方内容，签署后处方将正式生效。"
            type="warning"
            showIcon
          />
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="方名">{prescription?.name}</Descriptions.Item>
            <Descriptions.Item label="治则">{prescription?.principle}</Descriptions.Item>
            <Descriptions.Item label="剂数">{prescription?.total_days} 剂</Descriptions.Item>
            <Descriptions.Item label="药物">{totalHerbs} 味，日均约 {totalDosage.toFixed(0)}g</Descriptions.Item>
          </Descriptions>
        </Space>
      </Modal>
    </div>
  )
}

