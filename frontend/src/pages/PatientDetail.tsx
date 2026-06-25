import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card, Descriptions, Tag, Timeline, Button, Spin, Row, Col, Tabs,
  Table, Space, Divider, Typography, Alert, Empty, Progress,
} from 'antd'
import {
  ArrowLeftOutlined, MedicineBoxOutlined, UserOutlined,
  FileTextOutlined, HeartOutlined, ExperimentOutlined,
} from '@ant-design/icons'
import request from '../services/http'
import { API_ENDPOINTS } from '../services/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  const loadPatient = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setLoadError(null)
    try {
      const res: any = await request.get(API_ENDPOINTS.PATIENT_DETAIL(Number(id)))
      setPatient(res.data)
      // 加载就诊记录
      loadSessions(Number(id))
    } catch (e: any) {
      const errMsg = e?.response?.data?.message || e?.message || '加载患者信息失败'
      setLoadError(errMsg)
    } finally {
      setLoading(false)
    }
  }, [id])

  const loadSessions = async (patientId: number) => {
    setSessionsLoading(true)
    try {
      const res: any = await request.get(API_ENDPOINTS.PATIENT_SESSIONS(patientId))
      setSessions(res.data || [])
    } catch {
      // 静默失败，后端可能尚未部署此接口
      setSessions([])
    } finally {
      setSessionsLoading(false)
    }
  }

  useEffect(() => { loadPatient() }, [loadPatient])

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
  }

  if (loadError || !patient) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/patients')} style={{ marginBottom: 16 }}>
          返回患者列表
        </Button>
        <Card>
          <Alert
            message="加载失败"
            description={loadError || '未找到患者信息'}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={loadPatient}>
                重试
              </Button>
            }
          />
        </Card>
      </div>
    )
  }

  // 从患者数据中提取可用信息
  const genderText = patient.gender === 'male' ? '男' : patient.gender === 'female' ? '女' : '-'

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/patients')}>返回患者列表</Button>
        <Button type="primary" icon={<MedicineBoxOutlined />}
          onClick={() => navigate('/diagnosis', { state: { patientId: Number(id) } })}>
          开始诊疗
        </Button>
      </Space>

      <Row gutter={16}>
        <Col span={16}>
          {/* 患者基本信息 */}
          <Card title={`${patient.name} - 患者档案`} style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="姓名">{patient.name}</Descriptions.Item>
              <Descriptions.Item label="性别">{genderText}</Descriptions.Item>
              <Descriptions.Item label="年龄">{patient.age || '-'}</Descriptions.Item>
              <Descriptions.Item label="手机号">{patient.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="体质">
                <Tag color="blue">{patient.constitution_type || '未辨识'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="建档时间">
                {patient.created_at ? dayjs(patient.created_at).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="主诉" span={2}>{patient.chief_complaint || '-'}</Descriptions.Item>
              <Descriptions.Item label="现病史" span={2}>{patient.present_illness || '-'}</Descriptions.Item>
              <Descriptions.Item label="既往史" span={2}>{patient.past_illness || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Tabs
            defaultActiveKey="visits"
            items={[
              // 就诊记录 Tab - 调用真实API
              {
                key: 'visits',
                label: <span><FileTextOutlined /> 就诊记录</span>,
                children: (
                  <Card>
                    {sessionsLoading ? (
                      <Spin style={{ display: 'block', margin: '40px auto' }} />
                    ) : sessions.length > 0 ? (
                      <Table
                        dataSource={sessions}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        columns={[
                          { title: '就诊号', dataIndex: 'session_no', key: 'session_no', width: 180 },
                          {
                            title: '日期', dataIndex: 'created_at', key: 'date',
                            render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-',
                          },
                          {
                            title: '证型', key: 'pattern',
                            render: (_: any, r: any) => r.ai_result
                              ? <Tag color="red">{r.ai_result.primary_pattern}</Tag>
                              : <Tag>待诊断</Tag>,
                          },
                          {
                            title: '状态', key: 'status',
                            render: (_: any, r: any) => {
                              const map: Record<string, { color: string; text: string }> = {
                                completed: { color: 'green', text: '已完成' },
                                collecting: { color: 'orange', text: '采集中' },
                                pending: { color: 'default', text: '待处理' },
                              }
                              const s = map[r.status] || { color: 'default', text: r.status }
                              return <Tag color={s.color}>{s.text}</Tag>
                            },
                          },
                          {
                            title: '操作', key: 'action',
                            render: (_: any, r: any) => (
                              <Space>
                                <Button type="link" size="small"
                                  onClick={() => navigate(`/diagnosis/${r.id}`)}>
                                  诊断
                                </Button>
                                <Button type="link" size="small"
                                  onClick={() => navigate(`/prescription/${r.id}`)}>
                                  处方
                                </Button>
                              </Space>
                            ),
                          },
                        ]}
                      />
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <Space direction="vertical" style={{ textAlign: 'center' }}>
                            <Text type="secondary">暂无就诊记录</Text>
                            <Button type="primary" onClick={() => navigate('/diagnosis', { state: { patientId: Number(id) } })}>
                              开始新诊疗
                            </Button>
                          </Space>
                        }
                      />
                    )}
                  </Card>
                ),
              },
              // 健康记录 Tab - 后端 API 完善后自动填充
              {
                key: 'health',
                label: <span><ExperimentOutlined /> 健康记录</span>,
                children: (
                  <Card>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <Space direction="vertical" style={{ textAlign: 'center' }}>
                          <Text type="secondary">暂无健康记录</Text>
                          <Alert
                            message="数据说明"
                            description="健康记录（舌诊、脉诊、检验检查等）将等待后端 API 完善后自动填充。届时将展示历次诊疗的详细四诊数据。"
                            type="info"
                            showIcon
                            style={{ maxWidth: 500, textAlign: 'left' }}
                          />
                        </Space>
                      }
                    />
                  </Card>
                ),
              },
              // 健康建议 Tab - 根据患者体质展示
              {
                key: 'advice',
                label: <span><HeartOutlined /> 健康建议</span>,
                children: (
                  <Card>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Alert
                        message="饮食建议"
                        description={
                          patient.constitution_type
                            ? `根据患者体质（${patient.constitution_type}）定制饮食建议。建议咨询中医师获取个性化方案。`
                            : '建议进行体质辨识后获取个性化饮食建议。'
                        }
                        type="info"
                        showIcon
                      />
                      <Divider />
                      <Alert
                        message="情志调理"
                        description="保持心情舒畅，避免忧思过度。忧思伤脾，不利于病情恢复。"
                        type="warning"
                        showIcon
                      />
                      <Divider />
                      <Alert
                        message="运动指导"
                        description="早睡早起，避免熬夜。适当午休，不宜过度劳累。可进行散步、太极拳等温和运动。"
                        type="success"
                        showIcon
                      />
                    </Space>
                  </Card>
                ),
              },
            ]}
          />
        </Col>

        {/* 右侧栏 */}
        <Col span={8}>
          {/* 体质摘要 */}
          <Card title="体质摘要" style={{ marginBottom: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B4513, #D4A574)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px', fontSize: 28, color: '#fff',
              }}>
                <UserOutlined />
              </div>
              <Tag color="blue" style={{ fontSize: 16, padding: '2px 12px' }}>
                {patient.constitution_type || '未辨识'}
              </Tag>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary">
                  建档日期: {patient.created_at ? dayjs(patient.created_at).format('YYYY-MM-DD') : '-'}
                </Text>
              </div>
            </div>
            <Progress
              type="dashboard"
              percent={patient.constitution_type ? 75 : 0}
              strokeColor="#8B4513"
              format={() => (
                <>
                  <div style={{ fontSize: 24, color: '#8B4513' }}>
                    {patient.constitution_type ? '75' : '--'}
                  </div>
                  <div style={{ fontSize: 12 }}>健康分</div>
                </>
              )}
            />
          </Card>

          {/* 最近就诊 */}
          <Card title="最近就诊" style={{ marginBottom: 16 }}>
            {sessions.length > 0 ? (
              <Timeline
                items={sessions.slice(0, 5).map((s: any) => ({
                  color: s.ai_result?.status === 'approved' ? 'green'
                    : s.ai_result?.status === 'pending' ? 'orange' : 'gray',
                  children: (
                    <div>
                      <Text style={{ fontSize: 12 }}>{dayjs(s.created_at).format('MM-DD HH:mm')}</Text>
                      <div>
                        {s.ai_result
                          ? <Tag color="red" style={{ fontSize: 11 }}>{s.ai_result.primary_pattern}</Tag>
                          : <Tag style={{ fontSize: 11 }}>待诊断</Tag>
                        }
                      </div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    暂无就诊记录
                  </Text>
                }
              />
            )}
          </Card>

          {/* 快捷操作 */}
          <Card title="快捷操作">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<MedicineBoxOutlined />}
                onClick={() => navigate('/diagnosis', { state: { patientId: Number(id) } })}>
                开始新诊疗
              </Button>
              <Button block icon={<FileTextOutlined />}
                disabled
                title="等待后端 API 完善后可用">
                查看诊断报告
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
