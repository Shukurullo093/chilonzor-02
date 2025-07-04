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
    this.localStorage.setItem('rP', 3);
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

// function getUniqueValues(arr, key) {
//   return [...new Set(arr.map(item => item[key]))];
// }
// const uniqueNames = getUniqueValues(data3, 'neighborhood'); 
// console.log('mahallalar', uniqueNames);

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

crime_types = [
  'Гийовандлик воситалари, уларнинг аналоглари йоки психотроп моддаларни ўтказиш мақсадини кўзлаб қонунга хилоф равишда таййорлаш, олиш, сақлаш ва бошқа ҳаракатлар қилиш, шунингдэк уларни қонунга хилоф равишда ўтказиш',
  'Товламачилик',
  'Пора олиш',
  'Пора бериш',
  'Кучли таъсир қилувчи ёки заҳарли моддаларни қонунга хилоф равишда эгаллаш',
  'Қўшмачилик қилиш йоки фоҳишахона сақлаш ',
  ''
]

const uzbekMonths = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
];

// Oy-yil formatiga o'girish funksiyasi
function getMonthYear(dateStr) {
  const [day, month, year] = dateStr.split('.');
  const monthIndex = parseInt(month, 10) - 1;
  return uzbekMonths[monthIndex] || '';
}

// const groupedData = data3.reduce((acc, currentItem) => {
//     let key = currentItem.crime_type;

//     if (crime_types.includes(key)) {
//         // Replace all spaces with underscores (global replace)
//         key = key.replace(/ /g, '_');

//         if (!acc[key]) {
//             acc[key] = [];
//         }
//         acc[key].push(currentItem);
//     }
//     // Always return the accumulator!
//     return acc;
// }, {});

// Correct way to iterate over object values
// Object.values(groupedData).forEach(group => {
//     console.log(group, group.length);
// });
// Object.entries(groupedData).forEach(([crimeType, group]) => {
//     console.log(`Crime Type: ${crimeType}, Count: ${group.length}`);
// });

// const groupedCounts = data3.reduce((acc, currentItem) => {
//     let key = currentItem.crime_type;

//     if (crime_types.includes(key)) {
//         key = key.replace(/ /g, '_'); // replace all spaces with underscores

//         if (!acc[key]) {
//             acc[key] = 0;
//         }
//         acc[key] += 1; // increment count
//     }
//     return acc;
// }, {});
// console.log(groupedCounts);

