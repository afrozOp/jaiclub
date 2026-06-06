document.addEventListener('DOMContentLoaded', () => {
    console.log("JAICLUB script loaded");

    // Global session and user setup
    const currentUser = window.JaiDB ? window.JaiDB.getCurrentUser() : null;

    // Current page highlighting
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        }
    });

    // Sync global balances across all pages
    const syncBalanceUI = () => {
        if (!window.JaiDB) return;
        const user = window.JaiDB.getCurrentUser();
        const balanceVal = user ? parseFloat(user.balance).toFixed(2) : "0.00";

        // Home Page Pill
        const pillBalance = document.querySelector('.balance-pill span');
        if (pillBalance) {
            pillBalance.textContent = balanceVal;
        }

        // Account Page Total Balance
        const accountBalance = document.getElementById('balance-display');
        if (accountBalance) {
            accountBalance.textContent = balanceVal;
        }

        // Wallet Page Total Balance
        const walletBalance = document.getElementById('wallet-balance');
        if (walletBalance) {
            walletBalance.textContent = balanceVal;
        }

        // Withdraw modal available balance
        const withdrawAvail = document.getElementById('withdraw-available');
        if (withdrawAvail) {
            withdrawAvail.textContent = balanceVal;
        }

        // Sync Wallet Circular Stats
        const p1 = document.getElementById('wallet-percent-1');
        const p2 = document.getElementById('wallet-percent-2');
        if (p1 && p2) {
            p1.textContent = user ? "100%" : "0%";
            p2.textContent = "0%";
        }
    };

    syncBalanceUI();

    // Hook Balance Refresh Animation
    const refreshBtn = document.getElementById('balance-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.classList.add('fa-spin');
            setTimeout(() => {
                syncBalanceUI();
                refreshBtn.classList.remove('fa-spin');
                alert("Balance updated successfully!");
            }, 800);
        });
    }

    // Copy to clipboard helper
    window.copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert("Copied to clipboard: " + text);
        }).catch(() => {
            // fallback
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            alert("Copied: " + text);
        });
    };

    // ==========================================
    // 1. AUTHENTICATION & REGISTRATION (login.html)
    // ==========================================
    if (currentPage === 'login.html') {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const tabs = document.querySelectorAll('.tab-item');
        const tabContents = document.querySelectorAll('.tab-content');

        // Simple Tab Switching Local Override
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.style.display = 'none');
                tab.classList.add('active');
                tabContents[index].style.display = 'block';
            });
        });

        // Toggle passwords eyes
        document.querySelectorAll('.show-pwd').forEach(eye => {
            eye.addEventListener('click', () => {
                const input = eye.previousElementSibling;
                if (input.type === 'password') {
                    input.type = 'text';
                    eye.classList.replace('fa-eye-slash', 'fa-eye');
                } else {
                    input.type = 'password';
                    eye.classList.replace('fa-eye', 'fa-eye-slash');
                }
            });
        });

        if (loginBtn && window.JaiDB) {
            loginBtn.addEventListener('click', () => {
                const isPhoneTab = tabs[0].classList.contains('active');
                let identifier, password;

                if (isPhoneTab) {
                    identifier = document.getElementById('phone-input').value.trim();
                    password = document.getElementById('phone-pass').value;
                } else {
                    identifier = document.getElementById('email-input').value.trim();
                    password = document.getElementById('email-pass').value;
                }

                if (!identifier || !password) {
                    alert("Please enter both ID and Password");
                    return;
                }

                const result = window.JaiDB.login(identifier, password);
                if (result.success) {
                    alert("Logged in successfully! Redirecting...");
                    window.location.href = "account.html";
                } else {
                    // Direct auto-register if details are not found
                    const regResult = window.JaiDB.register(identifier, password);
                    if (regResult.success) {
                        alert("Account registered and logged in successfully! Redirecting...");
                        window.location.href = "account.html";
                    } else {
                        alert(result.message || "Login & Auto-registration failed");
                    }
                }
            });
        }

        if (registerBtn && window.JaiDB) {
            registerBtn.addEventListener('click', () => {
                const isPhoneTab = tabs[0].classList.contains('active');
                let identifier, password;

                if (isPhoneTab) {
                    identifier = document.getElementById('phone-input').value.trim();
                    password = document.getElementById('phone-pass').value;
                } else {
                    identifier = document.getElementById('email-input').value.trim();
                    password = document.getElementById('email-pass').value;
                }

                if (!identifier || !password) {
                    alert("Please enter ID and Password to Register");
                    return;
                }

                if (password.length < 6) {
                    alert("Password must be at least 6 characters long");
                    return;
                }

                const result = window.JaiDB.register(identifier, password);
                if (result.success) {
                    alert("Registered & Logged in successfully! Redirecting...");
                    window.location.href = "account.html";
                } else {
                    alert(result.message || "Registration failed");
                }
            });
        }
    }

    // ==========================================
    // 2. ACCOUNT PROFILE PAGE (account.html)
    // ==========================================
    if (currentPage === 'account.html') {
        const usernameDisp = document.getElementById('username-display');
        const vipDisp = document.getElementById('vip-display');
        const uidNum = document.getElementById('uid-number');
        const uidDisp = document.getElementById('uid-display');
        const lastLoginDisp = document.getElementById('last-login-display');
        const authActionBtn = document.getElementById('auth-action-btn');

        if (currentUser) {
            // Populate active member details
            if (usernameDisp) usernameDisp.textContent = currentUser.username;
            if (vipDisp) vipDisp.textContent = currentUser.vipLevel;
            if (uidNum) uidNum.textContent = currentUser.uid;
            if (lastLoginDisp) lastLoginDisp.textContent = "Last login: " + currentUser.lastLogin;

            // Logged-in styling and text for action button
            if (authActionBtn) {
                authActionBtn.innerHTML = `<img src="./images/power-off.png" style="width: 26px; height: 26px; object-fit: contain;"> Log out`;
                authActionBtn.href = "#";
                authActionBtn.style.color = "#A08FFF";
                authActionBtn.style.borderColor = "#2d2f5a";
                authActionBtn.style.background = "#17172c";

                authActionBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm("Are you sure you want to log out?")) {
                        window.JaiDB.logout();
                        alert("Logged out successfully!");
                        window.location.reload();
                    }
                });
            }

            // Copy UID on click
            if (uidDisp) {
                uidDisp.addEventListener('click', () => {
                    window.copyToClipboard(currentUser.uid);
                });
            }
        } else {
            // Guest UI setup
            if (usernameDisp) usernameDisp.textContent = "MOCK_GUEST";
            if (vipDisp) vipDisp.style.display = "none";
            if (uidNum) uidNum.textContent = "------";
            if (lastLoginDisp) lastLoginDisp.textContent = "Please log in to view stats";

            // Logged-out styling and text for action button (Log in)
            if (authActionBtn) {
                authActionBtn.innerHTML = `<img src="./images/power-off.png" style="width: 26px; height: 26px; object-fit: contain;"> Log in`;
                authActionBtn.href = "login.html";
                authActionBtn.style.color = "#A08FFF";
                authActionBtn.style.borderColor = "#2d2f5a";
                authActionBtn.style.background = "#17172c";
            }

            // Guard member-only menu clicks
            const privateCards = document.querySelectorAll('.menu-card, .service-item');
            privateCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    alert("Please log in first to view this page.");
                    window.location.href = "login.html";
                });
            });
        }
    }

    // ==========================================
    // 3. WALLET PAGE (wallet.html)
    // ==========================================
    if (currentPage === 'wallet.html') {
        // Force authentication
        if (!currentUser) {
            alert("Please log in to manage your wallet.");
            window.location.href = "login.html";
            return;
        }

        const depModal = document.getElementById('deposit-modal');
        const witModal = document.getElementById('withdraw-modal');
        const depOpenBtn = document.getElementById('deposit-open-btn');
        const witOpenBtn = document.getElementById('withdraw-open-btn');

        if (depOpenBtn) {
            depOpenBtn.addEventListener('click', () => {
                depModal.style.display = 'flex';
            });
        }

        if (witOpenBtn) {
            witOpenBtn.addEventListener('click', () => {
                witModal.style.display = 'flex';
            });
        }

        // Deep Link modal routing
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('action') === 'deposit') {
            depModal.style.display = 'flex';
        } else if (urlParams.get('action') === 'withdraw') {
            witModal.style.display = 'flex';
        }

        // Handle Deposit submission
        const depSubmit = document.getElementById('deposit-submit-btn');
        if (depSubmit) {
            depSubmit.addEventListener('click', () => {
                const amt = parseFloat(document.getElementById('deposit-amt').value);
                if (isNaN(amt) || amt <= 0) {
                    alert("Please enter a valid deposit amount.");
                    return;
                }
                const res = window.JaiDB.updateBalance(amt, "deposit", "UPI/Bank Deposit Verified");
                if (res.success) {
                    alert(`Successfully deposited ₹${amt.toFixed(2)} to your main wallet!`);
                    depModal.style.display = 'none';
                    syncBalanceUI();
                } else {
                    alert(res.message);
                }
            });
        }

        // Handle Withdrawal submission
        const witSubmit = document.getElementById('withdraw-submit-btn');
        if (witSubmit) {
            witSubmit.addEventListener('click', () => {
                const amt = parseFloat(document.getElementById('withdraw-amt').value);
                const details = document.getElementById('withdraw-details').value.trim();

                if (isNaN(amt) || amt <= 0) {
                    alert("Please enter a valid withdrawal amount.");
                    return;
                }
                if (!details) {
                    alert("Please enter payment destination details.");
                    return;
                }

                const res = window.JaiDB.updateBalance(-amt, "withdraw", "Withdrawn to " + details);
                if (res.success) {
                    alert(`Withdrawal request for ₹${amt.toFixed(2)} submitted successfully!`);
                    witModal.style.display = 'none';
                    syncBalanceUI();
                } else {
                    alert(res.message);
                }
            });
        }
    }

    // ==========================================
    // 4. PROMOTION PAGE (promotion.html)
    // ==========================================
    if (currentPage === 'promotion.html') {
        const commDisp = document.getElementById('commission-display');
        const directDisp = document.getElementById('direct-display');
        const teamDisp = document.getElementById('team-display');
        const inviteDisp = document.getElementById('invite-code-display');
        const copyInviteBtn = document.getElementById('copy-invite-btn');

        if (currentUser) {
            if (commDisp) {
                const savedComm = localStorage.getItem('promo_commission-display');
                commDisp.textContent = savedComm !== null ? savedComm : parseFloat(currentUser.yesterdayCommission).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
            }
            if (directDisp) {
                const savedDirect = localStorage.getItem('promo_direct-display');
                directDisp.textContent = savedDirect !== null ? savedDirect : currentUser.directSubordinates;
            }
            if (teamDisp) {
                const savedTeam = localStorage.getItem('promo_team-display');
                teamDisp.textContent = savedTeam !== null ? savedTeam : currentUser.teamSubordinates;
            }
            if (inviteDisp) inviteDisp.textContent = currentUser.inviteCode;

            if (copyInviteBtn) {
                copyInviteBtn.addEventListener('click', () => {
                    window.copyToClipboard(currentUser.inviteCode);
                });
            }
        } else {
            // Guard
            alert("Please log in to view your promotion details.");
            window.location.href = "login.html";
        }
    }

    // ==========================================
    // 5. SUBORDINATE DATA (subordinate_data.html)
    // ==========================================
    if (currentPage === 'subordinate_data.html') {
        if (!currentUser) {
            alert("Please log in to view subordinate data.");
            window.location.href = "login.html";
            return;
        }

        const dateSelect = document.getElementById('subordinate-date-select');
        const levelSelect = document.getElementById('subordinate-level-select');
        const searchInput = document.getElementById('subordinate-search');
        const searchBtn = document.getElementById('subordinate-search-btn');
        const noDataPlaceholder = document.getElementById('no-data-placeholder');
        const listContainer = document.getElementById('subordinate-list-container');

        // Subordinate stats fields
        const depNum = document.getElementById('deposit-number-val');
        const depAmt = document.getElementById('deposit-amount-val');
        const betNum = document.getElementById('bettors-number-val');
        const betAmt = document.getElementById('total-bet-val');
        const fstNum = document.getElementById('first-deposit-people-val');
        const fstAmt = document.getElementById('first-deposit-amount-val');

        const updateSubordinateData = () => {
            if (!window.JaiDB) return;
            const date = dateSelect.value;
            const level = levelSelect.value;
            const searchQuery = searchInput.value.trim();

            const data = window.JaiDB.getSubordinateData(date);

            // Populate static numeric fields (supporting manual edit overrides)
            depNum.textContent = localStorage.getItem('sub_deposit-number-val') !== null ? localStorage.getItem('sub_deposit-number-val') : data.depositNumber;
            depAmt.textContent = localStorage.getItem('sub_deposit-amount-val') !== null ? localStorage.getItem('sub_deposit-amount-val') : data.depositAmount.toLocaleString('en-IN');
            betNum.textContent = localStorage.getItem('sub_bettors-number-val') !== null ? localStorage.getItem('sub_bettors-number-val') : data.bettorsNumber;
            betAmt.textContent = localStorage.getItem('sub_total-bet-val') !== null ? localStorage.getItem('sub_total-bet-val') : data.totalBet.toLocaleString('en-IN');
            fstNum.textContent = localStorage.getItem('sub_first-deposit-people-val') !== null ? localStorage.getItem('sub_first-deposit-people-val') : data.firstDepositPeople;
            fstAmt.textContent = localStorage.getItem('sub_first-deposit-amount-val') !== null ? localStorage.getItem('sub_first-deposit-amount-val') : data.firstDepositAmount.toLocaleString('en-IN');

            // Filter List
            let records = data.list || [];

            // Search UID
            if (searchQuery) {
                records = records.filter(r => r.uid.includes(searchQuery));
            }

            // Level filters (use level field from data, tier1=1, tier2=2, etc.)
            if (level !== 'all') {
                const tierNum = parseInt(level.replace('tier', ''));
                records = records.filter(r => r.level === tierNum);
            }

            // Render
            listContainer.innerHTML = '';
            if (records.length === 0) {
                noDataPlaceholder.style.display = 'block';
            } else {
                noDataPlaceholder.style.display = 'none';
                records.forEach(rec => {
                    const card = document.createElement('div');
                    card.className = 'glass-card animate-fade';
                    card.style.marginBottom = '12px';
                    card.style.padding = '15px 18px';
                    card.style.borderRadius = '12px';
                    card.style.background = 'rgba(100, 150, 255, 0.1)';
                    card.style.border = '1px solid rgba(255,255,255,0.06)';

                    const level = rec.level || 1;
                    const commission = (rec.bet * 0.0001).toFixed(2);
                    const dateOnly = rec.time.split(' ')[0];

                    card.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                            <span style="font-weight: bold; color: white; font-size: 15px;">UID:${rec.uid}</span>
                            <svg onclick="event.stopPropagation(); window.copyToClipboard('${rec.uid}');" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7473fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor: pointer; flex-shrink: 0;">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px;">
                                <span style="color: rgba(255,255,255,0.6);">Level</span>
                                <span style="color: rgba(255,255,255,0.6); font-weight: 500;">${level}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px;">
                                <span style="color: rgba(255,255,255,0.6);">Deposit amount</span>
                                <span style="color: #aa842bff; font-weight: 500;">${rec.deposit}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px;">
                                <span style="color: rgba(255,255,255,0.6);">Bet amount</span>
                                <span style="color: #aa842bff; font-weight: 500;">${rec.bet}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px;">
                                <span style="color: rgba(255,255,255,0.6);">Commission</span>
                                <span style="color: #aa842bff; font-weight: 500;">${commission}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px;">
                                <span style="color: rgba(255,255,255,0.6);">Time</span>
                                <span style="color: rgba(255,255,255,0.6);">${dateOnly}</span>
                            </div>
                        </div>
                    `;
                    listContainer.appendChild(card);
                });
            }
        };

        // Listen for filter changes
        dateSelect.addEventListener('change', updateSubordinateData);
        levelSelect.addEventListener('change', updateSubordinateData);
        searchBtn.addEventListener('click', updateSubordinateData);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') updateSubordinateData();
        });

        // Initialize display
        updateSubordinateData();
    }

    // ==========================================
    // 6. ACTIVITY PAGE (activity.html)
    // ==========================================
    if (currentPage === 'activity.html') {
        if (!currentUser) {
            alert("Please log in to view activities.");
            window.location.href = "login.html";
            return;
        }

        const todayBonus = document.getElementById('today-bonus-display');
        const totalBonus = document.getElementById('total-bonus-display');
        const attendanceBtn = document.getElementById('attendance-banner-btn');
        const giftsBtn = document.getElementById('gifts-banner-btn');

        // Check and sync attendance status
        const syncAttendanceBonuses = () => {
            if (!window.JaiDB) return;
            const txs = window.JaiDB.getTransactions();
            const today = new Date().toISOString().split('T')[0];

            let todaySum = 0;
            let totalSum = 417.71; // starting seed

            txs.forEach(tx => {
                if (tx.type === 'bonus') {
                    const amt = parseFloat(tx.amount);
                    totalSum += amt;
                    if (tx.time.startsWith(today)) {
                        todaySum += amt;
                    }
                }
            });

            if (todayBonus) todayBonus.textContent = `₹ ${todaySum.toFixed(2)}`;
            if (totalBonus) totalBonus.textContent = `₹ ${totalSum.toFixed(2)}`;
        };

        syncAttendanceBonuses();

        if (attendanceBtn) {
            attendanceBtn.addEventListener('click', () => {
                const res = window.JaiDB.claimDailySignIn();
                alert(res.message);
                if (res.success) {
                    syncAttendanceBonuses();
                    syncBalanceUI();
                }
            });
        }

        if (giftsBtn) {
            giftsBtn.addEventListener('click', () => {
                const code = prompt("Please enter your redemption gift code (Try: JAICLUB100, FREE50, MEGA200):");
                if (code === null) return;
                if (!code.trim()) {
                    alert("Please enter a valid code");
                    return;
                }

                const res = window.JaiDB.redeemGiftCode(code);
                alert(res.message);
                if (res.success) {
                    syncAttendanceBonuses();
                    syncBalanceUI();
                }
            });
        }
    }

    // ==========================================
    // 7. PLAYABLE MINI GAMES SIMULATION (index.html)
    // ==========================================
    if (currentPage === 'index.html' || currentPage === '') {
        const gameCards = document.querySelectorAll('.game-card-refined');

        // Styles for embedded game simulator modals
        const style = document.createElement('style');
        style.textContent = `
            .game-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(9, 9, 25, 0.95);
                z-index: 20000;
                flex-direction: column;
                padding: 20px;
                box-sizing: border-box;
                overflow-y: auto;
            }
            .game-head {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid var(--card-border);
                padding-bottom: 15px;
                margin-bottom: 20px;
            }
            .game-body {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            .wingo-wheel {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin: 20px 0;
            }
            .color-btn {
                flex: 1;
                padding: 15px;
                border-radius: 12px;
                border: none;
                font-weight: bold;
                font-size: 16px;
                cursor: pointer;
                color: white;
                text-align: center;
            }
            .wingo-timer {
                background: var(--card-bg);
                padding: 15px;
                border-radius: 12px;
                text-align: center;
                border: 1px solid var(--card-border);
            }
            .aviator-screen {
                height: 220px;
                background: #030310;
                border: 2px solid var(--card-border);
                border-radius: 16px;
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            .aviator-plane {
                position: absolute;
                bottom: 20px;
                left: 20px;
                font-size: 28px;
                color: #ff4757;
                transition: all 0.1s linear;
            }
            .aviator-mult {
                font-size: 48px;
                font-weight: 800;
                color: white;
                text-shadow: 0 4px 10px rgba(255, 71, 87, 0.4);
            }
            @media (min-width: 600px) {
                .game-overlay {
                    max-width: 450px;
                    left: 50%;
                    transform: translateX(-50%);
                    box-shadow: 0 0 50px rgba(0,0,0,0.8);
                }
            }
        `;
        document.head.appendChild(style);

        // Append Wingo Game Simulator HTML
        const wingoOverlay = document.createElement('div');
        wingoOverlay.id = 'wingo-overlay';
        wingoOverlay.className = 'game-overlay';
        wingoOverlay.innerHTML = `
            <div class="game-head">
                <h2 style="font-weight:900; background:var(--primary-gradient); -webkit-background-clip:text; -webkit-text-fill-color:transparent;"><i class="fas fa-dice"></i> WINGO 1-MIN</h2>
                <i class="fas fa-times" id="close-wingo" style="font-size: 24px; cursor: pointer; color: var(--text-secondary);"></i>
            </div>
            <div class="game-body">
                <div class="wingo-timer">
                    <div style="font-size: 12px; color: var(--text-secondary); text-transform: uppercase;">Draw countdown</div>
                    <div style="font-size: 32px; font-weight: bold; color: var(--accent-color);" id="wingo-countdown">00:30</div>
                </div>

                <div class="glass-card" style="padding: 20px;">
                    <h3 style="margin-bottom: 12px; font-size:15px;">Place simulated color bet:</h3>
                    <div class="wingo-wheel">
                        <button class="color-btn" style="background:#2ed573;" onclick="selectWingoColor('green', this)">Green</button>
                        <button class="color-btn" style="background:#8e44ad;" onclick="selectWingoColor('violet', this)">Violet</button>
                        <button class="color-btn" style="background:#ff4757;" onclick="selectWingoColor('red', this)">Red</button>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Bet Amount (₹)</label>
                        <input type="number" id="wingo-bet-amt" class="form-control" value="10" min="1">
                    </div>

                    <button id="wingo-bet-submit" class="btn btn-primary" style="width: 100%; height: 50px; font-size: 16px; border-radius: 12px;">Place Bet</button>
                </div>

                <div class="glass-card" style="padding: 15px;">
                    <h4 style="margin-bottom:10px; font-size:13px; color:var(--text-secondary);">Simulated History</h4>
                    <div id="wingo-history" style="display:flex; gap:10px; flex-wrap:wrap;">
                        <span class="btn-gold" style="border-radius:50%; width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; color:white; background:#2ed573; font-size:12px;">3</span>
                        <span class="btn-gold" style="border-radius:50%; width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; color:white; background:#ff4757; font-size:12px;">8</span>
                        <span class="btn-gold" style="border-radius:50%; width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; color:white; background:#2ed573; font-size:12px;">1</span>
                        <span class="btn-gold" style="border-radius:50%; width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; color:white; background:#8e44ad; font-size:12px;">5</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(wingoOverlay);

        // Append Aviator Game Simulator HTML
        const aviatorOverlay = document.createElement('div');
        aviatorOverlay.id = 'aviator-overlay';
        aviatorOverlay.className = 'game-overlay';
        aviatorOverlay.innerHTML = `
            <div class="game-head">
                <h2 style="font-weight:900; color:#ff4757;"><i class="fas fa-paper-plane"></i> AVIATOR SIMULATOR</h2>
                <i class="fas fa-times" id="close-aviator" style="font-size: 24px; cursor: pointer; color: var(--text-secondary);"></i>
            </div>
            <div class="game-body">
                <div class="aviator-screen">
                    <div class="aviator-mult" id="aviator-mult">1.00x</div>
                    <div class="aviator-plane" id="aviator-plane"><i class="fas fa-paper-plane"></i></div>
                    <div style="position: absolute; bottom: 10px; color: #ff4757; font-weight: bold; display: none;" id="flew-away-text">FLEW AWAY!</div>
                </div>

                <div class="glass-card" style="padding: 20px;">
                    <div class="form-group">
                        <label class="form-label">Flight Bet (₹)</label>
                        <input type="number" id="aviator-bet-amt" class="form-control" value="20" min="1">
                    </div>

                    <div style="display:flex; gap:10px;">
                        <button id="aviator-bet-submit" class="btn btn-secondary" style="flex:1; height: 50px; font-size: 16px; border-radius: 12px;">Start Flight</button>
                        <button id="aviator-cashout" class="btn btn-gold" style="flex:1; height: 50px; font-size: 16px; border-radius: 12px; display:none;">Cash Out</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(aviatorOverlay);

        // Click listeners to launch game simulations
        gameCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                if (!currentUser) {
                    alert("Please log in to play simulated games!");
                    window.location.href = "login.html";
                    return;
                }

                const gameName = (card.getAttribute('data-game') || (card.querySelector('span') ? card.querySelector('span').textContent : '') || '').toLowerCase();
                if (gameName === 'wingo') {
                    wingoOverlay.style.display = 'flex';
                    startWingoTimer();
                } else if (gameName === 'aviator') {
                    aviatorOverlay.style.display = 'flex';
                } else {
                    alert(`Simulated ${gameName.toUpperCase()} game server connecting. Please try Wingo or Aviator!`);
                }
            });
        });

        // Close Game listeners
        document.getElementById('close-wingo').addEventListener('click', () => {
            wingoOverlay.style.display = 'none';
            clearInterval(wingoInterval);
        });

        document.getElementById('close-aviator').addEventListener('click', () => {
            aviatorOverlay.style.display = 'none';
            resetAviator();
        });

        // ==========================================
        // WINGO GAME LOGIC
        // ==========================================
        let wingoInterval = null;
        let selectedColor = "";

        window.selectWingoColor = (color, elem) => {
            selectedColor = color;
            const parent = elem.parentElement;
            parent.querySelectorAll('.color-btn').forEach(btn => btn.style.border = 'none');
            elem.style.border = '3px solid white';
        };

        const startWingoTimer = () => {
            let timer = 30;
            const timerText = document.getElementById('wingo-countdown');

            clearInterval(wingoInterval);
            wingoInterval = setInterval(() => {
                timer--;
                timerText.textContent = `00:${String(timer).padStart(2, '0')}`;

                if (timer <= 0) {
                    timer = 30;
                    // Trigger Draw Result
                    resolveWingoDraw();
                }
            }, 1000);
        };
        window.startWingoTimer = startWingoTimer;

        const resolveWingoDraw = () => {
            const colors = ['red', 'green', 'violet'];
            const winningColor = colors[Math.floor(Math.random() * colors.length)];
            const winningNumber = Math.floor(Math.random() * 10);

            // Draw visual result
            alert(`Draw Complete!\nWinning number: ${winningNumber}\nWinning Color: ${winningColor.toUpperCase()}`);

            // Prepend history
            const hist = document.getElementById('wingo-history');
            const newSpan = document.createElement('span');
            newSpan.className = 'btn-gold';
            newSpan.style.borderRadius = '50%';
            newSpan.style.width = '28px';
            newSpan.style.height = '28px';
            newSpan.style.display = 'inline-flex';
            newSpan.style.alignItems = 'center';
            newSpan.style.justifyContent = 'center';
            newSpan.style.color = 'white';
            newSpan.style.fontSize = '12px';
            newSpan.style.background = winningColor === 'green' ? '#2ed573' : (winningColor === 'red' ? '#ff4757' : '#8e44ad');
            newSpan.textContent = winningNumber;
            hist.insertBefore(newSpan, hist.firstChild);

            // Resolve placing bets
            const betAmtInput = document.getElementById('wingo-bet-amt');
            const betAmt = parseFloat(betAmtInput.value);

            if (selectedColor) {
                if (selectedColor === winningColor) {
                    const prize = winningColor === 'violet' ? betAmt * 4.5 : betAmt * 2;
                    window.JaiDB.updateBalance(prize, 'bonus', `Wingo Win - Draw Color: ${winningColor.toUpperCase()}`);
                    alert(`Congratulations! You won ₹${prize.toFixed(2)}!`);
                } else {
                    alert(`Sorry! You lost ₹${betAmt.toFixed(2)}! Better luck next time.`);
                }

                selectedColor = "";
                document.querySelectorAll('.color-btn').forEach(btn => btn.style.border = 'none');
                syncBalanceUI();
            }
        };

        const betSubmit = document.getElementById('wingo-bet-submit');
        if (betSubmit) {
            betSubmit.addEventListener('click', () => {
                if (!selectedColor) {
                    alert("Please select a color (Green, Violet, or Red) to place your bet!");
                    return;
                }

                const amt = parseFloat(document.getElementById('wingo-bet-amt').value);
                if (isNaN(amt) || amt <= 0) {
                    alert("Please enter a valid bet amount.");
                    return;
                }

                const res = window.JaiDB.updateBalance(-amt, 'withdraw', 'Wingo bet placed');
                if (res.success) {
                    alert(`₹${amt.toFixed(2)} bet placed successfully on ${selectedColor.toUpperCase()}! Please wait for the draw timer.`);
                    syncBalanceUI();
                } else {
                    alert(res.message);
                }
            });
        }

        // ==========================================
        // AVIATOR GAME LOGIC
        // ==========================================
        let aviatorActive = false;
        let aviatorBet = 0;
        let aviatorMultiplier = 1.00;
        let aviatorInterval = null;
        let aviatorCrashPoint = 0;

        const startBtn = document.getElementById('aviator-bet-submit');
        const cashBtn = document.getElementById('aviator-cashout');
        const multText = document.getElementById('aviator-mult');
        const plane = document.getElementById('aviator-plane');
        const crashText = document.getElementById('flew-away-text');

        const resetAviator = () => {
            clearInterval(aviatorInterval);
            aviatorActive = false;
            aviatorMultiplier = 1.00;
            multText.textContent = "1.00x";
            multText.style.color = "white";
            plane.style.bottom = "20px";
            plane.style.left = "20px";
            plane.style.color = "#ff4757";
            crashText.style.display = 'none';
            if (startBtn) startBtn.style.display = 'block';
            if (cashBtn) cashBtn.style.display = 'none';
        };

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                const amt = parseFloat(document.getElementById('aviator-bet-amt').value);
                if (isNaN(amt) || amt <= 0) {
                    alert("Please enter a valid flight bet amount.");
                    return;
                }

                const res = window.JaiDB.updateBalance(-amt, 'withdraw', 'Aviator bet placed');
                if (!res.success) {
                    alert(res.message);
                    return;
                }

                syncBalanceUI();
                resetAviator();

                // Setup Flight
                aviatorBet = amt;
                aviatorActive = true;
                aviatorCrashPoint = Math.round((1.01 + Math.random() * 8.00) * 100) / 100; // random flight exit

                startBtn.style.display = 'none';
                cashBtn.style.display = 'block';
                cashBtn.textContent = `Cash Out (₹${(aviatorBet * aviatorMultiplier).toFixed(2)})`;

                // Flight Animation Loop
                aviatorInterval = setInterval(() => {
                    aviatorMultiplier += 0.05;
                    aviatorMultiplier = Math.round(aviatorMultiplier * 100) / 100;
                    multText.textContent = `${aviatorMultiplier.toFixed(2)}x`;
                    cashBtn.textContent = `Cash Out (₹${(aviatorBet * aviatorMultiplier).toFixed(2)})`;

                    // Move plane icon
                    const bottomPos = 20 + (aviatorMultiplier * 15);
                    const leftPos = 20 + (aviatorMultiplier * 20);
                    plane.style.bottom = `${Math.min(bottomPos, 160)}px`;
                    plane.style.left = `${Math.min(leftPos, 300)}px`;

                    if (aviatorMultiplier >= aviatorCrashPoint) {
                        // Crash!
                        clearInterval(aviatorInterval);
                        aviatorActive = false;
                        multText.style.color = "#ff4757";
                        crashText.style.display = 'block';
                        cashBtn.style.display = 'none';
                        plane.style.color = "#7f8c8d";
                        alert(`Oh no! The plane flew away at ${aviatorMultiplier.toFixed(2)}x!\nYou lost ₹${aviatorBet.toFixed(2)}.`);

                        setTimeout(resetAviator, 3000);
                    }
                }, 150);
            });
        }

        // Aviator Cash Out Handler
        if (cashBtn) {
            cashBtn.addEventListener('click', () => {
                if (!aviatorActive) return;
                clearInterval(aviatorInterval);
                aviatorActive = false;

                const winnings = aviatorBet * aviatorMultiplier;
                window.JaiDB.updateBalance(winnings, 'bonus', `Aviator Cashout at ${aviatorMultiplier.toFixed(2)}x`);
                syncBalanceUI();

                multText.style.color = "#2ed573";
                cashBtn.style.display = 'none';
                alert(`Cashed out at ${aviatorMultiplier.toFixed(2)}x! You won ₹${winnings.toFixed(2)}!`);

                setTimeout(resetAviator, 2000);
            });
        }
    }

    // ==========================================
    // 8. ADDED: BANNER SLIDER, DROPDOWNS & INTERACTIVE GAMES (index.html)
    // ==========================================
    if (currentPage === 'index.html' || currentPage === '') {
        // Banner Slider logic (9 slides)
        let currentSlide = 0;
        const sliderWrapper = document.querySelector('.slider-wrapper');
        const dots = document.querySelectorAll('.slider-dot');

        window.setSlide = (index) => {
            currentSlide = index;
            if (sliderWrapper) {
                sliderWrapper.style.transform = `translateX(-${index * 11.1111}%)`;
            }
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === index);
            });
        };

        // Autoplay slider (mod 9)
        let sliderInterval = setInterval(() => {
            let nextSlide = (currentSlide + 1) % 9;
            setSlide(nextSlide);
        }, 4000);

        // Stop autoplay on dot click
        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                clearInterval(sliderInterval);
            });
        });

        // Country Select flag sync
        const countrySelect = document.getElementById('country-select');
        const countryFlag = document.getElementById('country-flag');
        if (countrySelect && countryFlag) {
            countrySelect.addEventListener('change', (e) => {
                const val = e.target.value;
                const selectedOption = countrySelect.options[countrySelect.selectedIndex];
                const flagCode = selectedOption.getAttribute('data-flag');
                countryFlag.src = `https://flagcdn.com/w20/${flagCode}.png`;
            });
        }

        // App Download Simulator
        const downloadTrigger = document.getElementById('header-download-btn');
        const downloadModal = document.getElementById('download-modal');
        const progressBar = document.getElementById('download-progress-bar');
        const progressPercentText = document.getElementById('download-percent-text');

        if (downloadTrigger && downloadModal) {
            downloadTrigger.addEventListener('click', () => {
                downloadModal.style.display = 'flex';
                let progress = 0;
                progressBar.style.width = '0%';
                progressPercentText.textContent = '0% complete';

                let downloadInterval = setInterval(() => {
                    progress += Math.floor(Math.random() * 12) + 6;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(downloadInterval);
                        progressBar.style.width = '100%';
                        progressPercentText.textContent = '100% complete! Installing...';
                        setTimeout(() => {
                            downloadModal.style.display = 'none';
                            alert('JAICLUB application installed successfully!');
                        }, 800);
                    } else {
                        progressBar.style.width = `${progress}%`;
                        progressPercentText.textContent = `${progress}% complete`;
                    }
                }, 120);
            });
        }

        // Notice Modal triggers
        const noticeDetailBtn = document.querySelector('.notice-bar button');
        const noticeModal = document.getElementById('notice-modal');
        const closeNoticeBtn = document.getElementById('close-notice-modal');

        if (noticeDetailBtn && noticeModal) {
            noticeDetailBtn.addEventListener('click', () => {
                noticeModal.style.display = 'flex';
            });
        }
        if (closeNoticeBtn && noticeModal) {
            closeNoticeBtn.addEventListener('click', () => {
                noticeModal.style.display = 'none';
            });
        }

        // Lucky Roulette spin wheel simulator
        const rouletteModal = document.getElementById('roulette-modal');
        const rouletteOpenBtns = [
            document.getElementById('roulette-banner-spin-btn'),
            document.getElementById('floating-roulette-btn')
        ];
        const closeRouletteBtn = document.getElementById('close-roulette-modal');
        const rouletteSpinBtn = document.getElementById('roulette-spin-btn');
        const rouletteWheel = document.getElementById('roulette-wheel');
        const rouletteResultMsg = document.getElementById('roulette-result-msg');

        rouletteOpenBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    if (!currentUser) {
                        alert("Please log in to spin the Lucky Roulette!");
                        window.location.href = "login.html";
                        return;
                    }
                    rouletteModal.style.display = 'flex';
                    rouletteResultMsg.textContent = '';
                    rouletteWheel.style.transform = 'rotate(0deg)';
                });
            }
        });

        if (closeRouletteBtn && rouletteModal) {
            closeRouletteBtn.addEventListener('click', () => {
                rouletteModal.style.display = 'none';
            });
        }

        let isSpinning = false;
        if (rouletteSpinBtn) {
            rouletteSpinBtn.addEventListener('click', () => {
                if (isSpinning) return;

                const cost = 10;
                if (currentUser.balance < cost) {
                    alert("Insufficient Balance to spin the Roulette wheel! Spin cost is ₹10.");
                    return;
                }

                // Deduct cost
                window.JaiDB.updateBalance(-cost, "withdraw", "Lucky Roulette Spin Fee");
                syncBalanceUI();

                isSpinning = true;
                rouletteResultMsg.textContent = "Spinning...";
                rouletteResultMsg.style.color = "var(--accent-color)";

                // Choose a random prize
                const rand = Math.random() * 100;
                let prize = "";
                let centerAngle = 0;
                let winAmt = 0;

                if (rand < 45) {
                    prize = "₹10 Bonus Cash";
                    centerAngle = 30;
                    winAmt = 10;
                } else if (rand < 70) {
                    prize = "Try Again next time!";
                    centerAngle = 330;
                    winAmt = 0;
                } else if (rand < 85) {
                    prize = "₹50 Bonus Cash";
                    centerAngle = 90;
                    winAmt = 50;
                } else if (rand < 95) {
                    prize = "₹100 Bonus Cash";
                    centerAngle = 150;
                    winAmt = 100;
                } else if (rand < 99.8) {
                    prize = "₹500 Jackpot Cash!";
                    centerAngle = 210;
                    winAmt = 500;
                } else {
                    prize = "GRAND PRIZE: GOLDEN IPHONE 17!";
                    centerAngle = 270;
                    winAmt = 10000;
                }

                // Spin animation
                const spins = 6;
                const totalDeg = spins * 360 + (360 - centerAngle);

                rouletteWheel.style.transform = `rotate(${totalDeg}deg)`;

                setTimeout(() => {
                    isSpinning = false;

                    if (winAmt > 0) {
                        window.JaiDB.updateBalance(winAmt, "bonus", `Lucky Roulette Win: ${prize}`);
                        syncBalanceUI();
                        rouletteResultMsg.textContent = `WINNER! You won ${prize}!`;
                        rouletteResultMsg.style.color = "#2ed573";
                        alert(`Congratulations! You won ${prize}!`);
                    } else {
                        rouletteResultMsg.textContent = `Better luck next time!`;
                        rouletteResultMsg.style.color = "#ff4757";
                    }
                }, 4000);
            });
        }

        // Dragon & Tiger Card Game simulator
        const dragontigerModal = document.getElementById('dragontiger-modal');
        const dragontigerOpenBtn = document.getElementById('floating-dragonTiger-btn');
        const closeDragontigerBtn = document.getElementById('close-dragontiger-modal');
        const dealBtn = document.getElementById('dragontiger-deal-btn');
        const dragonCardBox = document.getElementById('dragon-card-box');
        const tigerCardBox = document.getElementById('tiger-card-box');
        const dragontigerResultMsg = document.getElementById('dragontiger-result-msg');
        const dtBetAmtInput = document.getElementById('dragontiger-bet-amt');

        const betButtons = {
            dragon: document.getElementById('bet-dragon-btn'),
            tie: document.getElementById('bet-tie-btn'),
            tiger: document.getElementById('bet-tiger-btn')
        };

        let selectedSide = '';

        Object.keys(betButtons).forEach(side => {
            const btn = betButtons[side];
            if (btn) {
                btn.addEventListener('click', () => {
                    Object.values(betButtons).forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    selectedSide = side;
                });
            }
        });

        if (dragontigerOpenBtn && dragontigerModal) {
            dragontigerOpenBtn.addEventListener('click', () => {
                if (!currentUser) {
                    alert("Please log in to play Dragon Tiger!");
                    window.location.href = "login.html";
                    return;
                }
                dragontigerModal.style.display = 'flex';
                dragontigerResultMsg.textContent = '';
                dragonCardBox.innerHTML = '<i class="fas fa-question"></i>';
                tigerCardBox.innerHTML = '<i class="fas fa-question"></i>';
                Object.values(betButtons).forEach(b => b.classList.remove('active'));
                selectedSide = '';
            });
        }

        if (closeDragontigerBtn && dragontigerModal) {
            closeDragontigerBtn.addEventListener('click', () => {
                dragontigerModal.style.display = 'none';
            });
        }

        let isDealing = false;
        if (dealBtn) {
            dealBtn.addEventListener('click', () => {
                if (isDealing) return;
                if (!selectedSide) {
                    alert("Please select a betting side (Dragon, Tie, or Tiger) first!");
                    return;
                }

                const betAmt = parseFloat(dtBetAmtInput.value);
                if (isNaN(betAmt) || betAmt <= 0) {
                    alert("Please enter a valid bet amount.");
                    return;
                }

                if (currentUser.balance < betAmt) {
                    alert("Insufficient Balance to place this bet!");
                    return;
                }

                // Place bet (deduct)
                window.JaiDB.updateBalance(-betAmt, "withdraw", `DragonTiger Bet placed on ${selectedSide.toUpperCase()}`);
                syncBalanceUI();

                isDealing = true;
                dragontigerResultMsg.textContent = "Dealing cards...";
                dragontigerResultMsg.style.color = "white";
                dragonCardBox.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';
                tigerCardBox.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';

                setTimeout(() => {
                    const suits = ['♠', '♥', '♦', '♣'];
                    const cardValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

                    const dValIndex = Math.floor(Math.random() * 13);
                    const tValIndex = Math.floor(Math.random() * 13);

                    const dSuit = suits[Math.floor(Math.random() * 4)];
                    const tSuit = suits[Math.floor(Math.random() * 4)];

                    const dColor = (dSuit === '♥' || dSuit === '♦') ? '#ff4757' : 'white';
                    const tColor = (tSuit === '♥' || tSuit === '♦') ? '#ff4757' : 'white';

                    dragonCardBox.style.color = dColor;
                    dragonCardBox.innerHTML = `<div>${cardValues[dValIndex]}<span style="font-size:16px;">${dSuit}</span></div>`;

                    tigerCardBox.style.color = tColor;
                    tigerCardBox.innerHTML = `<div>${cardValues[tValIndex]}<span style="font-size:16px;">${tSuit}</span></div>`;

                    let gameWinner = '';
                    if (dValIndex > tValIndex) {
                        gameWinner = 'dragon';
                    } else if (tValIndex > dValIndex) {
                        gameWinner = 'tiger';
                    } else {
                        gameWinner = 'tie';
                    }

                    isDealing = false;

                    if (selectedSide === gameWinner) {
                        let multiplier = (gameWinner === 'tie') ? 9 : 2;
                        const prize = betAmt * multiplier;
                        window.JaiDB.updateBalance(prize, 'bonus', `DragonTiger Win on ${selectedSide.toUpperCase()}`);
                        syncBalanceUI();

                        dragontigerResultMsg.textContent = `YOU WON! Payout: ₹${prize} (Winner is ${gameWinner.toUpperCase()})`;
                        dragontigerResultMsg.style.color = "#2ed573";
                    } else {
                        dragontigerResultMsg.textContent = `YOU LOST! Winner is ${gameWinner.toUpperCase()}`;
                        dragontigerResultMsg.style.color = "#ff4757";
                    }
                }, 1500);
            });
        }

        // Gift Redemption Float trigger
        const floatGiftBtn = document.getElementById('floating-gift-btn');
        if (floatGiftBtn) {
            floatGiftBtn.addEventListener('click', () => {
                if (!currentUser) {
                    alert("Please log in first.");
                    window.location.href = "login.html";
                    return;
                }
                const code = prompt("Please enter your redemption gift code (Try: JAICLUB100, FREE50, MEGA200):");
                if (code === null) return;
                if (!code.trim()) {
                    alert("Please enter a valid code");
                    return;
                }

                const res = window.JaiDB.redeemGiftCode(code);
                alert(res.message);
                if (res.success) {
                    syncBalanceUI();
                }
            });
        }

        // Game category tabs switching
        const categoryPills = document.querySelectorAll('.category-pill');
        const gameGrids = document.querySelectorAll('.category-game-grid');
        const titleText = document.getElementById('category-title-text');

        categoryPills.forEach(pill => {
            pill.addEventListener('click', () => {
                const cat = pill.getAttribute('data-category');

                // Update active pill
                categoryPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                // Update Title text
                if (titleText) {
                    titleText.textContent = pill.querySelector('span').textContent;
                }

                // Toggle grids
                gameGrids.forEach(grid => {
                    if (grid.id === `grid-${cat}`) {
                        grid.style.display = 'grid';
                    } else {
                        grid.style.display = 'none';
                    }
                });
            });
        });
    }

    // ==========================================
    // 9. ADDED: INLINE BALANCE CHANGERS & ADMIN (account.html)
    // ==========================================
    if (currentPage === 'account.html') {
        const balanceArea = document.getElementById('balance-clickable-area');
        const balanceDisplayContainer = document.getElementById('balance-display-container');
        const balanceInlineInput = document.getElementById('balance-inline-input');
        const balanceRefreshIcon = document.getElementById('balance-refresh');
        const balanceEditIndicator = document.getElementById('balance-edit-indicator');

        const triggerInlineBalanceEdit = () => {
            if (!currentUser) {
                alert("Please log in first.");
                return;
            }
            if (balanceDisplayContainer && balanceInlineInput) {
                const currentBal = parseFloat(currentUser.balance).toFixed(2);
                balanceInlineInput.value = currentBal;

                balanceDisplayContainer.style.display = 'none';
                if (balanceRefreshIcon) balanceRefreshIcon.style.display = 'none';

                balanceInlineInput.style.display = 'inline-block';
                balanceInlineInput.focus();
                balanceInlineInput.select();
            }
        };

        const saveInlineBalance = () => {
            if (balanceInlineInput && balanceInlineInput.style.display !== 'none') {
                const val = parseFloat(balanceInlineInput.value);
                if (isNaN(val) || val < 0) {
                    alert("Please enter a valid positive number.");
                    balanceInlineInput.focus();
                    return;
                }

                const res = window.JaiDB.setBalance(val);
                if (res.success) {
                    syncBalanceUI();
                }

                balanceInlineInput.style.display = 'none';
                if (balanceDisplayContainer) balanceDisplayContainer.style.display = 'inline-block';
                if (balanceRefreshIcon) balanceRefreshIcon.style.display = 'inline-block';
            }
        };

        if (balanceArea) {
            let lastTap = 0;
            // Touch double-tap for phone
            balanceArea.addEventListener('touchstart', (e) => {
                if (e.target.tagName === 'INPUT') return;
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                if (tapLength < 300 && tapLength > 0) {
                    e.preventDefault();
                    triggerInlineBalanceEdit();
                }
                lastTap = currentTime;
            });

            // Click for laptop/desktop
            balanceArea.addEventListener('click', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.id === 'balance-refresh') return;
                if (e.pointerType === 'touch') return;
                triggerInlineBalanceEdit();
            });
        }

        if (balanceInlineInput) {
            balanceInlineInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    saveInlineBalance();
                } else if (e.key === 'Escape') {
                    balanceInlineInput.style.display = 'none';
                    if (balanceDisplayContainer) balanceDisplayContainer.style.display = 'inline-block';
                    if (balanceRefreshIcon) balanceRefreshIcon.style.display = 'inline-block';
                }
            });

            balanceInlineInput.addEventListener('blur', () => {
                saveInlineBalance();
            });
        }

        if (balanceEditIndicator) {
            balanceEditIndicator.addEventListener('click', triggerInlineBalanceEdit);
        }

        // Admin Portal Modal logic
        const adminModal = document.getElementById('admin-modal');
        const adminTrigger = document.getElementById('admin-panel-trigger');
        const closeAdminBtn = document.getElementById('close-admin-modal');
        const adminSaveBtn = document.getElementById('admin-save-btn');
        const adminResetBtn = document.getElementById('admin-reset-db');

        const balInput = document.getElementById('admin-balance-input');
        const commInput = document.getElementById('admin-commission-input');
        const directInput = document.getElementById('admin-direct-input');
        const teamInput = document.getElementById('admin-team-input');

        if (adminTrigger && adminModal) {
            adminTrigger.addEventListener('click', () => {
                if (!currentUser) {
                    alert("Please log in to open Admin Panel.");
                    return;
                }
                balInput.value = parseFloat(currentUser.balance).toFixed(2);
                commInput.value = parseFloat(currentUser.yesterdayCommission).toFixed(2);
                directInput.value = currentUser.directSubordinates;
                teamInput.value = currentUser.teamSubordinates;

                adminModal.style.display = 'flex';
            });
        }

        if (closeAdminBtn && adminModal) {
            closeAdminBtn.addEventListener('click', () => {
                adminModal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === adminModal) {
                adminModal.style.display = 'none';
            }
        });

        if (adminSaveBtn && currentUser) {
            adminSaveBtn.addEventListener('click', () => {
                const newBal = parseFloat(balInput.value);
                const newComm = parseFloat(commInput.value);
                const newDirect = parseInt(directInput.value);
                const newTeam = parseInt(teamInput.value);

                if (isNaN(newBal) || newBal < 0 || isNaN(newComm) || newComm < 0 || isNaN(newDirect) || newDirect < 0 || isNaN(newTeam) || newTeam < 0) {
                    alert("Please enter valid positive numbers in all fields.");
                    return;
                }

                const users = window.JaiDB.getUsers();
                const userKey = currentUser.phone || currentUser.email;
                const dbUser = users[userKey];

                if (dbUser) {
                    dbUser.balance = newBal;
                    dbUser.yesterdayCommission = newComm;
                    dbUser.directSubordinates = newDirect;
                    dbUser.teamSubordinates = newTeam;

                    if (dbUser.phone) users[dbUser.phone] = dbUser;
                    if (dbUser.email) users[dbUser.email] = dbUser;

                    localStorage.setItem("jaiclub_users", JSON.stringify(users));

                    const diff = newBal - parseFloat(currentUser.balance);
                    if (diff !== 0) {
                        window.JaiDB.addTransaction(currentUser.uid, diff, "bonus", "Admin Portal Modification", new Date().toISOString().replace('T', ' ').substring(0, 19));
                    }

                    syncBalanceUI();
                    adminModal.style.display = 'none';
                    alert("Admin changes saved successfully!");
                    window.location.reload();
                } else {
                    alert("Error: User session could not be synced.");
                }
            });
        }

        if (adminResetBtn) {
            adminResetBtn.addEventListener('click', () => {
                if (confirm("WARNING: This will reset all user profiles, balances, and history to database defaults. Proceed?")) {
                    localStorage.clear();
                    alert("Database reset successfully! Reloading page...");
                    window.location.reload();
                }
            });
        }
    }
});
