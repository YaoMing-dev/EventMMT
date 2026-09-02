import { companyLegalName } from './contactInfo.js'

const SITE_URL = 'https://minhminhthuy.io.vn'

// Service schema cho từng trang con — provider trỏ về đúng LocalBusiness
// (@id) đã khai báo ở eventSchema.js/weddingSchema.js, không lặp lại toàn
// bộ thông tin doanh nghiệp.
export function buildServiceSchema({ path, name, description, parentBusinessId, areaServed }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}${path}#service`,
    name,
    description,
    url: `${SITE_URL}${path}`,
    provider: { '@type': 'LocalBusiness', '@id': parentBusinessId, name: companyLegalName },
    areaServed,
  }
}

// items: [{ label, to }] — thứ tự từ trang chủ đến trang hiện tại.
export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: `${SITE_URL}${item.to}`,
    })),
  }
}
