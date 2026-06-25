import React from 'react'
import { Card, Descriptions, Tag, Typography, Divider, Table, Button, Space, Progress } from 'antd'
import { UserOutlined, MedicineBoxOutlined, WarningOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

export default function PatientHealthPage() {
  const navigate = useNavigate()

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <UserOutlined /> 健康档案
      </Title>

      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="姓名">张三</Descriptions.Item>
          <Descriptions.Item label="性别">男</Descriptions.Item>
          <Descriptions.Item label="年龄">45岁</Descriptions.Item>
          <Descriptions.Item label="血型">O型</Descriptions.Item>
          <Descriptions.Item label="身高">172cm</Descriptions.Item>
          <Descriptions.Item label="体重">68kg</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="中医体质信息" style={{ marginBottom: 16 }}>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="体质类型">
            <Tag color="blue" style={{ fontSize: 14, padding: '2px 12px' }}>阳虚质</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="体质特征">阳气不足，以畏寒怕冷、手足不温等虚寒表现为主要特征</Descriptions.Item>
          <Descriptions.Item label="辨识日期">2026-04-15</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Text strong>体质调理建议</Text>
        <ul style={{ marginTop: 8 }}>
          <li>宜温阳补气，多吃牛羊肉、生姜、韭菜等温热食物</li>
          <li>避寒凉，少食生冷瓜果和冷饮</li>
          <li>适当运动，推荐快走、太极拳</li>
          <li>注意保暖，尤其是腹部和脚部</li>
        </ul>
      </Card>

      <Card title="过敏史" style={{ marginBottom: 16 }}>
        <Table dataSource={[
          { allergen: '青霉素', reaction: '皮疹', severity: '中度' },
          { allergen: '花粉', reaction: '打喷嚏、流涕', severity: '轻度' },
        ]} rowKey="allergen" pagination={false} size="small"
          columns={[
            { title: '过敏原', dataIndex: 'allergen', key: 'allergen' },
            { title: '反应', dataIndex: 'reaction', key: 'reaction' },
            { title: '严重程度', dataIndex: 'severity', key: 'severity', render: (v: string) => (
              <Tag color={v === '重度' ? 'red' : v === '中度' ? 'orange' : 'blue'}>{v}</Tag>
            )},
          ]}
        />
      </Card>

      <Card title="既往病史">
        <Table dataSource={[
          { disease: '慢性胃炎', diagnosed: '2020-03', status: '已愈' },
          { disease: '腰椎间盘突出', diagnosed: '2022-08', status: '治疗中' },
        ]} rowKey="disease" pagination={false} size="small"
          columns={[
            { title: '疾病', dataIndex: 'disease', key: 'disease' },
            { title: '确诊时间', dataIndex: 'diagnosed', key: 'diagnosed' },
            { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => (
              <Tag color={v === '已愈' ? 'green' : 'orange'}>{v}</Tag>
            )},
          ]}
        />
      </Card>
    </div>
  )
}
