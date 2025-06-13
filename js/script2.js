const data = [15.4, 84.6];
const ctx = document.getElementById('myChart').getContext('2d');

new Chart(ctx, {
type: 'doughnut',
data: {
    labels: ['15.4%', '84.6%'],
    datasets: [{
    data: data,
    backgroundColor: ['#e74c3c', '#3498db'],
    borderWidth: 10,
    borderRadius: 35,
    cutout: '70%',
    borderColor: 'transparent'
    }]
},
options: {
    plugins: {
    legend: {
        display: false
    },
    tooltip: {
        enabled: false
    },
    datalabels: {
        color: '#fff',
        font: {
            weight: 'bold',
            size: 10
        },
        formatter: (value, context) => {
        return context.chart.data.labels[context.dataIndex];
        },
        anchor: 'end',
        align: 'middle',
        offset: 5
    }
    }
},
plugins: [ChartDataLabels]
});

window.addEventListener('load', function() {
    updateProgressBars();
});

function updateProgressBars() {
    updateCircularProgress('circular1', 34);
    updateCircularProgress('circular2', 22);
}

function updateCircularProgress(id, value) {
    const circle = document.getElementById(id);
    const text = document.getElementById(id + '-text');
    const circumference = 314; // 2 * π * 50
    const offset = circumference - (value / 100) * circumference;
    
    if (circle && text) {
        circle.style.strokeDashoffset = offset;
        // text.textContent = value + '%';
    }
}

const yearSelect = document.getElementById('yearSelect');
const monthSelect = document.getElementById('monthSelect');
const resetBtn = document.getElementById('resetChartBtn');

let chart;
let fullMonthlyData = []; // to‘liq oylik ma’lumotlar

const years = [...new Set(data3.map(d => d.date.split('.')[2]))];
years.sort();
years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
});

function renderChart(filteredData) {
    fullMonthlyData = filteredData; // reset uchun saqlaymiz

    const dates = [...new Set(filteredData.map(item => item.date))].sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('.').map(Number);
        const [dayB, monthB, yearB] = b.split('.').map(Number);
        return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
    });

    const daysOnly = dates.map(d => d.split('.')[0]); // faqat kunlar

    const crimeTypes = [...new Set(filteredData.map(item => item.crime_type))];

    const series = crimeTypes.map(type => {
        return {
            name: type,
            data: dates.map(date => {
                return filteredData.filter(item => item.date === date && item.crime_type === type).length;
            })
        };
    });

    const totalPerDate = dates.map(date => {
        return filteredData.filter(item => item.date === date).length;
    });

    const options = {
        chart: {
            type: 'bar',
            stacked: true,
            height: 600,
            toolbar: { show: false },
            events: {
                dataPointSelection: function(event, chartContext, config) {
                    const crimeType = chartContext.w.globals.seriesNames[config.seriesIndex];
                    const selectedYear = yearSelect.value;
                    const selectedMonth = monthSelect.value;

                    const filtered = data3.filter(item => {
                        const [day, month, year] = item.date.split('.');
                        return year === selectedYear && month === selectedMonth && item.crime_type === crimeType;
                    });

                    const grouped = {};
                    filtered.forEach(item => {
                        if (!grouped[item.date]) grouped[item.date] = 0;
                        grouped[item.date]++;
                    });

                    const dates = Object.keys(grouped).sort((a, b) => {
                        const [dayA, monthA, yearA] = a.split('.').map(Number);
                        const [dayB, monthB, yearB] = b.split('.').map(Number);
                        return (new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB));
                    });

                    const chartData = [{
                        name: crimeType,
                        data: dates.map(date => grouped[date])
                    }];
                    
                    chart.updateOptions({
                        series: chartData,
                        xaxis: { categories: dates.map(item => item.split('.')[0]) }
                    });

                    resetBtn.style.display = 'flex';
                    // const selectedCrimeType = chartContext.w.globals.seriesNames[config.seriesIndex];
                    updateMapColors(crimeType); 
                }
            }
        },
        xaxis: {
            categories: daysOnly,
            labels: { 
                style: { colors: '#fff' },
                rotate: -45
            }
        },
        yaxis: {
            labels: { style: { colors: '#fff' } }
        },
        legend: {
            show: false
        },
        dataLabels: {
            enabled: true,
            style: { colors: ['#fff'] },
            formatter: val => val,
            background: { enabled: false },
            dropShadow: { enabled: false },
            total: {
                enabled: true,
                style: {
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#fff'
                }
            }
        },
        tooltip: {
            shared: false,
            intersect: true,
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                const date = dates[dataPointIndex];
                const crimeType = w.globals.seriesNames[seriesIndex];
                const color = w.globals.colors[seriesIndex];

                const count = data3.filter(d => d.date === date && d.crime_type === crimeType).length;

                return `
                    <div style="padding:10px; border-left: 10px solid ${color};">
                        <span class='text-dark'><strong>Jinoyat turi:</strong> ${crimeType}</span><br/>
                        <span class='text-dark'><strong>Jinoyat soni:</strong> ${count} ta</span><br/>
                        <span class='text-dark'><strong>Sana:</strong> ${date}</span>                                                
                    </div>`;
            }
        },
        series: series
    };

    if (chart) {
        chart.updateOptions(options);
    } else {
        chart = new ApexCharts(document.querySelector("#crime_types_date"), options);
        chart.render();
    }

    resetBtn.style.display = 'none'; // grafikka qaytganda tugma yashiriladi
}

function updateChart() {
    const selectedYear = yearSelect.value;
    const selectedMonth = monthSelect.value;

    const filtered = data3
        .filter(item => {
            const [day, month, year] = item.date.split('.');
            return year === selectedYear && month === selectedMonth;
        })
        .map(item => ({
            date: item.date,
            crime_type: item.crime_type
        }));

    if (filtered.length > 0) {
        renderChart(filtered);
    }
}

resetBtn.addEventListener('click', () => {
    renderChart(fullMonthlyData); // reset qilish
    resetMapColors()
});

yearSelect.addEventListener('change', updateChart);
monthSelect.addEventListener('change', updateChart);

yearSelect.selectedIndex = 0;
updateChart();

document.getElementById('fullScreen').addEventListener('click', function () {
    this.classList.toggle('fa-expand');
    this.classList.toggle('fa-compress');
    const parentElement = this.parentNode.parentNode;
    if (parentElement) {
        if (localStorage.getItem('rP')==='3' || !localStorage.getItem('rP')) {
            parentElement.insertBefore(this.parentNode, parentElement.firstChild);
            localStorage.setItem('rP', 1)
        } else {
            parentElement.appendChild(this.parentNode);
            localStorage.setItem('rP', 3)
        }        
    }

    const rightBox = document.getElementsByClassName('right-box')[0];
    if (rightBox) {
        rightBox.classList.toggle('fullscreen');
    }

    document.getElementById('map').classList.toggle('d-none');
    document.getElementById('tab2').classList.toggle('d-none');
    
    ['top-left', 'middle-left', 'bottom-left', 'bottom-middle', 'bottom-right'].forEach(id => {
        const el = document.getElementsByClassName(id)[0];
        
        if (el) {
            el.classList.toggle('d-flex');
            el.classList.toggle('d-none');
        } 
    });
});

