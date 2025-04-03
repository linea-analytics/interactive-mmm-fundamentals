
// OLS -----------------------

const ctx1 = document.getElementById('regressionChart').getContext('2d');
const xValues = Array.from({ length: 10 }, (_, i) => i * 1000);
let slope = 2;
let intercept = 10000;

const originalYValues = xValues.map(x => 2 * x + 10000 + ((Math.random() - .5) * 5000));

function generateRegressionLine(slope, intercept) {
    return xValues.map(x => slope * x + intercept);
}

let regressionYValues = generateRegressionLine(slope, intercept);

const regressionChart = new Chart(ctx1, {
    type: 'scatter',
    data: {
        datasets: [
            {
                label: 'Sales vs Media Spend (Points)',
                data: xValues.map((x, i) => ({ x: x, y: originalYValues[i] })),
                backgroundColor: 'rgba(75, 192, 192, 1)',
                showLine: false
            },
            {
                label: 'Adjustable Regression Line',
                data: xValues.map((x, i) => ({ x: x, y: regressionYValues[i] })),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                type: 'line',
                fill: false
            }
        ]
    },
    options: {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: {
                    display: true,
                    text: 'Media Spend'
                },
                grid: { display: false },
                min: 0,
                max: 9000
            },
            y: {
                title: {
                    display: true,
                    text: 'Sales'
                },
                grid: { display: false },
                min: 0,
                max: 40000
            }
        },
        animation: {
            duration: 10,
            easing: 'easeInOutQuad',
        }
    },
    plugins: [{
        afterDatasetsDraw: function (chart) {
            const ctx = chart.ctx;
            chart.data.datasets[0].data.forEach((point, i) => {
                const actualY = chart.scales.y.getPixelForValue(point.y);
                const predictedY = chart.scales.y.getPixelForValue(regressionYValues[i]);
                const x = chart.scales.x.getPixelForValue(point.x);
                const residual = Math.abs(actualY - predictedY);
                const squareSize = residual;

                ctx.save();
                ctx.beginPath();
                ctx.rect(x - squareSize, Math.min(actualY, predictedY), squareSize, residual);
                ctx.fillStyle = 'rgba(54, 162, 235, 0.5)';
                ctx.fill();
                ctx.closePath();
                ctx.restore();
            });
        }
    }]
});

function updateChart1() {
    slope = parseFloat(document.getElementById('slope').value);
    intercept = parseFloat(document.getElementById('intercept').value);
    document.getElementById('slopeSales').textContent = slope;
    document.getElementById('interceptSales').textContent = intercept;
    document.getElementById('olsIntercept').innerHTML = intercept;
    document.getElementById('olsCoef').innerHTML = slope;

    regressionYValues = generateRegressionLine(slope, intercept);
    regressionChart.data.datasets[1].data = xValues.map((x, i) => ({ x: x, y: regressionYValues[i] }));
    regressionChart.update();
}

document.getElementById('slope').addEventListener('input', updateChart1);
document.getElementById('intercept').addEventListener('input', updateChart1);

function graduallyMoveSlider(sliderId, targetValue, step, delay, callback) {
    const slider = document.getElementById(sliderId);
    let currentValue = parseFloat(slider.value);
    const direction = targetValue > currentValue ? 1 : -1;

    function moveStep() {
        if ((direction === 1 && currentValue < targetValue) || (direction === -1 && currentValue > targetValue)) {
            currentValue += direction * step;
            slider.value = Math.round(currentValue * 10) / 10;
            document.getElementById(sliderId + 'Sales').textContent = slider.value;
            updateChart1();
            setTimeout(moveStep, delay);
        } else {
            callback();
        }
    }
    moveStep();
}

document.getElementById('resetButton1').addEventListener('click', function () {
    graduallyMoveSlider('slope', 2, 0.1, 10, function () {
        graduallyMoveSlider('intercept', 10000, 100, 5, function () {
            updateChart1();
        });
    });
});


// Time Series -----------------------

const mediaSpendTs = [0, 0, 0, 0, 0, 10000, 0, 0, 0, 5000, 15000, 0, 0, 0, 0];
const noise = Array.from({ length: mediaSpendTs.length }, () => Math.random() * 2000 - 1000);

