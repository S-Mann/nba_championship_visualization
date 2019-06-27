class CustomChart {
  constructor(element, config) {
    this.element = element;
    this.config = config;
  }

  makeChart() {
    return new Chart(this.element, this.config);
  }

  polarChart() {
    return Chart.PolarArea(this.element, this.config);
  }

  lineChart() {
    return Chart.Line(this.element, this.config);
  }
}

const init = async () => {
  const ctx = document.getElementById("myChart");
  const ctx1 = document.getElementById("myChart1");
  const ctx2 = document.getElementById("myChart2");
  const ctx3 = document.getElementById("myChart3");
  const ctx4 = document.getElementById("myChart4");
  var DATASET, FINALS_DATASET, FINALS_GAMEWISE_DATASET;
  var TOTAL_GAMES = 82;
  var TEAMS = [],
    AVG_POINTS = [],
    AVG_OPP_POINTS = [],
    REGULAR_SEASON_PD = [],
    FINALS_PD = [],
    FINALS_AVG_POINTS = [],
    GSW_RADAR = [],
    CLE_RADAR = [];

  const aggregate_data_func = async (df, groupByColumn, aggColumn) => {
    let aggList = [],
      groupList = [];
    let groupedDF = df.groupBy(groupByColumn);
    groupedDF
      .aggregate(group => group.stat.sum(aggColumn) / TOTAL_GAMES)
      .map((row, i) => {
        aggList.push(parseInt(row.get("aggregation")));
        groupList.push(row.get(groupByColumn));
      });
    return [aggList, groupList];
  };

  // requires cross platform access because the CSV is a file type protocol
  const load_data_func = async csv_path => {
    return await dfjs.DataFrame.fromCSV(csv_path);
  };

  DATASET = await load_data_func("nba-games-stats-15-16.csv");
  FINALS_DATASET = await load_data_func("nba-finals-stats-15-16.csv");
  FINALS_GAMEWISE_DATASET = await load_data_func(
    "nba-finals-gamewise-stats-15-16.csv"
  );

  FINALS_AVG_POINTS.push(FINALS_DATASET.select("TeamPoints").toArray()[0]);
  FINALS_AVG_POINTS.push(FINALS_DATASET.select("OpponentPoints").toArray()[0]);

  [AVG_POINTS, TEAMS] = await aggregate_data_func(
    DATASET,
    "Team",
    "TeamPoints"
  );

  [AVG_OPP_POINTS, TEAMS] = await aggregate_data_func(
    DATASET,
    "Team",
    "OpponentPoints"
  );

  const chartConfig = {
    type: "bar",
    data: {
      labels: ["Regular Season", "Finals"],
      datasets: [
        {
          label: "CLE's Avg Points Per Game",
          stack: "Stack 0",
          data: [AVG_POINTS[0], FINALS_AVG_POINTS[0]],
          backgroundColor: "rgba(4,30,66,1)",
          borderColor: "rgba(111,38,61,1)",
          borderWidth: 10
        },
        {
          label: "GSW's Avg Points Per Game",
          stack: "Stack 1",
          data: [AVG_POINTS[1], FINALS_AVG_POINTS[1]],
          backgroundColor: "rgba(0,107,182,1)",
          borderColor: "rgba(253,185,39,1)",
          borderWidth: 10
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: "CLE vs GSW in regular season and finals Points Per Game(PPG)"
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            },
            scaleLabel: {
              labelString: "Points Scored Per Game(Avg.)",
              display: true
            }
          }
        ]
      },
      legend: {
        display: true
      }
    }
  };

  var myChart = new CustomChart(ctx, chartConfig);
  myChart.makeChart();

  CLE_RADAR = FINALS_DATASET.select(
    "X3PointShotsPCT",
    "FreeThrowsPCT",
    "FieldGoalsPCT",
    "Assists",
    "TotalRebounds",
    "Blocks",
    "Steals",
    "Turnovers",
    "TotalFouls"
  ).toArray()[0];

  GSW_RADAR = FINALS_DATASET.select(
    "Opp3PointShotsPCT",
    "OppFreeThrowsPCT",
    "OppFieldGoalsPCT",
    "OppAssists",
    "OppTotalRebounds",
    "OppBlocks",
    "OppSteals",
    "OppTurnovers",
    "OppTotalFouls"
  ).toArray()[0];

  var MAX_ARR = [];

  for (i = 0; i < GSW_RADAR.length; i++) {
    MAX_ARR.push(Math.max(GSW_RADAR[i], CLE_RADAR[i]));
  }

  for (let j = 0; j < GSW_RADAR.length; j++) {
    GSW_RADAR[j] = GSW_RADAR[j] / MAX_ARR[j];
    CLE_RADAR[j] = CLE_RADAR[j] / MAX_ARR[j];
  }

  const chart_data1 = {
    labels: [
      "THREE POINTS PERCENTAGE",
      "FREE THROW PERCENTAGE",
      "FIELD GOAL PERCENTAGE",
      "ASSISTS",
      "REBOUNDS",
      "BLOCKS",
      "STEALS",
      "TURNOVERS",
      "FOULS"
    ],
    datasets: [
      {
        label: "CLE",
        data: CLE_RADAR,
        fill: true,
        backgroundColor: "rgba(4,30,66,0.2)",
        borderColor: "rgba(111,38,61,1)"
      },
      {
        label: "GSW",
        data: GSW_RADAR,
        fill: true,
        backgroundColor: "rgba(0,107,182,0.2)",
        borderColor: "rgba(253,185,39,1)"
      }
    ]
  };
  const chart_options1 = {
    title: {
      display: true,
      text: "Skill Graph"
    },
    scale: {
      ticks: {
        maxTicksLimit: 3,
        display: false,
        beginAtZero: true
      }
    }
  };

  GSW_WINNING_PCT = [68.8, 66.7, 77.8, 88.2, 94.1, 81.8, 63];
  CLE_BET_MULTI = [2.8, 4.2, 5, 7.5, 12, 4.75, 2.85];

  var myChart1 = new CustomChart(ctx1, {
    type: "radar",
    data: chart_data1,
    options: chart_options1
  });
  myChart1.makeChart();

  const chartConfig2 = {
    type: "bar",
    data: {
      labels: ["CLE", "GSW"],
      datasets: [
        {
          label: "Average Points",
          stack: "Stack 0",
          data: AVG_POINTS,
          backgroundColor: ["rgba(4,30,66,1)", "rgba(0,107,182,1)"],
          borderColor: ["rgba(111,38,61,1)", "rgba(253,185,39,1)"],
          borderWidth: 10
        },
        {
          label: "Avg. Points by Opponent Teams",
          stack: "Stack 1",
          data: AVG_OPP_POINTS,
          borderWidth: 10
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: "CLE and GSW vs Their Opponents in regular season"
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            },
            scaleLabel: {
              labelString: "Points Scored Per Game(Avg.)",
              display: true
            }
          }
        ]
      },
      legend: {
        display: true
      }
    }
  };

  var myChart2 = new CustomChart(ctx2, chartConfig2);
  myChart2.makeChart();

  const chartConfig3 = {
    data: {
      datasets: [
        {
          data: [12.74, 3.38, 47.99, 35.89],
          backgroundColor: [
            "rgba(4,30,66,0.8)",
            "rgba(206,17,65,0.8)",
            "rgba(0,107,182,0.8)",
            "rgba(196,206,211,0.8)"
          ],
          label: "My dataset" // for legend
        }
      ],
      labels: ["CLE", "TOR", "GSW", "SAS"]
    },
    options: {
      responsive: true,
      legend: {
        position: "right"
      },
      title: {
        display: true,
        text: "Chances of championship for the top 4 teams(Percentage)"
      },
      scale: {
        ticks: {
          beginAtZero: true
        },
        reverse: false
      },
      animation: {
        animateRotate: false,
        animateScale: true
      }
    }
  };
  var myChart3 = new CustomChart(ctx3, chartConfig3);
  myChart3.polarChart();

  const chartConfig4 = {
    data: {
      datasets: [
        {
          data: CLE_BET_MULTI,
          yAxisID: "y-axis-1",
          borderColor: "rgba(111,38,61,1)",
          label: "Bet Multiplier for CLE Winning"
        },
        {
          data: GSW_WINNING_PCT,
          yAxisID: "y-axis-2",
          borderColor: "rgba(253,185,39,1)",
          label: "Chances of GSW Winning"
        }
      ],
      labels: [
        "Game 1(GSW)",
        "Game 2(GSW)",
        "Game 3(CLE)",
        "Game 4(GSW)",
        "Game 5(CLE)",
        "Game 6(CLE)",
        "Game 7(CLE)"
      ]
    },
    options: {
      responsive: true,
      hoverMode: "index",
      stacked: false,
      title: {
        display: true,
        text: "GSW Winning Chances Vs CLE betting multiplier(before each game)"
      },
      scales: {
        yAxes: [
          {
            type: "linear", 
            display: true,
            position: "left",
            id: "y-axis-1",
            scaleLabel: {
              labelString: "Bet Multiplier for CLE Winning",
              display: true
            }
          },
          {
            type: "linear", 
            display: true,
            position: "right",
            id: "y-axis-2",

            gridLines: {
              drawOnChartArea: false
            },
            scaleLabel: {
              labelString: "GSW Winning Chance(%)",
              display: true
            }
          }
        ]
      }
    }
  };

  var myChart4 = new CustomChart(ctx4, chartConfig4);
  myChart4.lineChart();
};

if (window.navigator.onLine) {
  try {
    init();
  } catch (error) {
    errorOcurred();
  }
} else {
  errorOcurred();
}

const errorOcurred = () => {
  const node = document.createElement("h1");
  node.innerHTML = "You need internet and firefox for this to work!";
  document.body.innerHTML = "";
  document.body.appendChild(node);
};
