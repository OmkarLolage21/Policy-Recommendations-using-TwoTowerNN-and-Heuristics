export interface Customer {
  id: string;
  name: string;
  age: number;
  income: string;
  familySize: number;
  maritalStatus: 'Married' | 'Single';
  occupation: string;
  city: string;
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  existingPolicies: number;
}

export const customers: Customer[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    age: 35,
    income: '15-20L',
    familySize: 4,
    maritalStatus: 'Married',
    occupation: 'Software Engineer',
    city: 'Bangalore',
    riskProfile: 'Moderate',
    existingPolicies: 2
  },
  {
    id: '2',
    name: 'Priya Patel',
    age: 28,
    income: '10-15L',
    familySize: 1,
    maritalStatus: 'Single',
    occupation: 'Marketing Manager',
    city: 'Mumbai',
    riskProfile: 'Aggressive',
    existingPolicies: 1
  },
  {
    id: '3',
    name: 'Amit Kumar',
    age: 42,
    income: '25-30L',
    familySize: 5,
    maritalStatus: 'Married',
    occupation: 'Business Owner',
    city: 'Delhi',
    riskProfile: 'Conservative',
    existingPolicies: 3
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    age: 31,
    income: '20-25L',
    familySize: 3,
    maritalStatus: 'Married',
    occupation: 'Doctor',
    city: 'Hyderabad',
    riskProfile: 'Moderate',
    existingPolicies: 2
  }
];