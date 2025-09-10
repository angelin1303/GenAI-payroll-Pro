import React from 'react';
import { EmployeeWithPayroll, Employee } from '../types';
import { EditIcon, DeleteIcon, DownloadIcon, SortIcon, SearchIcon } from './icons';
import { exportToCsv } from '../utils/export';

type SortableKeys = 'name' | 'role' | 'grossPay' | 'netPay';

interface EmployeeTableProps {
  employeesWithPayroll: EmployeeWithPayroll[];
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
  departments: string[];
  selectedDepartment: string;
  onDepartmentChange: (department: string) => void;
  sortConfig: { key: SortableKeys; direction: 'ascending' | 'descending' } | null;
  onSort: (key: SortableKeys) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading: boolean;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ 
  employeesWithPayroll, 
  onEdit, 
  onDelete,
  departments,
  selectedDepartment,
  onDepartmentChange,
  sortConfig,
  onSort,
  searchQuery,
  onSearchChange,
  isLoading,
 }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const handleExport = () => {
    exportToCsv('payroll_export.csv', employeesWithPayroll);
  };

  const getEmptyStateMessage = () => {
    if (searchQuery) {
        return `No employees found matching "${searchQuery}".`;
    }
    if (selectedDepartment !== 'All') {
        return `No employees found in the ${selectedDepartment} department.`;
    }
    return "No employees found. Add one to get started!";
  };

  const SortableHeader: React.FC<{ columnKey: SortableKeys; title: string }> = ({ columnKey, title }) => (
    <th scope="col" className="px-6 py-3">
        <button onClick={() => onSort(columnKey)} className="flex items-center space-x-1 group">
            <span>{title}</span>
            <SortIcon
                direction={sortConfig?.key === columnKey ? sortConfig.direction : null}
            />
        </button>
    </th>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
       <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold text-brand-dark flex-shrink-0">Employee Payroll Details</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
                 <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <SearchIcon />
                </span>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="p-2 pl-10 border rounded-md bg-white w-full focus:ring-brand-primary focus:border-brand-primary"
                />
            </div>
            <select
                value={selectedDepartment}
                onChange={(e) => onDepartmentChange(e.target.value)}
                className="p-2 border rounded-md bg-white w-full sm:w-auto focus:ring-brand-primary focus:border-brand-primary"
            >
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 bg-brand-secondary text-white font-semibold px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
              disabled={employeesWithPayroll.length === 0 || isLoading}
            >
              <DownloadIcon />
              <span className="hidden sm:inline">Download CSV</span>
            </button>
        </div>
       </div>
       <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
                <SortableHeader columnKey="name" title="Name" />
                <th scope="col" className="px-6 py-3">Department</th>
                <SortableHeader columnKey="role" title="Role" />
                <SortableHeader columnKey="grossPay" title="Gross Pay" />
                <th scope="col" className="px-6 py-3">Deductions</th>
                <SortableHeader columnKey="netPay" title="Net Pay" />
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
            </tr>
            </thead>
            <tbody>
            {isLoading ? (
                <tr>
                    <td colSpan={7} className="text-center py-16">
                        <div className="flex justify-center items-center text-gray-500">
                            <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-brand-primary"></div>
                            <span className="ml-4">Recalculating Payroll...</span>
                        </div>
                    </td>
                </tr>
            ) : employeesWithPayroll.length > 0 ? (
                employeesWithPayroll.map((emp) => (
                <tr key={emp.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{emp.name}</td>
                    <td className="px-6 py-4">{emp.department}</td>
                    <td className="px-6 py-4">{emp.role}</td>
                    <td className="px-6 py-4 text-green-600">{formatCurrency(emp.grossPay)}</td>
                    <td className="px-6 py-4 text-red-600">{formatCurrency(emp.taxes + emp.insurance + emp.pf + emp.esic)}</td>
                    <td className="px-6 py-4 font-bold text-brand-dark">{formatCurrency(emp.netPay)}</td>
                    <td className="px-6 py-4 flex justify-center items-center space-x-2">
                        <button onClick={() => onEdit(emp)} className="text-brand-primary hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-100 transition-colors">
                            <EditIcon />
                        </button>
                        <button onClick={() => onDelete(emp.id)} className="text-brand-accent hover:text-pink-800 p-2 rounded-full hover:bg-pink-100 transition-colors">
                            <DeleteIcon />
                        </button>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                        {getEmptyStateMessage()}
                    </td>
                </tr>
            )}
            </tbody>
        </table>
       </div>
    </div>
  );
};

export default EmployeeTable;