import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Typography, message, Tabs, Space, Switch, Select, InputNumber, Divider, Spin } from 'antd'
import { SettingOutlined, ShopOutlined, SafetyOutlined, BellOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { TabPane } = Tabs

const defaultClinicSettings = {
  name: '系统设置待完善', address: '系统设置待完善...', phone: '010-88886666',
  doctor: '待完善', license: 'MA7XX...', description: '系统设置系统设置系统设置待完善',
}

const defaultDiagnosisSettings = { confidenceThreshold: 0.7, maxHerbs: 20, defaultDays: 7, defaultDoses: 1 }

const defaultNotificationSettings = { remindFollowup: true, remindMedication: true, remindReview: true }

const defaultSecuritySettings = { backupEnabled: true, retentionDays: 365 }

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [clinicForm] = Form.useForm()
  const [diagnosisForm] = Form.useForm()
  const [notificationForm] = Form.useForm()
  const [securityForm] = Form.useForm()

  useEffect(() => {
    setLoading(true)
    request.get('/admin/settings').then((res: any) => {
      const d = res.data || res
      if (d.clinic) clinicForm.setFieldsValue(d.clinic)
      if (d.diagnosis) diagnosisForm.setFieldsValue(d.diagnosis)
      if (d.notification) notificationForm.setFieldsValue(d.notification)
      if (d.security) securityForm.setFieldsValue(d.security)
    }).catch(() => {
      message.error('系统设置系统设置系统设置')
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async (section: string, form: any) => {
    setSaving(true)
    try {
      const values = await form.validateFields()
      await request.post('/admin/settings', { section, values })
      message.success('系统设置?')
    } catch {
      message.error('系统设置待完善')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <SettingOutlined /> 系统设置
      </Title>

      <Tabs defaultActiveKey="clinic">
        <TabPane tab={<span><ShopOutlined /> 系统设置</span>} key="clinic">
          <Card>
            <Form layout="vertical" style={{ maxWidth: 600 }} form={clinicForm}
              initialValues={defaultClinicSettings}
            >
              <Form.Item name="name" label="系统设置" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="address" label="待完善">
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="系统设置">
                <Input />
              </Form.Item>
              <Form.Item name="doctor" label="待完善">
                <Input />
              </Form.Item>
              <Form.Item name="license" label="系统设置待完善">
                <Input />
              </Form.Item>
              <Form.Item name="description" label="待完善">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Button type="primary" onClick={() => handleSave('clinic', clinicForm)} loading={saving}>系统设置</Button>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><SafetyOutlined /> 系统设置</span>} key="diagnosis">
          <Card>
            <Form layout="vertical" style={{ maxWidth: 600 }} form={diagnosisForm}
              initialValues={defaultDiagnosisSettings}
            >
              <Form.Item name="confidenceThreshold" label="AI系统设置待完善">
                <InputNumber min={0} max={1} step={0.05} style={{ width: 200 }} />
                <div><Text type="secondary">系统设置待完善AI系统设置系统设置系统设置</Text></div>
              </Form.Item>
              <Form.Item name="maxHerbs" label="系统设置待完善">
                <InputNumber min={1} max={50} style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="defaultDays" label="系统设置待完善">
                <InputNumber min={1} max={30} style={{ width: 200 }} suffix="?" />
              </Form.Item>
              <Form.Item name="defaultDoses" label="系统设置待完善">
                <InputNumber min={1} max={3} style={{ width: 200 }} suffix="?" />
              </Form.Item>
              <Button type="primary" onClick={() => handleSave('diagnosis', diagnosisForm)} loading={saving}>系统设置</Button>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><BellOutlined /> 系统设置</span>} key="notification">
          <Card>
            <Form layout="vertical" style={{ maxWidth: 600 }} form={notificationForm}
              initialValues={defaultNotificationSettings}
            >
              <Form.Item name="remindFollowup" label="系统设置" valuePropName="checked">
                <Switch /> <Text type="secondary" style={{ marginLeft: 8 }}>系统设置系统设置?30系统设置待完善</Text>
              </Form.Item>
              <Divider />
              <Form.Item name="remindMedication" label="系统设置" valuePropName="checked">
                <Switch /> <Text type="secondary" style={{ marginLeft: 8 }}>系统设置系统设置系统设置待完善</Text>
              </Form.Item>
              <Divider />
              <Form.Item name="remindReview" label="系统设置?" valuePropName="checked">
                <Switch /> <Text type="secondary" style={{ marginLeft: 8 }}>AI系统设置系统设置系统设置</Text>
              </Form.Item>
              <Divider />
              <Button type="primary" onClick={() => handleSave('notification', notificationForm)} loading={saving}>系统设置</Button>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><SafetyOutlined /> 系统设置</span>} key="security">
          <Card>
            <Form layout="vertical" style={{ maxWidth: 600 }} form={securityForm}
              initialValues={defaultSecuritySettings}
            >
              <Form.Item name="backupEnabled" label="系统设置" valuePropName="checked">
                <Switch /> <Text type="secondary" style={{ marginLeft: 8 }}>系统设置2系统设置待完善</Text>
              </Form.Item>
              <Divider />
              <Form.Item name="retentionDays" label="系统设置待完善">
                <Select style={{ width: 200 }}>
                  <Select.Option value={90}>90?</Select.Option>
                  <Select.Option value={180}>180?</Select.Option>
                  <Select.Option value={365}>1?</Select.Option>
                  <Select.Option value={730}>2?</Select.Option>
                  <Select.Option value={0}>系统设置</Select.Option>
                </Select>
              </Form.Item>
              <Divider />
              <Button type="primary" onClick={() => handleSave('security', securityForm)} loading={saving}>系统设置</Button>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
    </Spin>
  )
}
