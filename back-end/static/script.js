let currentPage = 1;
let totalPages = 1;

function loadContent(type) {
    if (type === "raw") {
        currentPage = 1;
        fetchData(currentPage);
    }
    if (type === "u1") {
        loadUsecase1();
    }
    if (type === "u2") {
        loadUsecase2();
    }
    if (type === "u3") {
        loadUsecase3();
    }
    if (type === "u4") {
        loadUsecase4UI();
    }
}

function fetchData(page) {
    fetch(`/data?page=${page}`)
        .then(res => res.json())
        .then(response => {

            const data = response.data;
            totalPages = response.total_pages;
            currentPage = response.current_page;

            renderTable(data);
            renderPagination();
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
}

function renderTable(data) {

    const content = document.getElementById("content");

    if (!data || data.length === 0) {
        content.innerHTML = "<p>No data found</p>";
        return;
    }

    let table = `
        <table class="table table-bordered table-hover table-sm">
        <thead class="table-dark">
        <tr>
    `;

    // Table headers
    Object.keys(data[0]).forEach(key => {
        table += `<th>${key}</th>`;
    });

    table += "</tr></thead><tbody>";

    // Table rows
    data.forEach(row => {
        table += "<tr>";
        Object.values(row).forEach(value => {
            table += `<td>${value}</td>`;
        });
        table += "</tr>";
    });

    table += "</tbody></table>";

    content.innerHTML = table;
}

function renderPagination() {

    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    // Previous Button
    let prevClass = currentPage === 1 ? "disabled" : "";
    pagination.innerHTML += `
        <li class="page-item ${prevClass}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `;

    // Page Numbers (show limited range)
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    for (let i = start; i <= end; i++) {
        let activeClass = i === currentPage ? "active" : "";
        pagination.innerHTML += `
            <li class="page-item ${activeClass}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }

    // Next Button
    let nextClass = currentPage === totalPages ? "disabled" : "";
    pagination.innerHTML += `
        <li class="page-item ${nextClass}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `;
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;
    fetchData(page);
}

//usecase1
function loadUsecase1() {

    fetch("/usecase1")
        .then(res => res.json())
        .then(data => {

            const content = document.getElementById("content");

            content.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <canvas id="bookingsChart"></canvas>
                    </div>
                    <div class="col-md-6">
                        <canvas id="cancelChart"></canvas>
                    </div>
                </div>
                <div class="row mt-4">
                    <div class="col-md-12">
                        <canvas id="adrChart"></canvas>
                    </div>
                </div>
            `;

            createBookingsChart(data.bookings);
            createCancelChart(data.cancellations);
            createAdrChart(data.adr);
        });
}
//charts function
function createBookingsChart(bookings) {

    const labels = bookings.map(b => b.month);
    const values = bookings.map(b => b.total_bookings);

    new Chart(document.getElementById("bookingsChart"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Total Bookings",
                data: values
            }]
        }
    });
}

function createCancelChart(cancellations) {

    const labels = cancellations.map(c => c.is_canceled === 1 ? "Canceled" : "Not Canceled");
    const values = cancellations.map(c => c.total);

    new Chart(document.getElementById("cancelChart"), {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: values
            }]
        }
    });
}

function createAdrChart(adr) {

    const labels = adr.map(a => a.month);
    const values = adr.map(a => parseFloat(a.avg_adr).toFixed(2));

    new Chart(document.getElementById("adrChart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Average ADR",
                data: values,
                fill: false
            }]
        }
    });
}

//usecase2
function loadUsecase2() {

    document.getElementById("pagination").innerHTML = "";

    fetch("/get-categories")
        .then(res => res.json())
        .then(categories => {

            document.getElementById("content").innerHTML = `
                <h4 class="mb-3">Hotel Cancellation Prediction</h4>

                <form id="predictionForm" class="row g-3">

                    <!-- NUMERIC FIELDS -->

                    <div class="col-md-4">
                        <label class="form-label">Lead Time</label>
                        <input type="number" class="form-control" name="lead_time" required>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Previous Cancellations</label>
                        <input type="number" class="form-control" name="previous_cancellations" required>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">ADR</label>
                        <input type="number" step="0.01" class="form-control" name="adr" required>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Booking Changes</label>
                        <input type="number" class="form-control" name="booking_changes" required>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Special Requests</label>
                        <input type="number" class="form-control" name="total_of_special_requests" required>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Repeated Guest</label>
                        <select class="form-select" name="is_repeated_guest">
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Adults</label>
                        <input type="number" class="form-control" name="adults" required>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Children</label>
                        <input type="number" class="form-control" name="children" required>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Week Nights</label>
                        <input type="number" class="form-control" name="stays_in_week_nights" required>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Weekend Nights</label>
                        <input type="number" class="form-control" name="stays_in_weekend_nights" required>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Waiting List Days</label>
                        <input type="number" class="form-control" name="days_in_waiting_list" required>
                    </div>

                    <!-- Dynamic Categorical Dropdowns -->

                    ${buildDropdown("deposit_type", categories.deposit_type)}
                    ${buildDropdown("market_segment", categories.market_segment)}
                    ${buildDropdown("customer_type", categories.customer_type)}
                    ${buildDropdown("distribution_channel", categories.distribution_channel)}

                    <div class="col-12 text-center">
                        <button type="submit" class="btn btn-danger px-4">Predict</button>
                    </div>

                </form>

                <div id="result" class="mt-4 text-center"></div>
            `;

            document.getElementById("predictionForm")
                .addEventListener("submit", predictCancellation);
        });
}
//dynamic dropdown
function buildDropdown(name, options) {

    let optionHTML = options.map(opt =>
        `<option value="${opt}">${opt}</option>`
    ).join("");

    return `
        <div class="col-md-4">
            <label class="form-label">${name.replace("_", " ")}</label>
            <select class="form-select" name="${name}" required>
                ${optionHTML}
            </select>
        </div>
    `;
}

//prediction function for usecase2
function predictCancellation(e) {

    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Convert numeric fields to numbers
    const numericFields = [
        "lead_time",
        "previous_cancellations",
        "adr",
        "booking_changes",
        "total_of_special_requests",
        "is_repeated_guest",
        "adults",
        "children",
        "stays_in_week_nights",
        "stays_in_weekend_nights",
        "days_in_waiting_list"
    ];

    numericFields.forEach(field => {
        data[field] = Number(data[field]);
    });

    fetch("/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Prediction failed");
        }
        return res.json();
    })
    .then(result => {

        let badge = result.prediction == 1
            ? `<span class="badge bg-danger">Likely to Cancel</span>`
            : `<span class="badge bg-success">Not Likely to Cancel</span>`;

        document.getElementById("result").innerHTML = `
            <h5>Prediction Result</h5>
            ${badge}
            <p>Probability: ${result.probability}%</p>
        `;
    })
    .catch(error => {
        document.getElementById("result").innerHTML =
            `<div class="alert alert-danger">Error: ${error.message}</div>`;
    });
}

//usecase3
function loadUsecase3() {

    document.getElementById("pagination").innerHTML = "";

    document.getElementById("content").innerHTML = `

        <h4 class="mb-3">Cancellation Risk Analyzer</h4>

        <form id="riskForm" class="row g-3">

            <div class="col-md-4">
                <label class="form-label">Month</label>
                <select class="form-control" name="arrival_date_month" required>
                    <option value="">Select Month</option>
                    <option>January</option>
                    <option>February</option>
                    <option>March</option>
                    <option>April</option>
                    <option>May</option>
                    <option>June</option>
                    <option>July</option>
                    <option>August</option>
                    <option>September</option>
                    <option>October</option>
                    <option>November</option>
                    <option>December</option>
                </select>
            </div>

            <div class="col-md-4">
                <label class="form-label">Lead Time</label>
                <input type="number" class="form-control" name="lead_time" required>
            </div>

            <div class="col-md-4">
                <label class="form-label">Previous Cancellations</label>
                <input type="number" class="form-control" name="previous_cancellations" required>
            </div>

            <div class="col-md-4">
                <label class="form-label">ADR</label>
                <input type="number" step="0.01" class="form-control" name="adr" required>
            </div>

            <div class="col-md-4">
                <label class="form-label">Booking Changes</label>
                <input type="number" class="form-control" name="booking_changes" required>
            </div>

            <div class="col-md-4">
                <label class="form-label">Special Requests</label>
                <input type="number" class="form-control" name="total_of_special_requests" required>
            </div>

            <div class="col-12 text-center">
                <button type="submit" class="btn btn-danger px-4">Analyze Risk</button>
            </div>

        </form>

        <div class="mt-4">

            <h5>Prediction Result</h5>

            <p><b>Prediction:</b> <span id="prediction"></span></p>
            <p><b>Probability:</b> <span id="probability"></span></p>
            <p><b>Risk Level:</b> <span id="risk"></span></p>
            <p><b>Top Reasons:</b> <span id="reasons"></span></p>
            <p><b>Context Reasons:</b> <span id="context_reasons"></span></p>

        </div>
    `;

    document
        .getElementById("riskForm")
        .addEventListener("submit", predictRisk);
}

//usecase3 prediction of risk
function predictRisk(e) {

    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    Object.keys(data).forEach(key => {
    if (key !== "arrival_date_month") {
        data[key] = Number(data[key]);
    }
    });

    fetch("/predict_2", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {

        document.getElementById("prediction").innerText =
            result.prediction == 1 ? "Likely To Cancel" : "Not Likely To Cancel";

        document.getElementById("probability").innerText =
            result.probability + "%";

        document.getElementById("risk").innerText =
            result.risk_level;

        document.getElementById("reasons").innerText =
            result.top_reasons.join(", ");
        
        document.getElementById("context_reasons").innerText =
            result.context_reasons ? result.context_reasons.join(" | ") : "No context available";    
    })
    .catch(error => {

        document.getElementById("prediction").innerText = "Error";
        console.error(error);

    });
}
//usecase4-chart ui
function loadUsecase4UI() {

    const content = document.getElementById("content");

    content.innerHTML = `
        <h2 class="mb-4">Usecase 4: Seasonal Insights</h2>

        <div class="row mb-4">
            <div class="col-md-4">
                <label>Month</label>
                <select id="monthFilter" class="form-control">
                    <option value="All">All</option>
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                </select>
            </div>

            <div class="col-md-4">
                <label>Season</label>
                <select id="seasonFilter" class="form-control">
                    <option value="All">All</option>
                    <option value="Peak">Peak</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Low">Low</option>
                </select>
            </div>

            <div class="col-md-4 d-flex align-items-end">
                <button class="btn btn-primary w-100" onclick="loadUsecase4Data()">Apply</button>
            </div>
        </div>
        <h4>demand vs Cancellation rate</h4>
        <canvas id="demandChart"></canvas>
        <h4>Booking vs Cancellation Trend</h4>
        <canvas id="trendChart"></canvas>
        <h4>season vs total booking</h4>
        <canvas id="seasonChart" class="mt-4"></canvas>
        <h4>months vs Cancellation rate</h4>
        <canvas id="monthChart" class="mt-4"></canvas>
        <h4>peak vs off-season</h4>
        <canvas id="peakChart" class="mt-4"></canvas>
    `;
}

//usecase4-fetch data
let charts = {};
function loadUsecase4Data() {
    
    let month = document.getElementById("monthFilter").value;
    let season = document.getElementById("seasonFilter").value;

    fetch(`/usecase4?month=${month}&season=${season}`)
        .then(res => res.json())
        .then(data => {

            destroyCharts(); // avoid overlap of charts

            createDemandChart(data.demand_chart);
            createTrendChart(data.trend_chart);
            createSeasonChart(data.season_chart);
            createMonthChart(data.month_chart);
            createPeakChart(data.peak_chart);
        })
        .catch(err => console.error("Error loading data:", err));
}
//destroy chart function
function destroyCharts() {
    if (typeof charts === "undefined") {
        console.warn("charts is not defined");
        return;
    }

    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === "function") {
            chart.destroy();
        }
    });

    charts = {}; // reset
}
//-------chart functions--------
//demand chart
function createDemandChart(data) {

    charts.demand = new Chart(document.getElementById("demandChart"), {
        type: "bar",
        data: data
    });
}
//trend chart
function createTrendChart(data) {

    charts.trend = new Chart(document.getElementById("trendChart"), {
        type: "line",
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: "Total Bookings",
                    data: data.bookings,
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: "Cancellations",
                    data: data.cancellations,
                    borderWidth: 2,
                    tension: 0.3
                }
            ]
        }
    });
}
//season chart
function createSeasonChart(data) {

    charts.season = new Chart(document.getElementById("seasonChart"), {
        type: "line",
        data: data
    });
}
//month chart
function createMonthChart(data) {

    charts.month = new Chart(document.getElementById("monthChart"), {
        type: "line",
        data: data
    });
}
//peak vs off-season chart
function createPeakChart(data) {

    charts.peak = new Chart(document.getElementById("peakChart"), {
        type: "pie",
        data: data
    });
}