function renderChart(filteredData) {
  // Ma'lumotlarni oylik va jinoyat turi bo'yicha guruhlash
  let monthlyCrimeCounts = filteredData.reduce((acc, item) => {
    const crime = item.crime_type;
    if (!crime) return acc; // undefined yoki false qiymatlarni o'tkazib yuborish

    const monthYear = getMonthYear(item.date);

    if (!acc[monthYear]) acc[monthYear] = {};
    if (!acc[monthYear][crime]) acc[monthYear][crime] = 0;
    acc[monthYear][crime] += 1;

    return acc;
  }, {});

  // Oylarni tartiblash
  const sortedMonthlyCrimeCounts = Object.entries(monthlyCrimeCounts)
      .sort(([a], [b]) => uzbekMonths.indexOf(a) - uzbekMonths.indexOf(b));
  
  monthlyCrimeCounts = Object.fromEntries(sortedMonthlyCrimeCounts);

  // Jinoyat turlarini olish (faqat eng ko'p sodir bo'lgan 10 tasi)
  const crimeCounts = {};
  Object.values(monthlyCrimeCounts).forEach(monthData => {
      Object.entries(monthData).forEach(([crime, count]) => {
          if (!crimeCounts[crime]) crimeCounts[crime] = 0;
          crimeCounts[crime] += count;
      });
  });

  // Eng ko'p sodir bo'lgan 10 ta jinoyat turi
  const topCrimes = Object.entries(crimeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(item => item[0]);

  // Faqat top jinoyatlar uchun ma'lumotlarni filtrlash
  const filteredMonthlyCrimeCounts = {};
  Object.keys(monthlyCrimeCounts).forEach(month => {
      filteredMonthlyCrimeCounts[month] = {};
      topCrimes.forEach(crime => {
          if (monthlyCrimeCounts[month][crime]) {
              filteredMonthlyCrimeCounts[month][crime] = monthlyCrimeCounts[month][crime];
          }
      });
  });

  // Oylar (x axis uchun)
  const months = Object.keys(filteredMonthlyCrimeCounts);

  // Series uchun data tayyorlash
  const series = topCrimes.map(crime => ({
      name: crime, // name: crime.length > 30 ? crime.substring(0, 30) + '...' : crime,
      data: months.map(month => filteredMonthlyCrimeCounts[month][crime] || 0)
  }));

  // ApexCharts options
  const options = {
      chart: {
          type: 'line',
          height: 600,
          zoom: {
              enabled: true
          },
          toolbar: {
              tools: {
                  download: false,
                  selection: true,
                  zoom: false,
                  zoomin: false,
                  zoomout: false,
                  pan: false,
                  reset: false
              }
          },
          events: {
              legendClick: function(chartContext, seriesIndex, config) {
                const fullSeriesName = config.config.series[seriesIndex].name;
                aiAdvice(fullSeriesName);

                const myModal = new bootstrap.Modal(document.getElementById('legendModal'));
                myModal.show();

                return false; // chiziqni yashirishni bloklash
              }
          }
      },
      dataLabels: {
          enabled: true
      },
      title: {
        text: 'Чилонзор туманидаги жиноятларнинг вақт бўйича таҳлили',
        align: 'center',
        style: {
          fontSize:  '18px',
          fontWeight:  'bold',
          fontFamily:  undefined,
          color:  '#fff'
        },
      },
      stroke: {
          curve: 'smooth',
          width: 3
      },
      series: series,
      xaxis: {
          categories: months,
          labels: {
              style: {
                  colors: '#ffffff'
              }
          }
      },
      yaxis: {
          labels: {
              style: {
                  colors: '#ffffff'
              }
          }
      },
      tooltip: {
          enabled: true,
          shared: false,
          intersect: false,
          style: {
              fontSize: '12px'
          },
          y: {
              formatter: function(value) {
                  return value + " ta";
              }
          }
      },
      legend: {
        show: true,
        position: 'right',
        horizontalAlign: 'left',
        fontSize: '14px',
        labels: {
            colors: '#fff',
            useSeriesColors: false,
        },
        markers: {
            width: 10,
            height: 10,
            radius: 0,
            offsetX: -5,
            offsetY: 1,
            shape: "line", // circle, square
        },
        itemMargin: {
            horizontal: 10,
            vertical: 5
        },
        onItemClick: {
            toggleDataSeries: true
        },
        onItemHover: {
            highlightDataSeries: true
        },
        formatter: function(seriesName, opts) {
          const maxLength = 25;
          return seriesName.length > maxLength ? 
              seriesName.substring(0, maxLength) + '...' : 
              seriesName;
        },
        containerMargin: {
            left: 10,
            top: 20
        }
      },
      colors: ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6', 
              '#1abc9c', '#d35400', '#34495e', '#e67e22', '#16a085'],
      grid: {
          borderColor: '#556d8f',
          strokeDashArray: 4
      }
  };

  // Avvalgi chartni yo'q qilish
  if (window.chart12) {
      window.chart12.destroy();
  }

  // Yangi chart yaratish
  window.chart12 = new ApexCharts(document.querySelector("#crime_types_date"), options);
  window.chart12.render();
}

//     fullMonthlyData = filteredData; // reset uchun saqlaymiz

//     const dates = [...new Set(filteredData.map(item => item.date))].sort((a, b) => {
//         const [dayA, monthA, yearA] = a.split('.').map(Number);
//         const [dayB, monthB, yearB] = b.split('.').map(Number);
//         return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
//     });

//     const daysOnly = dates.map(d => d.split('.')[0]); // faqat kunlar

//     const crimeTypes = [...new Set(filteredData.map(item => item.crime_type))];

//     const series = crimeTypes.map(type => {
//         return {
//             name: type,
//             data: dates.map(date => {
//                 return filteredData.filter(item => item.date === date && item.crime_type === type).length;
//             })
//         };
//     });

//     const totalPerDate = dates.map(date => {
//         return filteredData.filter(item => item.date === date).length;
//     });

