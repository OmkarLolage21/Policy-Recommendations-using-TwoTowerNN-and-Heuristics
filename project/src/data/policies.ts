export interface Policy {
  id: string;
  name: string;
  premium: string;
  coverage: string;
  duration: string;
  description: string;
  tags: string[];
}

export const allPolicies: Policy[] = [
  {
    id: 'p1',
    name: 'Smart Platina Supreme',
    premium: '₹30,000/year',
    coverage: '₹1.5 Crore',
    duration: '30 years',
    description: 'Premium life insurance plan with guaranteed returns and wealth creation',
    tags: ['Investment', 'Life Cover', 'Returns']
  },
  {
    id: 'p2',
    name: 'Smart Wealth Builder',
    premium: '₹40,000/year',
    coverage: '₹2 Crore',
    duration: '25 years',
    description: 'Long-term wealth creation with market-linked returns',
    tags: ['ULIP', 'Wealth', 'Market-Linked']
  },
  {
    id: 'p3',
    name: 'Smart Shield Classic',
    premium: '₹15,000/year',
    coverage: '₹1 Crore',
    duration: '40 years',
    description: 'Pure term insurance for maximum protection',
    tags: ['Term', 'Protection', 'Affordable']
  },
  {
    id: 'p4',
    name: 'Smart Income Protect',
    premium: '₹25,000/year',
    coverage: '₹75 Lakhs',
    duration: '20 years',
    description: 'Regular income benefits with life coverage',
    tags: ['Income', 'Protection', 'Family']
  },
  {
    id: 'p5',
    name: 'Smart Retirement Plus',
    premium: '₹50,000/year',
    coverage: '₹1 Crore',
    duration: '35 years',
    description: 'Retirement planning with guaranteed pension',
    tags: ['Pension', 'Retirement', 'Guaranteed']
  },
  {
    id: 'p6',
    name: 'Smart Child Future',
    premium: '₹35,000/year',
    coverage: '₹80 Lakhs',
    duration: '20 years',
    description: 'Secure your child\'s education and future',
    tags: ['Child', 'Education', 'Future']
  },
  {
    id: 'p7',
    name: 'Smart Health Premier',
    premium: '₹20,000/year',
    coverage: '₹50 Lakhs',
    duration: '15 years',
    description: 'Comprehensive health coverage with life insurance',
    tags: ['Health', 'Critical Illness', 'Medical']
  },
  {
    id: 'p8',
    name: 'Smart Women Advantage',
    premium: '₹18,000/year',
    coverage: '₹70 Lakhs',
    duration: '25 years',
    description: 'Special plan designed for women with enhanced benefits',
    tags: ['Women', 'Special', 'Enhanced']
  },
  {
    id: 'p9',
    name: 'Smart Business Protect',
    premium: '₹60,000/year',
    coverage: '₹2.5 Crore',
    duration: '30 years',
    description: 'Business continuation and key person insurance',
    tags: ['Business', 'KeyPerson', 'Corporate']
  },
  {
    id: 'p10',
    name: 'Smart Senior Care',
    premium: '₹45,000/year',
    coverage: '₹40 Lakhs',
    duration: '15 years',
    description: 'Specialized coverage for senior citizens with health benefits',
    tags: ['Senior', 'Health', 'Specialized']
  }
];

// Policy recommendations based on customer profiles
export const policies: Record<string, Policy[]> = {
  '1': [allPolicies[0], allPolicies[1], allPolicies[3]], // Family person with good income
  '2': [allPolicies[2], allPolicies[6], allPolicies[7]], // Young professional
  '3': [allPolicies[0], allPolicies[4], allPolicies[8]], // Business person
  '4': [allPolicies[5], allPolicies[3], allPolicies[6]], // Family focused
};