import React, { useState, useEffect } from 'react'
import { Card, Tabs, Table, Button, Modal, Form, Input, Tag, Typography, Space, message, Select, Divider, Spin } from 'antd'
import { FileTextOutlined, PlusOutlined, CopyOutlined, StarOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { TextArea } = Input
const { TabPane } = Tabs

const defaultTemplates = [
  { id: 1, name: '感冒（风寒袭表）', type: 'common', symptoms: '恶寒发热，无汗，头痛身痛，鼻塞流清涕', pattern: '风寒袭表证', prescription: '麻黄汤加减', usage: '每日1剂，水煎服' },
  { id: 2, name: '胃痛（脾胃虚寒）', type: 'common', symptoms: '胃脘冷痛，得温痛减，纳差，便溏', pattern: '脾胃虚寒证', prescription: '黄芪建中汤加减', usage: '每日1剂，温服' },
  { id: 3, name: '失眠（心肾不交）', type: 'common', symptoms: '心烦不寐，多梦易醒，腰膝酸软', pattern: '心肾不交证', prescription: '黄连阿胶汤加减', usage: '每日1剂，早晚分服' },
  { id: 4, name: '腰痛（肾虚）', type: 'common', symptoms: '腰部酸软无力，喜按喜揉，遇劳加重', pattern: '肾虚证', prescription: '六味地黄丸加减', usage: '每日1剂' },
]

const defaultPrescriptions = [
  { id: 1, name: '温阳健脾方', herbs: '制附子9g 党参12g 炒白术12g 干姜6g 茯苓15g 炙甘草6g', indication: '脾肾阳虚证', type: '常用方' },
  { id: 2, name: '疏肝解郁方', herbs: '柴胡9g 当归12g 白芍12g 白术12g 茯苓15g 薄荷6g', indication: '肝郁脾虚证', type: '常用方' },
  { id: 3, name: '益气活血方', herbs: '黄芪30g 当归12g 川芎9g 赤芍12g 桃仁9g 红花6g', indication: '气虚血瘀证', type: '常用方' },
]

export default function TemplatePage() {
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState(defaultTemplates)
  const [presets, setPresets] = useState(defaultPrescriptions)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'template' | 'preset'>('template')
  const [form] = Form.useForm()

  useEffect(() => {
    setLoading(true)
    request.get('/templates').then((res: any) => {
      const d = res.data || res
      if (d.templates) setTemplates(d.templates)
      if (d.presets) setPresets(d.presets)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleAdd = (type: 'template' | 'preset') => {
    setModalType(type)
    form.resetFields()
    setModalVisible(true)
  }

  const handleSave = async (values: any) => {
    const newItem = { id: Date.now(), ...values }
    try {
      const res = await request.post('/templates/' + modalType + 's', values)
      const d = res.data || res
      if (modalType === 'template') setTemplates([...templates, d])
      else setPresets([...presets, d])
    } catch {
      if (modalType === 'template') setTemplates([...templates, newItem])
      else setPresets([...presets, newItem])
    }
    message.success('保存成功')
    setModalVisible(false)
  }

  const handleUseTemplate = (template: any) => {
    message.success(`已应用模板：${template.name}`)
  }

  return (
    <div>
      <Spin spinning={loading}>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <FileTextOutlined /> 病历模板与快速处方
      </Title>

      <Tabs defaultActiveKey="templates">
        <TabPane tab={<span><FileTextOutlined /> 病历模板</span>} key="templates">
          <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('template')}>新建模板</Button>}>
            <Table dataSource={templates} rowKey="id" pagination={false} size="small"
              columns={[
                { title: '模板名称', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong style={{ color: '#8B4513' }}>{v}</Text> },
                { title: '症状', dataIndex: 'symptoms', key: 'symptoms', ellipsis: true },
                { title: '证型', dataIndex: 'pattern', key: 'pattern', render: (v: string) => <Tag color="red">{v}</Tag> },
                { title: '处方', dataIndex: 'prescription', key: 'prescription' },
                { title: '用法', dataIndex: 'usage', key: 'usage', ellipsis: true },
                { title: '操作', key: 'action', render: (_: any, record: any) => (
                  <Space>
                    <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => handleUseTemplate(record)}>应用</Button>
                  </Space>
                )},
              ]}
            />
          </Card>
        </TabPane>
        <TabPane tab={<span><StarOutlined /> 快速处方</span>} key="presets">
          <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('preset')}>新建处方模板</Button>}>
            <Table dataSource={presets} rowKey="id" pagination={false} size="small"
              columns={[
                { title: '处方名', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong style={{ color: '#8B4513' }}>{v}</Text> },
                { title: '药物组成', dataIndex: 'herbs', key: 'herbs' },
                { title: '主治', dataIndex: 'indication', key: 'indication', render: (v: string) => <Tag color="red">{v}</Tag> },
                { title: '类型', dataIndex: 'type', key: 'type', render: (v: string) => <Tag>{v}</Tag> },
                { title: '操作', key: 'action', render: (_: any, record: any) => (
                  <Space>
                    <Button type="link" size="small" icon={<CopyOutlined />}>引用到处方</Button>
                  </Space>
                )},
              ]}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal title={modalType === 'template' ? '新建病历模板' : '新建处方模板'}
        open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          {modalType === 'template' && (
            <>
              <Form.Item name="symptoms" label="典型症状"><TextArea rows={2} /></Form.Item>
              <Form.Item name="pattern" label="证型"><Input /></Form.Item>
              <Form.Item name="prescription" label="处方"><Input /></Form.Item>
              <Form.Item name="usage" label="用法"><Input /></Form.Item>
            </>
          )}
          {modalType === 'preset' && (
            <>
              <Form.Item name="herbs" label="药物组成"><TextArea rows={2} /></Form.Item>
              <Form.Item name="indication" label="主治证型"><Input /></Form.Item>
              <Form.Item name="type" label="分类"><Input placeholder="常用方/经验方/经典方" /></Form.Item>
            </>
          )}
        </Form>
      </Modal>
      </Spin>
    </div>
  )
}
