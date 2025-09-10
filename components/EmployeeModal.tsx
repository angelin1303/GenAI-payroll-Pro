import React, { useState, useEffect } from 'react';
import { Employee } from '../types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employeeToEdit: Employee | null;
}

const initialFormState: Omit<Employee, 'id'> = {
  name: '',
  department: '',
  role: '',
  salary: 0,
  hoursWorked: 0,
  overtimeHours: 0,
};

// A more scalable list of departments
const departments = [
  "Engineering", "Sales", "Marketing", "HR", "Finance", "IT", 
  "Operations", "Customer Support", "Product Management", "Design", 
  "Quality Assurance", "Legal", "Research & Development", 
  "Administration", "Public Relations"
].sort();

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSave, employeeToEdit }) => {
  const [formState, setFormState] = useState(initialFormState);

  useEffect(() => {
    if (employeeToEdit) {
      setFormState(employeeToEdit);
    } else {
      setFormState(initialFormState);
    }
  }, [employeeToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: name === 'salary' || name === 'hoursWorked' || name === 'overtimeHours' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formState,
      id: employeeToEdit ? employeeToEdit.id : new Date().toISOString(),
    });
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 shadow-2xl w-full max-w-lg transform transition-all scale-100">
        <h2 className="text-2xl font-bold mb-6 text-brand-dark">{employeeToEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" name="name" value={formState.name} onChange={handleChange} placeholder="Full Name" className="p-2 border rounded-md" required />
            <input type="text" name="role" value={formState.role} onChange={handleChange} placeholder="Role" className="p-2 border rounded-md" required />
            <select name="department" value={formState.department} onChange={handleChange} className="p-2 border rounded-md" required>
                <option value="">Select Department</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
            <input type="number" name="salary" value={formState.salary} onChange={handleChange} placeholder="Annual Salary (INR)" className="p-2 border rounded-md" required min="0" />
            <input type="number" name="hoursWorked" value={formState.hoursWorked} onChange={handleChange} placeholder="Hours Worked" className="p-2 border rounded-md" required min="0" />
            <input type="number" name="overtimeHours" value={formState.overtimeHours} onChange={handleChange} placeholder="Overtime Hours" className="p-2 border rounded-md" required min="0" />
          </div>
          <div className="flex justify-end space-x-4 mt-8">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-indigo-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;