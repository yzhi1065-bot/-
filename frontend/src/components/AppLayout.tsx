import React from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Badge } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  BarChartOutlined,
  LogoutOutlined,
  LaptopOutlined,
  RobotOutlined,
  FormOutlined,
  BookOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  AreaChartOutlined,
  FileTextOutlined,
  DownloadOutlined,
  WarningOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  HistoryOutlined,
  BellOutlined,
  TeamOutlined,
  SwapOutlined,
  ThunderboltOutlined,
  MonitorOutlined,
  HeartOutlined,
  StarOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ContainerOutlined,
  VideoCameraOutlined,
  SafetyOutlined,
  CloudServerOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  SwapRightOutlined,
  ReadOutlined,
  FileProtectOutlined,
  MessageOutlined,
  ToolOutlined,
} from '@ant-design/icons'

import { useAuthStore } from '../store/authStore'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台' },
  { key: '/patients', icon: <UserOutlined />, label: '患者管理' },
  { key: '/diagnosis', icon: <MedicineBoxOutlined />, label: '四诊采集' },
  { key: '/statistics', icon: <BarChartOutlined />, label: '数据统计' },
  { key: '/devices', icon: <LaptopOutlined />, label: '设备管理' },
  { key: '/ai-config', icon: <RobotOutlined />, label: 'AI配置' },
  { key: '/patient-consult', icon: <FormOutlined />, label: '预问诊' },
  { key: '/knowledge', icon: <BookOutlined />, label: '知识库' },
  { key: '/patient/home', icon: <UserOutlined />, label: '患者端' },
  { key: '/followup', icon: <RiseOutlined />, label: '复诊跟踪' },
  { key: '/medication', icon: <ClockCircleOutlined />, label: '服药管理' },
  { key: '/charts', icon: <AreaChartOutlined />, label: '可视化' },
  { key: '/templates', icon: <FileTextOutlined />, label: '病历模板' },
  { key: '/data-export', icon: <DownloadOutlined />, label: '导入导出' },
  { key: '/compatibility', icon: <WarningOutlined />, label: '配伍检查' },
  { key: '/audit-log', icon: <SecurityScanOutlined />, label: '审计日志' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
  { key: '/diagnosis-history', icon: <HistoryOutlined />, label: '诊断对比' },
  { key: '/notifications', icon: <BellOutlined />, label: '通知中心' },
  { key: '/queue', icon: <TeamOutlined />, label: '排队管理' },
  { key: '/chief-complaint', icon: <ThunderboltOutlined />, label: '快捷主诉' },
  { key: '/formula-compare', icon: <SwapOutlined />, label: '方剂对比' },
  { key: '/dashboard-screen', icon: <MonitorOutlined />, label: '数据大屏' },
  { key: '/health-advice', icon: <HeartOutlined />, label: '健康建议' },
  { key: '/satisfaction', icon: <StarOutlined />, label: '满意度' },
  { key: '/solar-term', icon: <EnvironmentOutlined />, label: '节气养生' },
  { key: '/pharmacy/drugs', icon: <ContainerOutlined />, label: '药品维护' },
  { key: '/pharmacy/purchases', icon: <ShoppingCartOutlined />, label: '进货管理' },
  { key: '/pharmacy/sales', icon: <DollarOutlined />, label: '销售统计' },
  { key: '/consultation', icon: <VideoCameraOutlined />, label: '远程会诊' },
  { key: '/user-manage', icon: <SafetyOutlined />, label: '权限管理' },
  { key: '/system-maintain', icon: <CloudServerOutlined />, label: '系统维护' },
  { key: '/nursing', icon: <MedicineBoxOutlined />, label: '护理记录' },
  { key: '/finance', icon: <DollarOutlined />, label: '财务管理' },
  { key: '/followup-manage', icon: <PhoneOutlined />, label: '患者随访' },
  { key: '/medical-record', icon: <FileTextOutlined />, label: '病历管理' },
  { key: '/schedule', icon: <CalendarOutlined />, label: '排班管理' },
  { key: '/report-analysis', icon: <BarChartOutlined />, label: '统计分析' },
  { key: '/lab-test', icon: <ExperimentOutlined />, label: '检查检验' },
  { key: '/insurance', icon: <DollarOutlined />, label: '医保结算' },
  { key: '/referral', icon: <SwapRightOutlined />, label: '转诊管理' },
  { key: '/health-edu', icon: <ReadOutlined />, label: '健康宣教' },
  { key: '/prescription-flow', icon: <FileProtectOutlined />, label: '处方流转' },
  { key: '/appointment', icon: <CalendarOutlined />, label: '预约挂号' },
  { key: '/message-push', icon: <MessageOutlined />, label: '消息推送' },
  { key: '/equipment', icon: <ToolOutlined />, label: '设备资产' },
  { key: '/live-stats', icon: <RiseOutlined />, label: '实时看板' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const selectedKey = '/' + location.pathname.split('/')[1]

  const dropdownItems = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: `${user?.real_name} (${user?.title || user?.role})` },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') logout()
    },
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF6F2 100%)',
        borderRight: '1px solid rgba(139,69,19,0.08)',
      }}>
        {/* Logo区域 */}
        <div style={{
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(139,69,19,0.08)',
          gap: 10,
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #8B4513 0%, #D4A574 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            color: '#fff',
            flexShrink: 0,
          }}>
            ⚕
          </div>
          <div>
            <div style={{
              fontFamily: '"Noto Serif SC", serif',
              fontSize: 16,
              fontWeight: 900,
              color: '#8B4513',
              letterSpacing: 2,
              lineHeight: 1.2,
            }}>中医智能</div>
            <div style={{
              fontFamily: '"Noto Serif SC", serif',
              fontSize: 16,
              fontWeight: 900,
              color: '#8B4513',
              letterSpacing: 2,
              lineHeight: 1.2,
            }}>诊断系统</div>
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            borderRight: 0,
            marginTop: 8,
            background: 'transparent',
            borderInlineEnd: 'none !important',
          }}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          borderBottom: '1px solid rgba(139,69,19,0.06)',
          height: 64,
        }}>
          <Dropdown menu={dropdownItems} placement="bottomRight">
            <div style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '4px 12px',
              borderRadius: 8,
              transition: 'all 0.2s',
            }}
              className="ant-dropdown-trigger"
            >
              <Avatar size={36} style={{
                background: 'linear-gradient(135deg, #8B4513 0%, #D4A574 100%)',
                fontWeight: 600,
                fontSize: 14,
              }}>
                {user?.real_name?.[0] || '管'}
              </Avatar>
              <div>
                <Text strong style={{ fontSize: 14, display: 'block', lineHeight: 1.3 }}>
                  {user?.real_name}
                </Text>
                <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.2 }}>
                  {user?.title || user?.department || user?.role}
                </Text>
              </div>
            </div>
          </Dropdown>
        </Header>
        <Content style={{
          margin: 24,
          minHeight: 'calc(100vh - 112px)',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
