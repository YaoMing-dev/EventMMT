import { contactInfo, companyLegalName } from './contactInfo.js'

const wedding = contactInfo.wedding
export const CANONICAL = 'https://minhminhthuy.io.vn/tiec-cuoi'

// Cố ý KHÔNG gắn aggregateRating: đánh giá do doanh nghiệp tự khai về chính
// mình không đủ điều kiện rich snippet của Google và có rủi ro manual action.
// Cũng không copy nội dung review từ Google Maps — nội dung thuộc về người
// viết, vi phạm ToS, và với Google Search là duplicate content.
export const weddingSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${CANONICAL}#business`,
  name: wedding.tagline,
  alternateName: wedding.brand,
  description:
    'Trang trí bàn thờ gia tiên, cổng hoa, cho thuê rạp cưới và bàn ghế đãi tiệc tại Cần Thơ.',
  url: CANONICAL,
  telephone: wedding.phoneIntl,
  email: wedding.email,
  parentOrganization: { '@type': 'Organization', name: companyLegalName },
  address: {
    '@type': 'PostalAddress',
    streetAddress: wedding.street,
    addressLocality: 'Phường Ninh Kiều',
    addressRegion: 'Cần Thơ',
    addressCountry: 'VN',
  },
  geo: { '@type': 'GeoCoordinates', latitude: wedding.geo.lat, longitude: wedding.geo.lng },
  hasMap: wedding.mapsUrl,
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: wedding.hoursOpen,
    closes: wedding.hoursClose,
  }],
  areaServed: [
    { '@type': 'City', name: 'Cần Thơ' },
    { '@type': 'AdministrativeArea', name: 'Vĩnh Long' },
    { '@type': 'AdministrativeArea', name: 'Hậu Giang' },
    { '@type': 'AdministrativeArea', name: 'Sóc Trăng' },
    { '@type': 'AdministrativeArea', name: 'An Giang' },
    { '@type': 'AdministrativeArea', name: 'Kiên Giang' },
  ],
  sameAs: [wedding.facebookUrl, wedding.mapsUrl],
  makesOffer: [
    'Trang trí bàn thờ gia tiên',
    'Cho thuê rạp cưới, bàn ghế',
    'Làm quà hỏi cưới, mâm quả trầu cau',
    'Cho thuê cổng cưới',
    'Đội ngũ bê tráp',
    'Xe hoa cưới',
    'Sân khấu, âm thanh ánh sáng tiệc cưới',
  ].map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
}
