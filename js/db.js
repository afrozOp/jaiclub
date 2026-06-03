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

    // Simulated subordinate data records for filtering
    const MOCK_SUBORDINATE_RECORDS = {
        "2026-05-25": {
            depositNumber: 5,
            depositAmount: 15000,
            bettorsNumber: 8,
            totalBet: 28400,
            firstDepositPeople: 2,
            firstDepositAmount: 2000,
            list: [
                { uid: "551892", time: "2026-05-25 10:14:02", deposit: 1000, bet: 3400, isFirst: true },
                { uid: "552011", time: "2026-05-25 11:45:21", deposit: 5000, bet: 12000, isFirst: false },
                { uid: "552089", time: "2026-05-25 14:02:11", deposit: 1000, bet: 1000, isFirst: true },
                { uid: "552103", time: "2026-05-25 15:30:45", deposit: 3000, bet: 5000, isFirst: false },
                { uid: "552190", time: "2026-05-25 17:10:00", deposit: 5000, bet: 7000, isFirst: false }
            ]
        },
        "2026-05-24": {
            depositNumber: 8,
            depositAmount: 24500,
            bettorsNumber: 12,
            totalBet: 45200,
            firstDepositPeople: 4,
            firstDepositAmount: 4500,
            list: [
                { uid: "550992", time: "2026-05-24 09:12:00", deposit: 500, bet: 1200, isFirst: true },
                { uid: "551042", time: "2026-05-24 10:44:15", deposit: 2000, bet: 4500, isFirst: true },
                { uid: "551221", time: "2026-05-24 12:01:54", deposit: 10000, bet: 18000, isFirst: false },
                { uid: "551388", time: "2026-05-24 14:22:10", deposit: 1000, bet: 1000, isFirst: true },
                { uid: "551560", time: "2026-05-24 16:55:01", deposit: 1000, bet: 2500, isFirst: true },
                { uid: "551600", time: "2026-05-24 18:30:20", deposit: 5000, bet: 9000, isFirst: false },
                { uid: "551711", time: "2026-05-24 20:11:42", deposit: 3000, bet: 6000, isFirst: false },
                { uid: "551802", time: "2026-05-24 22:40:05", deposit: 2000, bet: 3000, isFirst: false }
            ]
        },
        "2026-05-23": {
            depositNumber: 4,
            depositAmount: 9000,
            bettorsNumber: 6,
            totalBet: 15400,
            firstDepositPeople: 1,
            firstDepositAmount: 1000,
            list: [
                { uid: "550412", time: "2026-05-23 08:33:12", deposit: 1000, bet: 2400, isFirst: true },
                { uid: "550502", time: "2026-05-23 11:21:40", deposit: 3000, bet: 5000, isFirst: false },
                { uid: "550711", time: "2026-05-23 15:10:05", deposit: 4000, bet: 6000, isFirst: false },
                { uid: "550882", time: "2026-05-23 19:44:50", deposit: 1000, bet: 2000, isFirst: false }
            ]
        }
    };

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
