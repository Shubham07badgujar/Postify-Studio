import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import {
  CreditCardIcon,
  ShieldCheckIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { paymentAPI } from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ clientSecret, amount, description }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (error) {
      setError(error.message);
      toast.error(error.message);
    } else {
      setSucceeded(true);
      toast.success('Payment successful!');
      
      // Confirm payment on backend
      try {
        await paymentAPI.confirmPayment({
          paymentIntentId: paymentIntent.id,
        });
      } catch (err) {
        console.error('Error confirming payment:', err);
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }

    setLoading(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  if (succeeded) {
    return (
      <div className="text-center py-12">
        <ShieldCheckIcon className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          Payment Successful!
        </h2>
        <p className="mt-2 text-gray-600">
          Thank you for your payment. You will be redirected to your dashboard.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="p-4 border border-gray-300 rounded-md">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <LoadingSpinner size="small" />
        ) : (
          `Pay $${(amount / 100).toFixed(2)}`
        )}
      </button>
    </form>
  );
};

const Payment = () => {
  const { id } = useParams();
  const [paymentData, setPaymentData] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentData();
  }, [id]);

  const fetchPaymentData = async () => {
    try {
      // In a real app, you would fetch the payment/quote details
      // and create a payment intent on the backend
      const response = await paymentAPI.createPaymentIntent({
        amount: 5000, // $50.00 in cents
        currency: 'usd',
        description: 'Service Payment',
      });

      setClientSecret(response.data.clientSecret);
      setPaymentData({
        amount: 5000,
        description: 'Service Payment',
        currency: 'USD',
      });
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!paymentData || !clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Payment Not Found</h2>
          <p className="mt-2 text-gray-600">
            The payment information could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white text-center">
            <CreditCardIcon className="mx-auto h-12 w-12 mb-4" />
            <h1 className="text-2xl font-bold">Secure Payment</h1>
            <p className="mt-2 opacity-90">
              Complete your payment securely
            </p>
          </div>

          {/* Payment Details */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Service</span>
                <span className="font-medium">{paymentData.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium">
                  ${(paymentData.amount / 100).toFixed(2)} {paymentData.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="p-6">
            <Elements stripe={stripePromise}>
              <CheckoutForm
                clientSecret={clientSecret}
                amount={paymentData.amount}
                description={paymentData.description}
              />
            </Elements>
          </div>

          {/* Security Info */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-600">
              <LockClosedIcon className="h-4 w-4 mr-2" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-4 w-4 mr-1" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center">
              <CreditCardIcon className="h-4 w-4 mr-1" />
              <span>Stripe Powered</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Powered by Stripe. Your payment information is processed securely.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
