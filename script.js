// -------------  GLOBALS  ------------- 
let tally      = {};
let offset     = 0;
const LIMIT = 150;
let seen    = new Set(); 
let counter = 0

let chart;
const colorMap = {};
const primaryColors = [
    'rgba(255, 99, 132, 0.6)',   // red
    'rgba(255, 159, 64, 0.6)',   // orange
    'rgba(255, 206, 86, 0.6)',   // yellow
    'rgba(75, 192, 192, 0.6)',   // teal
    'rgba(54, 162, 235, 0.6)',   // blue
    'rgba(153, 102, 255, 0.6)'   // purple
];
//============================================================================



async function initTally() {
    const res  = await fetch("api/fetch_questions");
    const form = await res.json();
    form.questions[0].options          // first question is the project list
        .filter(o => /^\[\d+]/.test(shorten_name(o.value)))
        .forEach(o => { tally[shorten_name(o.value)] = 0; });
    console.log('Initial tally:', tally);
}
  
  // page through *all* submissions each run
async function fetchSubmissions() {
    let got;
    do {
        counter++;
        console.log(`Offset : {${offset}}`);
        
        const res = await fetch(`api/fetch_submissions?offset=${offset}`);
        const { responses } = await res.json();
        got = responses.length;
    
        responses.forEach(r => {
            if (seen.has(r.submissionId)) return;
            seen.add(r.submissionId);
    
            const choices = r.questions[0]?.value;          // first answer = vote
            choices.forEach(choice => {if (tally.hasOwnProperty(shorten_name(choice))) tally[shorten_name(choice)]++;})
      });
  
      offset += got;
    } while (got === LIMIT);
  
    offset = 0;
    console.log('Current tally:', tally);
    updateChart?.(tally);
}
  
  // ---------- forever loop ----------
(async () => {
    await initTally();
    (async function loop() {
      await fetchSubmissions();
      setTimeout(loop, 1000);
     })();
})();

function getColorForLabel(label, index) {
    if (!colorMap[label]) {
        colorMap[label] = primaryColors[index % primaryColors.length];
    }
    return colorMap[label];
}

async function get_fake_data(){
    return fetch('Mock_Data.json')
    .then(response => response.json())
};

function shorten_name(project_name){
    if (project_name.length > 32) {
        project_name = project_name.slice(0, 32) + "..."
    }
    return project_name
}


function updateChart(vote_count) {
    const sortedEntries = Object.entries(vote_count).sort((a, b) => b[1] - a[1]);
    const labels = sortedEntries.map(entry => entry[0]);
    const values = sortedEntries.map(entry => entry[1]);
    const backgroundColors = labels.map((label, index) => getColorForLabel(label, index));
    const canvas = document.getElementById('myChart');
    
    if (!chart) {
        const ctx = document.getElementById('myChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Votes',
                    data: values,
                    backgroundColor: backgroundColors,
                    borderColor: 'rgba(0,0,0,0.2)',
                    borderWidth: 1
                }]
            },
            
            plugins: [ChartDataLabels],
            options: get_options()
        });
    } else {
        chart.data.labels = labels;
        chart.data.datasets[0].data = values;
        chart.data.datasets[0].backgroundColor = backgroundColors;
        chart.update();
    }
}


function get_options(){
    return {
        devicePixelRatio: 2,
        indexAxis: 'y',
        responsive: true,
        animation: {
            duration: 1000,
            easing: 'easeInOutCubic'
        },
        layout: {
            padding: {
                right: 30
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 16,
                        family: 'Arial'
                    },
                    color: '#f4f7f5',
                    display: false
                },
                grid: {
                    drawTicks: true,
                    color: (ctx) => ctx.index % 2 === 0 ? 'rgba(200,200,200,0.2)' : 'transparent'
                }
            },
            y: {
                ticks: {
                    font: {
                        size: 16,
                        family: 'Arial'
                    },
                    color: '#f4f7f5'
                },
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
              display: false
            },
            title: {
                display: true,
                color: '#f4f7f5',
                text: 'اصوات مشاريع التخرج',
                font: {
                    size: 40,
                    family: 'Tajawal',
                    weight: '500'
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            },
            datalabels: {
                color: '#f4f7f5',
                anchor: 'end',
                align: 'right',
                offset: 4,
                font: {
                    weight: 'normal',
                    size: 14
                },
                formatter: value => value
            }
        }
    }
}
