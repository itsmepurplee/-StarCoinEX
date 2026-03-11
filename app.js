/**
 * StarCoinEX - Core Application Logic
 */

const State = {
    user: {
        isLoggedIn: false,
        balance: 10000.00, // Initial balance in USDT
        portfolio: {
            BTC: 0,
            ETH: 0,
            BNB: 0
        },
        orders: []
    },
    markets: [
        { id: 'btc', name: 'BTC', fullName: 'Bitcoin', price: 65000.00, change: 2.5, color: '#F7931A', icon: '₿' },
        { id: 'eth', name: 'ETH', fullName: 'Ethereum', price: 3500.00, change: 1.8, color: '#627EEA', icon: 'Ξ' },
        { id: 'bnb', name: 'BNB', fullName: 'Binance Coin', price: 600.00, change: -0.5, color: '#F3BA2F', icon: 'B' },
        { id: 'sol', name: 'SOL', fullName: 'Solana', price: 150.00, change: 5.2, color: '#00FFA3', icon: 'S' },
        { id: 'ada', name: 'ADA', fullName: 'Cardano', price: 0.50, change: -1.2, color: '#0033AD', icon: 'A' }
    ],
    currentPage: 'home'
};

/**
 * Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    initMarketPrices();
    renderMarketHighlights();
    loadPersistedData();
    setInterval(simulateMarketPriceMovement, 3000);
});

/**
 * Navigation & Routing
 */
function showPage(pageId) {
    State.currentPage = pageId;
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(`${pageId}Page`);
    if (targetSection) {
        targetSection.classList.add('active');
        if (pageId === 'spot') {
            setTimeout(initTradingViewChart, 100);
            updateOrderBook();
        }
        if (pageId === 'markets') {
            renderMarketsPage();
        }
    }

    // Update Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('onclick').includes(`'${pageId}'`)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    window.scrollTo(0, 0);
}

/**
 * Market Data & Simulation
 */
function initMarketPrices() {
    State.markets.forEach(market => {
        updateHeroPrice(market);
    });
}

function simulateMarketPriceMovement() {
    State.markets.forEach(market => {
        const volatility = 0.0005; // 0.05%
        const change = 1 + (Math.random() * 2 - 1) * volatility;
        market.price *= change;

        // Slightly fluctuate the 24h change too
        market.change += (Math.random() * 0.2 - 0.1);

        updateHeroPrice(market);
    });
    renderMarketHighlights();
}

