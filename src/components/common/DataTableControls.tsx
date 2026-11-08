import React from 'react';
import {
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';
import {
  Search,
  Clear,
  ViewList,
  GridView,
  Add,
  FileDownload,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

export interface FilterOption {
  label: string;
  value: string;
}

export interface SortOption {
  label: string;
  value: string;
}

interface DataTableControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterPlaceholder?: string;

  sortBy?: string;
  onSortChange?: (field: string) => void;
  sortOptions?: SortOption[];
  sortOrder?: 'asc' | 'desc';
  onToggleSortOrder?: () => void;

  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;

  onAddClick: () => void;
  addLabel: string;

  onExportCsv?: () => void;
  totalCount?: number;
}

export const DataTableControls: React.FC<DataTableControlsProps> = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterValue,
  onFilterChange,
  filterOptions,
  filterPlaceholder = 'All',
  sortBy,
  onSortChange,
  sortOptions,
  sortOrder = 'asc',
  onToggleSortOrder,
  viewMode,
  onViewModeChange,
  onAddClick,
  addLabel,
  onExportCsv,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-3.5 bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl shadow-lg">
      {/* Left side: Search & Filters */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search fontSize="small" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 bg-gray-800/90 border border-gray-700/80 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-400 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-white"
              title="Clear search"
            >
              <Clear fontSize="small" style={{ fontSize: '16px' }} />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        {filterOptions && onFilterChange && (
          <div className="relative">
            <select
              value={filterValue || ''}
              onChange={(e) => onFilterChange(e.target.value)}
              className="py-2 pl-3 pr-8 bg-gray-800/90 border border-gray-700/80 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
            >
              <option value="">{filterPlaceholder}</option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-gray-800 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <i className="fas fa-chevron-down text-[10px]" />
            </div>
          </div>
        )}

        {/* Sort Dropdown */}
        {sortOptions && onSortChange && (
          <div className="flex items-center gap-1">
            <div className="relative">
              <select
                value={sortBy || ''}
                onChange={(e) => onSortChange(e.target.value)}
                className="py-2 pl-3 pr-7 bg-gray-800/90 border border-gray-700/80 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gray-800 text-white">
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <i className="fas fa-sort text-[10px]" />
              </div>
            </div>

            {onToggleSortOrder && (
              <Tooltip title={sortOrder === 'asc' ? 'Ascending (A-Z, 0-9)' : 'Descending (Z-A, 9-0)'}>
                <IconButton
                  size="small"
                  onClick={onToggleSortOrder}
                  className="bg-gray-800/90 border border-gray-700/80 text-gray-300 hover:text-white rounded-xl p-2"
                >
                  {sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                </IconButton>
              </Tooltip>
            )}
          </div>
        )}
      </div>

      {/* Right side: View Toggle, Export, Add */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* View Mode Switcher */}
        <div className="flex items-center bg-gray-800/90 p-0.5 rounded-xl border border-gray-700/80">
          <Tooltip title="Table List View">
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ViewList fontSize="small" />
            </button>
          </Tooltip>
          <Tooltip title="Grid Cards View">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <GridView fontSize="small" />
            </button>
          </Tooltip>
        </div>

        {/* Export CSV button */}
        {onExportCsv && (
          <Tooltip title="Export to CSV spreadsheet">
            <Button
              variant="outlined"
              size="small"
              onClick={onExportCsv}
              startIcon={<FileDownload fontSize="small" />}
              className="py-1.5 px-3 rounded-xl border-gray-700/80 text-gray-300 hover:text-white hover:border-gray-500 text-xs font-semibold capitalize"
            >
              Export CSV
            </Button>
          </Tooltip>
        )}

        {/* Add Button */}
        <Button
          variant="contained"
          size="small"
          onClick={onAddClick}
          startIcon={<Add fontSize="small" />}
          className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 capitalize"
        >
          {addLabel}
        </Button>
      </div>
    </div>
  );
};

export default DataTableControls;
