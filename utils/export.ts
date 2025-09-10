import { EmployeeWithPayroll } from '../types';

export const exportToCsv = (filename: string, data: EmployeeWithPayroll[]): void => {
  if (data.length === 0) {
    // This case is handled by disabling the button, but it's good practice to have a check.
    return;
  }

  const headers = [
    'ID',
    'Name',
    'Department',
    'Role',
    'Annual Salary (INR)',
    'Hours Worked',
    'Overtime Hours',
    'Gross Pay (INR)',
    'Taxes (INR)',
    'Insurance (INR)',
    'PF (INR)',
    'ESIC (INR)',
    'Net Pay (INR)',
  ];

  const rows = data.map(emp => [
    emp.id,
    `"${emp.name.replace(/"/g, '""')}"`, // Escape quotes in names
    emp.department,
    `"${emp.role.replace(/"/g, '""')}"`, // Escape quotes in roles
    emp.salary,
    emp.hoursWorked,
    emp.overtimeHours,
    emp.grossPay.toFixed(2),
    emp.taxes.toFixed(2),
    emp.insurance.toFixed(2),
    emp.pf.toFixed(2),
    emp.esic.toFixed(2),
    emp.netPay.toFixed(2),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};