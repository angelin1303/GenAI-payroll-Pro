// Fix: Implementing the main App component to structure the application.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Employee, EmployeeWithPayroll, PayrollData, AiToolCall, ToolExecutionResult } from './types';
import { calculatePayroll } from './services/geminiService';
import EmployeeTable from './components/EmployeeTable';
import PayrollSummary from './components/PayrollSummary';
import EmployeeModal from './components/EmployeeModal';
import AiAnalyst from './components/AiAnalyst';
import DepartmentPayChart from './components/DepartmentPayChart';
import { PlusIcon, SparklesIcon, ChartBarIcon } from './components/icons';

const initialEmployees: Employee[] = [
  // Engineering
  { id: '1', name: 'Ravi Kumar', department: 'Engineering', role: 'Senior Developer', salary: 1800000, hoursWorked: 160, overtimeHours: 10 },
  { id: '2', name: 'Sunita Singh', department: 'Engineering', role: 'DevOps Engineer', salary: 1600000, hoursWorked: 165, overtimeHours: 5 },
  // Sales
  { id: '3', name: 'Priya Sharma', department: 'Sales', role: 'Sales Manager', salary: 2200000, hoursWorked: 160, overtimeHours: 20 },
  { id: '4', name: 'Vikram Mehta', department: 'Sales', role: 'Sales Executive', salary: 900000, hoursWorked: 170, overtimeHours: 15 },
  // Marketing
  { id: '5', name: 'Amit Singh', department: 'Marketing', role: 'Digital Marketer', salary: 1200000, hoursWorked: 170, overtimeHours: 0 },
  { id: '6', name: 'Anjali Gupta', department: 'Marketing', role: 'Content Strategist', salary: 1100000, hoursWorked: 160, overtimeHours: 8 },
  // HR
  { id: '7', name: 'Neha Reddy', department: 'HR', role: 'HR Manager', salary: 1500000, hoursWorked: 160, overtimeHours: 0 },
  { id: '8', name: 'Rajesh Patel', department: 'HR', role: 'Recruiter', salary: 850000, hoursWorked: 160, overtimeHours: 12 },
  // Finance
  { id: '9', name: 'Sanjay Verma', department: 'Finance', role: 'Financial Analyst', salary: 1400000, hoursWorked: 160, overtimeHours: 5 },
  { id: '10', name: 'Pooja Desai', department: 'Finance', role: 'Accountant', salary: 1000000, hoursWorked: 168, overtimeHours: 0 },
  // IT
  { id: '11', name: 'Deepak Joshi', department: 'IT', role: 'System Administrator', salary: 1300000, hoursWorked: 160, overtimeHours: 18 },
  { id: '12', name: 'Meera Iyer', department: 'IT', role: 'IT Support Specialist', salary: 750000, hoursWorked: 175, overtimeHours: 10 },
  // Operations
  { id: '13', name: 'Arun Nair', department: 'Operations', role: 'Operations Manager', salary: 1900000, hoursWorked: 160, overtimeHours: 0 },
  { id: '14', name: 'Kavita Rao', department: 'Operations', role: 'Logistics Coordinator', salary: 800000, hoursWorked: 160, overtimeHours: 25 },
  // Customer Support
  { id: '15', name: 'Manoj Tiwari', department: 'Customer Support', role: 'Support Lead', salary: 950000, hoursWorked: 160, overtimeHours: 30 },
  { id: '16', name: 'Geeta Bisht', department: 'Customer Support', role: 'Support Representative', salary: 600000, hoursWorked: 180, overtimeHours: 20 },
  // Product Management
  { id: '17', name: 'Aditya Chopra', department: 'Product Management', role: 'Product Manager', salary: 2500000, hoursWorked: 160, overtimeHours: 10 },
  { id: '18', name: 'Smita Krishnan', department: 'Product Management', role: 'Associate Product Manager', salary: 1500000, hoursWorked: 160, overtimeHours: 5 },
  // Design
  { id: '19', name: 'Rohan Shetty', department: 'Design', role: 'Lead UI/UX Designer', salary: 1700000, hoursWorked: 160, overtimeHours: 0 },
  { id: '20', name: 'Isha Negi', department: 'Design', role: 'Graphic Designer', salary: 900000, hoursWorked: 165, overtimeHours: 0 },
  // Quality Assurance
  { id: '21', name: 'Vivek Anand', department: 'Quality Assurance', role: 'QA Lead', salary: 1650000, hoursWorked: 160, overtimeHours: 15 },
  { id: '22', name: 'Divya Soni', department: 'Quality Assurance', role: 'QA Tester', salary: 850000, hoursWorked: 170, overtimeHours: 10 },
  // Legal
  { id: '23', name: 'Harish Shankar', department: 'Legal', role: 'Corporate Counsel', salary: 2800000, hoursWorked: 160, overtimeHours: 0 },
  { id: '24', name: 'Tanvi Shah', department: 'Legal', role: 'Paralegal', salary: 1100000, hoursWorked: 160, overtimeHours: 0 },
  // Research & Development
  { id: '25', name: 'Alok Nath', department: 'Research & Development', role: 'Research Scientist', salary: 2000000, hoursWorked: 160, overtimeHours: 8 },
  { id: '26', name: 'Bhavna Jha', department: 'Research & Development', role: 'Lab Technician', salary: 950000, hoursWorked: 160, overtimeHours: 2 },
  // Administration
  { id: '27', name: 'Umesh Yadav', department: 'Administration', role: 'Office Manager', salary: 1050000, hoursWorked: 160, overtimeHours: 0 },
  { id: '28', name: 'Preeti Menon', department: 'Administration', role: 'Administrative Assistant', salary: 650000, hoursWorked: 160, overtimeHours: 5 },
  // Public Relations
  { id: '29', name: 'Gaurav Khanna', department: 'Public Relations', role: 'PR Manager', salary: 1750000, hoursWorked: 160, overtimeHours: 10 },
  { id: '30', name: 'Rina Dsouza', department: 'Public Relations', role: 'PR Specialist', salary: 980000, hoursWorked: 160, overtimeHours: 3 },
];

