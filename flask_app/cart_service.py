# backend/cart_service.py
import pandas as pd
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
import threading

class CartService:
    def __init__(self):
        self.carts = {}  # In-memory storage (replace with DB in production)
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.email = "notifications@sbilife.com"
        self.password = "your_password"
        
    def add_to_cart(self, customer_id, policy_id):
        if customer_id not in self.carts:
            self.carts[customer_id] = {
                'items': [],
                'last_updated': datetime.now()
            }
        
        # Get policy details
        policies = pd.read_csv('data/policies.csv')
        policy = policies[policies['policy_id'] == policy_id].iloc[0]
        
        self.carts[customer_id]['items'].append({
            'policy_id': policy_id,
            'policy_name': policy['policy_name'],
            'premium_amount': float(policy['premium_amount (INR)'].replace(',', ''))
        })
        self.carts[customer_id]['last_updated'] = datetime.now()
        
    def get_cart(self, customer_id):
        return self.carts.get(customer_id, {'items': []})
    
    def checkout(self, customer_id):
        # Process checkout
        cart = self.carts.pop(customer_id, None)
        if cart:
            # Record purchase
            self.record_purchase(customer_id, cart['items'])
            return True
        return False
    
    def record_purchase(self, customer_id, items):
        # Add to interactions.csv
        new_interactions = [{
            'customer_id': customer_id,
            'policy_id': item['policy_id'],
            'timestamp': datetime.now().isoformat(),
            'purchased': True
        } for item in items]
        
        pd.DataFrame(new_interactions).to_csv(
            'data/interactions.csv',
            mode='a',
            header=False,
            index=False
        )
    
    def check_abandoned_carts(self):
        while True:
            now = datetime.now()
            for customer_id, cart in list(self.carts.items()):
                if (now - cart['last_updated']) > timedelta(minutes=30):
                    self.send_reminder_email(customer_id, cart['items'])
                    del self.carts[customer_id]
            time.sleep(60 * 5)  # Check every 5 minutes
    
    def send_reminder_email(self, customer_id, items):
        # Get customer email
        customers = pd.read_csv('data/customers.csv')
        customer = customers[customers['customer_id'] == customer_id].iloc[0]
        
        # Prepare email
        items_list = "\n".join([f"- {item['policy_name']} (₹{item['premium_amount']})" for item in items])
        
        msg = MIMEText(f"""
        Dear {customer['name']},
        
        We noticed you didn't complete your purchase for these policies:
        
        {items_list}
        
        Complete your purchase now to secure your coverage:
        http://yourwebsite.com/cart?customer_id={customer_id}
        
        Regards,
        SBI Life Team
        """)
        
        msg['Subject'] = "Complete Your Policy Purchase"
        msg['From'] = self.email
        msg['To'] = customer['email']
        
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email, self.password)
                server.send_message(msg)
        except Exception as e:
            print(f"Failed to send email: {e}")

# Start abandoned cart monitor
cart_service = CartService()
abandoned_cart_thread = threading.Thread(target=cart_service.check_abandoned_carts)
abandoned_cart_thread.daemon = True
abandoned_cart_thread.start()