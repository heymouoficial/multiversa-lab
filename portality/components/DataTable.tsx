import React from 'react';

interface DataTableProps {
    title?: string;
    headers: string[];
    rows: any[][];
    icon?: React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({ title, headers, rows, icon }) => {
    return (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
            {(title || icon) && (
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 bg-white/5">
                    {icon && <div className="text-emerald-400">{icon}</div>}
                    {title && <span className="text-xs font-bold text-white uppercase tracking-wider">{title}</span>}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5">
                            {headers.map((h, i) => (
                                <th key={i} className="px-4 py-2.5 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {rows.map((row, i) => (
                            <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                                {row.map((cell, j) => (
                                    <td key={j} className="px-4 py-3 text-xs text-gray-300">
                                        {typeof cell === 'boolean' ? (cell ? '✅' : '❌') : cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
