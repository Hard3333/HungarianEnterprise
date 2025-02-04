export const hu = {
  // Auth
  login: "Bejelentkezés",
  register: "Regisztráció",
  username: "Felhasználónév",
  password: "Jelszó",
  logout: "Kijelentkezés",
  
  // Navigation
  dashboard: "Irányítópult",
  inventory: "Készlet",
  orders: "Rendelések",
  contacts: "Kapcsolatok",

  // Products
  products: "Termékek",
  addProduct: "Termék hozzáadása",
  editProduct: "Termék szerkesztése",
  deleteProduct: "Termék törlése",
  productName: "Termék neve",
  sku: "Cikkszám",
  price: "Ár",
  stockLevel: "Készletszint",
  minStockLevel: "Minimum készletszint",
  unit: "Egység",

  // Contacts
  addContact: "Kapcsolat hozzáadása",
  editContact: "Kapcsolat szerkesztése",
  deleteContact: "Kapcsolat törlése",
  contactName: "Név",
  email: "E-mail",
  phone: "Telefon",
  address: "Cím",
  taxNumber: "Adószám",
  notes: "Megjegyzések",

  // Orders
  addOrder: "Rendelés létrehozása",
  editOrder: "Rendelés szerkesztése",
  deleteOrder: "Rendelés törlése",
  orderDate: "Dátum",
  status: "Státusz",
  total: "Összesen",
  invoiceNumber: "Számlaszám",

  // Validation messages
  required: "Kötelező mező",
  invalidEmail: "Érvénytelen e-mail cím",
  minLength: "Minimum {min} karakter szükséges",
  invalidNumber: "Érvénytelen szám",
  
  // Status messages
  pending: "Függőben",
  completed: "Teljesítve",
  cancelled: "Törölve",
  
  // Alerts
  confirmDelete: "Biztosan törölni szeretné?",
  success: "Sikeres művelet",
  error: "Hiba történt",

  // Units
  piece: "db",
  kg: "kg",
  liter: "l",
  meter: "m",
} as const;
