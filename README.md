# JAICLUB Website Simulator

A premium, high-fidelity gambling and agency website simulator built with a stunning modern mobile-first glassmorphism aesthetic using HTML5, CSS3, and Vanilla JavaScript.

This simulator goes beyond standard layouts by incorporating a fully functional simulated local database, user sessions, transaction histories, check-in algorithms, promotional networks, and fully playable mini-games.

## Key Dynamic Features

- **Simulated Local Database (`js/db.js`)**: Preserves all user states, registrations, passwords, balances, and records persistently across tab closures and page reloads using browser `localStorage`.
- **Prepopulated User Account**: Includes preconfigured credentials matching your specifications:
  - **Phone / ID**: `8884406837`
  - **Password**: `ZAYN7199S`
  - Preloaded with a dashboard balance of `₹ 3.61`, `VIP1` tier level, yesterday's commission metrics of `₹ 12,450.00`, 12 direct referrals, and 45 team referrals.
- **Dynamic Session Dashboard (`account.html`)**: Adapts to active sessions. If logged in, displays personalized UID, balance, VIP tags, last login time, and a functional "Log out" button. If logged out, restricts membership areas and shows Guest widgets.
- **Deposit & Withdrawal Engine (`wallet.html`)**: Features elegant slide-up modal panels with customizable preset shortcuts, interactive destination inputs (UPI / Bank Accounts), and transaction calculations that modify your balance in real-time.
- **Referrals Network & Filters (`subordinate_data.html`)**: Dynamic statistics charts that update automatically. Includes working selectors to filter subordinates by date (e.g., Today, Yesterday, Day Before) or referral hierarchy (Direct L1 vs Team L2), and real-time UID search.
- **Activity & Reward Hub (`activity.html`)**:
  - **Attendance Check-In**: Grants daily check-in bonuses (₹5–₹15) and blocks double-claims.
  - **Gift Codes**: Redeem valid promo codes (e.g. `JAICLUB100` for ₹100, `FREE50` for ₹50, `MEGA200` for ₹200) to credit your wallet instantly.
- **Interactive Game Simulators (`index.html`)**:
  - **Wingo (1-Min Draw)**: Choose colors (Green, Violet, Red), place custom currency bets, and watch the draw ticker complete draws dynamically with multiplier win awards.
  - **Aviator (Flight Crash)**: Input a flight stake, start the plane takeoff, watch the real-time flight multiplier climb, and cash out dynamically before the plane flies away!

## Project Structure

- `index.html`: Home page containing news tickers, game lobbies, and active simulators.
- `activity.html`: Attendance hubs, gift redemption portals, and bonus summaries.
- `promotion.html`: Agency statistics dashboards and referral action links.
- `subordinate_data.html`: Interactive subordinate date logs and referral filters.
- `wallet.html`: Balance displays with deposit & withdraw slide-up forms.
- `account.html`: Member profiles, last login tracker, and dynamic logout buttons.
- `login.html`: Dual-tab (Phone / Email) registration and session verification screens.
- `css/style.css`: Unified glassmorphism style rules, custom variables, and responsive layout wraps.
- `js/db.js`: Persistence, data storage arrays, validation algorithms, and checking services.
- `js/script.js`: Dynamic page controllers, modal handlers, filters, and mini-game states.

## How to Run & Experience
1. Open [index.html](file:///d:/KAIF/jaiclub/index.html) in your browser.
2. Navigate to **Account** -> Click **Log in** (the page has your specifications pre-filled).
3. Log in to start checking out transactions, making deposits, claiming check-ins, filtering subordinates, and playing the Wingo and Aviator games!
