import React from 'react';
import { useSelector } from 'react-redux';

const Price = ({ amount, className = "" }) => {
  const { currency, exchangeRate } = useSelector((state) => state.currency);

  const formattedPrice = currency === 'INR' 
    ? (amount * exchangeRate).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
    : amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return <span className={className}>{formattedPrice}</span>;
};

export default Price;
