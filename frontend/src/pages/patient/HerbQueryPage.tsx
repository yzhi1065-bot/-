import React, { useState } from 'react'
import { Card, Input, Table, Tag, Typography, Space, Divider, Descriptions } from 'antd'
import { MedicineBoxOutlined, SearchOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const herbData = [
  { name: '黄芪', category: '补气药', nature: '温', flavor: '甘', meridian: '脾、肺', efficacy: '补气固表，利水消肿，托毒生肌', use: '10-30g', caution: '实证及阴虚阳亢者慎用' },
  { name: '当归', category: '补血药', nature: '温', flavor: '甘、辛', meridian: '肝、心、脾', efficacy: '补血活血，调经止痛，润肠通便', use: '6-12g', caution: '湿盛中满者慎用' },
  { name: '茯苓', category: '利水渗湿药', nature: '平', flavor: '甘、淡', meridian: '心、脾、肾', efficacy: '利水渗湿，健脾宁心', use: '10-15g', caution: '阴虚火旺者慎用' },
  { name: '柴胡', category: '解表药', nature: '微寒', flavor: '苦、辛', meridian: '肝、胆', efficacy: '疏散退热，疏肝解郁，升举阳气', use: '3-10g', caution: '阴虚阳亢者忌用' },
  { name: '甘草', category: '补气药', nature: '平', flavor: '甘', meridian: '心、肺、脾、胃', efficacy: '补脾益气，清热解毒，缓急止痛，调和诸药', use: '2-10g', caution: '湿盛者慎用，反大戟、芫花、甘遂' },
  { name: '陈皮', category: '理气药', nature: '温', flavor: '苦、辛', meridian: '脾、肺', efficacy: '理气健脾，燥湿化痰', use: '3-10g', caution: '阴虚燥咳者慎用' },
  { name: '白芍', category: '补血药', nature: '微寒', flavor: '苦、酸', meridian: '肝、脾', efficacy: '养血调经，柔肝止痛，敛阴止汗', use: '6-15g', caution: '阳衰虚寒者慎用' },
  { name: '白术', category: '补气药', nature: '温', flavor: '苦、甘', meridian: '脾、胃', efficacy: '健脾益气，燥湿利水，止汗安胎', use: '6-12g', caution: '阴虚火旺者慎用' },
  { name: '熟地黄', category: '补血药', nature: '温', flavor: '甘', meridian: '肝、肾', efficacy: '滋阴补血，益精填髓', use: '9-15g', caution: '脾胃虚弱者慎用' },
  { name: '川芎', category: '活血化瘀药', nature: '温', flavor: '辛', meridian: '肝、胆、心包', efficacy: '活血行气，祛风止痛', use: '3-10g', caution: '阴虚火旺者慎用' },
]

export default function HerbQueryPage() {
  const [keyword, setKeyword] = useState('')

  const filtered = herbData.filter(h =>
    !keyword || h.name.includes(keyword) || h.category.includes(keyword) || h.efficacy.includes(keyword)
  )

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <MedicineBoxOutlined /> 中药查询
      </Title>

      <Card>
        <Input.Search
          placeholder="搜索药名、分类或功效..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ marginBottom: 16 }}
          enterButton={<><SearchOutlined /> 查询</>}
        />

        <Table dataSource={filtered} rowKey="name" pagination={false} size="small"
          columns={[
            { title: '药名', dataIndex: 'name', key: 'name',
              render: (v: string) => <Text strong style={{ color: '#8B4513', fontSize: 15 }}>{v}</Text> },
            { title: '分类', dataIndex: 'category', key: 'category', render: (v: string) => <Tag>{v}</Tag> },
            { title: '性', dataIndex: 'nature', key: 'nature', width: 50 },
            { title: '味', dataIndex: 'flavor', key: 'flavor', width: 80 },
            { title: '归经', dataIndex: 'meridian', key: 'meridian', width: 100 },
            { title: '功效', dataIndex: 'efficacy', key: 'efficacy', ellipsis: true },
            { title: '用量', dataIndex: 'use', key: 'use', width: 80 },
            { title: '注意事项', dataIndex: 'caution', key: 'caution', ellipsis: true },
          ]}
          expandable={{
            expandedRowRender: (record) => (
              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label="功效详解">{record.efficacy}</Descriptions.Item>
                <Descriptions.Item label="常规用量">{record.use}</Descriptions.Item>
                <Descriptions.Item label="使用注意">{record.caution}</Descriptions.Item>
              </Descriptions>
            ),
          }}
        />
      </Card>
    </div>
  )
}
