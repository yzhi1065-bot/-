import React, { useState, useEffect } from 'react'
import { Card, Tabs, Table, Button, Modal, Form, Input, Tag, Typography, Space, message, Divider, Spin } from 'antd'
import { BookOutlined, MedicineBoxOutlined, EnvironmentOutlined, PlusOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { TabPane } = Tabs
const { TextArea } = Input

// 方剂库数据
const defaultFormulas = [
  { id: 1, name: '附子理中汤', source: '《伤寒论》', composition: '制附子、干姜、党参、白术、炙甘草', efficacy: '温中祛寒，补气健脾', indication: '脾胃虚寒证，脘腹冷痛，呕吐泄泻' },
  { id: 2, name: '逍遥散', source: '《太平惠民和剂局方》', composition: '柴胡、当归、白芍、白术、茯苓、甘草、薄荷', efficacy: '疏肝解郁，养血健脾', indication: '肝郁脾虚证，两胁胀痛，神疲食少' },
  { id: 3, name: '六味地黄丸', source: '《小儿药证直诀》', composition: '熟地黄、山茱萸、山药、泽泻、牡丹皮、茯苓', efficacy: '滋阴补肾', indication: '肾阴虚证，腰膝酸软，头晕耳鸣' },
  { id: 4, name: '补中益气汤', source: '《脾胃论》', composition: '黄芪、党参、白术、炙甘草、当归、陈皮、升麻、柴胡', efficacy: '补中益气，升阳举陷', indication: '脾胃气虚证，少气懒言，体倦肢软' },
  { id: 5, name: '血府逐瘀汤', source: '《医林改错》', composition: '桃仁、红花、当归、生地黄、牛膝、柴胡、枳壳、赤芍', efficacy: '活血化瘀，行气止痛', indication: '胸中血瘀证，胸痛头痛' },
  { id: 6, name: '温胆汤', source: '《三因极一病证方论》', composition: '半夏、竹茹、枳实、陈皮、茯苓、甘草', efficacy: '理气化痰，清胆和胃', indication: '胆郁痰扰证，胆怯易惊，心烦不眠' },
]

const defaultHerbs = [
  { id: 1, name: '黄芪', category: '补气药', nature: '温', flavor: '甘', meridian: '脾、肺', efficacy: '补气固表，利水消肿' },
  { id: 2, name: '当归', category: '补血药', nature: '温', flavor: '甘、辛', meridian: '肝、心、脾', efficacy: '补血活血，调经止痛' },
  { id: 3, name: '茯苓', category: '利水渗湿药', nature: '平', flavor: '甘、淡', meridian: '心、脾、肾', efficacy: '利水渗湿，健脾宁心' },
  { id: 4, name: '柴胡', category: '解表药', nature: '微寒', flavor: '苦、辛', meridian: '肝、胆', efficacy: '疏散退热，疏肝解郁' },
  { id: 5, name: '甘草', category: '补气药', nature: '平', flavor: '甘', meridian: '心、肺、脾、胃', efficacy: '补脾益气，清热解毒' },
  { id: 6, name: '陈皮', category: '理气药', nature: '温', flavor: '苦、辛', meridian: '脾、肺', efficacy: '理气健脾，燥湿化痰' },
]

const defaultAcupoints = [
  { id: 1, name: '足三里', meridian: '足阳明胃经', location: '小腿外侧，犊鼻下3寸', indication: '胃痛、呕吐、腹胀、消化不良', method: '直刺1-2寸' },
  { id: 2, name: '合谷', meridian: '手阳明大肠经', location: '手背，第1-2掌骨间', indication: '头痛、牙痛、发热、咽喉肿痛', method: '直刺0.5-1寸' },
  { id: 3, name: '三阴交', meridian: '足太阴脾经', location: '小腿内侧，内踝尖上3寸', indication: '月经不调、失眠、腹胀', method: '直刺1-1.5寸' },
  { id: 4, name: '百会', meridian: '督脉', location: '头部，前发际正中直上5寸', indication: '头痛、眩晕、失眠、脱肛', method: '平刺0.5-0.8寸' },
  { id: 5, name: '关元', meridian: '任脉', location: '下腹部，脐中下3寸', indication: '虚劳、腹痛、遗尿、月经不调', method: '直刺1-2寸' },
]

export default function KnowledgeBasePage() {
  const [loading, setLoading] = useState(false)
  const [formulas, setFormulas] = useState(defaultFormulas)
  const [herbs, setHerbs] = useState(defaultHerbs)
  const [acupoints, setAcupoints] = useState(defaultAcupoints)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'formula' | 'herb' | 'acupoint'>('formula')
  const [form] = Form.useForm()

  useEffect(() => {
    setLoading(true)
    request.get('/knowledge-base').then((res: any) => {
      const d = res.data || res
      if (d.formulas) setFormulas(d.formulas)
      if (d.herbs) setHerbs(d.herbs)
      if (d.acupoints) setAcupoints(d.acupoints)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleAdd = (type: 'formula' | 'herb' | 'acupoint') => {
    setModalType(type)
    form.resetFields()
    setModalVisible(true)
  }

  const handleSave = async (values: any) => {
    const newItem = { id: Date.now(), ...values }
    try {
      const res = await request.post('/knowledge-base/' + modalType + 's', values)
      const d = res.data || res
      if (modalType === 'formula') setFormulas([...formulas, d])
      else if (modalType === 'herb') setHerbs([...herbs, d])
      else setAcupoints([...acupoints, d])
      message.success('添加成功')
    } catch {
      if (modalType === 'formula') setFormulas([...formulas, newItem])
      else if (modalType === 'herb') setHerbs([...herbs, newItem])
      else setAcupoints([...acupoints, newItem])
      message.success('添加成功')
    }
    setModalVisible(false)
  }

  return (
    <div>
      <Spin spinning={loading}>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <BookOutlined /> 知识库管理
      </Title>

      <Tabs defaultActiveKey="formulas">
        <TabPane tab={<span><MedicineBoxOutlined /> 方剂库</span>} key="formulas">
          <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('formula')}>添加方剂</Button>}>
            <Table dataSource={formulas} rowKey="id" pagination={false} size="small"
              columns={[
                { title: '方名', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong style={{ color: '#8B4513' }}>{v}</Text> },
                { title: '出处', dataIndex: 'source', key: 'source' },
                { title: '组成', dataIndex: 'composition', key: 'composition', ellipsis: true },
                { title: '功效', dataIndex: 'efficacy', key: 'efficacy', ellipsis: true },
                { title: '主治', dataIndex: 'indication', key: 'indication', ellipsis: true },
              ]} />
          </Card>
        </TabPane>
        <TabPane tab={<span><MedicineBoxOutlined /> 中药库</span>} key="herbs">
          <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('herb')}>添加中药</Button>}>
            <Table dataSource={herbs} rowKey="id" pagination={false} size="small"
              columns={[
                { title: '药名', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong style={{ color: '#8B4513' }}>{v}</Text> },
                { title: '分类', dataIndex: 'category', key: 'category', render: (v: string) => <Tag>{v}</Tag> },
                { title: '性', dataIndex: 'nature', key: 'nature' },
                { title: '味', dataIndex: 'flavor', key: 'flavor' },
                { title: '归经', dataIndex: 'meridian', key: 'meridian' },
                { title: '功效', dataIndex: 'efficacy', key: 'efficacy', ellipsis: true },
              ]} />
          </Card>
        </TabPane>
        <TabPane tab={<span><EnvironmentOutlined /> 穴位库</span>} key="acupoints">
          <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('acupoint')}>添加穴位</Button>}>
            <Table dataSource={acupoints} rowKey="id" pagination={false} size="small"
              columns={[
                { title: '穴位', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong style={{ color: '#8B4513' }}>{v}</Text> },
                { title: '归经', dataIndex: 'meridian', key: 'meridian', render: (v: string) => <Tag color="blue">{v}</Tag> },
                { title: '定位', dataIndex: 'location', key: 'location' },
                { title: '主治', dataIndex: 'indication', key: 'indication', ellipsis: true },
                { title: '操作', dataIndex: 'method', key: 'method' },
              ]} />
          </Card>
        </TabPane>
      </Tabs>

      <Modal title={`添加${modalType === 'formula' ? '方剂' : modalType === 'herb' ? '中药' : '穴位'}`}
        open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          {modalType === 'formula' && (
            <>
              <Form.Item name="name" label="方名" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="source" label="出处"><Input /></Form.Item>
              <Form.Item name="composition" label="组成"><Input /></Form.Item>
              <Form.Item name="efficacy" label="功效"><Input /></Form.Item>
              <Form.Item name="indication" label="主治"><TextArea rows={2} /></Form.Item>
            </>
          )}
          {modalType === 'herb' && (
            <>
              <Form.Item name="name" label="药名" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="category" label="分类"><Input /></Form.Item>
              <Form.Item name="nature" label="性"><Input placeholder="温/寒/凉/平" /></Form.Item>
              <Form.Item name="flavor" label="味"><Input placeholder="甘/辛/酸/苦/咸" /></Form.Item>
              <Form.Item name="efficacy" label="功效"><TextArea rows={2} /></Form.Item>
            </>
          )}
          {modalType === 'acupoint' && (
            <>
              <Form.Item name="name" label="穴名" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="meridian" label="归经"><Input /></Form.Item>
              <Form.Item name="location" label="定位"><Input /></Form.Item>
              <Form.Item name="indication" label="主治"><TextArea rows={2} /></Form.Item>
              <Form.Item name="method" label="操作"><Input /></Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </Spin>
    </div>
  )
}
