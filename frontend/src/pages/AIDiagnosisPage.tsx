import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card, Spin, Tag, Button, Descriptions, Divider, Typography,
  Space, message, Modal, Input, Alert, Select, Table,
} from 'antd'
import {
  CheckCircleOutlined, EditOutlined, CloseCircleOutlined,
  RobotOutlined, MedicineBoxOutlined, PrinterOutlined,
  UserOutlined,
} from '@ant-design/icons'
import request from '../services/http'
import { API_ENDPOINTS } from '../services/api'
import { useAuthStore } from '../store/authStore'

const { Title, Text, Paragraph } = Typography

export default function AIDiagnosisPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [loading, setLoading] = useState(true)
  const [diagnosing, setDiagnosing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [reviewModal, setReviewModal] = useState(false)
  const [reviewNote, setReviewNote] = useState('')
  const [action, setAction] = useState<'approved' | 'modified' | 'rejected'>('approved')
  const [error, setError] = useState<string | null>(null)

  // 创建新诊断的状态
  const [patientId, setPatientId] = useState<number | null>(null)
  const [patientName, setPatientName] = useState('')
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [patientModal, setPatientModal] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [creating, setCreating] = useState(false)

  const runDiagnosis = useCallback(async (sid: number) => {
    setDiagnosing(true)
    setError(null)
    try {
      const res: any = await request.post(API_ENDPOINTS.AI_DIAGNOSE, {
        session_id: sid,
      })
      setResult(res.data)
      message.success('AI 诊断完成')
    } catch (e: any) {
      const errMsg = e?.response?.data?.message || e?.message || '诊断请求失败'
      setError(errMsg)
      message.error('诊断失败：' + errMsg)
    } finally {
      setDiagnosing(false)
      setLoading(false)
    }
  }, [])

  const loadExistingResult = useCallback(async (sid: number) => {
    setLoading(true)
    setError(null)
    try {
      const res: any = await request.get(API_ENDPOINTS.AI_RESULT(sid))
      if (res.data) {
        setResult(res.data)
        setLoading(false)
      } else {
        await runDiagnosis(sid)
      }
    } catch (e: any) {
      if (e?.response?.status === 404) {
        await runDiagnosis(sid)
      } else {
        const errMsg = e?.response?.data?.message || e?.message || '加载诊断结果失败'
        setError(errMsg)
        message.error(errMsg)
        setLoading(false)
      }
    }
  }, [runDiagnosis])

  useEffect(() => {
    if (sessionId) {
      loadExistingResult(Number(sessionId))
    } else {
      setLoading(false)
    }
  }, [sessionId, loadExistingResult])

  const openPatientSelector = async () => {
    try {
      const res: any = await request.get(API_ENDPOINTS.PATIENTS, { params: { page: 1, page_size: 100 } })
      setPatients(res.data?.items || [])
      setPatientModal(true)
    } catch {
      message.error('加载患者列表失败')
    }
  }

  const handleCreateAndDiagnose = async () => {
    if (!patientId) {
      message.warning('请先选择患者')
      return
    }
    if (!chiefComplaint.trim()) {
      message.warning('请输入主诉')
      return
    }
    setCreating(true)
    setError(null)
    try {
      const res: any = await request.post(API_ENDPOINTS.CREATE_SESSION, {
        patient_id: patientId,
        chief_complaint: chiefComplaint,
      })
      const newSessionId = res.data.id
      message.success('诊断会话已创建')
      navigate(`/diagnosis/${newSessionId}`, { replace: true })
      await runDiagnosis(newSessionId)
    } catch (e: any) {
      const errMsg = e?.response?.data?.message || e?.message || '创建会话失败'
      setError(errMsg)
      message.error(errMsg)
    } finally {
      setCreating(false)
    }
  }

  const handleReview = async () => {
    if (!result?.id) return
    try {
      await request.post(API_ENDPOINTS.AI_REVIEW(result.id), {
        action,
        doctor_notes: reviewNote,
      })
      message.success('审核完成')
      setReviewModal(false)
      setReviewNote('')
    } catch (e: any) {
      message.error(e?.response?.data?.message || '审核提交失败')
    }
  }

  // ============ 无 sessionId：创建新诊断 ============
  if (!sessionId) {
    return (
      <div>
        <Title level={4} style={{ marginBottom: 16 }}>
          <RobotOutlined /> AI 智能诊断
        </Title>

        <Card style={{ textAlign: 'center', padding: 40 }}>
          <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: 500 }}>
            <div>
              <RobotOutlined style={{ fontSize: 48, color: '#8B4513' }} />
              <Title level={4} style={{ marginTop: 16 }}>创建新诊断</Title>
              <Text type="secondary">选择一个患者并输入主诉，系统将自动采集四诊数据并运行 AI 辨证分析</Text>
            </div>

            <div style={{ textAlign: 'left' }}>
              <Text strong>选择患者</Text>
              <Button
                block
                size="large"
                onClick={openPatientSelector}
                style={{ marginTop: 8, textAlign: 'left' }}
              >
                <UserOutlined /> {patientId ? `${patientName} (ID: ${patientId})` : '点击选择患者'}
              </Button>
            </div>

            <div style={{ textAlign: 'left' }}>
              <Text strong>主诉</Text>
              <Input.TextArea
                placeholder="请输入患者主诉，如：腹痛腹泻3月余，伴畏寒肢冷"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                rows={3}
                style={{ marginTop: 8 }}
              />
            </div>

            <Button
              type="primary"
              size="large"
              icon={<RobotOutlined />}
              onClick={handleCreateAndDiagnose}
              loading={creating}
              disabled={!patientId}
              block
            >
              {creating ? '正在创建并诊断...' : '创建会话并开始诊断'}
            </Button>

            {error && (
              <Alert
                message="操作失败"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
              />
            )}
          </Space>
        </Card>

        <Modal title="选择患者" open={patientModal} onCancel={() => setPatientModal(false)} footer={null} width={600}>
          <Table
            dataSource={patients}
            columns={[
              { title: '姓名', dataIndex: 'name' },
              { title: '性别', dataIndex: 'gender', render: (v: string) => v === 'male' ? '男' : v === 'female' ? '女' : '-' },
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
            size="small"
          />
        </Modal>
      </div>
    )
  }

  // ============ 诊断中 ============
  if (loading || diagnosing) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
        <Title level={4} style={{ marginTop: 24, color: '#8B4513' }}>
          AI 综合分析中...
        </Title>
        <Text type="secondary">正在分析四诊数据，进行辨证论治</Text>
      </div>
    )
  }

  // ============ 诊断出错 ============
  if (error && !result) {
    return (
      <div>
        <Title level={4} style={{ marginBottom: 16 }}>
          <RobotOutlined /> AI 诊断结果
        </Title>
        <Card>
          <Alert
            message="诊断失败"
            description={
              <Space direction="vertical">
                <Text>{error}</Text>
                <Space>
                  <Button type="primary" onClick={() => sessionId && runDiagnosis(Number(sessionId))} loading={diagnosing}>
                    重新诊断
                  </Button>
                  <Button onClick={() => navigate(`/diagnosis/${sessionId}`)}>刷新页面</Button>
                </Space>
              </Space>
            }
            type="error"
            showIcon
          />
        </Card>
      </div>
    )
  }

  // ============ 无结果 ============
  if (!result) {
    return (
      <Card>
        <Alert
          message="暂无诊断数据"
          description={
            <Space direction="vertical">
              <Text>当前会话没有诊断结果，请尝试重新诊断或返回工作台。</Text>
              <Button type="primary" onClick={() => sessionId && runDiagnosis(Number(sessionId))} loading={diagnosing}>
                开始诊断
              </Button>
            </Space>
          }
          type="info"
          showIcon
        />
      </Card>
    )
  }

  // ============ 结果展示 ============
  const confidenceColor = result.confidence_score > 0.85 ? 'green'
    : result.confidence_score > 0.7 ? 'orange' : 'red'

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <RobotOutlined /> AI 诊断结果
        <Text type="secondary" style={{ fontSize: 14, marginLeft: 12 }}>
          诊断医师: {user?.real_name || '未知'}
        </Text>
      </Title>

      <Alert
        message="免责提示"
        description="AI 诊断仅供参考，最终诊断需由医师审核确认。请仔细核对以下内容后进行签署。"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card
        title={<><Tag color="red">证型判断</Tag> 置信度 <Tag color={confidenceColor}>{Math.round(result.confidence_score * 100)}%</Tag></>}
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" size="small">
          <Title level={5} style={{ color: '#C0392B' }}>
            主证: {result.primary_pattern}
          </Title>
          {result.secondary_pattern && (<Text strong>兼证: {result.secondary_pattern}</Text>)}
        </Space>

        <Divider orientation="left">辨证依据</Divider>
        {result.diagnosis_basis && (
          <Descriptions column={1} size="small" bordered>
            {result.diagnosis_basis.tongue_basis && (
              <Descriptions.Item label="舌诊依据">{result.diagnosis_basis.tongue_basis}</Descriptions.Item>
            )}
            {result.diagnosis_basis.pulse_basis && (
              <Descriptions.Item label="脉诊依据">{result.diagnosis_basis.pulse_basis}</Descriptions.Item>
            )}
            {result.diagnosis_basis.symptom_basis && (
              <Descriptions.Item label="症状依据">{result.diagnosis_basis.symptom_basis}</Descriptions.Item>
            )}
            {result.diagnosis_basis.summary && (
              <Descriptions.Item label="综合辨证">{result.diagnosis_basis.summary}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Card>

      <Card title={<Tag color="green">治则治法</Tag>} style={{ marginBottom: 16 }}>
        <Text strong>{result.treatment_principle}</Text>
        {result.treatment_method && (
          <Paragraph style={{ marginTop: 8, color: '#666' }}>{result.treatment_method}</Paragraph>
        )}
      </Card>

      {result.recommended_prescription && (
        <Card title={<><MedicineBoxOutlined /> 推荐方剂</>} style={{ marginBottom: 16 }}>
          <Title level={5}>{result.recommended_prescription.name}</Title>
          {result.recommended_prescription.source && (
            <Text type="secondary">出处: {result.recommended_prescription.source}</Text>
          )}
          <Divider />
          <Text strong>药物组成:</Text>
          {result.recommended_prescription.composition?.map((item: any, idx: number) => (
            <div key={idx} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
              <Space>
                <Tag>{item.herb}</Tag>
                <Text>{item.dosage}{item.unit}</Text>
                {item.special && <Tag color="orange">{item.special}</Tag>}
              </Space>
            </div>
          ))}
          {result.recommended_prescription.modification && (
            <><Divider /><Text strong>随症加减:</Text><Paragraph style={{ marginTop: 4 }}>{result.recommended_prescription.modification}</Paragraph></>
          )}
          {result.recommended_prescription.usage && (
            <><Divider /><Text strong>用法:</Text><Paragraph style={{ marginTop: 4 }}>{result.recommended_prescription.usage}</Paragraph></>
          )}
        </Card>
      )}

      {result.recommended_acupuncture && (
        <Card title="针灸方案" style={{ marginBottom: 16 }}>
          <Paragraph><Text strong>穴位: </Text>{result.recommended_acupuncture.points?.join('、')}</Paragraph>
          <Paragraph><Text strong>方法: </Text>{result.recommended_acupuncture.method}</Paragraph>
          <Paragraph><Text strong>频率: </Text>{result.recommended_acupuncture.frequency}</Paragraph>
        </Card>
      )}

      {result.differential_diagnosis && (
        <Card title="鉴别诊断" style={{ marginBottom: 16 }}>
          {result.differential_diagnosis.map((item: string, idx: number) => (
            <Paragraph key={idx}>- {item}</Paragraph>
          ))}
        </Card>
      )}

      {result.health_advice && (
        <Card title="健康建议" style={{ marginBottom: 16 }}>
          {result.health_advice.diet && <Paragraph><Text strong>饮食: </Text>{result.health_advice.diet}</Paragraph>}
          {result.health_advice.emotion && <Paragraph><Text strong>情志: </Text>{result.health_advice.emotion}</Paragraph>}
          {result.health_advice.routine && <Paragraph><Text strong>作息: </Text>{result.health_advice.routine}</Paragraph>}
        </Card>
      )}

      <Card>
        <Space size="large" wrap>
          <Button type="primary" icon={<CheckCircleOutlined />}
            onClick={() => { setAction('approved'); setReviewModal(true) }}
            style={{ background: '#27AE60', borderColor: '#27AE60' }}>
            确认签署
          </Button>
          <Button icon={<EditOutlined />}
            onClick={() => { setAction('modified'); setReviewModal(true) }}>
            修改后签署
          </Button>
          <Button icon={<CloseCircleOutlined />}
            onClick={() => { setAction('rejected'); setReviewModal(true) }}
            style={{ borderColor: '#C0392B', color: '#C0392B' }}>
            驳回
          </Button>
          <Button onClick={() => navigate(`/prescription/${sessionId}`)}>查看处方</Button>
          <Button onClick={() => navigate(`/report/${sessionId}`)} icon={<PrinterOutlined />}>诊断报告</Button>
          <Button onClick={() => runDiagnosis(Number(sessionId))} loading={diagnosing}>重新生成</Button>
        </Space>
      </Card>

      <Modal
        title="审核 AI 诊断结果"
        open={reviewModal}
        onOk={handleReview}
        onCancel={() => setReviewModal(false)}
        okText="提交审核"
      >
        <Text>操作: {action === 'approved' ? '确认签署' : action === 'modified' ? '修改后签署' : '驳回'}</Text>
        {action !== 'approved' && (
          <Input.TextArea
            placeholder="请输入审核备注..."
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            rows={4}
            style={{ marginTop: 16 }}
          />
        )}
      </Modal>
    </div>
  )
}
