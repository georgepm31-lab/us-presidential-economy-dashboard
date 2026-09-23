# 🇺🇸 US Presidential Economy Dashboard

A full-stack, enterprise-grade data science application tracking the macroeconomic performance and capital market trajectories of the United States across Presidential administrations.

---

## 🚀 Live Application
Explore the live deployment hosted on Render: 
👉 [US Presidential Economy Dashboard Live](https://us-presidential-economy-dashboard.onrender.com)

---

## 🏛️ Project Overview & Architecture

The US Presidential Economy Dashboard bridges the gap between macroeconomic research and modern web development. It ingests, cleans, and models historical economic and financial data, allowing users to dynamically analyze how different political administrations correlate with core economic health indicators and equity market returns.

### Tech Stack
* **Frontend:** React, Vite, Tailwind CSS, Recharts (for dual-axis and dynamic time-series visualizations).
* **Backend:** Node.js, Express 5 (RESTful API architecture with unified static asset serving).
* **Database:** PostgreSQL hosted on **Neon**, storing structured time-series metrics.
* **Deployment & CI/CD:** Render cloud web services integrated with GitHub.

---

## 📊 Core Features

1. **Dynamic Mandate Highlighting:** Intelligent background zone mapping (`ReferenceArea` in Recharts) that visually distinguishes political parties (Democrats/Republicans) and dynamically highlights active administrative periods upon selection.
2. **Delta Effect Calculations:** Real-time analytical computation displaying how core indicators (Inflation, Unemployment, GDP Growth, and Public Debt) evolved from the exact start to the end of each presidential term.
3. **Dual-Axis Market Correlation:** Synchronized charting mapping S&P 500 equity performance against Federal Reserve interest rate adjustments (`Federal Funds Rate`).

---

## 📈 Data Sources

* **Federal Reserve Economic Data (FRED):** Real GDP growth, Unemployment Rate, Consumer Price Index (CPI), Federal Debt to GDP, and Federal Funds Rate.
* **Yahoo Finance:** Historical market pricing for the S&P 500 index.

---

## 📁 Repository Structure

```text
us-presidential-economy-dashboard/
│
├── client/                 # Frontend React application (Vite + Tailwind)
│   ├── src/
│   │   ├── components/     # UI widgets, KPIs, and Recharts layout
│   │   ├── services/       # API communication layer
│   │   └── App.jsx         # Main dashboard view controller
│   └── package.json
│
├── server.js               # Express 5 REST API & Production Static Host
├── package.json            # Backend dependencies & configuration
├── .env                    # Environment variables (Neon PostgreSQL connection)
└── us_macro_economy_etl.ipynb # Python ETL script for data extraction & ingestion
```

## 🛠️ Local Installation & Setup

### 1. Clone the repository:
```Bash
git clone [https://github.com/georgepm31-lab/us-presidential-economy-dashboard.git](https://github.com/georgepm31-lab/us-presidential-economy-dashboard.git)
cd us-presidential-economy-dashboard
```

### 2. Configure Environment Variables:
```Bash
DATABASE_URL=your_postgresql_connection_string_here
PORT=5000
```

### 3. Install Backend Dependencies:
```Bash
npm install
```

### 4. Install Frontend Dependencies & Build:
```Bash
cd client
npm install
npm run build
cd ..
```

### 5. Start the Production Server:
```Bash
node server.js
```
Open your browser and navigate to http://localhost:5000 (or 5001).

👨‍💻 Author
**Jorge Parra**

*  **Role:** Full-Stack Developer / Data Analyst

* **LinkedIn:** [Jorge Parra](https://www.linkedin.com/in/jorge-parra-67869634a/)

* **GitHub:** [georgepm31-lab](https://github.com/georgepm31-lab)

* **Data source:** Federal : Reserve Economic Data (FRED), Yahoo Finance
* 
*View the live demonstration:* 
 ```bash 
https://us-presidential-economy-dashboard.onrender.com
```

