import React, { useEffect, useState } from 'react';
import Navbar from '../components/NavBar';

interface CartItem {
  policy_id: string;
  policy_name: string;
  premium: string | number;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      console.log('Fetched cart items:', cart);
      const validItems = cart.filter(item => item.policy_id);
      setCartItems(validItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (policyId: string) => {
    const updated = cartItems.filter(item => item.policy_id !== policyId);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const handleCheckout = async () => {
    alert('Checkout successful!');
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>

        {loading ? (
          <div className="text-gray-600">Loading cart...</div>
        ) : cartItems.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-300 mb-6">
              {cartItems.map((item) => (
                <li key={item.policy_id} className="py-4 flex justify-between items-start">
                  <div>
                    <div className="text-lg font-semibold">{item.policy_name || 'Unnamed Policy'}</div>
                    <div className="text-gray-600">
                      Premium: ₹{item.premium || 'N/A'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.policy_id)}
                    className="text-sm text-red-500 hover:underline ml-4"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={handleCheckout}
              className="bg-violet-600 text-white px-6 py-3 rounded-md hover:bg-violet-700"
            >
              Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
