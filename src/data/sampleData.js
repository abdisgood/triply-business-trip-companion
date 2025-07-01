// Sample data for demonstration purposes
export const sampleCompanies = [
  {
    id: 'sample-1',
    name: 'Alibaba Group',
    industry: 'E-commerce & Technology',
    location: 'Hangzhou, Zhejiang',
    description: 'Leading Chinese multinational technology company specializing in e-commerce, retail, Internet, and technology.',
    status: 'interested',
    tags: ['E-commerce', 'Technology', 'Cloud Computing', 'Fintech'],
    phone: '+86 571 8505 2088',
    email: 'contact@alibaba.com',
    website: 'https://www.alibaba.com',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'sample-2',
    name: 'Tencent Holdings',
    industry: 'Internet & Gaming',
    location: 'Shenzhen, Guangdong',
    description: 'Chinese multinational technology and entertainment conglomerate and holding company.',
    status: 'contacted',
    tags: ['Gaming', 'Social Media', 'Technology', 'Entertainment'],
    phone: '+86 755 8601 3388',
    email: 'ir@tencent.com',
    website: 'https://www.tencent.com',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'sample-3',
    name: 'BYD Company',
    industry: 'Electric Vehicles & Batteries',
    location: 'Shenzhen, Guangdong',
    description: 'Chinese multinational manufacturing company headquartered in Shenzhen that specializes in electric vehicles.',
    status: 'scheduled',
    tags: ['Electric Vehicles', 'Green Technology', 'Manufacturing', 'Batteries'],
    phone: '+86 755 8988 8888',
    email: 'ir@byd.com',
    website: 'https://www.byd.com',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-30')
  },
  {
    id: 'sample-4',
    name: 'Xiaomi Corporation',
    industry: 'Consumer Electronics',
    location: 'Beijing',
    description: 'Chinese multinational electronics company founded in 2010 and headquartered in Beijing.',
    status: 'new',
    tags: ['Smartphones', 'IoT', 'Consumer Electronics', 'Smart Home'],
    phone: '+86 10 6060 6666',
    email: 'ir@xiaomi.com',
    website: 'https://www.mi.com',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'sample-5',
    name: 'CATL (Contemporary Amperex Technology)',
    industry: 'Battery Technology',
    location: 'Ningde, Fujian',
    description: 'Chinese battery manufacturer and technology company, specializing in lithium-ion batteries for electric vehicles.',
    status: 'visited',
    tags: ['Batteries', 'Energy Storage', 'Electric Vehicles', 'Green Tech'],
    phone: '+86 593 8699 8888',
    email: 'ir@catl.com',
    website: 'https://www.catl.com',
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'sample-6',
    name: 'Huawei Technologies',
    industry: 'Telecommunications & Technology',
    location: 'Shenzhen, Guangdong',
    description: 'Chinese multinational technology corporation specializing in telecommunications equipment and consumer electronics.',
    status: 'not_interested',
    tags: ['Telecommunications', '5G', 'Networking', 'Smartphones'],
    phone: '+86 755 2878 0808',
    email: 'contact@huawei.com',
    website: 'https://www.huawei.com',
    createdAt: new Date('2023-11-10'),
    updatedAt: new Date('2024-01-05')
  }
];

// Sample contacts for the companies
export const sampleContacts = [
  {
    id: 'contact-1',
    companyId: 'sample-1',
    name: 'Zhang Wei',
    position: 'Business Development Director',
    email: 'zhang.wei@alibaba.com',
    phone: '+86 138 0013 8000',
    notes: 'Key contact for international partnerships',
    createdAt: new Date('2024-01-16')
  },
  {
    id: 'contact-2',
    companyId: 'sample-2',
    name: 'Li Ming',
    position: 'VP of Strategic Partnerships',
    email: 'li.ming@tencent.com',
    phone: '+86 139 0013 9000',
    notes: 'Handles global expansion initiatives',
    createdAt: new Date('2024-01-12')
  },
  {
    id: 'contact-3',
    companyId: 'sample-3',
    name: 'Wang Xiaoli',
    position: 'International Sales Manager',
    email: 'wang.xiaoli@byd.com',
    phone: '+86 137 0013 7000',
    notes: 'Responsible for European market expansion',
    createdAt: new Date('2024-01-07')
  }
];

// Sample comments
export const sampleComments = [
  {
    id: 'comment-1',
    companyId: 'sample-1',
    content: 'Very promising company with strong e-commerce presence. Their cloud computing division is expanding rapidly.',
    createdAt: new Date('2024-01-18')
  },
  {
    id: 'comment-2',
    companyId: 'sample-2',
    content: 'Had initial discussion about potential gaming partnership. They seem interested in Western market expansion.',
    createdAt: new Date('2024-01-22')
  },
  {
    id: 'comment-3',
    companyId: 'sample-3',
    content: 'Scheduled visit to their Shenzhen facility next month. Very impressed with their EV technology demonstration.',
    createdAt: new Date('2024-01-28')
  }
];

// Sample scheduled actions
export const sampleScheduledActions = [
  {
    id: 'action-1',
    companyId: 'sample-3',
    type: 'visit',
    description: 'Factory tour and technology demonstration at BYD Shenzhen facility',
    scheduledDate: new Date('2024-03-15'),
    status: 'pending',
    createdAt: new Date('2024-01-28')
  },
  {
    id: 'action-2',
    companyId: 'sample-1',
    type: 'call',
    description: 'Follow-up call with Zhang Wei about partnership opportunities',
    scheduledDate: new Date('2024-02-20'),
    status: 'pending',
    createdAt: new Date('2024-01-18')
  },
  {
    id: 'action-3',
    companyId: 'sample-2',
    type: 'meeting',
    description: 'Virtual meeting to discuss gaming collaboration framework',
    scheduledDate: new Date('2024-02-28'),
    status: 'pending',
    createdAt: new Date('2024-01-22')
  }
]; 