import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './Stocks.scss';
import goairLogo from '../../../public/images/logo/goair.png';
import oyoLogo from '../../../public/images/logo/oyo.png';
import zomatoLogo from '../../../public/images/logo/zomato.png';
import bajajLogo from '../../../public/images/logo/bajaj.png';
import swiggyLogo from '../../../public/images/logo/swiggy.png';
import tataLogo from '../../../public/images/logo/tata.png';
import mahindraLogo from '../../../public/images/logo/mahindra.png';

const ipoDetails: Record<number, any> = {
  1: {
    company: 'GO AIR',
    issueSize: '₹3600 Crores',
    priceRange: '₹50-60',
    minAmount: '₹50,000',
    lotSize: '150 shares/lots',
    issueDates: '12 Dec - 15 Dec 22',
    listedPrice: '₹150',
    listingGain: '₹10 (10.0%)',
    logo: goairLogo,
    about: 'GoAir is a leading low-cost airline in India, offering affordable and reliable air travel services.',
    keyHighlights: [
      'Strong market presence in the aviation industry.',
      'Expanding fleet and route network.',
      'Focus on customer satisfaction and operational efficiency.',
    ],
  },
  2: {
    company: 'OYO',
    issueSize: '₹3600 Crores',
    priceRange: '₹50-60',
    minAmount: '₹50,000',
    lotSize: '150 shares/lots',
    issueDates: '12 Dec - 15 Dec 22',
    listedPrice: '₹150',
    listingGain: '₹10 (10.0%)',
    logo: oyoLogo,
    about: 'OYO is a global hospitality chain offering affordable and standardized accommodations.',
    keyHighlights: [
      'Rapid expansion across multiple countries.',
      'Technology-driven operations and customer experience.',
      'Strong brand recognition and customer loyalty.',
    ],
  },
  3: {
    company: 'ZOMATO',
    issueSize: '₹3600 Crores',
    priceRange: '₹50-60',
    minAmount: '₹50,000',
    lotSize: '150 shares/lots',
    issueDates: '12 Dec - 15 Dec 22',
    listedPrice: '₹150',
    listingGain: '₹10 (10.0%)',
    logo: zomatoLogo,
    about: 'Zomato is a leading food delivery and restaurant discovery platform in India and globally.',
    keyHighlights: [
      'Dominant market share in the food delivery industry.',
      'Strong technology platform and user base.',
      'Expanding into new verticals like grocery delivery.',
    ],
  },
  4: {
    company: 'BAJAJ ENERGY',
    issueSize: '₹3600 Crores',
    priceRange: '₹50-60',
    minAmount: '₹50,000',
    lotSize: '150 shares/lots',
    issueDates: '12 Dec - 15 Dec 22',
    listedPrice: '₹150',
    listingGain: '₹10 (10.0%)',
    logo: bajajLogo,
    about: 'Bajaj Energy is a leading power generation company in India, focusing on sustainable energy solutions.',
    keyHighlights: [
      'Diversified portfolio of thermal and renewable energy projects.',
      'Strong financial performance and growth potential.',
      'Commitment to environmental sustainability.',
    ],
  },
  5: {
    company: 'SWIGGY',
    issueSize: '₹3600 Crores',
    priceRange: '₹50-60',
    minAmount: '₹50,000',
    lotSize: '150 shares/lots',
    issueDates: '12 Dec - 15 Dec 22',
    listedPrice: '₹150',
    listingGain: '₹10 (10.0%)',
    logo: swiggyLogo,
    about: 'Swiggy is a leading online food delivery platform in India, known for its fast and reliable service.',
    keyHighlights: [
      'Extensive network of restaurants and delivery partners.',
      'Innovative features like Swiggy Super and Instamart.',
      'Strong focus on customer experience and technology.',
    ],
  },
  6: {
    company: 'TATA',
    issueSize: '₹3600 Crores',
    priceRange: '₹50-60',
    minAmount: '₹50,000',
    lotSize: '150 shares/lots',
    issueDates: '12 Dec - 15 Dec 22',
    listedPrice: '₹150',
    listingGain: '₹10 (10.0%)',
    logo: tataLogo,
    about: 'Tata is a diversified conglomerate with businesses in sectors like steel, automobiles, IT, and more.',
    keyHighlights: [
      'One of the largest and most trusted brands in India.',
      'Diverse portfolio of businesses with global presence.',
      'Commitment to innovation and sustainability.',
    ],
  },
  7: {
    company: 'MAHINDRA',
    issueSize: '₹3600 Crores',
    priceRange: '₹50-60',
    minAmount: '₹50,000',
    lotSize: '150 shares/lots',
    issueDates: '12 Dec - 15 Dec 22',
    listedPrice: '₹150',
    listingGain: '₹10 (10.0%)',
    logo: mahindraLogo,
    about: 'Mahindra is a leading Indian multinational conglomerate with interests in automobiles, agriculture, and IT.',
    keyHighlights: [
      'Strong presence in the automotive and farm equipment sectors.',
      'Focus on innovation and sustainability.',
      'Global operations with a strong domestic market.',
    ],
  },
};

const IPODetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ipo = ipoDetails[Number(id)];

  if (!ipo) {
    return <div className="stock-not-found">IPO not found</div>;
  }

  return (
    <div className="stock-detail-container">
      <div className="stock-detail-header">
        <img src={ipo.logo} alt={ipo.company} className="stock-detail-logo" />
        <h1 className="stock-detail-title">{ipo.company}</h1>
      </div>

      <div className="stock-detail-section">
        <h2 className="stock-section-title">IPO Details</h2>
        <div className="stock-detail-grid">
          <div className="stock-detail-item">
            <strong>Issue Size:</strong> {ipo.issueSize}
          </div>
          <div className="stock-detail-item">
            <strong>Price Range:</strong> {ipo.priceRange}
          </div>
          <div className="stock-detail-item">
            <strong>Minimum Amount:</strong> {ipo.minAmount}
          </div>
          <div className="stock-detail-item">
            <strong>Lot Size:</strong> {ipo.lotSize}
          </div>
          <div className="stock-detail-item">
            <strong>Issue Dates:</strong> {ipo.issueDates}
          </div>
          <div className="stock-detail-item">
            <strong>Listed Price:</strong> {ipo.listedPrice}
          </div>
          <div className="stock-detail-item">
            <strong>Listing Gain:</strong> {ipo.listingGain}
          </div>
        </div>
      </div>

      <div className="stock-detail-section">
        <h2 className="stock-section-title">About the Company</h2>
        <p className="stock-about">{ipo.about}</p>
      </div>

      <div className="stock-detail-section">
        <h2 className="stock-section-title">Key Highlights</h2>
        <ul className="stock-highlights">
          {ipo.keyHighlights.map((highlight: string, index: number) => (
            <li key={index} className="stock-highlight-item">
              {highlight}
            </li>
          ))}
        </ul>
      </div>

      <Link to="/ipolist" className="stock-back-button">
        Back to IPO List
      </Link>
    </div>
  );
};

export default IPODetail;