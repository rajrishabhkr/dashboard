/**
 * Utility to export any array of records as a clean CSV file
 */
export const exportToCsv = (filename: string, rows: Record<string, any>[], columnKeys?: string[]) => {
  if (!rows || rows.length === 0) return;

  const keys = columnKeys || Object.keys(rows[0]);
  const headerRow = keys.map(k => `"${k.toUpperCase()}"`).join(',');

  const dataRows = rows.map(row => {
    return keys.map(k => {
      const val = row[k] ?? '';
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