let b = 2;
let baseTs = 10000;

function calculateMediaContribution() {
    return mediaSpendTs.map(value => value * b);
}

const fixedSales = mediaSpendTs.map((value, i) => value * 2 + 10000 + noise[i]);
let mediaContributionTs = calculateMediaContribution();

const ctx2 = document.getElementById('olsChart').getContext('2d');
const olsChart = new Chart(ctx2, {
    type: 'bar',
    data: {
        labels: Array.from({ length: mediaSpendTs.length }, (_, i) => `Week ${i + 1}`),
        datasets: [
            {
                label: 'Base',
                data: Array(mediaSpendTs.length).fill(baseTs),
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                stack: 'Stack 0'
            },
            {
                label: 'Media Contribution',
                data: mediaContributionTs,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                stack: 'Stack 0'
            },
            {
                label: 'Sales',
                data: fixedSales,
                type: 'line',
                fill: false,
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)'
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                stacked: true,
                grid: { display: false }
            },
            y: {
                beginAtZero: true,
                stacked: true,
                min: 0,
                max: 60000,
                title: {
                    display: true,
                    text: 'Sales'
                },
                grid: { display: false }
            }
        }
    }
});

function updateChart2() {
    b = parseFloat(document.getElementById('tsCoefficient').value);
    base = parseFloat(document.getElementById('tsBase').value);

    document.getElementById('olsTsCoef').textContent = b;
    document.getElementById('olsTsIntercept').textContent = base;
    document.getElementById('bValue').textContent = b;
    document.getElementById('baseValue').textContent = base;

    mediaContribution = calculateMediaContribution();
    olsChart.data.datasets[0].data = Array(mediaSpendTs.length).fill(base);
    olsChart.data.datasets[1].data = mediaContributionTs;

    olsChart.update();
}

function resetSliders() {
    document.getElementById('tsCoefficient').value = 2;
    document.getElementById('tsBase').value = 10000;
    document.getElementById('bValue').textContent = 2;
    document.getElementById('baseValue').textContent = 10000;
    updateChart2();
}

document.getElementById('tsCoefficient').addEventListener('input', updateChart2);
document.getElementById('tsBase').addEventListener('input', updateChart2);
document.getElementById('resetButton2').addEventListener('click', resetSliders);


// Adstock -----------------------

const mediaSpendAds = [0, 0, 0, 0, 20000, 0, 0, 0, 0, 10000, 0, 0, 0, 0];
const baseValueAds = 10000;
let rateAds = 0.5;

function adstock(media, rate) {
    let result = [];
    let carryover = 0;
    for (let i = 0; i < media.length; i++) {
        const contribution = media[i] + carryover * rate;
        result.push(contribution);
        carryover = contribution;
    }
    return result;
}

function calculateMediaContributionAds(rate) {
    return adstock(mediaSpendAds, rate);
}

const salesAds = calculateMediaContributionAds(0.5).map(c => baseValueAds + c);
let mediaContributionAds = calculateMediaContributionAds(rateAds);

const ctx3 = document.getElementById('adstockChart').getContext('2d');
const adstockChart = new Chart(ctx3, {
    type: 'bar',
    data: {
        labels: Array.from({ length: mediaSpendAds.length }, (_, i) => `Week ${i + 1}`),
        datasets: [
            {
                label: 'Base',
                data: Array(mediaSpendAds.length).fill(baseValueAds),
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                stack: 'Stack 0'
            },
            {
                label: 'Media Contribution',
                data: mediaContributionAds,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                stack: 'Stack 0'
            },
            {
                label: 'Sales',
                data: salesAds,
                type: 'line',
                fill: false,
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)'
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                stacked: true,
                grid: { display: false }
            },
            y: {
                beginAtZero: true,
                stacked: true,
                min: 0,
                max: 40000,
                title: {
                    display: true,
                    text: 'Sales'
                },
                grid: { display: false }
            }
        }
    }
});

