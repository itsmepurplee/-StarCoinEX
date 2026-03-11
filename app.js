// State Management
let currentPrice = 64250.25;
let currentSide = 'buy';
let spinsAvailable = 3;

// Mock Market Data
const markets = [
    { symbol: 'BTC', name: 'Bitcoin', price: 64250.25, change: 2.45, vol: '2.1B' },
    { symbol: 'ETH', name: 'Ethereum', price: 3450.80, change: -1.20, vol: '850M' },
    { symbol: 'BNB', name: 'BNB', price: 580.45, change: 0.75, vol: '120M' },
    { symbol: 'SOL', name: 'Solana', price: 145.20, change: 5.30, vol: '450M' }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updatePrices();
    renderMarkets();
    renderOrderBook();
    setInterval(tickPrices, 3000);
});

// Navigation
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId + 'Page').classList.add('active');
    
    document.querySelectorAll('.nav-link, .nav-item').forEach(l => l.classList.remove('active'));
    // Simple logic to highlight nav
    event?.target?.classList?.add('active');
}

// Price Simulation
function tickPrices() {
    markets.forEach(m => {
        const change = (Math.random() - 0.5) * (m.price * 0.001);
        m.price += change;
    });
    updatePrices();
}

function updatePrices() {
    const btc = markets.find(m => m.symbol === 'BTC');
    const eth = markets.find(m => m.symbol === 'ETH');
    const bnb = markets.find(m => m.symbol === 'BNB');

    // Hero Prices
    if (document.getElementById('hero-btc-price')) {
        document.getElementById('hero-btc-price').innerText = `$ ${btc.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('hero-eth-price').innerText = `$ ${eth.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('hero-bnb-price').innerText = `$ ${bnb.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        document.getElementById('order-price').value = btc.price.toFixed(2);
    }
}

// Market List
function renderMarkets() {
    const body = document.getElementById('market-highlights-body');
    if (!body) return;
    
    body.innerHTML = markets.map(m => `
        <tr class="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer">
            <td class="py-4">
                <div class="flex items-center gap-3">
                    <span class="font-bold">${m.symbol}</span>
                    <span class="text-xs text-secondary">${m.name}</span>
                </div>
            </td>
            <td class="mono">$ ${m.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td class="${m.change >= 0 ? 'text-success' : 'text-danger'} font-semibold">
                ${m.change >= 0 ? '+' : ''}${m.change}%
            </td>
            <td class="text-right">
                <button class="btn btn-outline py-1 text-xs" onclick="showPage('spot')">Trade</button>
            </td>
        </tr>
    `).join('');
}

// Trading Logic
function setSide(side) {
    currentSide = side;
    const buyBtn = document.getElementById('buy-tab');
    const sellBtn = document.getElementById('sell-tab');
    const submitBtn = document.getElementById('submit-order-btn');

    if (side === 'buy') {
        buyBtn.className = 'btn flex-1 btn-primary';
        sellBtn.className = 'btn flex-1 btn-outline';
        submitBtn.className = 'btn btn-primary w-full py-4';
        submitBtn.innerText = 'Buy BTC';
    } else {
        buyBtn.className = 'btn flex-1 btn-outline';
        sellBtn.className = 'btn flex-1 btn-danger'; // Need to add .btn-danger to CSS or handle inline
        submitBtn.className = 'btn w-full py-4';
        submitBtn.style.backgroundColor = 'var(--danger)';
        submitBtn.style.color = 'white';
        submitBtn.innerText = 'Sell BTC';
    }
}

function handleOrderSubmit() {
    const amount = document.getElementById('order-amount').value;
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    const side = currentSide.toUpperCase();
    const price = document.getElementById('order-price').value;
    
    // Add to Open Orders
    const orderBody = document.getElementById('open-orders-body');
    const row = document.createElement('tr');
    row.className = 'border-b border-white/5';
    row.innerHTML = `
        <td class="py-2 text-secondary">${new Date().toLocaleTimeString()}</td>
        <td class="${currentSide === 'buy' ? 'text-success' : 'text-danger'} font-bold">${side}</td>
        <td class="mono">${price}</td>
        <td class="mono">${amount}</td>
        <td class="text-right"><button class="text-secondary hover:text-white" onclick="this.closest('tr').remove()">Cancel</button></td>
    `;
    orderBody.prepend(row);
    
    alert(`Order placed: ${side} ${amount} BTC at ${price} USDT`);
}

// Order Book Mock
function renderOrderBook() {
    const asks = document.getElementById('order-book-asks');
    const bids = document.getElementById('order-book-bids');
    if (!asks || !bids) return;

    let asksHtml = '';
    for(let i=0; i<5; i++) {
        const p = currentPrice + (i+1)*10;
        const a = (Math.random() * 2).toFixed(4);
        asksHtml = `<div class="flex justify-between text-xs mb-1"><span class="text-danger mono">${p.toFixed(2)}</span><span class="mono">${a}</span></div>` + asksHtml;
    }
    asks.innerHTML = asksHtml;

    let bidsHtml = '';
    for(let i=0; i<5; i++) {
        const p = currentPrice - (i+1)*10;
        const a = (Math.random() * 2).toFixed(4);
        bidsHtml += `<div class="flex justify-between text-xs mb-1"><span class="text-success mono">${p.toFixed(2)}</span><span class="mono">${a}</span></div>`;
    }
    bids.innerHTML = bidsHtml;
    
    document.getElementById('spread-display').innerText = currentPrice.toFixed(2);
}

// Lucky Draw
function toggleLuckyDraw(show) {
    const modal = document.getElementById('luckyDrawModal');
    modal.style.display = show ? 'flex' : 'none';
}

function spinWheel() {
    if (spinsAvailable <= 0) {
        alert("No spins left today! Come back tomorrow.");
        return;
    }

    const wheel = document.getElementById('lucky-wheel');
    const btn = document.getElementById('spin-btn');
    const winMsg = document.getElementById('win-message');
    
    spinsAvailable--;
    document.getElementById('spins-count').innerText = spinsAvailable;
    
    btn.disabled = true;
    const rotation = 1800 + Math.floor(Math.random() * 360);
    wheel.style.transform = `rotate(${rotation}deg)`;

    setTimeout(() => {
        btn.disabled = false;
        winMsg.innerText = "Congratulations! You won 0.0001 BTC!";
        winMsg.style.opacity = '1';
        
        // Reset message after 3s
        setTimeout(() => { winMsg.style.opacity = '0'; }, 3000);
    }, 3000);
}
