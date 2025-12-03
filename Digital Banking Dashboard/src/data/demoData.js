// src/data/demoData.js

export const DEMO_USER = {
  name: "Alex Johnson",
  email: "alex.johnson@novabank.com",
  tier: "Premium",
};

export const DEMO_ACCOUNTS = [
  {
    id: 1,
    name: "Main Checking",
    number: "**** 4582",
    type: "Checking",
    balance: 12450.32,
    currency: "USD",
  },
  {
    id: 2,
    name: "High-Yield Savings",
    number: "**** 9921",
    type: "Savings",
    balance: 40250.75,
    currency: "USD",
  },
  {
    id: 3,
    name: "Travel Wallet",
    number: "**** 7740",
    type: "Multi-currency",
    balance: 2320.1,
    currency: "EUR",
  },
];

export const DEMO_CARDS = [
  {
    id: 1,
    label: "Nova Infinite",
    number: "**** **** **** 3210",
    holder: "ALEX JOHNSON",
    expiry: "12/27",
    type: "Credit",
    limit: 10000,
    used: 3450,
    gradient: "from-sky-500 via-indigo-500 to-cyan-400",
  },
  {
    id: 2,
    label: "Everyday Debit",
    number: "**** **** **** 8744",
    holder: "ALEX JOHNSON",
    expiry: "04/26",
    type: "Debit",
    limit: 6000,
    used: 1250,
    gradient: "from-emerald-500 via-teal-500 to-lime-400",
  },
];

export const DEMO_TX = [
  {
    id: 1,
    name: "Salary",
    category: "Income • Company Ltd.",
    amount: 3500,
    type: "income",
    date: "Today • 09:32",
  },
  {
    id: 2,
    name: "Apple Store",
    category: "Shopping • Electronics",
    amount: 289.99,
    type: "expense",
    date: "Today • 08:10",
  },
  {
    id: 3,
    name: "Netflix",
    category: "Subscription",
    amount: 15.99,
    type: "expense",
    date: "Yesterday • 21:04",
  },
  {
    id: 4,
    name: "Coffee House",
    category: "Food & Drinks",
    amount: 4.5,
    type: "expense",
    date: "Yesterday • 10:18",
  },
];

export const DEMO_RECIPIENTS = [
  { id: 1, name: "Chris Lee", bank: "Chase", initials: "CL" },
  { id: 2, name: "Sarah Parker", bank: "NovaBank", initials: "SP" },
  { id: 3, name: "Design Studio", bank: "Stripe", initials: "DS" },
];