//     const options = {
//         chart: {
//             type: 'bar',
//             stacked: true,
//             height: 600,
//             toolbar: { show: false },
//             events: {
//                 dataPointSelection: function(event, chartContext, config) {
//                     const crimeType = chartContext.w.globals.seriesNames[config.seriesIndex];
//                     const selectedYear = yearSelect.value;
//                     const selectedMonth = monthSelect.value;

//                     const filtered = data3.filter(item => {
//                         const [day, month, year] = item.date.split('.');
//                         return year === selectedYear && month === selectedMonth && item.crime_type === crimeType;
//                     });

//                     const grouped = {};
//                     filtered.forEach(item => {
//                         if (!grouped[item.date]) grouped[item.date] = 0;
//                         grouped[item.date]++;
//                     });

//                     const dates = Object.keys(grouped).sort((a, b) => {
//                         const [dayA, monthA, yearA] = a.split('.').map(Number);
//                         const [dayB, monthB, yearB] = b.split('.').map(Number);
//                         return (new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB));
//                     });

//                     const chartData = [{
//                         name: crimeType,
//                         data: dates.map(date => grouped[date])
//                     }];
                    
//                     chart.updateOptions({
//                         series: chartData,
//                         xaxis: { categories: dates.map(item => item.split('.')[0]) }
//                     });

//                     resetBtn.style.display = 'flex';
//                     // const selectedCrimeType = chartContext.w.globals.seriesNames[config.seriesIndex];
//                     updateMapColors(crimeType); 
//                 }
//             }
//         },
//         xaxis: {
//             categories: daysOnly,
//             labels: { 
//                 style: { colors: '#fff' },
//                 rotate: -45
//             }
//         },
//         yaxis: {
//             labels: { style: { colors: '#fff' } }
//         },
//         legend: {
//             show: false
//         },
//         dataLabels: {
//             enabled: true,
//             style: { colors: ['#fff'] },
//             formatter: val => val,
//             background: { enabled: false },
//             dropShadow: { enabled: false },
//             total: {
//                 enabled: true,
//                 style: {
//                     fontSize: '12px',
//                     fontWeight: 600,
//                     color: '#fff'
//                 }
//             }
//         },
//         tooltip: {
//             shared: false,
//             intersect: true,
//             custom: function({ series, seriesIndex, dataPointIndex, w }) {
//                 const date = dates[dataPointIndex];
//                 const crimeType = w.globals.seriesNames[seriesIndex];
//                 const color = w.globals.colors[seriesIndex];

//                 const count = data3.filter(d => d.date === date && d.crime_type === crimeType).length;

//                 return `
//                     <div style="padding:10px; border-left: 10px solid ${color};">
//                         <span class='text-dark'><strong>Jinoyat turi:</strong> ${crimeType}</span><br/>
//                         <span class='text-dark'><strong>Jinoyat soni:</strong> ${count} ta</span><br/>
//                         <span class='text-dark'><strong>Sana:</strong> ${date}</span>                                                
//                     </div>`;
//             }
//         },
//         series: series
//     };

//     if (chart) {
//         chart.updateOptions(options);
//     } else {
//         chart = new ApexCharts(document.querySelector("#crime_types_date"), options);
//         chart.render();
//     }

//     resetBtn.style.display = 'none'; // grafikka qaytganda tugma yashiriladi
// }

