import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Typography, Space, Tag, Descriptions, Divider, message, Spin, Alert } from 'antd'
import { ArrowLeftOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons'
import request from '../services/http'
import { API_ENDPOINTS } from '../services/api'

const { Title, Text, Paragraph } = Typography

export default function ReportPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (sessionId) loadReport()
  }, [sessionId])

  const loadReport = async () => {
    try {
      const [aiRes, sessionRes, presRes] = await Promise.all([
        request.get(API_ENDPOINTS.AI_RESULT(Number(sessionId))).catch(() => null),
        request.get(API_ENDPOINTS.GET_SESSION(Number(sessionId))).catch(() => null),
        request.get(API_ENDPOINTS.PRESCRIPTION_BY_SESSION(Number(sessionId))).catch(() => null),
      ])
      setData({
        aiResult: (aiRes as any)?.data,
        session: (sessionRes as any)?.data,
        prescription: (presRes as any)?.data,
      })
    } catch (e) { /* ignore */ }
    setLoading(false)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
  if (!data) return <Card>未找到诊断报告</Card>

  const { aiResult, prescription } = data
  const rx = aiResult?.recommended_prescription

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
        <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>打印报告</Button>
      </Space>

      <div id="report-content">
        <Card style={{ marginBottom: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', margin: 0, letterSpacing: 4 }}>
              中医智能诊断报告
            </Title>
            <Divider style={{ borderColor: '#D4A574' }} />
            <Text type="secondary">报告编号：{sessionId} | 生成日期：{new Date().toLocaleDateString('zh-CN')}</Text>
          </div>

          {/* 诊断结论 */}
          {aiResult && (
            <>
              <Descriptions title="一、诊断结论" column={2} size="small" bordered style={{ marginBottom: 16 }}>
                <Descriptions.Item label="主证">
                  <Tag color="red" style={{ fontSize: 14, padding: '2px 8px' }}>{aiResult.primary_pattern}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="置信度">
                  <Tag color="green">{Math.round((aiResult.confidence_score || 0) * 100)}%</Tag>
                </Descriptions.Item>
                {aiResult.secondary_pattern && (
                  <Descriptions.Item label="兼证" span={2}>
                    <Tag>{aiResult.secondary_pattern}</Tag>
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* 辨证依据 */}
              {aiResult.diagnosis_basis && (
                <Descriptions title="二、辨证依据" column={1} size="small" bordered style={{ marginBottom: 16 }}>
                  {aiResult.diagnosis_basis.tongue_basis && (
                    <Descriptions.Item label="舌诊">{aiResult.diagnosis_basis.tongue_basis}</Descriptions.Item>
                  )}
                  {aiResult.diagnosis_basis.pulse_basis && (
                    <Descriptions.Item label="脉诊">{aiResult.diagnosis_basis.pulse_basis}</Descriptions.Item>
                  )}
                  {aiResult.diagnosis_basis.symptom_basis && (
                    <Descriptions.Item label="症状">{aiResult.diagnosis_basis.symptom_basis}</Descriptions.Item>
                  )}
                  {aiResult.diagnosis_basis.summary && (
                    <Descriptions.Item label="综合辨证">{aiResult.diagnosis_basis.summary}</Descriptions.Item>
                  )}
                </Descriptions>
              )}

              {/* 治则治法 */}
              <Descriptions title="三、治则治法" column={1} size="small" bordered style={{ marginBottom: 16 }}>
                <Descriptions.Item label="治则">{aiResult.treatment_principle}</Descriptions.Item>
                <Descriptions.Item label="治法">{aiResult.treatment_method}</Descriptions.Item>
              </Descriptions>
            </>
          )}

          {/* 处方 */}
          {rx && (
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>四、处方</Title>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="方名">{rx.name}</Descriptions.Item>
                {rx.source && <Descriptions.Item label="出处">{rx.source}</Descriptions.Item>}
              </Descriptions>
              <Divider orientation="left">药物组成</Divider>
              {rx.composition?.map((item: any, idx: number) => (
                <div key={idx} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                  <span><Text strong>{idx + 1}.</Text> {item.herb}</span>
                  <span>{item.dosage}{item.unit} {item.special && <Tag color="orange">{item.special}</Tag>}</span>
                </div>
              ))}
              {rx.usage && <Paragraph style={{ marginTop: 16 }}><Text strong>用法：</Text>{rx.usage}</Paragraph>}
              {rx.modification && <Paragraph><Text strong>加减：</Text>{rx.modification}</Paragraph>}
            </div>
          )}

          {/* 健康建议 */}
          {aiResult?.health_advice && (
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>五、健康建议</Title>
              {aiResult.health_advice.diet && <Paragraph><Text strong>饮食：</Text>{aiResult.health_advice.diet}</Paragraph>}
              {aiResult.health_advice.emotion && <Paragraph><Text strong>情志：</Text>{aiResult.health_advice.emotion}</Paragraph>}
              {aiResult.health_advice.routine && <Paragraph><Text strong>作息：</Text>{aiResult.health_advice.routine}</Paragraph>}
            </div>
          )}

          {/* 鉴别诊断 */}
          {aiResult?.differential_diagnosis && (
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>六、鉴别诊断</Title>
              {aiResult.differential_diagnosis.map((item: string, idx: number) => (
                <Paragraph key={idx}>• {item}</Paragraph>
              ))}
            </div>
          )}

          <Divider />
          <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
            <p>本报告由AI辅助生成，仅供参考，最终诊断以医师确认为准</p>
            <p>中医智能诊断系统 v1.0</p>
          </div>
        </Card>
      </div>

      <Space>
        <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>打印报告</Button>
      </Space>
    </div>
  )
}
