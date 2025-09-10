import React from 'react';
import { EmployeeWithPayroll } from '../types';

interface PayrollSummaryProps {
  employeesWithPayroll: EmployeeWithPayroll[];
}

const StatCard: React.FC<{ title: string; value: string; colorClass: string }> = ({ title, value, colorClass }) => (
    <div className={`p-4 rounded-lg shadow-md flex-1 text-white ${colorClass}`}>
        <h3 className="text-sm font-semibold uppercase text-gray-200">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
    </div>
);

const PayrollSummary: React.FC<PayrollSummaryProps> = ({ employeesWithPayroll }) => {
  const totals = employeesWithPayroll.reduce(
    (acc, emp) => {
      acc.grossPay += emp.grossPay;
      acc.deductions += emp.taxes + emp.insurance + emp.pf + emp.esic;
      acc.netPay += emp.netPay;
      return acc;
    },
    { grossPay: 0, deductions: 0, netPay: 0 }
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-brand-dark mb-4">Payroll Run Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Gross Pay" value={formatCurrency(totals.grossPay)} colorClass="bg-brand-primary" />
        <StatCard title="Total Deductions" value={formatCurrency(totals.deductions)} colorClass="bg-brand-accent" />
        <StatCard title="Total Net Pay" value={formatCurrency(totals.netPay)} colorClass="bg-brand-secondary" />
      </div>
    </div>
  );
};

export default PayrollSummary;