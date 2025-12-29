import './DriverChart.css';
import { useState, useEffect, useRef } from 'react';
import {Line} from "react-chartjs-2";
import {Doughnut} from "react-chartjs-2";
import {getCircuit, getResultsByRacesIds} from '../../api/api.js';
import { Chart as ChartJS } from "chart.js/auto";


const DriverChart = (props) => { 
  const [searchTypeChart1, setSearchTypeChart1] = useState('All Seasons');
  const [searchTypeChart2, setSearchTypeChart2] = useState('races');
  const [circuits, setCircuits] = useState();
  const [resultsByYear, setResultsByYear] = useState();
  const [racesPerSeason, setRacesPerSeason] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const montagemInicial = useRef(true);


  let infoPerSeasonChart = [];
  let infoConstructorChart = [];
  let seasons = props.driver_season_list.sort(function(a, b) {return a - b })
  let constructors = props.driver_constructor_list
  let races = props.races_data
  
  let driver_results = props.driver_results_data
  let drivers_per_race = null;



  useEffect(() => {

    getCircuit()
      .then((response) => 
          setCircuits(response.data)
      )
      .catch((error) => console.error(error));

  }, []);

  useEffect(() => {
    if (montagemInicial.current) {
      montagemInicial.current = false;
      return;
    }else{
      async function fetchData() {
        try {
          await getResultsByRacesIds(racesPerSeason.map(race => parseInt(race.raceId)))
          .then((response) => 
              setResultsByYear(response.data)
          )
          .catch((error) => console.error(error));
        } catch (err) {
            console.log('err')
        } finally {
            setIsLoading(false);
        }
      }

      fetchData(); 
    }

  }, [searchTypeChart1]);



  const infoPerSeasonList = () =>{
    let infoPerSeasonChartAux = [];
    
    seasons.forEach(function(season, index) {
      const driverRaceIds = [...new Set(driver_results.map(race => race.raceId))]

      let aux2 = races.filter(race => driverRaceIds.includes(race.raceId)).filter(driverRace => driverRace.year == season).map(obj => obj.raceId)

      let aux = driver_results.filter(race => aux2.includes(race.raceId)).map(obj => obj);

      let results_per_season = aux.filter(result => function(obj) { return obj.season === season;});

      let constructors2 = [...new Set(constructors.filter(race => results_per_season.map(obj => obj.constructorId).includes(race.constructorId)).map(constructor=> constructor.name))];
      
      let driver_wins = 0;
      let driver_points = 0;
      let driver_poles = 0;
      let driver_podiums = 0;

      results_per_season.forEach(function(race){
        if(race.position === 1){
          driver_wins = driver_wins + 1;
        }

        if(race.grid === 1){
          driver_poles = driver_poles + 1;
        }

        if(race.position === 1 || race.position === 2 || race.position === 3){
          driver_podiums = driver_podiums + 1;
        }

        driver_points = driver_points + parseInt(race.points);
      });

      infoPerSeasonChartAux.push({
        id: index,
        year: season,
        points: driver_points,
        wins: driver_wins,
        poles: driver_poles,
        podiums: driver_podiums,
        constructor: constructors2
      });
    });

    return infoPerSeasonChartAux;
  }

  const dataChartGeneration= async (seasonChart) =>{
    if(seasonChart === 'All Seasons'){
      infoPerSeasonChart = infoPerSeasonList();

      constructors.forEach(function(constructor, index){
        let races_per_constructor = driver_results.filter(function(obj) { return obj.constructorId === constructor.constructorId;});
        let wins_per_constructor = races_per_constructor.filter(function(obj) { return obj.position === 1;});
        let poles_per_constructor = races_per_constructor.filter(function(obj) { return obj.grid === 1;});
        let podiums_per_constructor = 0;
        let points_per_constructor = 0;

        races_per_constructor.forEach(race => {
          points_per_constructor = points_per_constructor + parseInt(race.points);

          if(race.position == 1 || race.position === 2 || race.position === 3){
            podiums_per_constructor = podiums_per_constructor + 1;
          }
        });

        infoConstructorChart.push({
          id: index,
          constructor: constructor,
          races: races_per_constructor.length,
          wins: wins_per_constructor.length,
          poles: poles_per_constructor.length,
          podiums: podiums_per_constructor,
          points: points_per_constructor
        });
      });
    }else{
      infoPerSeasonChart = [];
      if(racesPerSeason && resultsByYear){
        racesPerSeason.forEach(function(race, index){
          let driverResultsByYear = driver_results.filter(driverResult => racesPerSeason.map(race => race.raceId).includes(driverResult.raceId))

          let circuit = circuits.filter(circuit => circuit.circuitId === racesPerSeason[index].circuitId)
   
          let aux2 = races.filter(race => race.year == seasonChart).filter(race => race.circuitId == circuit[0].circuitId).map(obj => obj.raceId);
 
          drivers_per_race = [... new Set(resultsByYear.filter(result => aux2.includes(result.raceId)))].length;
         
          let raceDriverResult = driverResultsByYear.filter(result => result.raceId == race.raceId) 

          let grid = null
          let position = null

          if(raceDriverResult.length != 0){
              if(raceDriverResult[0].grid == 0){
                grid = drivers_per_race;
              }else{
                grid = raceDriverResult[0].grid
              }
          }else{
            grid = null;;
          }

          if(raceDriverResult.length != 0){
              if(raceDriverResult[0].positionText == "R" || raceDriverResult[0].positionText == "D" || raceDriverResult[0].positionText == "F" || raceDriverResult[0].positionText == 'W' || raceDriverResult[0].positionText == 'N'){
                position = drivers_per_race;
              }else{
                position = raceDriverResult[0].positionText
              }
          }else{
            position = null;
          }

          infoPerSeasonChart.push({
            id: index,
            year: seasonChart,
            race_name: circuit[0].circuitRef,
            country: circuit[0].country,
            constry_flag: `https://countryflagsapi.com/png/${circuit[0].country}`,
            points: raceDriverResult.length != 0 ? raceDriverResult[0].points : null,
            grid: grid,
            position: position,
            position_text: raceDriverResult.length != 0 ? raceDriverResult[0].positionText : null
          });
        });


        constructors.forEach(function(constructor, index){
          let races_per_constructor = driver_results.filter(function(obj) { return obj.constructorId === constructor.constructorId;});
          let wins_per_constructor = races_per_constructor.filter(function(obj) { return obj.position === 1;});
          let poles_per_constructor = races_per_constructor.filter(function(obj) { return obj.grid === 1;});
          let podiums_per_constructor = 0;
          let points_per_constructor = 0;

          races_per_constructor.forEach(race => {
            points_per_constructor = points_per_constructor + parseInt(race.points);

            if(race.position === 1 || race.position === 2 || race.position === 3){
              podiums_per_constructor = podiums_per_constructor + 1;
            }
          });

          infoConstructorChart.push({
            id: index,
            constructor: constructor,
            races: races_per_constructor.length,
            wins: wins_per_constructor.length,
            poles: poles_per_constructor.length,
            podiums: podiums_per_constructor,
            points: points_per_constructor
          });
        });
      }
    } 
  }

  function removerDuplicatasRaceIdComBaseNaPositionN(arr) {
    const raceIdMap = new Map();

    // Agrupar objetos por raceId
    arr.forEach((obj, index) => {
      if (!obj || typeof obj !== 'object' || obj.raceId === undefined) return;
      const id = obj.raceId;
      if (!raceIdMap.has(id)) {
        raceIdMap.set(id, []);
      }
      raceIdMap.get(id).push({ obj, index });
    });

    const indicesParaRemover = [];

    raceIdMap.forEach(lista => {
      if (lista.length > 1) {
        // Tenta encontrar uma ocorrência com position === "\N"
        const alvo = lista.find(item => item.obj.position === "\\N");

        if (alvo) {
          indicesParaRemover.push(alvo.index);
        } else {
          // Se nenhuma ocorrência tiver position === "\N", remove a última
          indicesParaRemover.push(lista[lista.length - 1].index);
        }
      }
    });

    // Remover de trás pra frente para evitar alteração de índices
    indicesParaRemover.sort((a, b) => b - a);
    for (const index of indicesParaRemover) {
      arr.splice(index, 1);
    }

    return arr;
  }

  dataChartGeneration(searchTypeChart1);

  const handleSearchTypeChart1 = (e) => {
    let aux2 = races.filter(race => race.year == e.target.value).sort((a, b) => a.round - b.round)

    setRacesPerSeason(aux2)

    setSearchTypeChart1(e.target.value != 0 ?  parseInt(e.target.value) : "All Seasons")
   
    dataChartGeneration(searchTypeChart1);
    

    infoPerSeasonChart = [];
  }

  const handleSearchTypeChart2 = (e) => {
    setSearchTypeChart2(e.target.value)
  }
  

  let chart1Data ={};
  let chart1Options = {}

  if(searchTypeChart1 === 'All Seasons'){
    chart1Data = {
      labels: infoPerSeasonChart.map((data) => data.year),
      datasets: [
        {
          label: "Points per season",
          data: infoPerSeasonChart.map((data) => data.points),
          pointRadius: 5,
          backgroundColor: [
            "#1E90FF",
          ],
          fill: false,
          borderColor: '#1E90FF',
          tension: 0.01,
        },
        {
          label: "Wins per season",
          data: infoPerSeasonChart.map((data) => data.wins),
          pointRadius: 5,
          backgroundColor: [
            "#2ECC71",
          ],
          fill: false,
          borderColor: '#2ECC71',
          tension: 0.01,
        },
        {
          label: "Poles per season",
          data: infoPerSeasonChart.map((data) => data.poles),
          pointRadius: 5,
          backgroundColor: [
            "#E67E22",
          ],
          fill: false,
          borderColor: '#E67E22',
          tension: 0.01,
        },
        {
          label: "Podiums per season",
          data: infoPerSeasonChart.map((data) => data.podiums),
          pointRadius: 5,
          backgroundColor: [
            "#9B59B6",
          ],
          fill: false,
          borderColor: '#9B59B6',
          tension: 0.01,
        }
      ]
    }

    chart1Options = {
      plugins: {
        legend: {
          labels: {
            color: "#fff",
            font: {
              size: 10
            }
          },
          position: 'bottom'
        },
        /* title: {
            display: true,
            text: 'WINS AND POINTS PER SEASON',
            color: "#fff",
            font: {
              size: 12
            }
        } */
      },
      scales: {
        y: {
          ticks: {
            color: "#fff",
            font: {
              size: 10,
            },
          },
          grid: {
            color: '#5A5A5A'
          }
        },
        x: { 
          ticks: {
            color: "#fff",
            font: {
              size: 10 
            }
          },
          grid: {
            color: '#5A5A5A'
          }
        }
      }
    }
  }else{
    chart1Data = {
      labels: infoPerSeasonChart.map((data) => `${data.race_name.replace('_',' ')}(${data.country})`),
      datasets: [
        {
          label: "Position",
          data: infoPerSeasonChart.map((data) => data.position),
          pointRadius: 5,
          pointStyle: infoPerSeasonChart.map((data) => (data.position_text == 'R' || data.position_text == 'D' || data.position_text == 'F' || data.position_text == 'W' || data.position_text == 'N' ? "triangle" : "circle")),
          pointBackgroundColor: '#9b92d3ff',
          backgroundColor: [
            "#6A5ACD",
          ],
          fill: false,
          borderColor: '#6A5ACD',
          tension: 0.01,
        },
        {
          label: "Grid",
          data: infoPerSeasonChart.map((data) => data.grid),
          pointRadius: 5,
          pointBackgroundColor: '#acfacdff',
          backgroundColor: [
            "#2ECC71",
          ],
          fill: false,
          borderColor: '#2ECC71',
          tension: 0.01,
        }
      ],
    }

    chart1Options = {
      plugins: {
        legend: {
          labels: {
            color: "#fff",
            font: {
              size: 10
            }
          },
          position: 'bottom'
        },
        /* title: {
            display: true,
            text: `POSITION AND GRID PER RACE IN ${searchTypeChart1}`,
            color: "#fff",
            font: {
              size: 12
            }
        } */
      },
      scales: {
        y: {
          min: 1,
          reverse: true,
          ticks: {
            color: "#fff",
            font: {
              size: 10,
            }
          },
          grid: {
            color: '#5A5A5A'
          }
        },
        x: { 
          ticks: {
            color: "#fff",
            font: {
              size: 10 
            },
          },
          grid: {
            color: '#5A5A5A'
          }
        }
      }
    }
  }
  
  
 
  const chart2Data = {
    labels: infoConstructorChart.map((data) => data.constructor.name),
    datasets: [{
      label: 'Races',
      data: infoConstructorChart.map((data) => data[searchTypeChart2]),
      backgroundColor: [
        '#ffffffff',
        '#ed1c24',
        '#1cac78',
        '#1E90FF',
        '#FFFF00',
        '#7700ffff',
      ],
      borderColor: 'transparent',
      hoverOffset: 10
    }]
  };

  const chart2Options = {
    plugins: {
      legend: {
        labels: {
          color: "#fff",
          font: {
            size: 10
          }
        },
        position: 'bottom'
      },
      /* title: {
          display: true,
          text: 'RACES PER CONSTRUCTOR',
          color: "#fff",
          font: {
            size: 12
          }
      } */
    }
  }

 
  return(
    <div className='row charts'>
      <div className='driver-section row'>
        <div className='driver-section-header'>
          <select className='search-type-chart' name="search-type-chart1" onChange={handleSearchTypeChart1} value={searchTypeChart1}>
            <option value='0' key={Math.random()}>All Seasons</option>)
            {seasons.reverse().map((data) => <option value={data} key={Math.random()}>{data}</option>)}
          </select>
          <p className='title-driver-section'>PER SEASON</p>
        </div>
        <div className='driver-section-body'>
          <div className = 'chart'>
            {infoPerSeasonChart.length !== 0 && <Line className='graphic1' data={chart1Data} options={chart1Options}/>}
          </div>
          {(searchTypeChart1 !== "All Seasons") &&
          <div className='chart-data'>
            <div className='text-info'>Points: {(infoPerSeasonList().filter(function(obj) { return obj.year == searchTypeChart1}))[0].points}</div>
            <div className='text-info'>Poles: {(infoPerSeasonList().filter(function(obj) { return obj.year == searchTypeChart1}))[0].poles}</div>
            <div className='text-info'>Wins: {(infoPerSeasonList().filter(function(obj) { return obj.year == searchTypeChart1}))[0].wins}</div>
            <div className='text-info'>Podiums: {(infoPerSeasonList().filter(function(obj) { return obj.year == searchTypeChart1}))[0].podiums}</div>
            <div className='text-info'>Team: {infoPerSeasonList().filter(function(obj) { return obj.year == searchTypeChart1})[0].constructor.join(', ')}</div>
          </div>
          }
        </div>
      </div>
      <div className='driver-section row'>
        <div className='driver-section-header'>
          <select className='search-type-chart' name="search-type-chart2" onChange={handleSearchTypeChart2} value={searchTypeChart2}>
            <option value='races' key={Math.random()}>races</option>
            <option value='wins' key={Math.random()}>wins</option>
            <option value='poles' key={Math.random()}>poles</option>
            <option value='podiums' key={Math.random()}>podiums</option>
            <option value='points' key={Math.random()}>points</option>
          </select>
          <p className='title-driver-section'>PER CONSTRUCTOR</p>
        </div>
        <div className='constructor-section-body'>
          <div className = 'chart'>
            {infoConstructorChart.length !== 0 && <Doughnut className='graphic2' data={chart2Data} options={chart2Options}/>}
          </div>
        </div>
      </div>
    </div>
  );
}

 export default DriverChart;