document.addEventListener('DOMContentLoaded', () => {
    // Array to hold deal objects (simulating a database)
    let deals = [];

    // --- DOM Elements ---
    const dealForm = document.getElementById('deal-form');
    const openDealsList = document.getElementById('open-deals-list');
    const closedDealsList = document.getElementById('closed-deals-list');
    const openValueSpan = document.getElementById('open-value');
    const wonCountSpan = document.getElementById('won-count');
    const lostCountSpan = document.getElementById('lost-count');
    const openDealCountSpan = document.getElementById('open-deal-count');
    const closedDealCountSpan = document.getElementById('closed-deal-count');
    const noOpenDealsMsg = document.getElementById('no-open-deals');
    const noClosedDealsMsg = document.getElementById('no-closed-deals');

    // Helper to get formatted currency string
    const formatCurrency = (value) => {
        return `₹ ${Math.round(value).toLocaleString('en-IN')}`;
    };

    // --- Core Data Logic ---

    // 1. Calculate and Update Summary Metrics
    function updateSummary() {
        const openDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
        const closedDeals = deals.filter(d => d.stage === 'Won' || d.stage === 'Lost');
        const wonDeals = deals.filter(d => d.stage === 'Won');
        const lostDeals = deals.filter(d => d.stage === 'Lost');

        const totalOpenValue = openDeals.reduce((sum, deal) => sum + deal.value, 0);

        // Update DOM elements
        openValueSpan.textContent = formatCurrency(totalOpenValue);
        wonCountSpan.textContent = wonDeals.length;
        lostCountSpan.textContent = lostDeals.length;
        
        openDealCountSpan.textContent = openDeals.length;
        closedDealCountSpan.textContent = closedDeals.length;

        // Show/hide "No deals" messages
        noOpenDealsMsg.style.display = openDeals.length === 0 ? 'block' : 'none';
        noClosedDealsMsg.style.display = closedDeals.length === 0 ? 'block' : 'none';
    }

    // 2. Render Deals to Pipeline Columns
    function renderDeals() {
        openDealsList.innerHTML = '';
        closedDealsList.innerHTML = '';

        deals.forEach(deal => {
            const dealElement = createDealElement(deal);

            if (deal.stage === 'Won' || deal.stage === 'Lost') {
                closedDealsList.appendChild(dealElement);
            } else {
                openDealsList.appendChild(dealElement);
            }
        });

        updateSummary();
    }

    // 3. Create single Deal HTML element
    function createDealElement(deal) {
        const isClosed = deal.stage === 'Won' || deal.stage === 'Lost';
        const stageClass = deal.stage.replace(/\s/g, ''); // Remove spaces for CSS class
        const displayStage = deal.stage.replace(/([A-Z])/g, ' $1').trim(); // Add space before capitals

        const item = document.createElement('div');
        item.classList.add('deal-item', 'border', 'rounded', `border-${stageClass}`);
        item.dataset.id = deal.id;

        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div class="deal-title text-dark">${deal.client}</div>
                    <span class="deal-stage stage-${stageClass}">${displayStage}</span>
                </div>
                <div class="text-end">
                    <div class="deal-value text-dark">${formatCurrency(deal.value)}</div>
                    <small class="text-muted">Close: ${deal.closingDate}</small>
                </div>
            </div>
            <div class="deal-actions">
                ${!isClosed ? `
                    <select class="form-select form-select-sm d-inline-block w-auto me-2" 
                            onchange="updateDealStage(${deal.id}, this.value)">
                        <option value="">Update Status...</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Won">Mark Won</option>
                        <option value="Lost">Mark Lost</option>
                    </select>
                ` : `
                    <span class="badge bg-secondary">${isClosed ? 'Closed' : 'Open'} on ${deal.closingDate}</span>
                `}
                <button class="btn btn-sm btn-outline-danger" onclick="deleteDeal(${deal.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        return item;
    }

    // 4. Update Deal Status (accessible from global scope)
    window.updateDealStage = (id, newStage) => {
        if (!newStage) return;
        const dealIndex = deals.findIndex(d => d.id === id);
        if (dealIndex !== -1) {
            // Update in the array (simulating a PATCH/PUT request to backend)
            deals[dealIndex].stage = newStage;
            
            // If closed, set the closing date to today
            if (newStage === 'Won' || newStage === 'Lost') {
                deals[dealIndex].closingDate = new Date().toISOString().split('T')[0];
            }
            
            // Re-render the pipeline
            renderDeals();
            alert(`Deal updated to: ${newStage}`);
        }
    };
    
    // 5. Delete Deal (accessible from global scope)
    window.deleteDeal = (id) => {
        if (confirm('Are you sure you want to delete this deal permanently?')) {
            // Filter the deal out (simulating a DELETE request)
            deals = deals.filter(d => d.id !== id);
            renderDeals();
            alert(`Deal ${id} deleted.`);
        }
    };

    // 6. Handle Form Submission for New Deals
    function handleFormSubmit(e) {
        e.preventDefault();

        const clientName = document.getElementById('client-name').value;
        const dealValue = parseFloat(document.getElementById('deal-value').value);
        const stage = document.getElementById('stage').value;
        const closingDate = document.getElementById('closing-date').value;
        const notes = document.getElementById('notes').value;

        if (!clientName || !dealValue || !stage) {
            alert('Please fill in Client Name, Deal Value, and Stage.');
            return;
        }

        const newDeal = {
            id: Date.now(), // Unique ID
            client: clientName,
            value: dealValue,
            stage: stage,
            closingDate: closingDate || 'N/A',
            notes: notes
        };

        // Add to the list
        deals.push(newDeal);
        
        // Reset form and re-render
        dealForm.reset();
        renderDeals();
        
        alert(`New deal for ${clientName} created successfully!`);
    }

    // --- Initialization ---

    // Load initial sample data (for demonstration)
    function loadInitialData() {
        deals = [
            { id: 1, client: "Acme Innovations", value: 75000, stage: "Negotiation", closingDate: "2026-01-15", notes: "Client needs final sign-off from finance." },
            { id: 2, client: "Global Logistics Ltd.", value: 120000, stage: "Proposal Sent", closingDate: "2026-02-01", notes: "Sent Q1 package. Awaiting feedback." },
            { id: 3, client: "Startup Nexus", value: 15000, stage: "Initial Contact", closingDate: "2025-12-30", notes: "Very early stage lead. Follow up next week." },
            { id: 4, client: "Tech Corp Solutions", value: 200000, stage: "Won", closingDate: "2025-12-10", notes: "Signed and deployed!" },
            { id: 5, client: "Old Legacy Systems", value: 30000, stage: "Lost", closingDate: "2025-12-05", notes: "Budget cuts, went with cheaper competitor." },
        ];
    }
    
    // --- Event Listeners and Initial Load ---
    
    dealForm.addEventListener('submit', handleFormSubmit);

    loadInitialData();
    renderDeals();
});