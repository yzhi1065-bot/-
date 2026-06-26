import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, Steps, Button, Form, Input, Select, InputNumber, Space, Tag, Typography, Row, Col, message, Alert, Modal, Table } from 'antd'
import {
  EyeOutlined, AudioOutlined, FormOutlined, ToolOutlined,
  CheckCircleOutlined, MedicineBoxOutlined, PlusOutlined,
} from '@ant-design/icons'
import request from '../services/http'
import { API_ENDPOINTS } from '../services/api'

import PulseWaveChart from '../components/PulseWaveChart'

const { Title, Text } = Typography

const stepIcons = [<EyeOutlined />, <AudioOutlined />, <FormOutlined />, <ToolOutlined />]

export default function DiagnosisWorkbench() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(0)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [patientId, setPatientId] = useState<number | null>(
    (location.state as any)?.patientId || null
  )
  const [patientName, setPatientName] = useState('')
  const [patientModal, setPatientModal] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [inspectionForm] = Form.useForm()
  const [auscultationForm] = Form.useForm()
  const [inquiryForm] = Form.useForm()
  const [palpationForm] = Form.useForm()
  const [tongueImage, setTongueImage] = useState<string | null>(null)
  const [pulseRate, setPulseRate] = useState(72)
  const [complaint, setComplaint] = useState('')

  // 创建诊断会话
  const createSession = async () => {
    if (!patientId) {
      message.warning('请先选择患者')
      return
    }
    try {
      const res: any = await request.post(API_ENDPOINTS.CREATE_SESSION, {
        patient_id: patientId,
        chief_complaint: complaint,
      })
      setSessionId(res.data.id)
      message.success('诊断会话已创建')
    } catch (e) {
      message.error('操作失败，请重试')
    }
  }

  // 选择患者
  const selectPatient = async () => {
    try {
      const res: any = await request.get(API_ENDPOINTS.PATIENTS, { params: { page: 1, page_size: 100 } })
      setPatients(res.data?.items || [])
      setPatientModal(true)
    } catch (e) {
      message.error('操作失败，请重试')
    }
  }

  // 保存望诊
  const saveInspection = async () => {
    if (!sessionId) return
    try {
      const values = inspectionForm.getFieldsValue()
      // 将数组转换为逗号分隔字符串
      const processed: any = {}
      for (const [key, val] of Object.entries(values)) {
        processed[key] = Array.isArray(val) ? val.join('，') : val
      }
      await request.post(API_ENDPOINTS.SAVE_INSPECTION(sessionId), processed)
      message.success('望诊数据已保存')
      setCurrentStep(1)
    } catch (e) { /* ignore */ }
  }

  // 保存闻诊
  const saveAuscultation = async () => {
    if (!sessionId) return
    try {
      const values = auscultationForm.getFieldsValue()
      const processed: any = {}
      for (const [key, val] of Object.entries(values)) {
        processed[key] = Array.isArray(val) ? val.join('，') : val
      }
      await request.post(API_ENDPOINTS.SAVE_AUSCULTATION(sessionId), processed)
      message.success('闻诊数据已保存')
      setCurrentStep(2)
    } catch (e) { /* ignore */ }
  }

  // 保存问诊
  const saveInquiry = async () => {
    if (!sessionId) return
    try {
      const values = inquiryForm.getFieldsValue()
      const processed: any = {}
      for (const [key, val] of Object.entries(values)) {
        processed[key] = Array.isArray(val) ? val.join('，') : val
      }
      await request.post(API_ENDPOINTS.SAVE_INQUIRY(sessionId), processed)
      message.success('问诊数据已保存')
      setCurrentStep(3)
    } catch (e) { /* ignore */ }
  }

  // 保存切诊+完成
  const savePalpationAndComplete = async () => {
    if (!sessionId) return
    try {
      const values = palpationForm.getFieldsValue()
      const processed: any = {}
      for (const [key, val] of Object.entries(values)) {
        processed[key] = Array.isArray(val) ? val.join('，') : val
      }
      await request.post(API_ENDPOINTS.SAVE_PALPATION(sessionId), processed)
      await request.post(API_ENDPOINTS.COMPLETE_SESSION(sessionId))
      message.success('采集完成，即将进入AI诊断')
      navigate(`/diagnosis/${sessionId}`)
    } catch (e) { /* ignore */ }
  }

  const renderInspection = () => (
    <Card title={<><EyeOutlined /> 望诊采集</>}>
      <Alert message="支持上传舌象照片辅助诊断" type="info" showIcon style={{ marginBottom: 16 }} />
      <Row gutter={16}>
        <Col span={6}>
          <div style={{ textAlign: 'center', padding: 16, border: '1px dashed #d9d9d9', borderRadius: 8, cursor: 'pointer' }}
            onClick={() => document.getElementById('tongue-upload')?.click()}>
            {tongueImage ? (
              <img src={tongueImage} alt="舌象" style={{ maxWidth: 180, maxHeight: 150 }} />
            ) : (
              <div>
                <PlusOutlined style={{ fontSize: 32, color: '#D4A574' }} />
                <p style={{ color: '#8C8C8C', marginTop: 8 }}>上传舌象照片</p>
              </div>
            )}
            <input id="tongue-upload" type="file" accept="image/*" hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (ev) => setTongueImage(ev.target?.result as string)
                  reader.readAsDataURL(file)
                }
              }} />
          </div>
        </Col>
        <Col span={18}>
          <Form form={inspectionForm} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="tongue_body" label="舌质">
              <Select mode="tags" placeholder="选择舌质特征" options={[
                { label: '淡红舌', value: '淡红舌' }, { label: '淡白舌', value: '淡白舌' },
                { label: '红舌', value: '红舌' }, { label: '绛舌', value: '绛舌' },
                { label: '青紫舌', value: '青紫舌' },
              ]} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="tongue_coating" label="舌苔">
              <Select mode="tags" placeholder="选择舌苔特征" options={[
                { label: '薄白苔', value: '薄白苔' }, { label: '白厚苔', value: '白厚苔' },
                { label: '黄苔', value: '黄苔' }, { label: '腻苔', value: '腻苔' },
                { label: '剥苔', value: '剥苔' }, { label: '无苔', value: '无苔' },
              ]} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="tongue_shape" label="舌形">
              <Select mode="tags" placeholder="选择舌形特征" options={[
                { label: '胖大', value: '胖大' }, { label: '瘦小', value: '瘦小' },
                { label: '裂纹', value: '裂纹' }, { label: '齿痕', value: '齿痕' },
                { label: '芒刺', value: '芒刺' },
              ]} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="complexion" label="面色">
              <Select mode="tags" placeholder="选择面色" options={[
                { label: '面色红润', value: '面色红润' }, { label: '面色萎黄', value: '面色萎黄' },
                { label: '面色苍白', value: '面色苍白' }, { label: '面色晦暗', value: '面色晦暗' },
                { label: '面色潮红', value: '面色潮红' },
              ]} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="body_shape" label="体型">
              <Select placeholder="选择体型">
                <Select.Option value="适中">适中</Select.Option>
                <Select.Option value="偏瘦">偏瘦</Select.Option>
                <Select.Option value="偏胖">偏胖</Select.Option>
                <Select.Option value="肥胖">肥胖</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" onClick={saveInspection}>保存并下一步</Button>
          </Form>
        </Col>
      </Row>
    </Card>
  )

  const renderAuscultation = () => (
    <Card title={<><AudioOutlined /> 闻诊采集</>}>
      <Alert message="高保真麦克风就绪后可录制声诊，当前为手动录入模式" type="info" showIcon style={{ marginBottom: 16 }} />
      <Form form={auscultationForm} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="voice_quality" label="音质">
              <Select placeholder="选择音质特征">
                <Select.Option value="清亮">清亮</Select.Option>
                <Select.Option value="低微">低微</Select.Option>
                <Select.Option value="嘶哑">嘶哑</Select.Option>
                <Select.Option value="重浊">重浊</Select.Option>
                <Select.Option value="声高气粗">声高气粗</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="speech_pattern" label="语态">
              <Select placeholder="语态特征">
                <Select.Option value="多言">多言</Select.Option>
                <Select.Option value="少言">少言</Select.Option>
                <Select.Option value="郑声">郑声（声低断续）</Select.Option>
                <Select.Option value="谵语">谵语（胡言乱语）</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="breath_odor" label="口气">
              <Select placeholder="口气特征">
                <Select.Option value="无特殊">无特殊</Select.Option>
                <Select.Option value="口臭">口臭</Select.Option>
                <Select.Option value="酸腐">酸腐味</Select.Option>
                <Select.Option value="腥臭">腥臭味</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="cough_type" label="咳嗽类型">
              <Select placeholder="咳嗽特征">
                <Select.Option value="无咳嗽">无咳嗽</Select.Option>
                <Select.Option value="干咳">干咳无痰</Select.Option>
                <Select.Option value="咳声重浊">咳声重浊</Select.Option>
                <Select.Option value="咳声低微">咳声低微</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="sputum" label="痰">
              <Select placeholder="痰的特征">
                <Select.Option value="无痰">无痰</Select.Option>
                <Select.Option value="白痰">白痰</Select.Option>
                <Select.Option value="黄痰">黄痰</Select.Option>
                <Select.Option value="稀痰">稀痰</Select.Option>
                <Select.Option value="黏稠痰">黏稠痰</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Space>
          <Button onClick={() => setCurrentStep(0)}>上一步</Button>
          <Button type="primary" onClick={saveAuscultation}>保存并下一步</Button>
        </Space>
      </Form>
    </Card>
  )

  const renderInquiry = () => (
    <Card title={<><FormOutlined /> 问诊采集</>}>
      <Form form={inquiryForm} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="chills_fever" label="寒热">
              <Select placeholder="寒热情况">
                <Select.Option value="无异常">无异常</Select.Option>
                <Select.Option value="畏寒肢冷">畏寒肢冷</Select.Option>
                <Select.Option value="恶寒发热">恶寒发热</Select.Option>
                <Select.Option value="但热不寒">但热不寒</Select.Option>
                <Select.Option value="寒热往来">寒热往来</Select.Option>
                <Select.Option value="五心烦热">五心烦热</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="sweat" label="汗">
              <Select placeholder="出汗情况">
                <Select.Option value="正常">正常</Select.Option>
                <Select.Option value="自汗">自汗（白天易汗）</Select.Option>
                <Select.Option value="盗汗">盗汗（睡中出汗）</Select.Option>
                <Select.Option value="无汗">无汗</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="head_body" label="头身">
              <Select placeholder="头身感觉">
                <Select.Option value="正常">正常</Select.Option>
                <Select.Option value="头痛">头痛</Select.Option>
                <Select.Option value="头晕">头晕</Select.Option>
                <Select.Option value="身重">身重</Select.Option>
                <Select.Option value="身痛">身痛</Select.Option>
                <Select.Option value="腰酸">腰酸</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="appetite" label="食欲">
              <Select placeholder="食欲情况">
                <Select.Option value="正常">正常</Select.Option>
                <Select.Option value="纳差">纳差（食欲不振）</Select.Option>
                <Select.Option value="纳呆">纳呆（不思饮食）</Select.Option>
                <Select.Option value="消谷善饥">消谷善饥（易饿）</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="sleep" label="睡眠">
              <Select placeholder="睡眠情况">
                <Select.Option value="正常">正常</Select.Option>
                <Select.Option value="失眠">失眠</Select.Option>
                <Select.Option value="多梦">多梦</Select.Option>
                <Select.Option value="嗜睡">嗜睡</Select.Option>
                <Select.Option value="易醒">易醒</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="bowel" label="大便">
              <Select placeholder="大便情况">
                <Select.Option value="正常">正常</Select.Option>
                <Select.Option value="便溏">便溏（稀便）</Select.Option>
                <Select.Option value="便秘">便秘</Select.Option>
                <Select.Option value="完谷不化">完谷不化</Select.Option>
                <Select.Option value="里急后重">里急后重</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="urine" label="小便">
              <Select placeholder="小便情况">
                <Select.Option value="正常">正常</Select.Option>
                <Select.Option value="清长">清长</Select.Option>
                <Select.Option value="短赤">短赤</Select.Option>
                <Select.Option value="频数">频数</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="emotion" label="情志">
              <Select placeholder="情志状态">
                <Select.Option value="平和">平和</Select.Option>
                <Select.Option value="抑郁">抑郁</Select.Option>
                <Select.Option value="烦躁">烦躁</Select.Option>
                <Select.Option value="焦虑">焦虑</Select.Option>
                <Select.Option value="易怒">易怒</Select.Option>
                <Select.Option value="思虑过度">思虑过度</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Space>
          <Button onClick={() => setCurrentStep(1)}>上一步</Button>
          <Button type="primary" onClick={saveInquiry}>保存并下一步</Button>
        </Space>
      </Form>
    </Card>
  )

  const renderPalpation = () => (
    <Card title={<><ToolOutlined /> 切诊采集</>}>
      <Alert message="脉诊仪就绪后可自动采集脉波数据，当前为手动录入模式" type="info" showIcon style={{ marginBottom: 16 }} />
      <PulseWaveChart pulseRate={palpationForm.getFieldValue('pulse_frequency') || 72} />
      <Form form={palpationForm} layout="vertical">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="pulse_frequency" label="脉率（次/分）">
              <InputNumber min={30} max={200} style={{ width: '100%' }} onChange={(val) => setPulseRate(val || 72)} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="pulse_depth" label="脉位">
              <Select placeholder="浮/中/沉">
                <Select.Option value="浮">浮</Select.Option>
                <Select.Option value="中">中</Select.Option>
                <Select.Option value="沉">沉</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="pulse_rate" label="脉数">
              <Select placeholder="迟/数/缓/急">
                <Select.Option value="迟">迟（＜60次/分）</Select.Option>
                <Select.Option value="缓">缓（60-70次/分）</Select.Option>
                <Select.Option value="数">数（＞90次/分）</Select.Option>
                <Select.Option value="疾">疾（＞120次/分）</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="pulse_shape" label="脉形">
              <Select mode="tags" placeholder="脉形特征">
                <Select.Option value="弦">弦</Select.Option>
                <Select.Option value="滑">滑</Select.Option>
                <Select.Option value="细">细</Select.Option>
                <Select.Option value="涩">涩</Select.Option>
                <Select.Option value="濡">濡</Select.Option>
                <Select.Option value="结代">结代</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="pulse_force" label="脉势">
              <Select placeholder="有力/无力">
                <Select.Option value="有力">有力</Select.Option>
                <Select.Option value="无力">无力</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="pulse_rhythm" label="节律">
              <Select placeholder="节律">
                <Select.Option value="整齐">整齐</Select.Option>
                <Select.Option value="不齐">不齐</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Space>
          <Button onClick={() => setCurrentStep(2)}>上一步</Button>
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={savePalpationAndComplete}>
            保存并完成采集
          </Button>
        </Space>
      </Form>
    </Card>
  )

  const stepContent = [renderInspection, renderAuscultation, renderInquiry, renderPalpation]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <MedicineBoxOutlined /> 四诊采集工作台
      </Title>

      {/* 患者选择和会话创建 */}
      {!sessionId ? (
        <Card style={{ marginBottom: 16, textAlign: 'center', padding: 40 }}>
          <Space direction="vertical" size="large">
            <Space>
              <Button size="large" onClick={selectPatient}>
                {patientId ? `已选择: ${patientName}` : '选择患者'}
              </Button>
            </Space>
            {patientId && (
              <>
                <Input.TextArea
                  placeholder="输入主诉（可选）"
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  style={{ width: 400 }}
                  rows={2}
                />
                <Button type="primary" size="large" onClick={createSession}>
                  开始采集
                </Button>
              </>
            )}
          </Space>
        </Card>
      ) : (
        <>
          <Card size="small" style={{ marginBottom: 16 }}>
            <Space>
              <Tag color="green">就诊号: {sessionId}</Tag>
              <Tag>患者: {patientName}</Tag>
              <Text type="secondary">状态: 采集中</Text>
            </Space>
          </Card>

          <Steps
            current={currentStep}
            items={[
              { title: '望诊', icon: <EyeOutlined /> },
              { title: '闻诊', icon: <AudioOutlined /> },
              { title: '问诊', icon: <FormOutlined /> },
              { title: '切诊', icon: <ToolOutlined /> },
            ]}
            style={{ marginBottom: 24 }}
          />

          {stepContent[currentStep]()}
        </>
      )}

      {/* 选择患者弹窗 */}
      <Modal title="选择患者" open={patientModal} onCancel={() => setPatientModal(false)} footer={null} width={600}>
        <Table
          dataSource={patients}
          columns={[
            { title: '姓名', dataIndex: 'name' },
            { title: '性别', dataIndex: 'gender', render: (v: string) => v === 'male' ? '男' : '女' },
            { title: '年龄', dataIndex: 'age' },
            { title: '手机号', dataIndex: 'phone' },
            {
              title: '操作', render: (_: any, record: any) => (
                <Button type="primary" size="small" onClick={() => {
                  setPatientId(record.id)
                  setPatientName(record.name)
                  setPatientModal(false)
                }}>选择</Button>
              ),
            },
          ]}
          rowKey="id"
          pagination={false}
        />
      </Modal>
    </div>
  )
}
