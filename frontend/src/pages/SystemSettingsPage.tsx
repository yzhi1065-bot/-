import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Typography, message, Tabs, Space, Switch, Select, InputNumber, Divider, Spin } from 'antd'
import { SettingOutlined, ShopOutlined, SafetyOutlined, BellOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { TabPane } = Tabs

const defaultClinicSettings = {
  name: '??????', address: '??????...', phone: '010-88886666',
  doctor: '???', license: 'MA7XX...', description: '???????????????',
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
      message.error('????????????')
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async (section: string, form: any) => {
    setSaving(true)
    try {
      const values = await form.validateFields()
      await request.post('/admin/settings', { section, values })
      message.success('?????')
    } catch {
      message.error('??????')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <SettingOutlined /> ????
      </Title>

      <Tabs defaultActiveKey="clinic">
        <TabPane tab={<span><ShopOutlined /> ????</span>} key="clinic">
          <Card>
            <Form layout="vertical" style={{ maxWidth: 600 }} form={clinicForm}
              initialValues={defaultClinicSettings}
            >
              <Form.Item name="name" label="????" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="address" label="??">
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="????">
                <Input />
              </Form.Item>
              <Form.Item name="doctor" label="???">
                <Input />
              </Form.Item>
              <Form.Item name="license" label="??????">
                <Input />
              </Form.Item>
              <Form.Item name="description" label="??">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Button type="primary" onClick={() => handleSave('clinic', clinicForm)} loading={saving}>????</Button>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><SafetyOutlined /> ????</span>} key="diagnosis">
          <Card>
            <Form layout="vertical" style={{ maxWidth: 600 }} form={diagnosisForm}
              initialValues={defaultDiagnosisSettings}
            >
              <Form.Item name="confidenceThreshold" label="AI???????">
                <InputNumber min={0} max={1} step={0.05} style={{ width: 200 }} />
                <div><Text type="secondary">??????AI????????????</Text></div>
              </Form.Item>
              <Form.Item name="maxHerbs" label="???????">
                <InputNumber min={1} max={50} style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="defaultDays" label="??????">
                <InputNumber min={1} max={30} style={{ width: 200 }} suffix="?" />
              </Form.Item>
              <Form.Item name="defaultDoses" label="??????">
                <InputNumber min={1} max={3} style={{ width: 200 }} suffix="?" />
              </Form.Item>
              <Button type="primary" onClick={() => handleSave('diagnosis', diagnosisForm)} loading={saving}>????</Button>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><BellOutlined /> ????</span>} key="notification">
          <Card>
            <Form layout="vertical" style={{ maxWidth: 600 }} form={notificationForm}
              initialValues={defaultNotificationSettings}
            >
              <Form.Item name="remindFollowup" label="????" valuePropName="checked">
                <Switch /> <Text type="secondary" style={{ marginLeft: 8 }}>?????????30???????</Text>
              </Form.Item>
              <Divider />
              <Form.Item name="remindMedication" label="????" valuePropName="checked">
                <Switch /> <Text type="secondary" style={{ marginLeft: 8 }}>??????????????</Text>
              </Form.Item>
              <Divider />
              <Form.Item name="remindReview" label="?????" valuePropName="checked">
                <Switch /> <Text type="secondary" style={{ marginLeft: 8 }}>AI????????????</Text>
              </Form.Item>
              <Divider />
              <Button type="primary" onClick={() => handleSave('notification', notificationForm)} loading={saving}>????</Button>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><SafetyOutlined /> ????</span>} key="security">
          <Card>
            <Form layout="vertical" style={{ maxWidth: 600 }} form={securityForm}
              initialValues={defaultSecuritySettings}
            >
              <Form.Item name="backupEnabled" label="????" valuePropName="checked">
                <Switch /> <Text type="secondary" style={{ marginLeft: 8 }}>????2???????</Text>
              </Form.Item>
              <Divider />
              <Form.Item name="retentionDays" label="??????">
                <Select style={{ width: 200 }}>
                  <Select.Option value={90}>90?</Select.Option>
                  <Select.Option value={180}>180?</Select.Option>
                  <Select.Option value={365}>1?</Select.Option>
                  <Select.Option value={730}>2?</Select.Option>
                  <Select.Option value={0}>????</Select.Option>
                </Select>
              </Form.Item>
              <Divider />
              <Button type="primary" onClick={() => handleSave('security', securityForm)} loading={saving}>????</Button>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
    </Spin>
  )
}
