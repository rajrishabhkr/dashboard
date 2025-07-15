import React from 'react';
import { Link } from 'react-router-dom';
import './Stocks.scss';
import goairLogo from '../../../public/images/logo/goair.png';
import oyoLogo from '../../../public/images/logo/oyo.png';
import zomatoLogo from '../../../public/images/logo/zomato.png';
import bajajLogo from '../../../public/images/logo/bajaj.png';
import swiggyLogo from '../../../public/images/logo/swiggy.png';
import tataLogo from '../../../public/images/logo/tata.png';
import mahindraLogo from '../../../public/images/logo/mahindra.png';

const ipoList = [
  {
    id: 1,
    company: 'GO AIR',
    issueSize: '₹3600 Crores',
    priceRange: '₹50-60',
    minInvestment: '₹50,000',
    logo: goairLogo,
  },
  {
    id: 2,
    company: 'OYO',
    issueSize: '₹3600 Crores',
    priceRange: '₹50-60',
    minInvestment: '₹50,000',
    logo: oyoLogo,
  },
  {
    id: 3,
    company: 'ZOMATO',
    issueSize: '₹3600 Crores',
    priceRange: '₹50-60',
    minInvestment: '₹50,000',
    logo: zomatoLogo,
  },
  {
    id: 4,
    company: 'BAJAJ ENERGY',
    issueSize: '₹3600 Crores',
    priceRange: '₹50-60',
    minInvestment: '₹50,000',
    logo: bajajLogo,
  },
  {
    id: 5,
    company: 'SWIGGY',
    issueSize: '₹3600 Crores',
    priceRange: '₹50-60',
    minInvestment: '₹50,000',
    logo: swiggyLogo,
  },
  {
    id: 6,
    company: 'TATA',
    issueSize: '₹3600 Crores',
    priceRange: '₹50-60',
    minInvestment: '₹50,000',
    logo: tataLogo,
  },
  {
    id: 7,
    company: 'MAHINDRA',
    issueSize: '₹3600 Crores',
    priceRange: '₹50-60',
    minInvestment: '₹50,000',
    logo: mahindraLogo,
  },
];

const IPOList: React.FC = () => {
  const isSmallScreen = window.innerWidth < 768;

  return (
    <div className="stock-container">
      <h2 className="stock-title">IPO List</h2>

      <div className="stock-content">
        {isSmallScreen ? (
          <div className="stock-grid">
            {ipoList.map((ipo) => (
              <div key={ipo.id} className="stock-card">
                <div className="stock-card-header">
                  <img src={ipo.logo} alt={ipo.company} className="stock-logo" />
                  <h3 className="stock-company">{ipo.company}</h3>
                </div>
                <div className="stock-details">
                  <p><strong>Issue Size:</strong> {ipo.issueSize}</p>
                  <p><strong>Price Range:</strong> {ipo.priceRange}</p>
                  <p><strong>Min Investment:</strong> {ipo.minInvestment}</p>
                </div>
                <Link to={`/ipolist/details/${ipo.id}`} className="stock-link">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <table className="stock-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Issue Size</th>
                <th>Price Range</th>
                <th>Min Investment</th>
              </tr>
            </thead>
            <tbody>
              {ipoList.map((ipo) => (
                <tr key={ipo.id} className="stock-table-row">
                  <td>{ipo.id}</td>
                  <td>
                    <Link to={`/ipolist/details/${ipo.id}`} className="stock-company-link">
                      <img src={ipo.logo} alt={ipo.company} className="stock-logo" />
                      {ipo.company}
                    </Link>
                  </td>
                  <td>{ipo.issueSize}</td>
                  <td>{ipo.priceRange}</td>
                  <td>{ipo.minInvestment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default IPOList;
