import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { EmployeeWithPayroll } from '../types';

interface DepartmentPayChartProps {
  employeesWithPayroll: EmployeeWithPayroll[];
  isLoading: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const DepartmentPayChart: React.FC<DepartmentPayChartProps> = ({ employeesWithPayroll, isLoading }) => {
  const chartData = employeesWithPayroll.reduce((acc, emp) => {
    const department = emp.department;
    if (!acc[department]) {
      acc[department] = { name: department, 'Total Net Pay': 0 };
    }
    acc[department]['Total Net Pay'] += emp.netPay;
    return acc;
  }, {} as Record<string, { name: string; 'Total Net Pay': number }>);

  const data = Object.values(chartData);

  return (
    <div style={{ width: '100%', height: 400, position: 'relative' }}>
        {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10 rounded-lg">
                <div className="flex items-center text-gray-500">
                    <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-brand-primary"></div>
                    <span className="ml-4">Loading Chart Data...</span>
                </div>
            </div>
        )}
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="Total Net Pay" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default DepartmentPayChart;