function updateChart3() {
    rate = parseFloat(document.getElementById('rate').value);
    document.getElementById('rateValue').textContent = (rate * 100).toFixed(0) + "%";
    const adsRate = document.getElementById('adsRate');
    adsRate.textContent = (rate * 100).toFixed(0) + "%";
    mediaContribution = calculateMediaContributionAds(rate);
    adstockChart.data.datasets[1].data = mediaContribution;
    adstockChart.update();
}

document.getElementById('rate').addEventListener('input', updateChart3);

// Diminishing Returns -----------------------

const mediaSpendDimRets = [0, 0, 0, 0, 20000, 0, 0, 5000, 0, 10000, 0, 0, 0, 0];
const baseValueDimRets = 10000;

let rateDimRets = 10000;
let coefficientDimRets = 10000;

function diminishingReturns(media, rate) {
    return media.map(value => 1 - Math.exp(-value / rate));
}

function calculateMediaContributionDimRets(media, rate, coefficient) {
    return diminishingReturns(media, rate).map(val => val * coefficient);
}

function calculateSales(media, rate, coefficient) {
    return calculateMediaContributionDimRets(media, rate, coefficient).map(contribution => baseValueDimRets + contribution);
}

let mediaContributionDimRets = calculateMediaContributionDimRets(mediaSpendDimRets, rateDimRets, coefficientDimRets);
let sales = calculateSales(mediaSpendDimRets,rateDimRets, coefficientDimRets);

const ctxDR = document.getElementById('diminishingChart').getContext('2d');
const diminishingChart = new Chart(ctxDR, {
    type: 'bar',
    data: {
        labels: Array.from({ length: mediaSpendDimRets.length }, (_, i) => `Week ${i + 1}`),
        datasets: [
            {
                label: 'Base',
                data: Array(mediaSpendDimRets.length).fill(baseValueDimRets),
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                stack: 'Stack 0'
            },
            {
                label: 'Media Contribution',
                data: mediaContributionDimRets,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                stack: 'Stack 0'
            },
            {
                label: 'Sales',
                data: sales,
                type: 'line',
                fill: false,
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)'
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                stacked: true,
                grid: { display: false }
            },
            y: {
                beginAtZero: true,
                stacked: true,
                min: 0,
                max: 30000,
                title: {
                    display: true,
                    text: 'Sales'
                },
                grid: { display: false }
            }
        }
    }
});

const ctxContribution = document.getElementById('mediaContributionChart').getContext('2d');
const mediaSpendRange = Array.from({ length: 20 }, (_, i) => i * 1000);
let mediaContributionRange = diminishingReturns(mediaSpendRange, rateDimRets).map(val => val * coefficientDimRets);

const mediaContributionChart = new Chart(ctxContribution, {
    type: 'line',
    data: {
        labels: mediaSpendRange,
        datasets: [{
            label: 'Media Contribution (Diminishing Returns)',
            data: mediaContributionRange,
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false,
            borderWidth: 2,
            pointBackgroundColor: 'rgba(75, 192, 192, 1)'
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Media Spend'
                },
                grid: { display: false }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Media Contribution'
                },
                grid: { display: false }
            }
        }
    }
});

function updateCharts() {
    rateDimRets  = parseFloat(document.getElementById('rateDR').value);
    coefficientDimRets = parseFloat(document.getElementById('coefficient').value);

    document.getElementById('rateValueDR').textContent = rateDimRets;
    document.getElementById('DimRetsRate').textContent = rateDimRets;
    document.getElementById('DimRetscoefficient').textContent = coefficientDimRets;
    document.getElementById('coefficientValue').textContent = coefficientDimRets;

    mediaContributionDimRets = calculateMediaContributionDimRets(mediaSpendDimRets, rateDimRets, coefficientDimRets);
    mediaContributionRange = diminishingReturns(mediaSpendRange, rateDimRets).map(val => val * coefficientDimRets);

    diminishingChart.data.datasets[1].data = mediaContributionDimRets;
    mediaContributionChart.data.datasets[0].data = mediaContributionRange;

    diminishingChart.update();
    mediaContributionChart.update();
}

document.getElementById('rateDR').addEventListener('input', updateCharts);
document.getElementById('coefficient').addEventListener('input', updateCharts);