type SortableKeys = 'name' | 'role' | 'grossPay' | 'netPay';

const App: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [employeesWithPayroll, setEmployeesWithPayroll] = useState<EmployeeWithPayroll[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showChart, setShowChart] = useState(true);

  const runPayrollCalculation = useCallback(async (currentEmployees: Employee[]) => {
    if (currentEmployees.length === 0) {
      setEmployeesWithPayroll([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const payrollResults: PayrollData[] = await calculatePayroll(currentEmployees);
      const combinedData: EmployeeWithPayroll[] = currentEmployees.map(emp => {
        const payroll = payrollResults.find(p => p.id === emp.id);
        // Added a fallback for safety, though API should always return data
        return { ...emp, ...payroll! };
      });
      setEmployeesWithPayroll(combinedData);
    } catch (err) {
      setError('Failed to calculate payroll. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    runPayrollCalculation(employees);
  }, [employees, runPayrollCalculation]);

  const handleSaveEmployee = (employee: Employee) => {
    const index = employees.findIndex(e => e.id === employee.id);
    if (index > -1) {
      // Edit
      const updatedEmployees = [...employees];
      updatedEmployees[index] = employee;
      setEmployees(updatedEmployees);
    } else {
      // Add
      setEmployees(prev => [...prev, employee]);
    }
    setEmployeeToEdit(null);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };

  const handleEditEmployee = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsModalOpen(true);
  };

  const handleAddNewEmployee = () => {
    setEmployeeToEdit(null);
    setIsModalOpen(true);
  };

  const handleExecuteTool = (toolCall: AiToolCall): ToolExecutionResult => {
    if (toolCall.name === 'add_employee') {
      const { name, department, role, salary } = toolCall.args;
      if (!name || !department || !role || !salary) {
        return { status: 'error', message: 'Missing required employee details from the AI. Please try again.' };
      }

      const newEmployee: Employee = {
        id: new Date().toISOString(),
        name,
        department,
        role,
        salary: Number(salary),
        hoursWorked: 160, // Set default hours for AI-added employees
        overtimeHours: 0,  // Set default overtime for AI-added employees
      };

      setEmployees(prev => [...prev, newEmployee]);

      // Calculate net pay for immediate feedback in the chat, mirroring the AI's logic
      const monthlyBase = newEmployee.salary / 12;
      const grossPay = monthlyBase; // No overtime for initial calculation
      const pf = monthlyBase * 0.12;
      const esic = grossPay <= 21000 ? grossPay * 0.0075 : 0;
      const taxes = grossPay * 0.20;
      const insurance = 1000;
      const netPay = grossPay - taxes - insurance - pf - esic;

      return {
        status: 'success',
        employeeName: newEmployee.name,
        netPay: netPay,
      };
    }
    return { status: 'error', message: `Unknown tool "${toolCall.name}" requested by AI.` };
  };

  const departments = useMemo(() => ['All', ...new Set(employees.map(e => e.department).sort())], [employees]);

  const sortedAndFilteredEmployees = useMemo(() => {
    let processableData = [...employeesWithPayroll];

    // Filtering by department
    if (filterDepartment !== 'All') {
      processableData = processableData.filter(emp => emp.department === filterDepartment);
    }

    // Filtering by search query
    if (searchQuery.trim() !== '') {
        processableData = processableData.filter(emp => 
            emp.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Sorting
    if (sortConfig !== null) {
      processableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return processableData;
  }, [employeesWithPayroll, filterDepartment, sortConfig, searchQuery]);

  const handleSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <header className="bg-brand-primary shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-white">
            <SparklesIcon />
            <h1 className="text-2xl font-bold">GenAI Payroll Pro</h1>
          </div>
          <button
            onClick={handleAddNewEmployee}
            className="flex items-center space-x-2 bg-white text-brand-primary font-semibold px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            <PlusIcon />
            <span>Add Employee</span>
          </button>
        </nav>
      </header>

      <main className="container mx-auto p-6">
        <EmployeeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEmployee}
          employeeToEdit={employeeToEdit}
        />

        {isLoading && employeesWithPayroll.length === 0 && employees.length > 0 && !error && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-primary mx-auto"></div>
                <p className="text-lg text-gray-600 mt-4">Calculating Payroll with GenAI...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {employees.length > 0 && !error ? (
            <div className="space-y-8">
                <PayrollSummary employeesWithPayroll={employeesWithPayroll} />
                <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <EmployeeTable
                            employeesWithPayroll={sortedAndFilteredEmployees}
                            onEdit={handleEditEmployee}
                            onDelete={handleDeleteEmployee}
                            departments={departments}
                            selectedDepartment={filterDepartment}
                            onDepartmentChange={setFilterDepartment}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            isLoading={isLoading}
                        />
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-brand-dark">Net Pay Distribution by Department</h2>
                                <button
                                    onClick={() => setShowChart(!showChart)}
                                    className="flex items-center space-x-2 text-brand-primary font-semibold px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors"
                                    aria-expanded={showChart}
                                    aria-controls="department-chart-container"
                                >
                                    <ChartBarIcon />
                                    <span>{showChart ? 'Hide Chart' : 'Show Chart'}</span>
                                </button>
                            </div>
                            {showChart && (
                                <div id="department-chart-container">
                                    <DepartmentPayChart
                                        employeesWithPayroll={employeesWithPayroll}
                                        isLoading={isLoading}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                         <AiAnalyst 
                            employeesWithPayroll={employeesWithPayroll} 
                            onExecuteTool={handleExecuteTool}
                        />
                    </div>
                </div>
            </div>
        ) : (
            !isLoading && !error && (
                <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-700">No Employee Data</h2>
                    <p className="text-gray-500 mt-2">Add an employee to get started with payroll processing.</p>
                    <button
                        onClick={handleAddNewEmployee}
                        className="mt-6 flex items-center mx-auto space-x-2 bg-brand-primary text-white font-semibold px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        <PlusIcon />
                        <span>Add Your First Employee</span>
                    </button>
                </div>
            )
        )}
      </main>
    </div>
  );
};

export default App;