import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Card, Menu, Typography } from 'antd'
import { HomeOutlined, FileTextOutlined, UserOutlined, MedicineBoxOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import PatientHomePage from './PatientHomePage'
import PatientRecordsPage from './PatientRecordsPage'
import PatientHealthPage from './PatientHealthPage'
import HerbQueryPage from './HerbQueryPage'

const { Title } = Typography

const patientMenuItems = [
  { key: '/patient/home', icon: <HomeOutlined />, label: '患者首页' },
  { key: '/patient/records', icon: <FileTextOutlined />, label: '就诊记录' },
  { key: '/patient/health', icon: <UserOutlined />, label: '健康档案' },
  { key: '/patient/herbs', icon: <MedicineBoxOutlined />, label: '中药查询' },
]

export default function PatientLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedKey = '/' + location.pathname.split('/').slice(1, 3).join('/')

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        患者端
      </Title>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={patientMenuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', background: 'transparent' }}
        />
      </Card>
      <Routes>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<PatientHomePage />} />
        <Route path="records" element={<PatientRecordsPage />} />
        <Route path="health" element={<PatientHealthPage />} />
        <Route path="herbs" element={<HerbQueryPage />} />
      </Routes>
    </div>
  )
}
