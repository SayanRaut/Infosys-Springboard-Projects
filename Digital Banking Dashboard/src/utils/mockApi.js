const MOCK_DELAY = 600;

const mockUser = {
  id: 1,
  name: "Alex Morgan",
  email: "alex@example.com",
  phone: "+1 (555) 123-4567",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  settings: { emailAuth: true, smsAuth: false, notifications: true }
};

const mockAccounts = [
  { id: 1, type: "Checking", number: "**** 4582", balance: 24500.50, color: "from-blue-600 via-blue-500 to-cyan-400" },
  { id: 2, type: "Savings", number: "**** 9921", balance: 120500.00, color: "from-violet-600 via-purple-500 to-fuchsia-400" },
];

const mockCards = [
  { id: 1, type: "Visa Infinite", number: "4532 1120 9923 4582", expiry: "12/26", holder: "ALEX MORGAN", status: "active", theme: "bg-slate-900" },
  { id: 2, type: "Mastercard Gold", number: "5412 7512 3412 3456", expiry: "09/25", holder: "ALEX MORGAN", status: "locked", theme: "bg-gradient-to-r from-rose-500 to-orange-500" }
];

const mockTransactions = [
  { id: 1, title: "Netflix Subscription", date: "2023-10-24", amount: -15.99, type: "expense", category: "Entertainment" },
  { id: 2, title: "Freelance Payment", date: "2023-10-23", amount: 1250.00, type: "income", category: "Work" },
  { id: 3, title: "Grocery Store", date: "2023-10-22", amount: -142.50, type: "expense", category: "Food" },
  { id: 4, title: "Electric Bill", date: "2023-10-20", amount: -95.20, type: "expense", category: "Utilities" },
  { id: 5, title: "Transfer from Savings", date: "2023-10-18", amount: 500.00, type: "income", category: "Transfer" },
];

export const api = {
  login: (email, password) => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === "demo@bank.com" && password === "password") {
        resolve({ token: "fake-jwt-token", user: mockUser });
      } else {
        reject(new Error("Invalid credentials. Try demo@bank.com / password"));
      }
    }, MOCK_DELAY);
  }),
  signup: (data) => new Promise((resolve) => {
    setTimeout(() => resolve({ token: "fake-jwt", user: { ...mockUser, name: data.name } }), MOCK_DELAY);
  }),
  fetchDashboardData: () => new Promise((resolve) => {
    setTimeout(() => resolve({ accounts: mockAccounts, transactions: mockTransactions }), MOCK_DELAY);
  }),
  fetchCards: () => new Promise((resolve) => {
    setTimeout(() => resolve(mockCards), MOCK_DELAY);
  }),
  updateProfile: (data) => new Promise((resolve) => {
    setTimeout(() => resolve({ status: "success", user: { ...mockUser, ...data } }), MOCK_DELAY);
  }),
  transferMoney: (amount) => new Promise((resolve) => {
    setTimeout(() => resolve({ status: "success", message: `Successfully transferred $${amount}` }), MOCK_DELAY);
  })
};