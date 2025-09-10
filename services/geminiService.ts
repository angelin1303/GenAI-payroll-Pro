// Fix: Implementing Gemini API services for payroll calculation and AI chat.
import { GoogleGenAI, Type } from "@google/genai";
import { Employee, PayrollData } from '../types';

// Fix: Initialize GoogleGenAI with a named apiKey parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const payrollCalculationSystemInstruction = `
You are a payroll calculation expert for an Indian company.
Given a list of employees, calculate their monthly payroll.
Assume the following:
- The provided salary is annual. Monthly base salary is annual salary / 12.
- The standard work hours per month are 160.
- Overtime is paid at 1.5 times the normal hourly rate. Hourly rate is (annual salary / 12) / 160.
- Gross Pay = Monthly base salary + Overtime pay.
- Provident Fund (PF) is 12% of the monthly base salary.
- Employee's State Insurance (ESIC) is 0.75% of the Gross Pay, but only for employees whose Gross Pay is 21,000 INR or less per month. If Gross Pay is higher, ESIC is 0.
- Taxes are calculated at 20% of the Gross Pay.
- Insurance is a flat 1000 INR per month.
- Net Pay = Gross Pay - Taxes - Insurance - PF - ESIC.
Return the result as a JSON array matching the provided schema. Do not include any other text or explanations in your response.
`;

const payrollResponseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        grossPay: { type: Type.NUMBER },
        taxes: { type: Type.NUMBER },
        insurance: { type: Type.NUMBER },
        pf: { type: Type.NUMBER },
        esic: { type: Type.NUMBER },
        netPay: { type: Type.NUMBER },
      },
      // Fix: 'required' is not a valid property in the schema, using propertyOrdering instead.
      propertyOrdering: ['id', 'grossPay', 'taxes', 'insurance', 'pf', 'esic', 'netPay'],
    },
};


export const calculatePayroll = async (employees: Employee[]): Promise<PayrollData[]> => {
    if (employees.length === 0) {
        return [];
    }
    
    try {
        // Fix: Use correct model 'gemini-2.5-flash' and structure for generateContent call.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Calculate payroll for the following employees: ${JSON.stringify(employees)}`,
            config: {
                systemInstruction: payrollCalculationSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: payrollResponseSchema,
            },
        });

        // Fix: Directly access the 'text' property for the response.
        const jsonStr = response.text.trim();
        const payrollResults: PayrollData[] = JSON.parse(jsonStr);
        return payrollResults;

    } catch (error) {
        console.error("Error calculating payroll:", error);
        throw new Error("Failed to calculate payroll using Gemini API.");
    }
};

const addEmployeeTool = {
  functionDeclarations: [
    {
      name: 'add_employee',
      description: 'Adds a new employee to the payroll system.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Full name of the employee.' },
          department: { type: Type.STRING, description: 'Department the employee works in. Must be one of: Engineering, Sales, Marketing, HR, Finance, IT, Operations, Customer Support, Product Management, Design, Quality Assurance, Legal, Research & Development, Administration, Public Relations.' },
          role: { type: Type.STRING, description: 'Job title or role of the employee.' },
          salary: { type: Type.NUMBER, description: 'Annual salary in Indian Rupees (INR).' },
        },
        required: ['name', 'department', 'role', 'salary'],
      },
    },
  ],
};

const aiAnalystSystemInstruction = `
You are an expert financial and HR analyst and assistant.
Provide brief, concise summaries and insights. Keep your entire response under 50 words.
You have a tool to add new employees: 'add_employee'.
When a user asks to add an employee, use this tool. Parse the user's message to find the required parameters: name, department, role, and salary.
After the tool is executed successfully, simply confirm the action in a friendly and concise manner (e.g., "Done. I've added them to the payroll.").
For other questions, continue in your role as an expert analyst, but keep answers brief.
`;


export const createAnalystChat = () => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        // Fix: 'systemInstruction' and 'tools' must be nested inside the 'config' object.
        config: {
            systemInstruction: aiAnalystSystemInstruction,
            tools: [addEmployeeTool],
        },
    });
};