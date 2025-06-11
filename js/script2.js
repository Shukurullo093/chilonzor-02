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