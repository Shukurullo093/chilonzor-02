crime_types = [
    'Фирибгарлик',
    'Қўшмачилик қилиш йоки фоҳишахона сақлаш ',
    'Қимор ва таваккалчиликка асосланган бошқа ўйинларни ташкил этиш ҳамда ўтказиш ',
    'Ўғрилик',
    'Бэзорилик'
]

function groupCrimesByNeighborhood(data) {
  const result = {};
  
  data.forEach(entry => {
    const neighborhood = entry.neighborhood;
    const crimeType = entry.crime_type;
    if (crime_types.includes(crimeType)){
        if (!result[neighborhood]) {
            result[neighborhood] = {
                crimes: {}
            };
        }
        
        if (!result[neighborhood].crimes[crimeType]) {
            result[neighborhood].crimes[crimeType] = 0;
        }
        
        result[neighborhood].crimes[crimeType]++;
    }    
  });
  
  return result;
}

const crimeStats = groupCrimesByNeighborhood(data3);
console.log(crimeStats);