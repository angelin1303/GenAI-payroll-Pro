// Fix: Defining necessary types for the application.
export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  salary: number; // Annual salary in INR
  hoursWorked: number; // per month
  overtimeHours: number; // per month
}

export interface PayrollData {
    id: string;
    grossPay: number; // per month
    taxes: number; // per month
    insurance: number; // per month
    pf: number; // Provident Fund, per month
    esic: number; // Employee's State Insurance, per month
    netPay: number; // per month
}

export interface EmployeeWithPayroll extends Employee, Omit<PayrollData, 'id'> {}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Types for AI Tool Calling
export interface AiToolCall {
  name: string;
  args: Record<string, any>;
}

export interface ToolExecutionSuccessResult {
  status: 'success';
  employeeName: string;
  netPay: number;
}

export interface ToolExecutionErrorResult {
  status: 'error';
  message: string;
}

export type ToolExecutionResult = ToolExecutionSuccessResult | ToolExecutionErrorResult;

export interface ToolResultMessage {
  role: 'tool';
  result: ToolExecutionResult;
}