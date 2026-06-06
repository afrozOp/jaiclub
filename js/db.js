// db.js - Mock Database & Session Service for JAICLUB

(function () {
    // Initial default user to match screenshots & user credentials
    const DEFAULT_USER = {
        uid: "551345",
        phone: "8884406837",
        email: "zayn@jaiclub.com",
        password: "ZAYN7199S",
        username: "MEMBERNNGCZP28",
        vipLevel: "VIP1",
        balance: 3.61,
        regTime: "2026-05-17 17:50:41",
        lastLogin: "2026-05-25 18:42:25",
        inviteCode: "18233551345",
        yesterdayCommission: 12450.00,
        directSubordinates: 12,
        teamSubordinates: 45
    };

    // ---- Helper: generate yesterday's date string ----
    function getYesterdayStr() {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    // ---- Helper: generate a date string N days ago ----
    function daysAgoStr(n) {
        const d = new Date();
        d.setDate(d.getDate() - n);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    // ---- Seeded random for reproducible data ----
    function seededRandom(seed) {
        let s = seed;
        return function () {
            s = (s * 16807 + 0) % 2147483647;
            return (s - 1) / 2147483646;
        };
    }

    // ---- Generate mock subordinate records for ~90 days (3 months) up to yesterday ----
    function generateMockSubordinateRecords() {
        const records = {};
        const baseUid = 549000;
        let uidCounter = 0;

        // Generate data for each day from 90 days ago to yesterday (skip today)
        for (let daysBack = 1; daysBack <= 90; daysBack++) {
            const dateStr = daysAgoStr(daysBack);
            const rand = seededRandom(daysBack * 7919 + 42);

            // Random number of list entries: 25 to 30
            const numEntries = Math.floor(rand() * 6) + 25;
            const list = [];

            let totalDeposit = 0;
            let totalBet = 0;
            let firstDepositCount = 0;
            let firstDepositAmt = 0;

            for (let i = 0; i < numEntries; i++) {
                uidCounter++;
                const uid = String(baseUid + uidCounter);
                // Guarantee at least one representation for levels 1-6, then random
                const level = (i < 6) ? (i + 1) : (Math.floor(rand() * 6) + 1);
                const deposit = [500, 1000, 1500, 2000, 3000, 5000, 7500, 10000][Math.floor(rand() * 8)];
                const betMultiplier = 1.5 + rand() * 3;
                const bet = Math.round(deposit * betMultiplier);
                const isFirst = rand() > 0.7;

                const hour = Math.floor(rand() * 14) + 8; // 8 AM - 10 PM
                const minute = Math.floor(rand() * 60);
                const second = Math.floor(rand() * 60);
                const timeStr = `${dateStr} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;

                list.push({
                    uid: uid,
                    level: level,
                    time: timeStr,
                    deposit: deposit,
                    bet: bet,
                    isFirst: isFirst
                });

                totalDeposit += deposit;
                totalBet += bet;
                if (isFirst) {
                    firstDepositCount++;
                    firstDepositAmt += deposit;
                }
            }

            records[dateStr] = {
                depositNumber: numEntries,
                depositAmount: totalDeposit,
                bettorsNumber: Math.floor(numEntries * (0.6 + rand() * 0.4)),
                totalBet: totalBet,
                firstDepositPeople: firstDepositCount,
                firstDepositAmount: firstDepositAmt,
                list: list
            };
        }

        return records;
    }

    const MOCK_SUBORDINATE_RECORDS = generateMockSubordinateRecords();

    // Get DB from localStorage or initialize
    function initDatabase() {
        if (!localStorage.getItem("jaiclub_users")) {
            const users = {};
            users[DEFAULT_USER.phone] = DEFAULT_USER;
            users[DEFAULT_USER.email] = DEFAULT_USER;
            localStorage.setItem("jaiclub_users", JSON.stringify(users));
        }

        // Initialize empty transaction log if not exists
        if (!localStorage.getItem("jaiclub_transactions")) {
            const initialTransactions = [
                { id: "TX10001", amount: 3.61, type: "bonus", desc: "Welcome Bonus", time: "2026-05-17 17:50:41" }
            ];
            localStorage.setItem("jaiclub_transactions", JSON.stringify(initialTransactions));
        }

        // Initialize sign in claims tracker
        if (!localStorage.getItem("jaiclub_claims")) {
            localStorage.setItem("jaiclub_claims", JSON.stringify({}));
        }
    }

    initDatabase();

    // Export DB module to window scope
    window.JaiDB = {
        getUsers: function () {
            return JSON.parse(localStorage.getItem("jaiclub_users")) || {};
        },

        getCurrentUser: function () {
            const session = localStorage.getItem("jaiclub_session");
            if (!session) return null;
            
            // Sync with current data in users map to ensure fresh balance/stats
            const users = this.getUsers();
            return users[session] || null;
        },

        login: function (identifier, password) {
            const users = this.getUsers();
            const cleanId = identifier.trim();
            const user = users[cleanId];

            if (user && user.password === password) {
                // Update last login
                const now = new Date();
                const formattedTime = now.getFullYear() + "-" + 
                    String(now.getMonth() + 1).padStart(2, '0') + "-" + 
                    String(now.getDate()).padStart(2, '0') + " " + 
                    String(now.getHours()).padStart(2, '0') + ":" + 
                    String(now.getMinutes()).padStart(2, '0') + ":" + 
                    String(now.getSeconds()).padStart(2, '0');
                
                user.lastLogin = formattedTime;
                users[user.phone] = user;
                if (user.email) {
                    users[user.email] = user;
                }
                localStorage.setItem("jaiclub_users", JSON.stringify(users));

                // Save to session (store identifier)
                localStorage.setItem("jaiclub_session", cleanId);
                return { success: true, user: user };
            }
            return { success: false, message: "Invalid Phone/Email or Password" };
        },

        register: function (identifier, password, inviteCode = "") {
            const users = this.getUsers();
            const cleanId = identifier.trim();

            if (users[cleanId]) {
                return { success: false, message: "Account already exists" };
            }

            // Create new member profile
            const isEmail = cleanId.includes("@");
            const newUid = String(Math.floor(100000 + Math.random() * 900000));
            const phoneVal = isEmail ? "" : cleanId;
            const emailVal = isEmail ? cleanId : "";

            const newUser = {
                uid: newUid,
                phone: phoneVal,
                email: emailVal,
                password: password,
                username: "MEMBER" + newUid,
                vipLevel: "VIP1",
                balance: 0.00,
                regTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
                lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
                inviteCode: "18233" + newUid,
                yesterdayCommission: 0.00,
                directSubordinates: 0,
                teamSubordinates: 0
            };

            users[cleanId] = newUser;
            localStorage.setItem("jaiclub_users", JSON.stringify(users));

            // Log Transaction
            this.addTransaction(newUser.uid, 0.00, "bonus", "Registration Bonus Setup", newUser.regTime);

            // Log session automatically
            localStorage.setItem("jaiclub_session", cleanId);
            return { success: true, user: newUser };
        },

        logout: function () {
            localStorage.removeItem("jaiclub_session");
            return true;
        },

        updateBalance: function (amount, type, description) {
            const user = this.getCurrentUser();
            if (!user) return { success: false, message: "No active session" };

            const users = this.getUsers();
            const prevBalance = parseFloat(user.balance);
            const newBalance = Math.round((prevBalance + parseFloat(amount)) * 100) / 100;

            if (newBalance < 0) {
                return { success: false, message: "Insufficient Balance" };
            }

            user.balance = newBalance;
            users[user.phone || user.email] = user;
            
            // Sync both lookup keys
            if (user.phone) users[user.phone] = user;
            if (user.email) users[user.email] = user;
            
            localStorage.setItem("jaiclub_users", JSON.stringify(users));

            // Log Transaction
            const now = new Date();
            const formattedTime = now.getFullYear() + "-" + 
                String(now.getMonth() + 1).padStart(2, '0') + "-" + 
                String(now.getDate()).padStart(2, '0') + " " + 
                String(now.getHours()).padStart(2, '0') + ":" + 
                String(now.getMinutes()).padStart(2, '0') + ":" + 
                String(now.getSeconds()).padStart(2, '0');

            this.addTransaction(user.uid, amount, type, description, formattedTime);
            return { success: true, balance: newBalance };
        },

        setBalance: function (newBalance) {
            const user = this.getCurrentUser();
            if (!user) return { success: false, message: "No active session" };

            const users = this.getUsers();
            const roundedVal = Math.round(parseFloat(newBalance) * 100) / 100;
            if (isNaN(roundedVal) || roundedVal < 0) {
                return { success: false, message: "Invalid balance value" };
            }

            const difference = roundedVal - parseFloat(user.balance);

            user.balance = roundedVal;
            users[user.phone || user.email] = user;
            if (user.phone) users[user.phone] = user;
            if (user.email) users[user.email] = user;
            localStorage.setItem("jaiclub_users", JSON.stringify(users));

            // Log Transaction
            const now = new Date();
            const formattedTime = now.getFullYear() + "-" + 
                String(now.getMonth() + 1).padStart(2, '0') + "-" + 
                String(now.getDate()).padStart(2, '0') + " " + 
                String(now.getHours()).padStart(2, '0') + ":" + 
                String(now.getMinutes()).padStart(2, '0') + ":" + 
                String(now.getSeconds()).padStart(2, '0');

            this.addTransaction(user.uid, difference, "bonus", "Admin Balance Set", formattedTime);
            return { success: true, balance: roundedVal };
        },

        addTransaction: function (uid, amount, type, desc, time) {
            const txs = JSON.parse(localStorage.getItem("jaiclub_transactions")) || [];
            const txId = "TX" + Math.floor(10000 + Math.random() * 90000);
            txs.unshift({ id: txId, uid: uid, amount: amount, type: type, desc: desc, time: time });
            localStorage.setItem("jaiclub_transactions", JSON.stringify(txs));
        },

        getTransactions: function () {
            const user = this.getCurrentUser();
            if (!user) return [];
            const txs = JSON.parse(localStorage.getItem("jaiclub_transactions")) || [];
            return txs.filter(t => t.uid === user.uid || !t.uid); // return user transactions + global system ones
        },

        getSubordinateData: function (dateStr) {
            // Standardize date input or use yesterday as default if not matched
            if (MOCK_SUBORDINATE_RECORDS[dateStr]) {
                return MOCK_SUBORDINATE_RECORDS[dateStr];
            }
            // Return dummy zero values if date doesn't exist
            return {
                depositNumber: 0,
                depositAmount: 0,
                bettorsNumber: 0,
                totalBet: 0,
                firstDepositPeople: 0,
                firstDepositAmount: 0,
                list: []
            };
        },

        claimDailySignIn: function () {
            const user = this.getCurrentUser();
            if (!user) return { success: false, message: "Please log in first" };

            const claims = JSON.parse(localStorage.getItem("jaiclub_claims")) || {};
            const today = new Date().toISOString().split('T')[0];
            const claimKey = user.uid + "_" + today;

            if (claims[claimKey]) {
                return { success: false, message: "You have already claimed today's attendance bonus!" };
            }

            // Reward random small bonus between 5 and 15 rupees
            const rewardAmount = Math.floor(5 + Math.random() * 11);
            const res = this.updateBalance(rewardAmount, "bonus", "Daily Sign-In Bonus");
            if (res.success) {
                claims[claimKey] = true;
                localStorage.setItem("jaiclub_claims", JSON.stringify(claims));
                return { success: true, amount: rewardAmount, message: `Successfully claimed ₹${rewardAmount} sign-in bonus!` };
            }
            return { success: false, message: "Bonus claim failed. Try again." };
        },

        checkDailyClaimed: function () {
            const user = this.getCurrentUser();
            if (!user) return false;
            const claims = JSON.parse(localStorage.getItem("jaiclub_claims")) || {};
            const today = new Date().toISOString().split('T')[0];
            return !!claims[user.uid + "_" + today];
        },

        redeemGiftCode: function (code) {
            const cleanCode = code.trim().toUpperCase();
            const validCodes = {
                "JAICLUB100": 100,
                "FREE50": 50,
                "MEGA200": 200,
                "BONUS10": 10
            };

            if (!validCodes[cleanCode]) {
                return { success: false, message: "Invalid promo / gift code" };
            }

            const giftRedeemedKey = "redeemed_" + cleanCode;
            const user = this.getCurrentUser();
            if (!user) return { success: false, message: "Please log in first" };

            // Initialize redeemed list
            const redeemed = JSON.parse(localStorage.getItem("jaiclub_redeemed_codes")) || {};
            const userRedeemedKey = user.uid + "_" + cleanCode;

            if (redeemed[userRedeemedKey]) {
                return { success: false, message: "You have already redeemed this gift code!" };
            }

            const rewardAmount = validCodes[cleanCode];
            const res = this.updateBalance(rewardAmount, "bonus", `Gift Code Redeemed: ${cleanCode}`);
            if (res.success) {
                redeemed[userRedeemedKey] = true;
                localStorage.setItem("jaiclub_redeemed_codes", JSON.stringify(redeemed));
                return { success: true, amount: rewardAmount, message: `Code redeemed successfully! ₹${rewardAmount} added to balance.` };
            }
            return { success: false, message: "Redemption failed." };
        }
    };
})();
