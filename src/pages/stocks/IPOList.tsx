import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Stocks.scss';
import { useToast } from '../../components/layout/ToastContext';
import { db, subscribeDbChange } from '../../services/db';
import { DataTableControls, FilterOption, SortOption } from '../../components/common/DataTableControls';
import { DataTablePagination } from '../../components/common/DataTablePagination';
import { exportToCsv } from '../../utils/csvExport';

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

const FILTER_OPTIONS: FilterOption[] = [
  { label: 'Mega Issue (≥ ₹3000 Cr)', value: 'mega' },
  { label: 'Mid Issue (₹1000 - ₹2999 Cr)', value: 'mid' },
  { label: 'Standard (< ₹1000 Cr)', value: 'small' },
];

const SORT_OPTIONS: SortOption[] = [
  { label: 'Company Name', value: 'company' },
  { label: 'Issue Size', value: 'issueSize' },
  { label: 'Min Investment', value: 'minInvestment' },
  { label: 'Listing ID', value: 'id' },
];

const IPOList: React.FC = () => {
  const { showToast } = useToast();
  const [ipoList, setIpoList] = useState<IPOItem[]>([]);
  const [search, setSearch] = useState('');
  const [capFilter, setCapFilter] = useState('');
  const [sortBy, setSortBy] = useState('company');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 6 });

  // Dialog & Validation State
  const [openDialog, setOpenDialog] = useState(false);
  const [newIpo, setNewIpo] = useState({
    company: '',
    issueSize: '',
    priceRange: '',
    minInvestment: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await db.ipo.getAll();
        if (mounted) setIpoList(data);
      } catch (err) {
        console.warn('Failed to load IPOs from DB:', err);
      }
    };
    load();
    const unsubscribe = subscribeDbChange(load);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [search, capFilter, sortBy, sortOrder]);

  const getLogo = (item: IPOItem) => {
    if (item.logoName && logoMap[item.logoName]) {
      return logoMap[item.logoName];
    }
    return item.logo || tataLogo;
  };

  const validateIpoForm = (data: typeof newIpo) => {
    const errors: Record<string, string> = {};
    if (!data.company.trim()) {
      errors.company = 'Company name is required';
    } else if (data.company.trim().length < 2) {
      errors.company = 'Company name must be at least 2 characters';
    }

    if (!data.issueSize.trim()) {
      errors.issueSize = 'Issue size is required (e.g. ₹2000 Crores)';
    }

    if (!data.priceRange.trim()) {
      errors.priceRange = 'Price range is required (e.g. ₹100-120)';
    }

    if (!data.minInvestment.trim()) {
      errors.minInvestment = 'Minimum investment is required (e.g. ₹15,000)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddIpo = async () => {
    if (!validateIpoForm(newIpo)) return;
    const companyName = newIpo.company.trim().toUpperCase();
    const created = await db.ipo.add({
      company: companyName,
      issueSize: newIpo.issueSize.trim(),
      priceRange: newIpo.priceRange.trim(),
      minInvestment: newIpo.minInvestment.trim(),
      logoName: 'tata.png'
    });
    setIpoList(prev => [...prev.filter(i => i.id !== created.id), created]);
    showToast(`Added new IPO stock: ${companyName}`, 'success');
    setNewIpo({ company: '', issueSize: '', priceRange: '', minInvestment: '' });
    setFormErrors({});
    setOpenDialog(false);
  };

  const handleDeleteIpo = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this IPO stock?')) {
      const targetCompany = ipoList.find(i => i.id === id)?.company || 'Stock';
      await db.ipo.delete(id);
      setIpoList(prev => prev.filter(item => item.id !== id));
      showToast(`Removed IPO stock: ${targetCompany}`, 'warning');
    }
  };

  const handleExportCsv = () => {
    if (filteredAndSortedIpos.length === 0) {
      showToast('No IPO records to export', 'warning');
      return;
    }
    exportToCsv('ipo_stocks_directory', filteredAndSortedIpos, ['id', 'company', 'issueSize', 'priceRange', 'minInvestment']);
    showToast('Exported IPO directory to CSV! 📊', 'success');
  };

  const handleHeaderSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const extractNumber = (str: string) => {
    const num = parseInt(str.replace(/[^\d]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  // Filter & Sort
  const filteredAndSortedIpos = ipoList
    .filter(ipo => {
      const matchesSearch = ipo.company.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (!capFilter) return true;
      const sizeVal = extractNumber(ipo.issueSize);
      if (capFilter === 'mega') return sizeVal >= 3000;
      if (capFilter === 'mid') return sizeVal >= 1000 && sizeVal < 3000;
      if (capFilter === 'small') return sizeVal < 1000;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'company') comparison = a.company.localeCompare(b.company);
      else if (sortBy === 'issueSize') comparison = extractNumber(a.issueSize) - extractNumber(b.issueSize);
      else if (sortBy === 'minInvestment') comparison = extractNumber(a.minInvestment) - extractNumber(b.minInvestment);
      else comparison = a.id - b.id;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const paginatedIpos = filteredAndSortedIpos.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  );

  const totalIpos = ipoList.length;

  return (
    <div className="stock-container">
      <div className="school-header-section" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="school-title">IPO Market Watch & List</h1>
          <p className="school-subtitle">
            Table Info Directory: Live tracker for Initial Public Offerings, issue sizes, pricing bands, and details.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="school-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon total"><i className="fas fa-chart-line"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{totalIpos}</span>
            <span className="kpi-label">Active Listings</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon present"><i className="fas fa-coins"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">₹15K+</span>
            <span className="kpi-label">Min Investment</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon late"><i className="fas fa-layer-group"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">₹1,000 Cr+</span>
            <span className="kpi-label">Average Size</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon grade-a"><i className="fas fa-shield-alt"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">100%</span>
            <span className="kpi-label">SEBI Verified</span>
          </div>
        </div>
      </div>

      {/* Reusable Data Table Controls */}
      <DataTableControls
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search company (e.g. Zomato, Tata, Oyo)..."
        filterValue={capFilter}
        onFilterChange={setCapFilter}
        filterOptions={FILTER_OPTIONS}
        filterPlaceholder="All Issue Sizes"
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={SORT_OPTIONS}
        sortOrder={sortOrder}
        onToggleSortOrder={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddClick={() => {
          setFormErrors({});
          setOpenDialog(true);
        }}
        addLabel="Add IPO Stock"
        onExportCsv={handleExportCsv}
      />

      {/* Content Rendering: Grid vs List */}
      <div className="stock-content">
        {viewMode === 'grid' ? (
          <div className="stock-grid">
            {paginatedIpos.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <i className="fas fa-search" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
                No IPO listings found matching your search.
              </div>
            ) : (
              paginatedIpos.map((ipo) => (
                <div key={ipo.id} className="stock-card">
                  <div className="stock-card-header">
                    <img src={getLogo(ipo)} alt={ipo.company} className="stock-logo" />
                    <div>
                      <h3 className="stock-company">{ipo.company}</h3>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: #{ipo.id}</span>
                    </div>
                  </div>
                  <div className="stock-details">
                    <p><strong>Issue Size:</strong> {ipo.issueSize}</p>
                    <p><strong>Price Range:</strong> {ipo.priceRange}</p>
                    <p><strong>Min Investment:</strong> {ipo.minInvestment}</p>
                  </div>
                  <div className="stock-card-actions">
                    <Link to={`/ipolist/details/${ipo.id}`} className="stock-link">
                      <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i> View Details
                    </Link>
                    <button 
                      onClick={() => handleDeleteIpo(ipo.id)} 
                      className="school-delete-button"
                      title="Remove stock"
                    >
                      <i className="fas fa-trash-alt"></i> Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="stock-table-container">
            <table className="stock-table">
              <thead>
                <tr>
                  <th onClick={() => handleHeaderSort('id')} style={{ cursor: 'pointer' }}>
                    ID {sortBy === 'id' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleHeaderSort('company')} style={{ cursor: 'pointer' }}>
                    Company {sortBy === 'company' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleHeaderSort('issueSize')} style={{ cursor: 'pointer' }}>
                    Issue Size {sortBy === 'issueSize' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th>Price Range</th>
                  <th onClick={() => handleHeaderSort('minInvestment')} style={{ cursor: 'pointer' }}>
                    Min Investment {sortBy === 'minInvestment' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedIpos.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      No IPO listings match your search criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedIpos.map((ipo) => (
                    <tr key={ipo.id} className="stock-table-row">
                      <td>#{ipo.id}</td>
                      <td>
                        <Link to={`/ipolist/details/${ipo.id}`} className="stock-company-link">
                          <img src={getLogo(ipo)} alt={ipo.company} className="stock-logo" />
                          <span style={{ fontWeight: 600 }}>{ipo.company}</span>
                        </Link>
                      </td>
                      <td>
                        <span style={{ color: '#38bdf8', fontWeight: 500 }}>{ipo.issueSize}</span>
                      </td>
                      <td>{ipo.priceRange}</td>
                      <td>
                        <span style={{ color: '#10b981', fontWeight: 500 }}>{ipo.minInvestment}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <Link 
                            to={`/ipolist/details/${ipo.id}`} 
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: 'rgba(56, 189, 248, 0.15)',
                              color: '#38bdf8',
                              textDecoration: 'none',
                              fontSize: '0.8rem',
                              fontWeight: 500
                            }}
                          >
                            Details
                          </Link>
                          <button 
                            onClick={() => handleDeleteIpo(ipo.id)} 
                            className="school-delete-button"
                            title="Remove Stock"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reusable Data Table Pagination */}
      <DataTablePagination
        currentPage={pagination.page}
        pageSize={pagination.pageSize}
        totalRecords={filteredAndSortedIpos.length}
        pageSizeOptions={[6, 12, 24]}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) => setPagination({ page: 1, pageSize })}
      />

      {/* Add IPO Modal with Input Validation */}
      {openDialog && (
        <div className="school-dialog">
          <div className="school-dialog-content">
            <h2>Add New IPO Stock</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '15px' }}>
              Add a new IPO offering to the market database with verified figures.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <input
                  type="text"
                  placeholder="Company Name (e.g. RELIANCE, INFOSYS)"
                  value={newIpo.company}
                  onChange={(e) => setNewIpo({ ...newIpo, company: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: formErrors.company ? '1px solid #ef4444' : '1px solid #334155',
                    background: '#0f172a',
                    color: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.company && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    {formErrors.company}
                  </span>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Issue Size (e.g. ₹2,500 Crores)"
                  value={newIpo.issueSize}
                  onChange={(e) => setNewIpo({ ...newIpo, issueSize: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: formErrors.issueSize ? '1px solid #ef4444' : '1px solid #334155',
                    background: '#0f172a',
                    color: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.issueSize && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    {formErrors.issueSize}
                  </span>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Price Range (e.g. ₹150 - ₹165)"
                  value={newIpo.priceRange}
                  onChange={(e) => setNewIpo({ ...newIpo, priceRange: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: formErrors.priceRange ? '1px solid #ef4444' : '1px solid #334155',
                    background: '#0f172a',
                    color: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.priceRange && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    {formErrors.priceRange}
                  </span>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Minimum Investment (e.g. ₹14,850)"
                  value={newIpo.minInvestment}
                  onChange={(e) => setNewIpo({ ...newIpo, minInvestment: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: formErrors.minInvestment ? '1px solid #ef4444' : '1px solid #334155',
                    background: '#0f172a',
                    color: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.minInvestment && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    {formErrors.minInvestment}
                  </span>
                )}
              </div>
            </div>

            <div className="school-dialog-actions" style={{ marginTop: '20px' }}>
              <button 
                onClick={() => setOpenDialog(false)} 
                className="btn-cancel"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddIpo} 
                className="btn-save"
              >
                <i className="fas fa-plus" style={{ marginRight: '6px' }}></i> Add Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPOList;
