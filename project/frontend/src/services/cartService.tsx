export const addToCart = async (customerId: string, policyId: string) => {
  const response = await fetch('http://localhost:5000/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_id: customerId, policy_id: policyId })
  });

  if (!response.ok) throw new Error('Failed to add to cart');

  // --- Add to localStorage for frontend display ---
  const existing = JSON.parse(localStorage.getItem('cart') || '[]');
  const responseData = await fetch(`http://localhost:5000/search_policies?q=${policyId}`);
  const fullData = await responseData.json();
  const foundPolicy = fullData.find((p: any) => p.policy_id === policyId);

  if (foundPolicy) {
    const newItem = {
      policy_id: foundPolicy.policy_id,
      policy_name: foundPolicy.policy_name,
      premium: foundPolicy['premium_amount (INR)']
    };
    localStorage.setItem('cart', JSON.stringify([...existing, newItem]));
  }
};

  
  export const checkoutCart = async (customerId: string) => {
    try {
      const response = await fetch('http://localhost:5000/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to checkout');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  };
  
  export const getCart = async (customerId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/cart?customer_id=${customerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  };