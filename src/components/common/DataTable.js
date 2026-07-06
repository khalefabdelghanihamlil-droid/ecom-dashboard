import React from 'react';
import './DataTable.css';

const DataTable = ({ columns, data, loading, emptyMessage = "Aucune donnée disponible" }) => {
  if (loading) {
    return (
      <div className="data-table-loading">
        <div className="spinner"></div>
        <span>Chargement...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="data-table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <table className="erp-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th 
                key={index} 
                style={{ width: col.width || 'auto', textAlign: col.align || 'left' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map((col, colIndex) => (
                <td 
                  key={colIndex}
                  style={{ textAlign: col.align || 'left' }}
                >
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
