import React from 'react';
import { IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight, FirstPage, LastPage } from '@mui/icons-material';

interface DataTablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  pageSizeOptions?: number[];
}

export const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  currentPage,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20],
}) => {
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(totalRecords, currentPage * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-800 text-xs text-gray-400">
      {/* Records Count Info */}
      <div className="flex items-center gap-2">
        <span>
          Showing <strong className="text-white">{startRecord}</strong> - <strong className="text-white">{endRecord}</strong> of{' '}
          <strong className="text-cyan-400">{totalRecords}</strong> entries
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-3">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="py-1 px-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        <IconButton
          size="small"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          className="text-gray-400 hover:text-white disabled:opacity-30 p-1"
          title="First page"
        >
          <FirstPage fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="text-gray-400 hover:text-white disabled:opacity-30 p-1"
          title="Previous page"
        >
          <ChevronLeft fontSize="small" />
        </IconButton>

        <div className="flex items-center gap-1 px-1">
          <span className="font-semibold text-white px-2 py-0.5 rounded-lg bg-gray-800 border border-gray-700">
            {currentPage} / {totalPages}
          </span>
        </div>

        <IconButton
          size="small"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="text-gray-400 hover:text-white disabled:opacity-30 p-1"
          title="Next page"
        >
          <ChevronRight fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="text-gray-400 hover:text-white disabled:opacity-30 p-1"
          title="Last page"
        >
          <LastPage fontSize="small" />
        </IconButton>
      </div>
    </div>
  );
};

export default DataTablePagination;