function updateChart() {
    const selectedYear = yearSelect.value;
    const selectedMonth = monthSelect.value;

    const filtered = data3
        .filter(item => {
            const [day, month, year] = item.date.split('.');
            return year === selectedYear //&& month === selectedMonth;
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
        if (localStorage.getItem('rP') === '3' || !localStorage.getItem('rP')) {
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


// Crime Timeline Chart Implementation
function initializeCrimeTimelineChart() {
    // Sample data - replace with your actual crime data
    const crimeData = {
      categories: [
        "Қотиллик", 
        "Оғир ТЖE", 
        "Ўртача оғир", 
        "Енгил ТЖE", 
        "Номусга тегиш", 
        "Талончилик", 
        "Ўғирлик", 
        "Безорилик", 
        "Бошқа жиноятлар"
      ],
      series: [
        {
          name: "Қозиробод",
          data: [0, 1, 0, 1, 1, 1, 7, 0, 0]
        },
        {
          name: "Ал-Хоразмий",
          data: [1, 0, 0, 1, 0, 0, 0, 1, 1]
        },
        {
          name: "Бешёғоч",
          data: [0, 0, 1, 1, 0, 0, 4, 0, 0]
        },
        {
          name: "Меҳржон",
          data: [0, 0, 0, 1, 0, 1, 5, 0, 0]
        }
      ],
      months: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"]
    };
  
    // Create the timeline chart
    const options = {
      series: crimeData.series,
      chart: {
        type: 'line',
        height: 350,
        stacked: false,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        zoom: {
          enabled: true
        },
        foreColor: '#fff',
        background: 'transparent'
      },
      colors: ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6', '#1abc9c', '#d35400', '#34495e', '#e67e22'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      xaxis: {
        categories: crimeData.months,
        labels: {
          style: {
            colors: '#fff'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Jinoyatlar soni',
          style: {
            color: '#fff'
          }
        },
        labels: {
          style: {
            colors: '#fff'
          }
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: 'dark',
        y: {
          formatter: function (value) {
            return value + " ta";
          }
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        labels: {
          colors: '#fff'
        },
        markers: {
          width: 12,
          height: 12,
          radius: 12
        }
      },
      grid: {
        borderColor: '#556d8f',
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        }
      }
    };
  
    const chart = new ApexCharts(document.querySelector("#crimeTimelineChart"), options);
    chart.render();
  
    // Generate crime details
    generateCrimeDetails(crimeData);
}

function generateCrimeDetails(crimeData) {
  const detailsContainer = document.getElementById('crimeDetails');
  // detailsContainer.innerHTML = '';
  
  crimeData.categories.forEach((category, index) => {
    const categoryElement = document.createElement('div');
    categoryElement.className = 'crime-category';
    
    let totalCrimes = 0;
    let locations = [];
    
    crimeData.series.forEach(area => {
      if (area.data[index] > 0) {
        totalCrimes += area.data[index];
        locations.push({
          name: area.name,
          count: area.data[index]
        });
      }
    });
    
    categoryElement.innerHTML = `
      <h4>${category} <span class="value">(${totalCrimes} ta)</span></h4>
      ${locations.map(loc => `
        <div class="crime-stat">
          <span class="label">${loc.name}:</span>
          <span class="value">${loc.count} ta</span>
        </div>
      `).join('')}
      <div class="crime-stat">
        <span class="label">Jami:</span>
        <span class="value">${totalCrimes} ta</span>
      </div>
    `;
    
    // detailsContainer.appendChild(categoryElement);
  });
}

// Jinoyat turlari filterini to'ldirish
function populateCrimeTypeFilter() {
    const crimeTypeFilter = document.getElementById('crimeTypeFilter');
    const crimeTypes = [...new Set(data3.map(item => item.crime_type))];
    
    crimeTypes.sort().forEach(crime => {
        const option = document.createElement('option');
        option.value = crime;
        // option.textContent = crime.length > 50 ? crime.substring(0, 50) + '...' : crime;
        // crimeTypeFilter.appendChild(option);
    });
}

// Filterlarni qo'llash funksiyasi
function applyFilters() {
    const selectedYear = yearSelect.value;
    const selectedMonth = monthSelect.value;
    const selectedNeighborhood = neighborhood.value;
    const selectedCrimeType = crimeTypeFilter.value;

    const filtered = data3.filter(item => {
        const [day, month, year] = item.date.split('.');
        
        const yearMatch = !selectedYear || year === selectedYear;
        const monthMatch = !selectedMonth || month === selectedMonth;
        const neighborhoodMatch = !selectedNeighborhood || item.neighborhood === selectedNeighborhood;
        const crimeTypeMatch = !selectedCrimeType || item.crime_type === selectedCrimeType;
        
        return yearMatch && monthMatch && neighborhoodMatch && crimeTypeMatch;
    });

    if (filtered.length > 0) {
        renderChart(filtered);
    } else {
        // Agar hech qanday ma'lumot topilmasa
        alert("Tanlangan filterlar bo'yicha ma'lumot topilmadi");
    }
}

// Event listenerlarni qo'shish
yearSelect.addEventListener('change', applyFilters);
monthSelect.addEventListener('change', applyFilters);
neighborhood.addEventListener('change', applyFilters);
// crimeTypeFilter.addEventListener('change', applyFilters);

// Dastlabki filterlarni to'ldirish
window.addEventListener('load', function() {
  updateProgressBars();
    // initializeCrimeTimelineChart();
  populateCrimeTypeFilter();
    // updateProgressBars();
    // initializeCrimeTimelineChart();
  this.localStorage.setItem('rP', 3);
});

function aiAdvice(targetCrimeType){
  function groupCrimeCountByTimeSorted(data, targetCrimeType) {
    // 1. Filtrlash va sonni hisoblash
    const grouped = data
    .filter(item => item.crime_type === targetCrimeType)
    .reduce((acc, { time }) => {
      if (time) acc[time] = (acc[time] || 0) + 1;
      return acc;
    }, {});

    // 2. Kamayish tartibida sortlash va massivga o‘tkazish
    const sorted = Object.entries(grouped)
      .sort((a, b) => b[1] - a[1]) // kamayish tartibi
      .map(([time, count]) => ({ time, count }));

    document.getElementById('time_period').innerText = sorted[0].time;
    // return sorted;
  }
  groupCrimeCountByTimeSorted(data3, targetCrimeType)

  // const result = groupCrimeCountByTimeSorted(data3, "Гийовандлик воситалари, уларнинг аналоглари йоки психотроп моддаларни ўтказиш мақсадини кўзламай қонунга хилоф равишда таййорлаш, эгаллаш, сақлаш ва бошқа ҳаракатлар ");
  // console.log(result);
  function groupCrimeByTimePeriod(data, targetCrimeType) {
    const timeGroups = {
      "Tun": 0,
      "Ertalab": 0,
      "Kunduzi": 0,
      "Kechqurun": 0
    };

    data
      .filter(item => item.crime_type === targetCrimeType)
      .forEach(item => {
        if (!item.time) return;

        const [hourStr, minuteStr] = item.time.split(':');
        const hour = parseInt(hourStr, 10);

        if (hour >= 0 && hour < 6) {
          timeGroups["Tun"]++;
        } else if (hour >= 6 && hour < 12) {
          timeGroups["Ertalab"]++;
        } else if (hour >= 12 && hour < 18) {
          timeGroups["Kunduzi"]++;
        } else if (hour >= 18 && hour < 24) {
          timeGroups["Kechqurun"]++;
        }
      });

    document.getElementById('time_0_6').innerText = timeGroups['Tun'];
    document.getElementById('time_6_12').innerText = timeGroups['Ertalab'];
    document.getElementById('time_12_18').innerText = timeGroups['Kunduzi'];
    document.getElementById('time_18_24').innerText = timeGroups['Kechqurun'];
  }
  groupCrimeByTimePeriod(data3, targetCrimeType)

  function generatePredictions() {
      const predictionBody = document.getElementById('predictionBody');
      
      // Haqiqiy loyihada bu yerda mashina o'rganish modellari ishlatiladi
      // Namuna uchun, ma'lumotlarga asoslangan bashoratlar yaratamiz
      
      const predictions = [
          {
              district: "Chilonzor",
              crimeType: "Narkotik moddalar bilan bog'liq jinoyatlar",
              riskLevel: "Yuqori",
              timeWindow: "Kechqurun (18:00-24:00)"
          },
          {
              district: "Bektopi",
              crimeType: "O'g'irlik",
              riskLevel: "O'rta",
              timeWindow: "Kunduzi (12:00-18:00)"
          },
          {
              district: "Qatortol",
              crimeType: "Narkotik moddalar bilan bog'liq jinoyatlar",
              riskLevel: "O'rta",
              timeWindow: "Tun (00:00-06:00)"
          },
          {
              district: "Tirsakobod",
              crimeType: "O'g'irlik",
              riskLevel: "Past",
              timeWindow: "Ertalab (06:00-12:00)"
          }
      ];
      
      let html = '';
      predictions.forEach(prediction => {
          html += `
              <tr>
                  <td>${prediction.district}</td>
                  <td>${prediction.crimeType}</td>
                  <td>${prediction.riskLevel}</td>
                  <td>${prediction.timeWindow}</td>
              </tr>
          `;
      });
      
      predictionBody.innerHTML = html;
      
      // Bashoratlarga asoslangan yechimlarni yaratish
      // generateSolutions(predictions);
  }
  generatePredictions()    
}