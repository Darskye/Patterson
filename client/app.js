// Main Dashboard Application
class ComplianceDashboard {
    constructor() {
        this.data = null;
        this.filteredData = null;
        this.map = null;
        this.charts = {};
        this.currentEditingId = null;
        this.currentUser = null;
        
        // API base URL - configure for deployed environment
        this.apiBaseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:5000' 
            : localStorage.getItem('apiBaseUrl') || 'https://patterson-production.up.railway.app';

        this.initializeEventListeners();
        this.initializeUser();
        this.loadData();
    }

    initializeEventListeners() {
        // Upload buttons
        document.getElementById('uploadBtn').addEventListener('click', () => this.triggerFileUpload());
        document.getElementById('uploadBtnEmpty').addEventListener('click', () => this.triggerFileUpload());
        document.getElementById('uploadArea').addEventListener('click', () => this.triggerFileUpload());
        document.getElementById('uploadArea').addEventListener('dragover', (e) => this.handleDragOver(e));
        document.getElementById('uploadArea').addEventListener('drop', (e) => this.handleDrop(e));
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportToExcel());

        // Download all plants button (optional)
        const downloadAllPlantsBtn = document.getElementById('downloadAllPlantsBtn');
        if (downloadAllPlantsBtn) {
            downloadAllPlantsBtn.addEventListener('click', () => this.downloadAllPlantPackages());
        }

