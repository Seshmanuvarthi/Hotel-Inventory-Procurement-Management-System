import React from 'react';

const StyledTable = ({ headers, data, className = '', onRowClick }) => {
  return (
    <div className={`bg-card rounded-xl shadow-luxury overflow-hidden border border-secondary/10 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary/10">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider border-b border-secondary/20"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/10">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-6 py-8 text-center text-text-dark/60"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`
                    transition-all duration-200
                    ${rowIndex % 2 === 0 ? 'bg-card' : 'bg-secondary/5'}
                    hover:bg-secondary/10 hover:shadow-sm
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                  onClick={() => onRowClick && onRowClick(row, rowIndex)}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-text-dark"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StyledTable;
