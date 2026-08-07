import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Stocks.scss';
import initialIpoData from '../../store/ipoData.json';
import { useToast } from '../../components/layout/ToastContext';

import goairLogo from '../../../public/images/logo/goair.png';
import oyoLogo from '../../../public/images/logo/oyo.png';
import zomatoLogo from '../../../public/images/logo/zomato.png';
import bajajLogo from '../../../public/images/logo/bajaj.png';
import swiggyLogo from '../../../public/images/logo/swiggy.png';
import tataLogo from '../../../public/images/logo/tata.png';
import mahindraLogo from '../../../public/images/logo/mahindra.png';

interface IPOItem {
  id: number;
  company: string;
  issueSize: string;
  priceRange: string;
  minInvestment: string;
  logoName?: string;
  logo?: string;
}

const logoMap: Record<string, string> = {
  'goair.png': goairLogo,
  'oyo.png': oyoLogo,
  'zomato.png': zomatoLogo,
  'bajaj.png': bajajLogo,
  'swiggy.png': swiggyLogo,
  'tata.png': tataLogo,
  'mahindra.png': mahindraLogo,
};

const STORAGE_KEY = 'dashboard_ipo_data';

const IPOList: React.FC = () => {
  const { showToast } = useToast();
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const [ipoList, setIpoList] = useState<IPOItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return initialIpoData;
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [newIpo, setNewIpo] = useState({
    company: '',
    issueSize: '',
    priceRange: '',
    minInvestment: ''
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ipoList));
  }, [ipoList]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getLogo = (item: IPOItem) => {
    if (item.logoName && logoMap[item.logoName]) {
      return logoMap[item.logoName];
    }
    return item.logo || tataLogo;
  };

  const handleAddIpo = () => {
    if (!newIpo.company.trim()) return;
    const newId = ipoList.length ? Math.max(...ipoList.map(i => i.id)) + 1 : 1;
    const companyName = newIpo.company.trim().toUpperCase();
    setIpoList([
      ...ipoList,
      {
        id: newId,
        company: companyName,
        issueSize: newIpo.issueSize.trim() || '₹1000 Crores',
        priceRange: newIpo.priceRange.trim() || '₹100-120',
        minInvestment: newIpo.minInvestment.trim() || '₹15,000',
        logoName: 'tata.png'
      }
    ]);
    showToast(`Added new IPO stock: ${companyName}`, 'success');
    setNewIpo({ company: '', issueSize: '', priceRange: '', minInvestment: '' });
    setOpenDialog(false);
  };

  const handleDeleteIpo = (id: number) => {
    if (window.confirm('Are you sure you want to remove this IPO stock?')) {
      const targetCompany = ipoList.find(i => i.id === id)?.company || 'Stock';
      setIpoList(ipoList.filter(item => item.id !== id));
      showToast(`Removed IPO stock: ${targetCompany}`, 'warning');
    }
  };

  return (
    <div className="stock-container">
      <div className="ipo-header-bar">
        <h2 className="stock-title">IPO List</h2>
        <button className="stock-add-button" onClick={() => setOpenDialog(true)}>
          <i className="fas fa-plus"></i> Add New IPO Stock
        </button>
      </div>

      <div className="stock-content">
        {isSmallScreen ? (
          <div className="stock-grid">
            {ipoList.map((ipo) => (
              <div key={ipo.id} className="stock-card">
                <div className="stock-card-header">
                  <img src={getLogo(ipo)} alt={ipo.company} className="stock-logo" />
                  <h3 className="stock-company">{ipo.company}</h3>
                </div>
                <div className="stock-details">
                  <p><strong>Issue Size:</strong> {ipo.issueSize}</p>
                  <p><strong>Price Range:</strong> {ipo.priceRange}</p>
                  <p><strong>Min Investment:</strong> {ipo.minInvestment}</p>
                </div>
                <div className="stock-card-actions">
                  <Link to={`/ipolist/details/${ipo.id}`} className="stock-link">
                    View Details
                  </Link>
                  <button onClick={() => handleDeleteIpo(ipo.id)} className="school-delete-button">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="stock-table-container">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Company</th>
                  <th>Issue Size</th>
                  <th>Price Range</th>
                  <th>Min Investment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ipoList.map((ipo) => (
                  <tr key={ipo.id} className="stock-table-row">
                    <td>#{ipo.id}</td>
                    <td>
                      <Link to={`/ipolist/details/${ipo.id}`} className="stock-company-link">
                        <img src={getLogo(ipo)} alt={ipo.company} className="stock-logo" />
                        <span>{ipo.company}</span>
                      </Link>
                    </td>
                    <td>{ipo.issueSize}</td>
                    <td>{ipo.priceRange}</td>
                    <td>{ipo.minInvestment}</td>
                    <td>
                      <button onClick={() => handleDeleteIpo(ipo.id)} className="school-delete-button">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add IPO Modal */}
      {openDialog && (
        <div className="school-dialog">
          <div className="school-dialog-content">
            <h2>Add New IPO Stock</h2>
            <input
              type="text"
              placeholder="Company Name (e.g. RELIANCE)"
              value={newIpo.company}
              onChange={(e) => setNewIpo({ ...newIpo, company: e.target.value })}
            />
            <input
              type="text"
              placeholder="Issue Size (e.g. ₹2500 Crores)"
              value={newIpo.issueSize}
              onChange={(e) => setNewIpo({ ...newIpo, issueSize: e.target.value })}
            />
            <input
              type="text"
              placeholder="Price Range (e.g. ₹100-120)"
              value={newIpo.priceRange}
              onChange={(e) => setNewIpo({ ...newIpo, priceRange: e.target.value })}
            />
            <input
              type="text"
              placeholder="Minimum Investment (e.g. ₹15,000)"
              value={newIpo.minInvestment}
              onChange={(e) => setNewIpo({ ...newIpo, minInvestment: e.target.value })}
            />
            <div className="school-dialog-actions">
              <button onClick={() => setOpenDialog(false)} className="btn-cancel">Cancel</button>
              <button onClick={handleAddIpo} className="btn-save">Add Stock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPOList;