        // Alerts and messages
        document.getElementById('alertsBtn')?.addEventListener('click', () => this.showAlerts());
        document.getElementById('messagesBtn')?.addEventListener('click', () => this.showMessages());
        document.getElementById('backToDashboardBtn')?.addEventListener('click', () => this.showDashboard());
        document.getElementById('backToDashboardBtnMsg')?.addEventListener('click', () => this.showDashboard());
        document.getElementById('addGeneralAlertBtn')?.addEventListener('click', () => this.addGeneralAlert());
        document.getElementById('sendMessageBtn')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('chatMessageInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        });

        const alertsList = document.getElementById('alertsList');
        if (alertsList) {
            alertsList.addEventListener('click', (event) => this.handleAlertAction(event));
        }

        // User select
        document.querySelectorAll('.user-select').forEach(button => {
            button.addEventListener('click', () => this.setCurrentUser(button.dataset.user));
        });

        // Search and filter
        document.getElementById('searchInput')?.addEventListener('input', () => this.filterTable());
        document.getElementById('filterStatus')?.addEventListener('change', () => this.filterTable());

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('editForm').addEventListener('submit', (e) => this.saveChanges(e));
        document.getElementById('downloadReportBtn').addEventListener('click', () => this.downloadPlantReport());
        document.getElementById('downloadAllBtn').addEventListener('click', () => this.downloadAllFiles());
        document.getElementById('uploadFileBtn').addEventListener('click', () => this.triggerPlantFileUpload());
        document.getElementById('plantFileInput').addEventListener('change', (e) => this.handlePlantFileUpload(e));

        // Close modal on background click
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') this.closeModal();
        });
    }

    initializeUser() {
        const userModal = document.getElementById('userModal');
        if (userModal) {
            userModal.classList.add('active');
        }
    }

    setCurrentUser(user) {
        this.currentUser = user;
        document.getElementById('userModal').classList.remove('active');
        this.updateUserUI();
    }

    updateUserUI() {
        const badge = document.getElementById('currentUserBadge');
        if (badge) {
            badge.textContent = `User: ${this.currentUser}`;
        }

        const messagesBtn = document.getElementById('messagesBtn');
        if (messagesBtn) {
            messagesBtn.style.display = this.currentUser === 'Ben' ? 'none' : 'inline-flex';
        }

        if (this.currentUser === 'Ben') {
            const messagesSection = document.getElementById('messagesSection');
            if (messagesSection) {
                messagesSection.style.display = 'none';
            }
        }

    }

    async loadData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/data`);
            if (response.ok) {
                this.data = await response.json();
                this.filteredData = [...this.data];
                this.showDashboard();
                this.renderDashboard();
            } else {
                this.showUploadSection();
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.showUploadSection();
        }
    }

    triggerFileUpload() {
        document.getElementById('fileInput').click();
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.style.backgroundColor = 'rgba(26, 155, 142, 0.15)';
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.style.backgroundColor = '';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.uploadFile(files[0]);
        }
    }

    async handleFileUpload(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.uploadFile(files[0]);
        }
    }

    async uploadFile(file) {
        if (!file.name.match(/\.(xlsx|xls)$/)) {
            alert('Please select a valid Excel file (.xlsx or .xls)');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            this.showLoading();
            const response = await fetch(`${this.apiBaseUrl}/api/upload`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                this.data = result.data;
                this.filteredData = [...this.data];
                this.showDashboard();
                this.renderDashboard();
                alert(result.message);
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            alert(`Upload failed: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    async exportToExcel() {
        try {
            this.showLoading();
            const response = await fetch(`${this.apiBaseUrl}/api/export`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Tier2_Compliance_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            alert(`Export failed: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    async downloadAllPlantPackages() {
        try {
            this.showLoading();
            const response = await fetch(`${this.apiBaseUrl}/api/export-all-plants`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `All_Plants_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            alert(`Failed to download all plants: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    showDashboard() {
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        document.getElementById('alertsSection').style.display = 'none';
        document.getElementById('messagesSection').style.display = 'none';
    }

    showUploadSection() {
        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'none';
        document.getElementById('alertsSection').style.display = 'none';
        document.getElementById('messagesSection').style.display = 'none';
    }

    showAlerts() {
        document.getElementById('dashboardSection').style.display = 'none';
        document.getElementById('alertsSection').style.display = 'block';
        document.getElementById('messagesSection').style.display = 'none';
        this.loadAlerts();
    }

    showMessages() {
        if (this.currentUser === 'Ben') return;
        document.getElementById('dashboardSection').style.display = 'none';
        document.getElementById('alertsSection').style.display = 'none';
        document.getElementById('messagesSection').style.display = 'block';
        this.loadMessages();
    }

    async renderDashboard() {
        await this.updateSummaryCards();
        this.renderCharts();
        this.renderMap();
        this.renderTable();
    }

    async updateSummaryCards() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/summary`);
            if (!response.ok) throw new Error('Failed to fetch summary');
            const summary = await response.json();

            document.getElementById('totalPlants').textContent = summary.total_plants;
            document.getElementById('completedReports').textContent = summary.reporting_status.completed;
            document.getElementById('inProgressReports').textContent = summary.reporting_status.in_progress;
            document.getElementById('overdueReports').textContent = 
                summary.reporting_status.not_started + summary.reporting_status.overdue;
            document.getElementById('statesCovered').textContent = summary.states;

            const completedPercent = Math.round(
                (summary.reporting_status.completed / summary.total_plants) * 100
            );
            document.getElementById('completedPercent').textContent = `${completedPercent}%`;
        } catch (error) {
            console.error('Error updating summary cards:', error);
        }
    }

    renderCharts() {
        this.renderReportingStatusChart();
        this.renderReporterChart();
        this.renderFilingFeeChart();
        this.renderStateChart();
    }

    renderReportingStatusChart() {
        const statusCounts = {
            'Completed': 0,
            'In Progress': 0,
            'Not Started': 0
        };

        this.data.forEach(plant => {
            const status = plant.reporting_status || 'Not Started';
            if (status.includes('Complete')) statusCounts['Completed']++;
            else if (status.includes('Progress')) statusCounts['In Progress']++;
            else statusCounts['Not Started']++;
        });

        const ctx = document.getElementById('reportingStatusChart').getContext('2d');
        
        if (this.charts.reportingStatus) {
            this.charts.reportingStatus.destroy();
        }

        this.charts.reportingStatus = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        '#27ae60',  // Completed - Green
                        '#f39c12',  // In Progress - Orange
                        '#e74c3c'   // Not Started - Red
                    ],
                    borderColor: '#0F1415',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#FFFFFF',
                            padding: 20,
                            font: { size: 13, weight: 'bold' }
                        }
                    }
                }
            }
        });
    }

    renderReporterChart() {
        const reporterCounts = { 'Yes': 0, 'No': 0, 'Pending': 0 };

        this.data.forEach(plant => {
            const reporter = plant.reporter_2025 ? String(plant.reporter_2025).trim() : 'Pending';
            if (reporter.toLowerCase().includes('yes')) reporterCounts['Yes']++;
            else if (reporter.toLowerCase().includes('no')) reporterCounts['No']++;
            else reporterCounts['Pending']++;
        });

        const ctx = document.getElementById('reporterChart').getContext('2d');
        
        if (this.charts.reporter) {
            this.charts.reporter.destroy();
        }

        this.charts.reporter = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(reporterCounts),
                datasets: [{
                    data: Object.values(reporterCounts),
                    backgroundColor: [
                        '#1A9B8E',  // Yes - Teal
                        '#e74c3c',  // No - Red
                        '#f39c12'   // Pending - Orange
                    ],
                    borderColor: '#0F1415',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#FFFFFF',
                            padding: 20,
                            font: { size: 13, weight: 'bold' }
                        }
                    }
                }
            }
        });
    }

    renderFilingFeeChart() {
        const feeCounts = { 'Paid': 0, 'Not Paid': 0 };
        const totalFees = { paid: 0, total: 0 };

        this.data.forEach(plant => {
            const fee = parseFloat(plant.filing_fee) || 0;
            totalFees.total += fee;
            if (fee > 0) {
                feeCounts['Paid']++;
                totalFees.paid += fee;
            } else {
                feeCounts['Not Paid']++;
            }
        });

        const ctx = document.getElementById('filingFeeChart').getContext('2d');
        
        if (this.charts.filingFee) {
            this.charts.filingFee.destroy();
        }

        this.charts.filingFee = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Fees Collected', 'Fees Outstanding'],
                datasets: [{
                    label: 'Dollar Amount',
                    data: [totalFees.paid, totalFees.total - totalFees.paid],
                    backgroundColor: [
                        '#27ae60',  // Paid - Green
                        '#e74c3c'   // Outstanding - Red
                    ],
                    borderColor: '#0F1415',
                    borderWidth: 1.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            color: '#FFFFFF',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#FFFFFF', font: { size: 13, weight: 'bold' } }
                    }
                }
            }
        });
    }

    renderStateChart() {
        const stateCounts = {};

        this.data.forEach(plant => {
            const state = plant.state || 'Unknown';
            stateCounts[state] = (stateCounts[state] || 0) + 1;
        });

        const sortedStates = Object.entries(stateCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);

        const ctx = document.getElementById('stateChart').getContext('2d');
        
        if (this.charts.state) {
            this.charts.state.destroy();
        }

        this.charts.state = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedStates.map(s => s[0]),
                datasets: [{
                    label: 'Plants per State',
                    data: sortedStates.map(s => s[1]),
                    backgroundColor: '#1A9B8E',
                    borderColor: '#0F6B63',
                    borderWidth: 1.5
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#FFFFFF', font: { size: 13, weight: 'bold' } }
                    }
                }
            }
        });
    }

    renderMap() {
        const mapElement = document.getElementById('map');
        
        if (this.map) {
            this.map.remove();
        }

        // Initialize map centered on US
        this.map = L.map('map').setView([39.8283, -98.5795], 4);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add markers for each plant
        this.data.forEach(plant => {
            if (plant.state && stateCoordinates[plant.state]) {
                const coords = stateCoordinates[plant.state];
                
                // Determine color based on status
                let color = '#e74c3c';  // Red - Not Started
                if (plant.reporting_status?.includes('Complete')) {
                    color = '#27ae60';  // Green - Completed
                } else if (plant.reporting_status?.includes('Progress')) {
                    color = '#f39c12';  // Orange - In Progress
                }

                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.5);"></div>`,
                    iconSize: [24, 24]
                });

                // Build full address for popup
                const fullAddressDisplay = plant.address_only ? 
                    `${plant.address_only.trim()}<br>${plant.city}, ${plant.state}` :
                    `${plant.city}, ${plant.state}`;

                const marker = L.marker([coords.lat, coords.lng], { icon })
                    .bindPopup(`
                        <div style="min-width: 220px;">
                            <strong style="font-size: 14px;">${plant.plant_name}</strong><br>
                            <small style="color: #666;">${fullAddressDisplay}</small><br><br>
                            <strong>Status:</strong> ${plant.reporting_status || 'Unknown'}<br>
                            <strong>Filing Fee:</strong> $${(plant.filing_fee || 0).toFixed(2)}<br>
                            ${plant.client_notes ? `<strong>Client Notes:</strong> ${plant.client_notes}<br>` : ''}
                            ${plant.notes ? `<strong>Notes:</strong> ${plant.notes}` : ''}
                        </div>
                    `)
                    .addTo(this.map);
            }
        });
    }

    renderTable() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        this.filteredData.forEach(plant => {
            const row = document.createElement('tr');
            const statusClass = this.getStatusClass(plant.reporting_status);

            const hasAlert = plant.notes && plant.notes.trim().length > 0;

            row.innerHTML = `
                <td><strong>${plant.plant_name}</strong>${hasAlert ? ' <span class="alert-icon" title="Alert: notes present">⚠️</span>' : ''}</td>
                <td>${plant.city}, ${plant.state}</td>
                <td><span class="status-badge ${statusClass}">${plant.reporting_status || 'Not Started'}</span></td>
                <td>${plant.filing_fee > 0 ? '$' + plant.filing_fee.toFixed(2) : 'Not Paid'}</td>
                <td>${plant.reporter_2025 || 'Unknown'}</td>
                <td>${plant.client_notes ? '📝 ' + plant.client_notes.substring(0, 25) + '...' : '-'}</td>
                <td>
                    <button class="edit-btn" onclick="dashboard.openEditModal(${plant.id})" title="Edit plant details">✏️ Edit</button>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    async loadAlerts() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/alerts`);
            if (!response.ok) {
                throw new Error('Failed to load alerts');
            }
            const alerts = await response.json();
            this.renderAlerts(alerts);
            this.updateAlertBadge(alerts);
        } catch (error) {
            console.error('Error loading alerts:', error);
        }
    }

    renderAlerts(alerts) {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;

        if (!alerts || alerts.length === 0) {
            alertsList.innerHTML = '<div class="alert-item"><div>No alerts found.</div></div>';
            return;
        }

        alertsList.innerHTML = alerts.map(alert => {
            const meta = alert.type === 'general'
                ? `General • ${alert.createdBy || 'System'}`
                : `Plant • ${alert.plantName}`;
            const resolvedLabel = alert.resolved ? 'Resolved' : 'Open';
            const resolveBtnLabel = alert.resolved ? 'Reopen' : 'Resolve';
            const canResolve = this.currentUser === 'Darian';
            const responses = alert.responses || [];
            return `
                <div class="alert-item" data-alert-id="${alert.id}" data-alert-type="${alert.type}">
                    <div>
                        <div class="alert-message">${alert.message}</div>
                        <div class="alert-meta">${meta} • ${resolvedLabel}</div>
                        <div class="alert-responses">
                            ${responses.length ? responses.map(response => {
                                const icon = this.getResponderIcon(response.responder);
                                return `<div>${icon} <strong>${response.responder}:</strong> <span class="alert-response-message">${response.message}</span></div>`;
                            }).join('') : '<div>No responses yet.</div>'}
                        </div>
                        <div class="alert-response-form" style="display: none;">
                            <textarea placeholder="Type response... (Shift+Enter for new line)"></textarea>
                            <button class="btn btn-secondary btn-small alert-send-btn">Send</button>
                        </div>
                    </div>
                    <div class="alert-actions">
                        <button class="btn btn-secondary btn-small alert-respond-btn">Respond</button>
                        ${canResolve ? `<button class="btn btn-secondary btn-small alert-resolve-btn">${resolveBtnLabel}</button>` : ''}
                        ${canResolve ? `<button class="btn btn-secondary btn-small alert-delete-btn">Delete</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    handleAlertAction(event) {
        const item = event.target.closest('.alert-item');
        if (!item) return;

        const alertId = item.dataset.alertId;
        const alertType = item.dataset.alertType;

        if (event.target.classList.contains('alert-respond-btn')) {
            const form = item.querySelector('.alert-response-form');
            if (form) {
                form.style.display = form.style.display === 'none' ? 'flex' : 'none';
            }
            return;
        }

        if (event.target.classList.contains('alert-send-btn')) {
            event.preventDefault();
            const input = item.querySelector('.alert-response-form textarea');
            if (input && input.value.trim()) {
                this.sendAlertResponse(alertType, alertId, input.value.trim());
                input.value = '';
            }
            return;
        }

        if (event.target.classList.contains('alert-resolve-btn')) {
            const shouldResolve = event.target.textContent.trim() !== 'Reopen';
            this.resolveAlert(alertType, alertId, shouldResolve);
            return;
        }

        if (event.target.classList.contains('alert-delete-btn')) {
            if (confirm('Delete this alert? This cannot be undone.')) {
                this.deleteAlert(alertType, alertId);
            }
        }
    }

    async sendAlertResponse(alertType, alertId, message) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/alerts/${alertType}/${alertId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    responder: this.currentUser || 'System',
                    message
                })
            });
            if (!response.ok) {
                throw new Error('Failed to respond to alert');
            }
            this.loadAlerts();
        } catch (error) {
            console.error('Error responding to alert:', error);
        }
    }

    async resolveAlert(alertType, alertId, resolved) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/alerts/${alertType}/${alertId}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resolved,
                    resolvedBy: this.currentUser || 'System'
                })
            });
            if (!response.ok) {
                throw new Error('Failed to update alert');
            }
            this.loadAlerts();
        } catch (error) {
            console.error('Error resolving alert:', error);
        }
    }

    async deleteAlert(alertType, alertId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/alerts/${alertType}/${alertId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deletedBy: this.currentUser || 'System'
                })
            });
            if (!response.ok) {
                throw new Error('Failed to delete alert');
            }
            this.showToast('Alert deleted');
            this.loadAlerts();
        } catch (error) {
            console.error('Error deleting alert:', error);
        }
    }

    updateAlertBadge(alerts, silent = false) {
        const badge = document.getElementById('alertsBadge');
        if (!badge) return;

        const unresolvedCount = alerts.filter(alert => !alert.resolved).length;
        badge.textContent = unresolvedCount;
        badge.style.display = 'inline-flex';

        if (silent && unresolvedCount > this.lastAlertCount && this.lastAlertCount !== 0) {
        }
        this.lastAlertCount = unresolvedCount;
    }

    getResponderIcon(responder) {
        if (!responder) return '💬';
    updateAlertBadge(alerts) {
        if (name === 'darian') return '<span class="avatar avatar-d">D</span>';
        if (name === 'loren') return '<span class="avatar avatar-l">L</span>';
        return '<span class="avatar">?</span>';
    }

    showToast(message) {
        toast.textContent = message;
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input.value.trim(),
                    createdBy: this.currentUser || 'System'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add alert');
            }

            input.value = '';
            this.loadAlerts();
        } catch (error) {
            console.error('Error adding alert:', error);
        }
    }

    async loadMessages() {
        if (!this.currentUser || this.currentUser === 'Ben') return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/messages?user=${encodeURIComponent(this.currentUser)}`);
            if (!response.ok) {
                throw new Error('Failed to load messages');
            }
            const messages = await response.json();
            this.renderMessages(messages);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    renderMessages(messages) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        if (!messages || messages.length === 0) {
            chatMessages.innerHTML = '<div class="alert-meta">No messages yet.</div>';
            return;
        }

        chatMessages.innerHTML = messages.map(message => {
            const isSelf = message.sender.toLowerCase() === this.currentUser.toLowerCase();
            return `
                <div class="chat-message ${isSelf ? 'self' : 'other'}">
                    <div>${message.body}</div>
                </div>
            `;
        }).join('');

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async sendMessage() {
        if (!this.currentUser || this.currentUser === 'Ben') return;

        const input = document.getElementById('chatMessageInput');
        if (!input || !input.value.trim()) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: this.currentUser,
                    body: input.value.trim()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            input.value = '';
            this.loadMessages();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    getStatusClass(status) {
        if (!status) return 'status-not-started';
        if (status.includes('Complete')) return 'status-completed';
        if (status.includes('Progress')) return 'status-in-progress';
        if (status.includes('Overdue')) return 'status-overdue';
        return 'status-not-started';
    }

    filterTable() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('filterStatus').value;

        this.filteredData = this.data.filter(plant => {
            const matchesSearch = 
                plant.plant_name.toLowerCase().includes(searchTerm) ||
                plant.city.toLowerCase().includes(searchTerm) ||
                plant.state.toLowerCase().includes(searchTerm);

            const matchesStatus = !statusFilter || plant.reporting_status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        this.renderTable();
    }

    openEditModal(id) {
        this.currentEditingId = id;
        const plant = this.data.find(p => p.id === id);

        if (plant) {
            document.getElementById('editPlantName').value = plant.plant_name;
            document.getElementById('editReportingStatus').value = plant.reporting_status || 'Not Started';
            document.getElementById('editFilingFee').value = plant.filing_fee || 0;
            document.getElementById('editReporter2025').value = plant.reporter_2025 || 'Pending';
            document.getElementById('editAdditionalFee').value = plant.additional_fee || 'None';
            document.getElementById('editAdditionalSteps').value = plant.additional_steps || '';
            document.getElementById('editNotes').value = plant.notes || '';
            document.getElementById('editClientNotes').value = plant.client_notes || '';

            document.getElementById('editModal').classList.add('active');
            this.loadPlantFiles();
        }
    }

    async loadPlantFiles() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/plant/${this.currentEditingId}/files`);
            if (response.ok) {
                const files = await response.json();
                this.renderFilesList(files);
            }
        } catch (error) {
            console.error('Error loading files:', error);
        }
    }

    renderFilesList(files) {
        const filesList = document.getElementById('filesList');
        const plantId = this.currentEditingId;
        
        if (!files || files.length === 0) {
            filesList.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px; margin: 0;">No files attached</p>';
            return;
        }

        filesList.innerHTML = files.map(file => `
            <div class="file-item">
                <div class="file-info">
                    <div class="file-name">📄 ${file.originalName}</div>
                    <div class="file-meta">${(file.fileSize / 1024).toFixed(1)} KB • ${new Date(file.uploadDate).toLocaleDateString()}</div>
                </div>
                <div class="file-actions">
                    <button type="button" class="file-btn" onclick="dashboard.downloadPlantFile(${plantId}, ${file.id})">⬇️</button>
                    <button type="button" class="file-btn file-btn-delete" onclick="dashboard.deletePlantFile(${plantId}, ${file.id})">✕</button>
                </div>
            </div>
        `).join('');
    }

    triggerPlantFileUpload() {
        document.getElementById('plantFileInput').click();
    }

    async handlePlantFileUpload(e) {
        const files = e.target.files;
        if (files.length > 0) {
            await this.uploadPlantFile(files[0]);
        }
    }

    async uploadPlantFile(file) {
        try {
            this.showLoading();
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${this.apiBaseUrl}/api/plant/${this.currentEditingId}/files`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                this.loadPlantFiles();
                // Reset file input
                document.getElementById('plantFileInput').value = '';
                alert(`File "${file.name}" uploaded successfully!`);
            } else {
                const error = await response.json();
                alert(`Upload failed: ${error.error}`);
            }
        } catch (error) {
            alert(`Upload failed: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    async downloadPlantFile(plantId, fileId) {
        try {
            window.location.href = `/api/plant/${plantId}/files/${fileId}/download`;
        } catch (error) {
            alert(`Download failed: ${error.message}`);
        }
    }

    async deletePlantFile(plantId, fileId) {
        if (confirm('Are you sure you want to delete this file?')) {
            try {
                this.showLoading();
                const response = await fetch(`${this.apiBaseUrl}/api/plant/${plantId}/files/${fileId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    this.loadPlantFiles();
                    alert('File deleted successfully');
                } else {
                    const error = await response.json();
                    alert(`Delete failed: ${error.error}`);
                }
            } catch (error) {
                alert(`Delete failed: ${error.message}`);
            } finally {
                this.hideLoading();
            }
        }
    }

    async downloadPlantReport(plantId) {
        try {
            this.showLoading();
            const id = plantId || this.currentEditingId;
            const response = await fetch(`${this.apiBaseUrl}/api/plant/${id}/report`);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const plant = this.data.find(p => p.id === id);
                a.download = `${plant.plant_name}_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to download report');
            }
        } catch (error) {
            alert(`Download failed: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    async downloadAllFiles() {
        try {
            this.showLoading();
            const response = await fetch(`${this.apiBaseUrl}/api/plant/${this.currentEditingId}/download-all`);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const plant = this.data.find(p => p.id === this.currentEditingId);
                a.download = `${plant.plant_name}_Complete_${new Date().toISOString().split('T')[0]}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to download files');
            }
        } catch (error) {
            alert(`Download failed: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    closeModal() {
        document.getElementById('editModal').classList.remove('active');
        this.currentEditingId = null;
    }

    async saveChanges(e) {
        e.preventDefault();

        const updates = {
            reporting_status: document.getElementById('editReportingStatus').value,
            filing_fee: parseFloat(document.getElementById('editFilingFee').value) || 0,
            reporter_2025: document.getElementById('editReporter2025').value,
            additional_fee: document.getElementById('editAdditionalFee').value,
            additional_steps: document.getElementById('editAdditionalSteps').value,
            notes: document.getElementById('editNotes').value,
            client_notes: document.getElementById('editClientNotes').value
        };

        try {
            this.showLoading();
                const response = await fetch(`${this.apiBaseUrl}/api/data/${this.currentEditingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                // Update local data
                const plant = this.data.find(p => p.id === this.currentEditingId);
                Object.assign(plant, updates);
                this.filteredData = [...this.data];

                this.closeModal();
                this.renderDashboard();
                alert('Plant record updated successfully!');
            } else {
                alert('Failed to update plant record');
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        document.getElementById('loading').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading').classList.remove('active');
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new ComplianceDashboard();
});