function updateHeroPrice(market) {
    const priceEl = document.getElementById(`hero-${market.id}-price`);
    const changeEl = document.getElementById(`hero-${market.id}-change`);

    if (priceEl) priceEl.textContent = `$ ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (changeEl) {
        changeEl.textContent = `${market.change >= 0 ? '+' : ''}${market.change.toFixed(2)}%`;
        changeEl.className = market.change >= 0 ? 'text-success text-sm font-semibold mt-2' : 'text-danger text-sm font-semibold mt-2';
    }
}

function renderMarketsPage() {
    const container = document.getElementById('full-markets-body');
    if (!container) return;

    container.innerHTML = State.markets.map(market => `
        <tr class="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors" onclick="showPage('spot')">
            <td class="py-6">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold" style="background: ${market.color}20; color: ${market.color}">${market.icon}</div>
                    <div>
                        <div class="font-bold text-lg">${market.name} / USDT</div>
                        <div class="text-sm text-secondary">${market.fullName}</div>
                    </div>
                </div>
            </td>
            <td class="py-6 mono font-bold text-lg">$ ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="py-6 ${market.change >= 0 ? 'text-success' : 'text-danger'} font-bold">
                <div class="flex items-center gap-1">
                    <i data-lucide="${market.change >= 0 ? 'trending-up' : 'trending-down'}" class="w-4 h-4"></i>
                    ${market.change >= 0 ? '+' : ''}${market.change.toFixed(2)}%
                </div>
            </td>
            <td class="py-6 mono text-secondary">$ ${(Math.random() * 1000 + 500).toFixed(2)}M</td>
            <td class="py-6 text-right">
                <button class="btn btn-primary" onclick="showPage('spot')">Trade Now</button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

/**
 * Charting Engine (Lightweight Charts)
 */
let chart, candleSeries;

function initTradingViewChart() {
    const container = document.getElementById('tv-chart-container');
    if (!container || chart) return;

    container.innerHTML = '';

    chart = LightweightCharts.createChart(container, {
        layout: {
            background: { color: 'transparent' },
            textColor: '#94a3b8',
        },
        grid: {
            vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
            horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        timeScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
        },
    });

    candleSeries = chart.addCandlestickSeries({
        upColor: '#0ecb81',
        downColor: '#f6465d',
        borderVisible: false,
        wickUpColor: '#0ecb81',
        wickDownColor: '#f6465d',
    });

    // Generate some dummy data
    const data = [];
    const now = new Date();
    for (let i = 0; i < 100; i++) {
        const time = new Date(now.getTime() - (100 - i) * 60000);
        data.push({
            time: time.getTime() / 1000,
            open: 65000 + Math.random() * 100,
            high: 65150 + Math.random() * 100,
            low: 64900 + Math.random() * 100,
            close: 65050 + Math.random() * 100,
        });
    }

    candleSeries.setData(data);

    window.addEventListener('resize', () => {
        chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
    });
}

/**
 * Auth Modals
 */
function openAuthModal(type) {
    alert(`${type.toUpperCase()} feature is coming soon! In this demo, you are currently using a simulated trading account with $10,000 USDT.`);
}

/**
 * Spot Trading Logic
 */
let currentSide = 'buy';
let selectedAsset = 'BTC';

function setSide(side) {
    currentSide = side;
    document.getElementById('buy-tab').className = side === 'buy' ? 'btn flex-1 btn-primary' : 'btn flex-1 btn-outline';
    document.getElementById('sell-tab').className = side === 'sell' ? 'btn flex-1 btn-primary' : 'btn flex-1 btn-outline';

    const submitBtn = document.getElementById('submit-order-btn');
    submitBtn.textContent = `${side === 'buy' ? 'Buy' : 'Sell'} ${selectedAsset}`;
    submitBtn.className = side === 'buy' ? 'btn btn-primary w-full py-4' : 'btn btn-danger w-full py-4';

    updateAvailableBalance();
}

function updateOrderBook() {
    const asset = State.markets.find(m => m.name === selectedAsset);
    if (!asset) return;

    const price = asset.price;
    document.getElementById('order-price').value = price.toFixed(2);
    document.getElementById('spread-display').textContent = price.toFixed(2);
    document.getElementById('spread-display').className = asset.change >= 0 ? 'text-center py-2 border-y border-white/5 my-2 mono font-bold text-lg price-up' : 'text-center py-2 border-y border-white/5 my-2 mono font-bold text-lg price-down';

    // Asks (Sellers)
    const asksContainer = document.getElementById('order-book-asks');
    let asksHTML = '';
    for (let i = 5; i > 0; i--) {
        const askPrice = price + (i * (price * 0.0001));
        const amount = (Math.random() * 2).toFixed(4);
        const fillWidth = Math.random() * 100;
        asksHTML += `
            <div class="order-book-row">
                <span class="price-down mono">${askPrice.toFixed(2)}</span>
                <span class="mono">${amount}</span>
                <div class="order-book-fill" style="width: ${fillWidth}%; background: var(--danger)"></div>
            </div>
        `;
    }
    asksContainer.innerHTML = asksHTML;

    // Bids (Buyers)
    const bidsContainer = document.getElementById('order-book-bids');
    let bidsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const bidPrice = price - (i * (price * 0.0001));
        const amount = (Math.random() * 2).toFixed(4);
        const fillWidth = Math.random() * 100;
        bidsHTML += `
            <div class="order-book-row">
                <span class="price-up mono">${bidPrice.toFixed(2)}</span>
                <span class="mono">${amount}</span>
                <div class="order-book-fill" style="width: ${fillWidth}%; background: var(--success)"></div>
            </div>
        `;
    }
    bidsContainer.innerHTML = bidsHTML;
}

