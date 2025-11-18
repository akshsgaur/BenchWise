# BenchWise 💰🤖
### AI-Powered Personal Finance for the Gig Economy

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![AI](https://img.shields.io/badge/AI-OpenAI-green.svg)
![Status](https://img.shields.io/badge/status-development-orange.svg)

> **Empowering 65+ million American freelancers and gig workers with intelligent financial tools designed for variable income.**

## 🎯 Mission Statement

BenchWise bridges the financial inclusion gap for freelancers, gig workers, and independent earners who are underserved by traditional personal finance tools. Using advanced AI and behavioral economics, we provide personalized financial guidance that adapts to the unique challenges of variable income streams.

## 🚨 The Problem

In 2025, over 65 million Americans work as freelancers or gig workers, yet they face critical financial challenges:

- **Unpredictable cashflow** makes traditional budgeting tools ineffective
- **Zombie subscriptions** drain $2.9B annually from variable-income households
- **Tax complexity** for 1099 workers leads to overpayment or penalties
- **Financial illiteracy** costs gig workers an average of $1,230/year in missed opportunities
- **Limited access** to personalized financial advice (traditional advisors cost $200+/hour)
- **Banking discrimination** - 22% of gig workers are underbanked or unbanked
- **Income volatility stress** affects 78% of freelancers' mental health and financial planning ability

## 🎯 Target Audience

### Primary Users

#### **Freelancers & Gig Workers** 🚗👩‍💻
- Uber drivers, violin teachers, hair stylists, virtual assistants
- Etsy sellers, Airbnb hosts, DoorDash drivers
- Income: $25k-$100k/year with high variability
- **Pain Points**: Inconsistent cashflow, tax complexity, forgotten subscriptions

#### **Side Hustlers** 💼➕
- People mixing W2 + 1099 income
- Weekend entrepreneurs balancing day jobs with passion projects
- **Pain Points**: Managing multiple income streams, optimizing tax deductions across employment types

#### **Recent Grads & Immigrants** 🎓🌍
- Navigating U.S. financial systems with non-traditional income flows
- Building credit history while managing student loans
- **Pain Points**: Financial literacy gaps, establishing banking relationships, understanding tax obligations

#### **Underserved Financial Users** 🏦❌
- Distrust traditional banks or don't use credit heavily
- Prefer mobile-first, self-reliant financial tools
- **Pain Points**: Limited access to financial advice, predatory lending, high fees

### Secondary Users (Future Expansion)

#### **College Students** 🎓
- Future freelancers and entrepreneurs
- Learning financial literacy through simplified AI tools
- **Opportunity**: Build habits early, scale tools as income grows

#### **Young Entrepreneurs** 🚀
- Need advanced financial tools for scaling businesses
- Require CapEx/OpEx tracking, KPI monitoring, investor-ready financials
- **Higher LTV potential** with advanced feature sets

## 🚀 Our Solution

BenchWise leverages AI to provide enterprise-grade financial planning for everyone:

### Core Features

#### 🔮 **Intelligent Cashflow Forecasting & Break-Even Planning**
- Predicts income from multiple gig sources (Uber, freelancing, tutoring)
- Auto-calculates break-even point based on fixed and variable costs
- "Gigs needed to break even" calculator with personalized pacing alerts
- Future balance simulator with best-case, worst-case, and average scenarios
- **AI Example**: "Based on your Uber pattern, you need 23 more rides this month to cover rent"

#### 🧟 **Zombie Subscription Detection & Waste Prevention**
- AI-powered expense categorization and duplicate detection
- Automated trial expiration alerts and unused membership flagging
- Smart recommendations for subscription portfolio optimization
- Detects "zombie expenses" (low-frequency recurring payments)
- **AI Example**: "You have 3 streaming services but only used Netflix last month. Cancel Hulu to save $96/year?"

#### 📊 **Real-Time 1099 Tax Optimizer + Smart Write-Off Tracker**
- Automated write-off tracking with IRS compliance (Section 179, MACRS depreciation)
- Live quarterly tax estimates based on real income vs static calculators
- CapEx vs OpEx categorization for freelancers following GAAP principles
- State vs federal tax differences calculation
- Schedule C draft generation for audit resilience
- **AI Example**: "That $600 laptop can be depreciated over 3 years. Want to track it as business equipment?"

#### 🎯 **Smart Budget Benchmarks & Personalized Alerts**
- Dynamic monthly spending targets by category based on income patterns
- Contextual overspending alerts ("75% of grocery budget by day 10")
- Highlights outliers vs typical spending patterns
- Unexpected charge detection and fraud alerts
- **AI Example**: "Your grocery spending is 40% higher than similar freelancers in your area"

#### 💡 **AI Financial Advisor ("Dave Ramsey Bot")**
- Personalized advice using Claude + comprehensive financial data analysis
- "Dave Ramsey-style" coaching for financial discipline and tough love
- Educational nudges tailored to user behavior and income source
- **AI Example**: "You've got $12k in assets but negative net worth due to credit cards. Let's fix this."

#### 💰 **Deal-to-Wealth Redirection System**
- Surfaces personalized grocery and service deals based on spending patterns
- Routes deal savings automatically into investments, emergency funds, or entrepreneur support
- Community crowdfunding pool for supporting other platform users' business ventures
- **AI Example**: "You saved $47 this month on deals. Invest it or support Maria's bakery startup?"

#### 📚 **Gamified Accounting Literacy**
- Daily accounting challenges and flashcard-style learning
- Scenario-based financial education personalized to user's situation
- Visual accounting journal showing how transactions affect financial statements
- **AI Example**: "Quiz: What's the difference between accrued and prepaid expenses for your consulting business?"

#### 🏢 **Automated Bookkeeping for Entrepreneurs**
- Auto-generate Profit & Loss statements, income statements, cash flow statements
- Balance sheet creation for more advanced users
- Quarterly estimated tax summaries and threshold alerts
- **AI Example**: "You're trending toward $3,400 net income this quarter. Set aside ~$850 for taxes."

## 🏗️ Technical Architecture

### AI-First Design with MCP Integration

++++++++++++++++++++++++

### Model Context Protocol (MCP) Implementation
**System Components**:
1. User Interface → BenchWise Server
2. BenchWise Server ↔ MCP Client
3. MCP Client ↔ MCP Server
4. BenchWise Server ↔ Claude LLM
5. MCP Server ↔ External Services (Plaid, tax APIs, deal aggregators)

**Workflow Example**:
- User query: "What's my tax situation?"
- Server requests available tools from MCP server
- Server sends query + available tools to Claude
- Claude determines functions to call ("get transactions 3 months", "calculate tax deductions")
- Server executes functions via MCP
- Claude creates personalized tax analysis from returned data

**Key Technologies**:
- **OpenAI API**: Advanced AI reasoning for personalized financial advice
- **Plaid API**: Secure bank account and transaction data
- **React**: Modern, responsive web interface
- **Node.js + Express**: High-performance backend services
- **MongoDB**: Secure financial data storage
- **Azure OpenAI**: Enterprise-grade AI with secure containers

### Data Security & Privacy
- End-to-end encryption for all financial data
- SOC 2 Type II compliance pathway
- Minimal data retention policies (user-controlled)
- On-premises deployment options for enterprise clients
- Secure containers with embedded models for sensitive data
- No financial data sent to third-party AI services without explicit consent

## 📈 Market Opportunity & Competitive Analysis

### Market Size
**Total Addressable Market**: $12.3B (U.S. personal finance software market)
**Serviceable Addressable Market**: $3.1B (gig economy financial tools)
**Target Demographics**:
- 65M+ freelancers and gig workers
- 25M+ side hustlers mixing W2 + 1099 income
- 15M+ recent grads and immigrants with non-traditional income

### Competitive Landscape (2025)

| **Product** | **Focus** | **Weakness vs BenchWise** |
|-------------|-----------|---------------------------|
| **Rocket Money** | Subscription cancellation, budgeting | Strong at subscriptions but lacks income forecasting and personalized benchmarks. User experience friction with frequent re-authentication. |
| **Copilot Money** | Expense tracking with beautiful UI | Targets salaried professionals, limited for multiple fluctuating incomes |
| **YNAB** | Zero-based budgeting | Requires strict manual input and financial knowledge, not optimized for freelancers |
| **Intuit Mint** | Budgeting tool | Discontinued 2024 - market opportunity opened |
| **Monarch Money** | High-net-worth planning | Focuses on wealthy households, lacks gig-focused tools |
| **Emma, Cleo, Charlie AI** | AI finance assistants | Conversational tone but not precise with tax forecasting or benchmark planning |
| **QuickBooks Self-Employed** | Tax tracking for freelancers | Strong for Schedule C but lacks predictive cashflow and personal guidance |
| **BudgetGPT** | AI budgeting chatbot | Limited to GPT Store, no comprehensive financial integration |
| **Blizer (AI Cash App)** | College-focused fintech | P2P payments + basic budgeting, missing advanced AI insights |

**Competitive Advantage**: First AI-native platform designed specifically for variable income earners with comprehensive tax optimization and behavioral coaching.

### Y Combinator Market Validation
Summer 2025 saw numerous AI personal finance startups in Y Combinator, indicating strong investor interest and market demand. Current solutions (asking friends, Googling, expensive financial advisors) are unreliable, biased, or costly. **Opportunity**: AI-powered personalized advice at near-zero marginal cost.

## 🎓 Academic Context

This project was developed for CMU's "Special Topics: Advanced AI for Industry and Society" course, exploring how AI can address real societal challenges in financial inclusion.

### Key Research Questions
- How can AI democratize access to personalized financial planning for underserved populations?
- What are the ethical implications of AI-driven financial advice for vulnerable populations?
- How do we prevent algorithmic bias in financial AI systems serving diverse communities?
- Can AI-powered financial tools reduce economic inequality or do they risk exacerbating it?
- What regulatory frameworks are needed for AI financial advisors serving mass markets?

### Academic Contributions
- **Financial Inclusion Research**: Quantitative analysis of gig worker financial behaviors
- **AI Ethics Framework**: Guidelines for responsible AI in personal finance
- **Behavioral Economics Integration**: AI systems that nudge positive financial behaviors
- **Technology Adoption Studies**: Understanding barriers to fintech adoption in underserved communities

### Course Alignment: Advanced AI Elements
- **Personalization at Scale**: AI providing individualized advice that traditional software cannot
- **Natural Language Financial Coaching**: LLM-powered behavioral change through conversational interfaces
- **Predictive Analytics**: Income forecasting and expense pattern recognition
- **Automated Decision Support**: Tax optimization and investment recommendations
- **Ethical AI Implementation**: Bias detection and mitigation in financial algorithms

## 🛠️ Getting Started

### Prerequisites
```bash


+++++++++++++++++++++++++++

### Installation
```bash