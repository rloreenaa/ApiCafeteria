import { loadStripe } from '@stripe/stripe-js';

let stripePromise = null;

export const getStripe = (publishableKey) => {
  if (!stripePromise && publishableKey) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};