function handleOrderSubmit() {
    const amount = parseFloat(document.getElementById('order-amount').value);
    const price = parseFloat(document.getElementById('order-price').value);

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const totalCost = amount * price;

    if (currentSide === 'buy') {
        if (State.user.balance < totalCost) {
            alert('Insufficient USDT balance');
            return;
        }
        State.user.balance -= totalCost;
        State.user.portfolio[selectedAsset] = (State.user.portfolio[selectedAsset] || 0) + amount;
    } else {
        if ((State.user.portfolio[selectedAsset] || 0) < amount) {
            alert(`Insufficient ${selectedAsset} balance`);
            return;
        }
        State.user.balance += totalCost;
        State.user.portfolio[selectedAsset] -= amount;
    }

    // Add to order history (simulated as executed immediately)
    State.user.orders.unshift({
        time: new Date().toLocaleTimeString(),
        side: currentSide,
        price: price,
        amount: amount,
        asset: selectedAsset,
        status: 'Executed'
    });

    savePersistedData();
    updatePortfolioUI();
    document.getElementById('order-amount').value = '';
    alert('Order executed successfully!');
}

function updatePortfolioUI() {
    const totalBalanceUsdt = document.getElementById('total-balance-usdt');
    const availableBalance = document.getElementById('available-balance');
    const portfolioList = document.getElementById('portfolio-list');

    if (availableBalance) availableBalance.textContent = `${State.user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT`;

    let estimatedTotal = State.user.balance;

    if (portfolioList) {
        portfolioList.innerHTML = Object.entries(State.user.portfolio).map(([symbol, amount]) => {
            const market = State.markets.find(m => m.name === symbol);
            const value = amount * (market ? market.price : 0);
            estimatedTotal += value;

            if (amount <= 0) return '';

            return `
                <div class="flex justify-between items-center">
                    <div>
                        <div class="font-semibold">${symbol}</div>
                        <div class="text-xs text-secondary">${amount.toFixed(4)} ${symbol}</div>
                    </div>
                    <div class="text-right">
                        <div class="mono font-semibold">$ ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div class="text-xs text-secondary">≈ ${value.toFixed(2)} USDT</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (totalBalanceUsdt) totalBalanceUsdt.textContent = `$ ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function updateAvailableBalance() {
    const label = document.getElementById('available-balance');
    if (currentSide === 'buy') {
        label.textContent = `${State.user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT`;
    } else {
        const amount = State.user.portfolio[selectedAsset] || 0;
        label.textContent = `${amount.toFixed(4)} ${selectedAsset}`;
    }
}

// Hook into the main loop
const originalSimulate = simulateMarketPriceMovement;
simulateMarketPriceMovement = function () {
    originalSimulate();
    if (State.currentPage === 'spot') {
        updateOrderBook();
    }
    updatePortfolioUI();
};

/**
 * Lucky Draw Logic
 */
let remainingSpins = 3;
let isSpinning = false;

function toggleLuckyDraw(show) {
    const modal = document.getElementById('luckyDrawModal');
    if (modal) {
        modal.style.display = show ? 'flex' : 'none';
    }
}

function spinWheel() {
    if (isSpinning || remainingSpins <= 0) return;

    isSpinning = true;
    remainingSpins--;
    document.getElementById('spins-count').textContent = remainingSpins;

    const wheel = document.getElementById('lucky-wheel');
    const spinDegrees = 1800 + Math.floor(Math.random() * 360);
    wheel.style.transform = `rotate(${spinDegrees}deg)`;

    const btn = document.getElementById('spin-btn');
    btn.disabled = true;
    btn.textContent = 'Spinning...';

    setTimeout(() => {
        isSpinning = false;
        btn.disabled = false;
        btn.textContent = remainingSpins > 0 ? 'SPIN NOW' : 'No Spins Left';

        const winMsg = document.getElementById('win-message');
        const rewards = ['0.005 BTC', '100 USDT', '0.1 ETH', 'VIP 1 Upgrade', 'Try Again', '10,000 SHIB'];
        const reward = rewards[Math.floor(Math.random() * rewards.length)];

        winMsg.textContent = reward === 'Try Again' ? 'Better luck next time!' : `Congratulations! You won ${reward}!`;
        winMsg.style.opacity = '1';

        if (reward !== 'Try Again') {
            // Add to balance or portfolio if it was a real reward
            alert(`StarCoinEX: You received ${reward}!`);
        }
    }, 3000);
}

/**
 * Persistence
 */
function savePersistedData() {
    localStorage.setItem('starcoinex_user_data', JSON.stringify(State.user));
}

function loadPersistedData() {
    const saved = localStorage.getItem('starcoinex_user_data');
    if (saved) {
        State.user = JSON.parse(saved);
    }
}
