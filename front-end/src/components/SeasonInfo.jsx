import './SeasonInfo.css';
import {Line} from "react-chartjs-2";
import { Chart as ChartJS, Legend } from "chart.js/auto";
import { useEffect, useState, useRef } from 'react';
import {getConstructorsChampionchipStanding, getDriversChampionchipStanding, getRacesByYear, getDriversByDriversId, getConstructorsByConstructorsId, getDriversResultsByRacesId, getCircuitsByYear, getConstructorsResultsByRacesId} from '../../api/api.js';
import { MaterialReactTable, useMaterialReactTable} from 'material-react-table';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useMemo } from "react";
import Table2Legend from "../UI/Table2Legend.jsx"
import img from '../assets/pngwing.png'



const darkTheme = createTheme({
    palette: {
        mode: "light",
        background: { default: "#121212", paper: "#1e1e1e" },
        primary: { main: "#90caf9" },
        text: { primary: "#fff" },
    },
});


const SeasonInfo = (props) =>{
    const [searchTypeChart, setSearchTypeChart] = useState('drivers');
    const [driversStandings, setDriversStandings] = useState([]);
    const [constructorsStandings, setConstructorsStandings] = useState([]);
    const [driversPodium, setDriversPodium] = useState([]);
    const [constructorsPodium, setConstructorsPodium] = useState([]);
    const [driversPodiumLoaded, setDriversPodiumLoaded] = useState([]);
    const [constructorsPodiumLoaded, setConstructorsPodiumLoaded] = useState([]);
    const [racesByYear, setRacesByYear] = useState([]);
    const [isLoading1, setIsLoading1] = useState(true);
    const [isLoading2, setIsLoading2] = useState(true);
    const [driversInfoData, setDriversInfoData] = useState(true);
    const [chart1Data, setChart1Data] = useState({});
    const [chart1Options, setChart1Options] = useState({});
    const [driversTableData, setDriversTableData] = useState([]);
    const [driversTableData2, setDriversTableData2] = useState([]);
    const [constructorsTableData2, setConstructorsTableData2] = useState([]);
    const [columnOrder, setColumnOrder] = useState([]);
    const [driversResultsSeason, setDriversResultsSeason] = useState([]);
    const [constructorsResultsSeason, setConstructorsResultsSeason] = useState([]);
    const [podiumPositions, setPodiumPositions] = useState([]);
    const [constructorsOnPodium, setConstructorsOnPodium] = useState([]);
    const [poleDrivers, setPoleDrivers] = useState([]);
    const [poleConstructors, setPoleConstructors] = useState([]);
    const [fastestLapCounts, setFastestLapCounts] = useState([]);
    const [constructorFastestLaps, setConstructorFastestLaps] = useState([]);
    const [circuitListInfo, setCircuitListInfo] = useState([]);
    const [table2Selector, setTable2Selector] = useState('position');
   

    const montagemInicial1 = useRef(true);
    
    let infoPerSeasonChart = [];
    let racesIds = [];
    let circuitList = [];
    let driverPodium = [];
    let constructorPodium = [];
    let poleCounts = [];


    
    const onClickDriverNameHandler = (attr) => {
        props.onClickDriverName(attr);
    }

    useEffect(() => {
        if (searchTypeChart === "drivers") {
            setColumnOrder(["position", "driver", "nationality", "constructor", "poles", "wins", "fastestLap", "points"]);
        } else {
            setColumnOrder(["position", "constructor", "nationality", "drivers", "poles", "wins", "fastestLap","points"]);
        }
    }, [searchTypeChart]);


    useEffect(() => {
        async function fetchData() {
            try {
                await getDriversChampionchipStanding(props.season)
                    .then((response) => {
                        setDriversStandings(response.data)
                    }   
                    )
                    .catch((error) => console.error(error));
                    
                await getConstructorsChampionchipStanding(props.season)
                    .then((response) => {
                        setConstructorsStandings(response.data)
                    }   
                    )
                    .catch((error) => console.error(error));

                await getRacesByYear(props.season)
                    .then((response) => {
                        setRacesByYear(response.data)
                    }   
                    )
                    .catch((error) => console.error(error));

                await getCircuitsByYear(props.season)
                    .then((response) => {
                        setCircuitListInfo(response.data)
                    }   
                    )
                    .catch((error) => console.error(error));

                } catch (err) {
                console.log('err')
            } finally {
               setIsLoading1(false);
            }
        }

         fetchData();     
    }, []);
    

    useEffect(() => {
        if (montagemInicial1.current) {
            montagemInicial1.current = false;
            return;
        }else{
            async function fetchData() {
                await getDriversResultsByRacesId([...new Set(driversStandings.map(d => d.raceId))])
                    .then((response) => {
                        setDriversResultsSeason(response.data)
                    }   
                    )
                    .catch((error) => console.error(error));
                
                await getConstructorsResultsByRacesId([...new Set(constructorsStandings.map(d => d.raceId))])
                    .then((response) => {
                        setConstructorsResultsSeason(response.data)
                    }   
                    )
                    .catch((error) => console.error(error));
            }
            fetchData();     
        }   
    }, [driversStandings, constructorsStandings]);


    useEffect(() => {
        if (driversStandings.length == 0 || constructorsStandings.length == 0 || racesByYear.length == 0 ) return;

        const dataChartsGeneration = async () => {
            if (searchTypeChart == "drivers") {
                if (driversStandings.length != 0 && racesByYear.length != 0) {

                    getFastestLapWinners();

                    const raceIdToRound = racesByYear.reduce((acc, race) => {
                        acc[race.raceId] = race.round;
                        return acc;
                    }, {});

                    const groupByRaceId = driversStandings.reduce((acc, current) => {
                        if (!acc[current.driverId]) {
                            acc[current.driverId] = [];
                        }

                        acc[current.driverId].push({
                            ...current,
                            round: raceIdToRound[current.raceId] || null
                        });

                        return acc;
                    }, {});

                    let groupedStandingsByRaceId = Object.values(groupByRaceId);
                    
                    groupedStandingsByRaceId = setLessRaces(groupedStandingsByRaceId, racesByYear.map(race => race.raceId))

                    groupedStandingsByRaceId.sort((a, b) => {
                        const ultimaCorridaA = a[a.length - 1];
                        const ultimaCorridaB = b[b.length - 1];

                        if (ultimaCorridaB.points !== ultimaCorridaA.points) {
                            return ultimaCorridaB.points - ultimaCorridaA.points;
                        } else {
                            return ultimaCorridaA.position - ultimaCorridaB.position;
                        }
                    });

                    let resultsGroupedByRaceId = driversResultsSeason.reduce((acc, current) => {
                        if (!acc[current.driverId]) {
                            acc[current.driverId] = [];
                        }
                        
                        acc[current.driverId].push(current);
                        return acc;
                    }, {});

                    resultsGroupedByRaceId = Object.values(resultsGroupedByRaceId)
                    
                    let aux = [];
                    let aux2 = [];
                    let diferentRaceWinners = 0;
                    
                    if(driversResultsSeason.length != 0){
                        poleCounts = resultsGroupedByRaceId.map(races => ({
                            driverId: races[0].driverId,
                            count: races.filter(r => r.grid === 1).length,
                        }));
                    }


                    groupedStandingsByRaceId.forEach(function(standing, index){
                        let lastConstructor = null;
                        let constructors = [];

              
                        standing.forEach(function(driverStanding, index2) {
                            if (typeof driverStanding.constructor === 'string') {
                                lastConstructor = driverStanding.constructor;
                            } else if (driverStanding._id && lastConstructor) {
                                driverStanding.constructor = lastConstructor;
                            }

                            constructors.push(driverStanding.constructor)
                            
                            circuitList.push({circuitName: driverStanding.circuitName, raceId: driverStanding.raceId})
                            racesIds.push(driverStanding.raceId)
                            infoPerSeasonChart.push({
                                id: index,
                                raceId: driverStanding.raceId,
                                driverId: driverStanding.driverId,
                                surname: driverStanding.surname,
                                forename: driverStanding.forename,
                                points: driverStanding.points,
                                position: driverStanding.position,
                                position_text: driverStanding.positionText,
                                wins: driverStanding.wins,
                                circuitName: driverStanding.circuitName, 
                                round: driverStanding.round
                            });
                            
                            if(index2 == standing.length -1){
                                constructors = [...new Set(constructors)];
                                
                                driverPodium.push({
                                    driverId: driverStanding.driverId,
                                    surname: driverStanding.surname,
                                    forename: driverStanding.forename, 
                                    position: driverStanding.position, 
                                    picture: driverStanding.picture
                                })

                                aux.push({
                                    driverId: driverStanding.driverId,
                                    driver: `${driverStanding.forename} ${driverStanding.surname}`,
                                    nationality: driverStanding.nationality,
                                    points: driverStanding.points,
                                    position: driverStanding.position,
                                    wins: driverStanding.wins,
                                    ...(driversResultsSeason.length != 0 && {
                                        poles: poleCounts.find(d => d.driverId === driverStanding.driverId)?.count || 0,
                                    }),
                                    ...(driversResultsSeason.length != 0 && {
                                        fastestLap: fastestLapCounts.find(d => d.driverId === driverStanding.driverId)?.fastestLaps || 0,
                                    }),
                                    constructor: constructors,
                                })

                                if(driverStanding.wins != 0){
                                    diferentRaceWinners++;
                                }
                            }
                        });
                    });

                    setDriversTableData(aux.sort(function(a, b) {return b.points - a.points}));
                    
                    setDriversTableData2(buildInfosTableByRace());
   
                    driverPodium.sort(function(a, b) {return a.position - b.position;});   
                   
                    setDriversPodium(driverPodium.slice(0, 3));

                    const groupConstructorByRaceId = constructorsStandings.reduce((acc, current) => {
                        if (!acc[current.constructorId]) {
                            acc[current.constructorId] = [];
                        }
                        
                        acc[current.constructorId].push(current);
                        return acc;
                    }, {});

                    let groupedConstructorStandingsByRaceId = Object.values(groupConstructorByRaceId)
                    
                    groupedConstructorStandingsByRaceId = setLessRaces(groupedConstructorStandingsByRaceId, racesByYear.map(race => race.raceId))

                    groupedConstructorStandingsByRaceId.sort((a, b) => {
                        const ultimaCorridaA = a[a.length - 1];
                        const ultimaCorridaB = b[b.length - 1];

                        if (ultimaCorridaB.points !== ultimaCorridaA.points) {
                            return ultimaCorridaB.points - ultimaCorridaA.points;
                        } else {
                            return ultimaCorridaA.position - ultimaCorridaB.position;
                        }
                    });
                    
                    
                    let aux3 = [];
                    let diferentConstructorRaceWinners = 0;

                    groupedConstructorStandingsByRaceId.forEach(function(standing, index){
                        let lastConstructor = null;
                        standing.forEach(function(constructorStanding, index2) {
                            if(index2 == standing.length -1){
                                if(constructorStanding.wins != 0){
                                    diferentConstructorRaceWinners++;
                                }
                            }
                        });
                    });
                    
                    racesIds = [...new Set(racesIds)].sort(function(a, b) {return a - b });
                    
                    circuitList = infoPerSeasonChart.map((standing) => standing.circuitName.replace('_',' ')).slice(0, driversInfoData.rounds);
                    
                    let infoPerSeasonChartOrganized = infoPerSeasonChart.reduce((acc, current) => {
                        if (!acc[current.driverId]) {
                            acc[current.driverId] = [];
                        }
                        
                        acc[current.driverId].push(current);
                        return acc;
                    }, {});
                    
                    infoPerSeasonChartOrganized = Object.values(infoPerSeasonChartOrganized);

                    let setInfoDataAux = {
                        rounds: racesIds.length,
                        diferentDriversRaceWinners: diferentRaceWinners,
                        diferentConstructorsRaceWinners: diferentConstructorRaceWinners,
                    };

                    setDriversInfoData(setInfoDataAux);
                    
                    let dataset = [];

                    for(let i = 0; i < infoPerSeasonChartOrganized.length; i++){
                        let color = getRandomColor();
                        dataset.push({
                        label: infoPerSeasonChartOrganized[i][0].surname,
                        data: infoPerSeasonChartOrganized[i].map((infoStandingRace) => infoStandingRace.points).sort(function(a, b) {return a - b }),
                        pointRadius: 5,
                        backgroundColor: color,
                        fill: false,
                        borderColor: color,
                        tension: 0.01,
                        })
                    }

                    
            
                    setChart1Data({
                    labels: circuitList,
                    datasets: dataset
                    })
            
                    setChart1Options({
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
                    })
                }
            }else{
                if(constructorsStandings.length != 0 && racesByYear.length != 0){
                    calculateConstructorFastestLaps();

                    let constructorPoleCounts = {};

                    driversResultsSeason.forEach(r => {
                        if (r.grid === 1) {
                        const constructorId = r.constructorId;
                        const constructor = r.constructor;

                        if (!constructorPoleCounts[constructorId]) {
                            constructorPoleCounts[constructorId] = {
                            constructorId,
                            constructor,
                            poles: 0,
                            };
                        }

                        constructorPoleCounts[constructorId].poles++;
                        }
                    });

                    constructorPoleCounts = Object.values(constructorPoleCounts)

                    const driverNameMap = {};
                    driversStandings.forEach(d => {
                    driverNameMap[d.driverId] = `${d.forename} ${d.surname}`;
                    });

                    let constructorsDrivers = {};

                    driversResultsSeason.forEach(r => {
                    const constructorId = r.constructorId;
                    const driverId = r.driverId;

                    if (!constructorsDrivers[constructorId]) {
                        constructorsDrivers[constructorId] = new Set();
                    }

                    constructorsDrivers[constructorId].add(driverId);
                    });

                    constructorsDrivers = Object.keys(constructorsDrivers).map(constructorId => ({
                    constructorId: Number(constructorId),
                    drivers: Array.from(constructorsDrivers[constructorId]).map(driverId => ({
                        driverId: Number(driverId),
                        name: driverNameMap[driverId] ?? null,
                    })),
                    }));

                    const raceIdToRound = racesByYear.reduce((acc, race) => {
                        acc[race.raceId] = race.round;
                        return acc;
                    }, {});

                    const groupByRaceId = constructorsStandings.reduce((acc, current) => {
                        if (!acc[current.constructorId]) {
                            acc[current.constructorId] = [];
                        }

                        acc[current.constructorId].push({
                            ...current,
                            round: raceIdToRound[current.raceId] || null
                        });

                        return acc;
                    }, {});

        
                    let groupedStandingsByRaceId = Object.values(groupByRaceId);
                    
                    groupedStandingsByRaceId = setLessRaces(groupedStandingsByRaceId, racesByYear.map(race => race.raceId))

                    let aux = [];


                    groupedStandingsByRaceId.forEach(function(standing, index){
                        for(let i = 0; i < standing.length; i++ ){
                            racesIds.push(standing[i].raceId)

                            infoPerSeasonChart.push({
                                id: index,
                                raceId: standing[i].raceId,
                                constructorStandingsId: standing[i].constructorStandingsId,
                                constructorId: standing[i].constructorId,
                                name: standing[i].name,
                                points: standing[i].points,
                                position: standing[i].position,
                                position_text: standing[i].positionText,
                                wins: standing[i].wins,
                                circuit: standing[i].circuitName,
                                circuitName: standing[i].circuitName,
                                round: standing[i].round
                            });
                            
                            if(i == standing.length -1){
                                constructorPodium.push({
                                    constructorId: standing[i].constructorId,
                                    name: standing[i].name,
                                    position: standing[i].position, 
                                    picture: standing[i].picture
                                })
                    
                                aux.push({
                                    constructorStandingsId: standing[i].constructorStandingsId,
                                    constructorId: standing[i].constructorId,
                                    constructor: standing[i].name,
                                    nationality: standing[i].nationality,
                                    points: standing[i].points,
                                    position: standing[i].position,
                                    wins: standing[i].wins,
                                    ...(driversResultsSeason.length != 0 && {
                                        poles: constructorPoleCounts.find(d => d.constructorId == standing[i].constructorId)?.poles || 0,
                                    }),
                                    ...(driversResultsSeason.length != 0 && {
                                        drivers: constructorsDrivers.find(d => d.constructorId == standing[i].constructorId)?.drivers.map((driver) => driver.name) || 0,
                                    }),
                                    ...(driversResultsSeason.length != 0 && {
                                        fastestLap: constructorFastestLaps.find(d => d.constructorId == standing[i].constructorId)?.fastestLaps || 0,
                                    }),
                                })
                            }
                        }
                    });
                    
                    constructorPodium.sort(function(a, b) {return a.position - b.position;});   
                    
                    setDriversTableData(aux.sort(function(a, b) {return b.points - a.points;}));
                    
                    setConstructorsTableData2(buildInfosTableByRace());
                    
                    setConstructorsPodium(constructorPodium.slice(0, 3));
                    
                    groupedStandingsByRaceId.sort((a, b) => {
                        const ultimaCorridaA = a[a.length - 1];
                        const ultimaCorridaB = b[b.length - 1];

                        if (ultimaCorridaB.points !== ultimaCorridaA.points) {
                            return ultimaCorridaB.points - ultimaCorridaA.points;
                        } else {
                            return ultimaCorridaA.position - ultimaCorridaB.position;
                        }
                    });
                    
                    racesIds = [...new Set(racesIds)].sort(function(a, b) {return a - b })
                    
                    circuitList = infoPerSeasonChart.map((standing) => standing.circuitName.replace('_',' ')).slice(0, driversInfoData.rounds);

                    let infoPerSeasonChartOrganized = infoPerSeasonChart.reduce((acc, current) => {
                        if (!acc[current.constructorId]) {
                            acc[current.constructorId] = [];
                        }
                        
                        acc[current.constructorId].push(current);
                        return acc;
                    }, {});
                    
                    
                    infoPerSeasonChartOrganized = Object.values(infoPerSeasonChartOrganized);
                    
                    let dataset = [];
                    
                    
                    for(let i = 0; i < infoPerSeasonChartOrganized.length; i++){
                        let color = getRandomColor();
                        dataset.push({
                        label: infoPerSeasonChartOrganized[i][0].name,
                        data: infoPerSeasonChartOrganized[i].map((infoStandingRace) => infoStandingRace.points).sort(function(a, b) {return a - b }),
                        pointRadius: 5,
                        backgroundColor: color,
                        fill: false,
                        borderColor: color,
                        tension: 0.01,
                        })
                    }
        
                    setChart1Data({
                        labels: circuitList,
                        datasets: dataset
                    }) 
        
                    setChart1Options({
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
                    })
                }
            }
        } 
        

        function setLessRaces(arr, raceIdsAno) {
            const circuitNamesPorRaceId = {};
            
            if(arr[0][0].hasOwnProperty('driverStandingsId')){
                let driver = arr;
                driver.forEach(corridasPiloto => {
                    corridasPiloto.forEach(corrida => {
                    const { raceId, circuitName } = corrida;
                    if (!circuitNamesPorRaceId[raceId] && circuitName) {
                        circuitNamesPorRaceId[raceId] = circuitName;
                    }
                    });
                });

                return driver.map(corridasPiloto => {
                    const corridasPorId = Object.fromEntries(
                    corridasPiloto.map(c => [c.raceId, c])
                    );

                    const corridaExemplo = corridasPiloto[0];
                    if (!corridaExemplo) return [];
                    
                    const { driverStandingsId, driverId, surname, forename, picture, nationality, round } = corridaExemplo;
                    
                    const corridasCompletas = [];

                    raceIdsAno.forEach((raceId, index) => {
                        if (corridasPorId[raceId]) {
                            corridasCompletas.push(corridasPorId[raceId]);
                        } else {
                            let points = 0;

                            if (index > 0) {
                                const corridaAnterior = corridasCompletas[index - 1];
                                if (corridaAnterior) {
                                    points = corridaAnterior.points;
                                }
                            }

                            corridasCompletas.push({
                                driverStandingsId,
                                raceId,
                                driverId,
                                surname,
                                forename,
                                nationality,
                                picture,
                                circuitName: circuitNamesPorRaceId[raceId],
                                points, 
                                round
                            });
                        }
                    });
                    
                    return corridasCompletas.sort((a, b) => a.round - b.round);
                });
            }else{
                let constructor = arr;
                constructor.forEach(corridasConstructor => {
                    corridasConstructor.forEach(corrida => {
                    const { raceId, circuitName } = corrida;
                    if (!circuitNamesPorRaceId[raceId] && circuitName) {
                        circuitNamesPorRaceId[raceId] = circuitName;
                    }
                    });
                });

                return constructor.map(corridasConstructor => {
                    const corridasPorId = Object.fromEntries(
                    corridasConstructor.map(c => [c.raceId, c])
                    );

                    const corridaExemplo = corridasConstructor[0];
                    if (!corridaExemplo) return [];
                    
                    const { constructorStandingsId, constructorId, name, nationality } = corridaExemplo;
                    
                    const corridasCompletas = [];

                    raceIdsAno.forEach((raceId, index) => {
                        if (corridasPorId[raceId]) {
                            corridasCompletas.push(corridasPorId[raceId]);
                        } else {
                            let points = 0;

                            if (index > 0) {
                                const corridaAnterior = corridasCompletas[index - 1];
                                if (corridaAnterior) {
                                    points = corridaAnterior.points;
                                }
                            }

                            corridasCompletas.push({
                                constructorStandingsId,
                                raceId,
                                constructorId,
                                name,
                                nationality,
                                circuitName: circuitNamesPorRaceId[raceId],
                                points
                            });
                        }
                    });                     

                    return corridasCompletas.sort((a, b) => a.round - b.round);
                });
            }
        }

        function calculatePodiumAndPoleStats() {
            if (driversResultsSeason.length === 0) return;

            const podium = new Set();
            const constructors = new Set();
            const poleD = new Set();
            const poleC = new Set();

            driversResultsSeason.forEach(r => {
                const pos = Number(r.position) || Number(r.positionText);

                if (pos >= 1 && pos <= 3) {
                podium.add(r.driverId);
                constructors.add(r.constructorId);
                }

                if (r.grid === 1) {
                poleD.add(r.driverId);
                poleC.add(r.constructorId);
                }
            });

            setPodiumPositions([...podium]);
            setConstructorsOnPodium([...constructors]);
            setPoleDrivers([...poleD]);
            setPoleConstructors([...poleC]);
        }


        function getFastestLapWinners() {
            if (!driversResultsSeason || driversResultsSeason.length === 0) return;

            const resultsByRace = {};

            driversResultsSeason.forEach(r => {
                if (!resultsByRace[r.raceId]) resultsByRace[r.raceId] = [];
                resultsByRace[r.raceId].push(r);
            });

            const counts = {};

            function toMs(timeStr) {
                if (!timeStr) return Infinity;
                const [min, sec] = timeStr.split(":");
                return (Number(min) * 60 + Number(sec)) * 1000;
            }

            Object.values(resultsByRace).forEach(race => {
                const valid = race.filter(r => r.fastestLapTime);
                if (valid.length === 0) return;

                let fastest = valid[0];

                for (let i = 1; i < valid.length; i++) {
                if (toMs(valid[i].fastestLapTime) < toMs(fastest.fastestLapTime)) {
                    fastest = valid[i];
                }
                }

                const driverId = Number(fastest.driverId);

                if (!counts[driverId]) {
                counts[driverId] = { driverId, fastestLaps: 0 };
                }

                counts[driverId].fastestLaps++;
            });

            setFastestLapCounts(Object.values(counts));
        }

        function calculateConstructorFastestLaps() {
            if (fastestLapCounts.length === 0 || driversResultsSeason.length === 0) return;

            const temp = {};

            fastestLapCounts.forEach(entry => {
                const driverId = entry.driverId;
                const flCount = entry.fastestLaps;

                const teams = driversResultsSeason
                .filter(r => r.driverId === driverId)
                .map(r => r.constructorId);

                const uniqueTeams = [...new Set(teams)];

                uniqueTeams.forEach(constructorId => {
                if (!temp[constructorId]) {
                    temp[constructorId] = { constructorId, fastestLaps: 0 };
                }
                temp[constructorId].fastestLaps += flCount;
                });
            });

            setConstructorFastestLaps(Object.values(temp));
            }

            function buildInfosTableByRace() {

                const totalRounds = Math.max(...racesByYear.map(r => r.round));

                if (searchTypeChart === "drivers") {

                    const grouped = driversResultsSeason.reduce((acc, result) => {
                        if (!acc[result.driverId]) acc[result.driverId] = [];

                        const raceInfo = racesByYear.find(r => r.raceId === result.raceId);
                        const standingInfo = driversStandings.find(
                            s => s.raceId === result.raceId && s.driverId === result.driverId
                        );

                        acc[result.driverId].push({
                            driverId: result.driverId,
                            constructorId: result.constructorId,
                            raceId: result.raceId,
                            circuitName: standingInfo?.circuitName || "",
                            round: raceInfo?.round ?? null,
                            position: result.position,
                            positionText: result.positionText,
                            statusId: result.statusId,
                            points: result.points ?? 0
                        });

                        return acc;
                    }, {});

                    const finalArray = Object.entries(grouped).map(([driverId, results]) => {

                        const fullResults = Array.from({ length: totalRounds }, () => ({
                            points: 0,
                            position: null,
                            positionText: "-",
                            constructorId: null,
                            circuitName: "",
                            round: null,
                        }));

                        results.forEach(r => {
                            if (r.round != null) {
                                fullResults[r.round - 1] = r;
                            }
                        });

                        const lastRace = racesByYear.find(r => r.round === totalRounds);
                        const finalStanding = lastRace
                            ? driversStandings.find(
                                s => s.driverId == driverId && s.raceId == lastRace.raceId
                            )
                            : null;

                        const finalPosition = finalStanding?.position || null;

                        const standingInfo = driversStandings.find(s => s.driverId == driverId);
                        const driverName = standingInfo
                            ? `${standingInfo.forename} ${standingInfo.surname}`
                            : "Unknown";

                        return {
                            driverId,
                            driverName,
                            finalPosition,
                            results: fullResults
                        };
                    });

                    return finalArray.sort((a, b) => a.finalPosition - b.finalPosition);
                }

                if (searchTypeChart === "constructors") {
                    const grouped = constructorsResultsSeason.reduce((acc, result) => {
                        if (!acc[result.constructorId]) acc[result.constructorId] = [];

                        const raceInfo = racesByYear.find(r => r.raceId === result.raceId);
                        const standingInfo = constructorsStandings.find(
                            s => s.raceId === result.raceId && s.constructorId === result.constructorId
                        );

                        acc[result.constructorId].push({
                            constructorId: result.constructorId,
                            raceId: result.raceId,
                            circuitName: standingInfo?.circuitName || "",
                            round: raceInfo?.round ?? null,
                            points: result.points ?? 0,
                        });

                        return acc;
                    }, {});


                    const allTeams = Object.keys(grouped);

                    racesByYear.forEach(race => {
                        const raceId = race.raceId;

                        const teamsInRace = allTeams
                            .map(constructorId => {
                                const result = grouped[constructorId].find(r => r.raceId === raceId);
                                return result
                                    ? { constructorId, points: result.points }
                                    : null;
                            })
                            .filter(Boolean);

                        teamsInRace.sort((a, b) => b.points - a.points);

                        teamsInRace.forEach((team, index) => {
                            const record = grouped[team.constructorId].find(r => r.raceId === raceId);
                            if (record) record.position = index + 1;
                        });
                    });

                    const finalArray = Object.entries(grouped).map(([constructorId, results]) => {

                        const fullResults = Array(totalRounds).fill(null);

                        results.forEach(r => {
                            if (r.round != null) {
                                fullResults[r.round - 1] = r;
                            }
                        });

                        const lastRace = racesByYear.find(r => r.round === totalRounds);
                        const finalStanding = lastRace
                            ? constructorsStandings.find(
                                s => s.constructorId == constructorId && s.raceId == lastRace.raceId
                            )
                            : null;

                        const finalPosition = finalStanding?.position || null;

                        const standingInfo = constructorsStandings.find(s => s.constructorId == constructorId);

                        const constructorName = standingInfo?.name || "Unknown";

                        return {
                            constructorId,
                            constructorName,
                            finalPosition,
                            results: fullResults
                        };
                    });
                    console.log(finalArray.sort((a, b) => a.finalPosition - b.finalPosition))
                    return finalArray.sort((a, b) => a.finalPosition - b.finalPosition);
                }
            }

        calculatePodiumAndPoleStats();
        dataChartsGeneration();

    }, [isLoading1, driversResultsSeason, searchTypeChart, table2Selector]);
    
    
    useEffect(() => {  
        if(searchTypeChart == 'drivers'){
            if (driversPodium.length == 0) return;
            
            async function fetchData() {
                try { 
                    await getDriversByDriversId(driversPodium.map(driver => driver.driverId))
                    .then((response) => {
                        let aux = response.data;
    
                        let aux2 = driversPodium.map(driver => {
                            const find = aux.find(d => d.driverId == driver.driverId);
                            return {
                                ...driver,
                                picture: find?.picture || null,
                            };
                        });
                        
                        setDriversPodiumLoaded(aux2.sort(function(a, b) {return a.position - b.position}))
                    })
                .catch((error) => console.error(error));
                
                } catch (err) {
                    console.log('err')
                } finally {
                    setIsLoading2(false);
                }
            }
            fetchData();

        }else{
            if (constructorsPodium.length == 0) return;
            
            async function fetchData() {
                try { 
                    await getConstructorsByConstructorsId(constructorsPodium.map(constructor => constructor.constructorId))
                    .then((response) => {
                        let aux = response.data;
    
                        let aux2 = constructorsPodium.map(constructor => {
                            const find = aux.find(d => d.constructorId == constructor.constructorId);
                            return {
                                ...constructor,
                                picture: find?.picture || null,
                            };
                        });
    
                        setConstructorsPodiumLoaded(aux2.sort(function(a, b) {return a.position - b.position}))
                    })
                .catch((error) => console.error(error));
                
                } catch (err) {
                    console.log('err')
                } finally {
                    setIsLoading2(false);
                }
            }
            fetchData();
        }
    }, [driversPodium, constructorsPodium]);


    function nationalityToCountryCode(input) {
        if (!input) return null;

        const mapping = {
            "Afghan": "AF",
            "Albanian": "AL",
            "Algerian": "DZ",
            "American": "US",
            "USA": "US",
            "Andorran": "AD",
            "Angolan": "AO",
            "Argentinian": "AR",
            "Armenian": "AM",
            "Australian": "AU",
            "Austrian": "AT",
            "Azerbaijani": "AZ",
            "Bahamian": "BS",
            "Bahraini": "BH",
            "Bangladeshi": "BD",
            "Barbadian": "BB",
            "Belarusian": "BY",
            "Belgian": "BE",
            "Belizean": "BZ",
            "Beninese": "BJ",
            "Bhutanese": "BT",
            "Bolivian": "BO",
            "Bosnian": "BA",
            "Brazilian": "BR",
            "British": "GB",
            "Bruneian": "BN",
            "Bulgarian": "BG",
            "Burkinabe": "BF",
            "Burmese": "MM",
            "Burundian": "BI",
            "Cambodian": "KH",
            "Cameroonian": "CM",
            "Canadian": "CA",
            "Cape Verdean": "CV",
            "Chadian": "TD",
            "Chilean": "CL",
            "Chinese": "CN",
            "Colombian": "CO",
            "Congolese": "CG",
            "Costa Rican": "CR",
            "Croatian": "HR",
            "Cuban": "CU",
            "Cypriot": "CY",
            "Czech": "CZ",
            "Danish": "DK",
            "Djiboutian": "DJ",
            "Dominican": "DO",
            "Dutch": "NL",
            "Ecuadorian": "EC",
            "Egyptian": "EG",
            "Salvadoran": "SV",
            "English": "GB",
            "Equatoguinean": "GQ",
            "Eritrean": "ER",
            "Estonian": "EE",
            "Ethiopian": "ET",
            "Finnish": "FI",
            "French": "FR",
            "Gabonese": "GA",
            "Gambian": "GM",
            "Georgian": "GE",
            "German": "DE",
            "Ghanaian": "GH",
            "Greek": "GR",
            "Guatemalan": "GT",
            "Guinean": "GN",
            "Haitian": "HT",
            "Honduran": "HN",
            "Hungarian": "HU",
            "Icelander": "IS",
            "Indian": "IN",
            "Indonesian": "ID",
            "Iranian": "IR",
            "Iraqi": "IQ",
            "Irish": "IE",
            "Israeli": "IL",
            "Italian": "IT",
            "Jamaican": "JM",
            "Japanese": "JP",
            "Jordanian": "JO",
            "Kazakh": "KZ",
            "Kenyan": "KE",
            "Kuwaiti": "KW",
            "Lao": "LA",
            "Latvian": "LV",
            "Lebanese": "LB",
            "Liberian": "LR",
            "Libyan": "LY",
            "Lithuanian": "LT",
            "Luxembourgish": "LU",
            "Macedonian": "MK",
            "Malagasy": "MG",
            "Malaysian": "MY",
            "Malian": "ML",
            "Maltese": "MT",
            "Mauritanian": "MR",
            "Mauritian": "MU",
            "Mexican": "MX",
            "Moldovan": "MD",
            "Monegasque": "MC",
            "Mongolian": "MN",
            "Montenegrin": "ME",
            "Moroccan": "MA",
            "Mozambican": "MZ",
            "Namibian": "NA",
            "Nepalese": "NP",
            "New Zealander": "NZ",
            "Nicaraguan": "NI",
            "Nigerien": "NE",
            "Nigerian": "NG",
            "North Korean": "KP",
            "Norwegian": "NO",
            "Omani": "OM",
            "Pakistani": "PK",
            "Palestinian": "PS",
            "Panamanian": "PA",
            "Paraguayan": "PY",
            "Peruvian": "PE",
            "Philippine": "PH",
            "Polish": "PL",
            "Portuguese": "PT",
            "Qatari": "QA",
            "Romanian": "RO",
            "Russian": "RU",
            "Rwandan": "RW",
            "Saudi": "SA",
            "Scottish": "GB",
            "Senegalese": "SN",
            "Serbian": "RS",
            "Singaporean": "SG",
            "Slovak": "SK",
            "Slovenian": "SI",
            "Somali": "SO",
            "South African": "ZA",
            "South Korean": "KR",
            "Spanish": "ES",
            "Sri Lankan": "LK",
            "Sudanese": "SD",
            "Surinamese": "SR",
            "Swazi": "SZ",
            "Swedish": "SE",
            "Swiss": "CH",
            "Syrian": "SY",
            "Taiwanese": "TW",
            "Tajik": "TJ",
            "Tanzanian": "TZ",
            "Thai": "TH",
            "Togolese": "TG",
            "Tunisian": "TN",
            "Turkish": "TR",
            "Ugandan": "UG",
            "Ukrainian": "UA",
            "Uruguayan": "UY",
            "Uzbek": "UZ",
            "Venezuelan": "VE",
            "Vietnamese": "VN",
            "Welsh": "GB",
            "Yemeni": "YE",
            "Zambian": "ZM",
            "Zimbabwean": "ZW"
        };

        const countryMapping = {
            "UAE": "AE",
            "Afghanistan": "AF",
            "Albania": "AL",
            "Algeria": "DZ",
            "USA": "US",
            "United States": "US",
            "Andorra": "AD",
            "Angola": "AO",
            "Argentina": "AR",
            "Armenia": "AM",
            "Australia": "AU",
            "Austria": "AT",
            "Azerbaijan": "AZ",
            "Bahamas": "BS",
            "Bahrain": "BH",
            "Bangladesh": "BD",
            "Barbados": "BB",
            "Belarus": "BY",
            "Belgium": "BE",
            "Belize": "BZ",
            "Benin": "BJ",
            "Bhutan": "BT",
            "Bolivia": "BO",
            "Bosnia and Herzegovina": "BA",
            "Brazil": "BR",
            "UK": "GB",
            "Brunei": "BN",
            "Bulgaria": "BG",
            "Burkina Faso": "BF",
            "Myanmar": "MM",
            "Burundi": "BI",
            "Cambodia": "KH",
            "Cameroon": "CM",
            "Canada": "CA",
            "Cape Verde": "CV",
            "Chad": "TD",
            "Chile": "CL",
            "China": "CN",
            "Colombia": "CO",
            "Republic of the Congo": "CG",
            "Costa Rica": "CR",
            "Croatia": "HR",
            "Cuba": "CU",
            "Cyprus": "CY",
            "Czech Republic": "CZ",
            "Denmark": "DK",
            "Djibouti": "DJ",
            "Dominican Republic": "DO",
            "Netherlands": "NL",
            "Ecuador": "EC",
            "Egypt": "EG",
            "El Salvador": "SV",
            "Equatorial Guinea": "GQ",
            "Eritrea": "ER",
            "Estonia": "EE",
            "Ethiopia": "ET",
            "Finland": "FI",
            "France": "FR",
            "Georgia": "GE",
            "Germany": "DE",
            "Ghana": "GH",
            "Greece": "GR",
            "Guatemala": "GT",
            "Guinea": "GN",
            "Haiti": "HT",
            "Honduras": "HN",
            "Hungary": "HU",
            "Iceland": "IS",
            "India": "IN",
            "Indonesia": "ID",
            "Iran": "IR",
            "Iraq": "IQ",
            "Ireland": "IE",
            "Israel": "IL",
            "Italy": "IT",
            "Jamaica": "JM",
            "Japan": "JP",
            "Jordan": "JO",
            "Kazakhstan": "KZ",
            "Kenya": "KE",
            "Kuwait": "KW",
            "Laos": "LA",
            "Latvia": "LV",
            "Lebanon": "LB",
            "Liberia": "LR",
            "Libya": "LY",
            "Lithuania": "LT",
            "Luxembourg": "LU",
            "North Macedonia": "MK",
            "Madagascar": "MG",
            "Malaysia": "MY",
            "Mali": "ML",
            "Malta": "MT",
            "Mauritania": "MR",
            "Mauritius": "MU",
            "Mexico": "MX",
            "Moldova": "MD",
            "Monaco": "MC",
            "Mongolia": "MN",
            "Montenegro": "ME",
            "Morocco": "MA",
            "Mozambique": "MZ",
            "Namibia": "NA",
            "Nepal": "NP",
            "New Zealand": "NZ",
            "Nicaragua": "NI",
            "Niger": "NE",
            "Nigeria": "NG",
            "North Korea": "KP",
            "Norway": "NO",
            "Oman": "OM",
            "Pakistan": "PK",
            "Palestine": "PS",
            "Panama": "PA",
            "Paraguay": "PY",
            "Peru": "PE",
            "Philippines": "PH",
            "Poland": "PL",
            "Portugal": "PT",
            "Qatar": "QA",
            "Romania": "RO",
            "Russia": "RU",
            "Rwanda": "RW",
            "Saudi Arabia": "SA",
            "Senegal": "SN",
            "Serbia": "RS",
            "Singapore": "SG",
            "Slovakia": "SK",
            "Slovenia": "SI",
            "Somalia": "SO",
            "South Africa": "ZA",
            "South Korea": "KR",
            "Spain": "ES",
            "Sri Lanka": "LK",
            "Sudan": "SD",
            "Suriname": "SR",
            "Swaziland": "SZ",
            "Sweden": "SE",
            "Switzerland": "CH",
            "Syria": "SY",
            "Taiwan": "TW",
            "Tajikistan": "TJ",
            "Tanzania": "TZ",
            "Thailand": "TH",
            "Togo": "TG",
            "Tunisia": "TN",
            "Turkey": "TR",
            "Uganda": "UG",
            "Ukraine": "UA",
            "Uruguay": "UY",
            "Uzbekistan": "UZ",
            "Venezuela": "VE",
            "Vietnam": "VN",
            "Yemen": "YE",
            "Zambia": "ZM",
            "Zimbabwe": "ZW"
        };

        const normalized = input.trim().toLowerCase();

        const natKey = Object.keys(mapping)
            .find(k => k.toLowerCase() === normalized);

        if (natKey) return mapping[natKey];

        const countryKey = Object.keys(countryMapping)
            .find(k => k.toLowerCase() === normalized);

        if (countryKey) return countryMapping[countryKey];

        return null;
    }

    
    const handleSearchTypeChart = (e) => {
        setSearchTypeChart(e.target.value)
        
        infoPerSeasonChart = [];
    }
    
    
    const handleTable2Selector = (e) => {
        setTable2Selector(e.target.value)

    }


    const {columns, initialColumnOrder} = useMemo(() => {
        let cols;
        if (searchTypeChart === "drivers" && poleCounts.length != null) {
           cols = [
            { accessorKey: "position", header: "Position", size: 80 },
            { 
                accessorKey: 'driver',
                header: 'Driver',
                size: 160,
                Cell: ({ cell, row }) => {
                const driver = row.original;
            
                return (
                    <span
                    onClick={() => onClickDriverNameHandler(driver.driverId)}
                    style={{
                        cursor: 'pointer',
                        color: '#000000ff',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#e1e1e1ff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                        e.currentTarget.style.color = '#000000ff';
                        e.currentTarget.style.transition = 'all 0.2s ease';
                        e.currentTarget.style.cursor = 'pointer';
                    }}
                    >
                    {driver.driver}
                    </span>
                );
                },
            },
            {
                accessorKey: "nationality",
                header: "Nationality",
                size: 120,
                Cell: ({ row }) => {
                const code = nationalityToCountryCode(row.original.nationality);
                return (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img
                        src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`}
                        alt={row.original.nationality}
                        width={20}
                        height={15}
                        style={{ borderRadius: "2px" }}
                    />
                    {row.original.nationality}
                    </div>
                );
                },
            },
            { 
                accessorKey: 'constructor',
                header: 'Constructor',
                size: 150,
                Cell: ({ row }) => {
                    const constructors = row.original.constructor;

                    if (Array.isArray(constructors)) {
                    return (
                        <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '4px',
                            lineHeight: 1.2,
                        }}
                        >
                        {constructors.map((team, i) => (
                            <span key={i}>{team}</span>
                        ))}
                        </div>
                    );
                    }

                    return <span>{constructors}</span>;
                },
            },
            { accessorKey: "poles", header: "Poles", size: 80 },
            { accessorKey: "wins", header: "Wins", size: 80 },
            { accessorKey: "fastestLap", header: "FastestLap", size: 80 },
            { accessorKey: "points", header: "Points", size: 80 },
            ];
            const order = ["position", "driver", "nationality", "constructor", "poles", "wins", "fastestLap", "points"];

            return { columns: cols, initialColumnOrder: order };
        } else {
            cols = [
            { accessorKey: "position", header: "Position", size: 80 },
            { accessorKey: "constructor", header: "Constructor", size: 150 },
            {
                accessorKey: "nationality",
                header: "Nationality",
                size: 120,
                Cell: ({ row }) => {
                const code = nationalityToCountryCode(row.original.nationality);
                return (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img
                        src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`}
                        alt={row.original.nationality}
                        width={20}
                        height={15}
                        style={{ borderRadius: "2px" }}
                    />
                    {row.original.nationality}
                    </div>
                );
                },
            },
            { 
                accessorKey: 'drivers',
                header: 'Drivers',
                size: 160,
                Cell: ({ row }) => {
                    const drivers = row.original.drivers;

                    if (Array.isArray(drivers)) {
                    return (
                        <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '4px',
                            lineHeight: 1.2,
                        }}
                        >
                        {drivers.map((driver, i) => (
                            <span key={i}>{driver}</span>
                        ))}
                        </div>
                    );
                    }

                    return <span>{drivers}</span>;
             }
            },
            { accessorKey: "poles", header: "Poles", size: 80 },
            { accessorKey: "wins", header: "Wins", size: 80 },
            { accessorKey: "fastestLap", header: "FastestLap", size: 80 },
            { accessorKey: "points", header: "Points", size: 80 },
            ];
            const order = ["position", "constructor", "nationality", "drivers", "poles", "wins", "fastestLap", "points"];

            return { columns: cols, initialColumnOrder: order };
        }
        
    }, [searchTypeChart]);

    
    const data = useMemo(() => driversTableData, [driversTableData]);

    const table = useMaterialReactTable({
        data,
        columns,
        enableRowSelection: false,
        enableColumnOrdering: false,
        enableBottomToolbar: false,
        enableTopToolbar: false,
        enableSorting: false,
        enableToolbarInternalActions: false,
        enableColumnActions: false,
        enablePagination: false,


        state: {
            columnOrder,
        },
        

        muiTablePaperProps: {
            sx: {
            backgroundColor: '#303030',
            color: '#fff',
            fontSize: "15.5px",
            },
        },
        muiTableContainerProps: {
            sx: {
            backgroundColor: '#303030',
            fontSize: "15.5px",
            maxHeight: "470px",
            overflowY: "auto",
            overflowX: "auto",
            },
        },
        muiTableHeadCellProps: {
            sx: {
            backgroundColor: '#303030ff',
            color: '#fff',
            fontSize: "15.5px",
            },
        },
        muiTableBodyCellProps: {
            sx: {
            backgroundColor: '#1e1e1e',
            color: '#fff',
            borderBottom: '1px solid #4c4c4c',
            fontSize: "15.3px",
            },
        },

        
        muiTableBodyRowProps: ({ row }) => {
            const pos = Number(row.original?.position);
            const index = parseInt(row.id ?? 9999);

            if (pos === 1 || index === 0) {
            return {
                sx: {
                '& td': {
                    backgroundColor: '#ffd900ff',
                    borderBottom: '1px solid #b9b9b9ff',
                    color: '#000 !important',
                    fontWeight: 'bold',
                },
                },
            };
            }
            if (pos === 2 || index === 1) {
            return {
                sx: {
                '& td': {
                    backgroundColor: '#C0C0C0',
                    borderBottom: '1px solid #b9b9b9ff',
                    color: '#000 !important',
                    fontWeight: 'bold',
                },
                },
            };
            }
            if (pos === 3 || index === 2) {
            return {
                sx: {
                '& td': {
                    backgroundColor: '#CD7F32',
                    borderBottom: '1px solid #b9b9b9ff',
                    color: '#000 !important',
                    fontWeight: 'bold',
                },
                },
            };
            }

            return {
            sx: {
                '& td': {
                backgroundColor: '#939393ff',
                color: '#000',
                borderBottom: '1px solid #b9b9b9ff',
                fontWeight: 'bold',
                },
            },
            };
        },
    });

    const columns2 = useMemo(() => {
        const tableData = searchTypeChart === "drivers"
            ? driversTableData2
            : constructorsTableData2;

        if (!tableData || tableData.length === 0) return [];

        const sampleResults = tableData[0].results || [];

        const raceColumns = sampleResults.map((race, index) => {
            const circuitObj = circuitListInfo.find(
                c => c.circuitRef === (race?.circuitName || "")
            );
            const country = circuitObj?.country || null;
            const countryCode = nationalityToCountryCode(country);

            return {
                id: `${race?.circuitName ?? 'race'}_${index}`,
                accessorFn: (row) => {
                    const r = row?.results?.[index] ?? {
                        points: 0,
                        position: null,
                        positionText: "-",
                    };

                    if (table2Selector === "points") {
                        return r.points ?? 0;
                    }

                    if (searchTypeChart === "drivers") {
                        return r.positionText ?? "-";
                    }
                    return r.position ?? "-";
                },
                header: (
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "4px 0",
                        }}
                        title={`${race?.circuitName ?? `Round ${index + 1}`} (${country || "Unknown"})`}
                    >
                        {countryCode ? (
                            <img
                                src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode}.svg`}
                                alt={country}
                                width={26}
                                height={20}
                                style={{
                                    display: "block",
                                    borderRadius: "2px",
                                }}
                            />
                        ) : (
                            <span>{race?.circuitName ?? `R${index + 1}`}</span>
                        )}
                    </div>
                ),
                size: 80,
                Cell: ({ cell }) => (
                    <div style={{ textAlign: "center" }}>
                        {cell.getValue()}
                    </div>
                ),
                muiTableBodyCellProps: ({ row }) => {
                    const r = row?.original?.results?.[index] ?? {
                        points: 0,
                        position: null,
                        positionText: "-",
                    };

                    const pos = r.position != null ? Number(r.position) : null;
                    const pts = Number(r.points ?? 0);
                    const posText = r.positionText;

                    let background = "#939393ff";
                    let color = "#000000";

                    const retiredCodes = ["R", "NP", "W", "D"];
                    if (retiredCodes.includes(posText)) {
                        return {
                            sx: {
                                backgroundColor: "#ebebebff",
                                color: "#ff0000",
                                textAlign: "center",
                                fontWeight: "bold",
                                borderTop: "1px solid #ffffffff",
                                borderLeft: "1px solid #ffffffff",
                                borderRight: "1px solid #ffffffff",
                            }
                        };
                    }

                    if (pos === 1) background = "#ffd700"; 
                    else if (pos === 2) background = "#c0c0c0"; 
                    else if (pos === 3) background = "#cd7f32";    
                    else if (pts === 0) background = "#9b59b6";     
                    else background = "#2ecc71";                 

                    return {
                        sx: {
                            backgroundColor: background,
                            color: "#000000",
                            textAlign: "center",
                            fontWeight: "bold",
                            borderTop: "1px solid #ffffffff",
                            borderLeft: "1px solid #ffffffff",
                            borderRight: "1px solid #ffffffff",
                        }
                    };
                },
            };
        });

        let firstColumn;
        if (searchTypeChart === "drivers") {
            firstColumn = {
                accessorKey: "driverName",
                header: "Driver",
                size: 200,
                Cell: ({ row }) => {
                    const driver = row.original;
                    return (
                        <span
                            onClick={() => onClickDriverNameHandler(driver.driverId)}
                            style={{ cursor: "pointer", color: "#000", fontWeight: "bold", paddingLeft: "12px" }}
                        >
                            {driver.driverName}
                        </span>
                    );
                },
                muiTableBodyCellProps: { sx: { backgroundColor: "#939393ff", color: "black" } },
            };
        } else {
            firstColumn = {
                accessorKey: "constructorName",
                header: "Constructor",
                size: 200,
                Cell: ({ row }) => {
                    const team = row.original;
                    return (
                        <span style={{ cursor: "pointer", color: "#000", fontWeight: "bold", paddingLeft: "12px" }}>
                            {team.constructorName}
                        </span>
                    );
                },
                muiTableBodyCellProps: { sx: { backgroundColor: "#939393ff", color: "black" } },
            };
        }

        return [firstColumn, ...raceColumns];

    }, [table2Selector, driversTableData2, constructorsTableData2, searchTypeChart]);

    const data2 = useMemo(() => {
        return searchTypeChart === "drivers" ? driversTableData2 : constructorsTableData2;
    }, [driversTableData2, constructorsTableData2, searchTypeChart]);

    const table2 = useMaterialReactTable({
        data: data2,
        columns: columns2,

        enableRowSelection: false,
        enableColumnOrdering: false,
        enableBottomToolbar: false,
        enableTopToolbar: false,
        enableSorting: false,
        enableToolbarInternalActions: false,
        enableColumnActions: false,
        enablePagination: false,

        state: {
            columnOrder,
        },

        muiTableProps: {
            sx: {
                borderCollapse: "collapse",
            }
        },

        muiTablePaperProps: {
            sx: {
                backgroundColor: '#303030',
                color: '#fff',
                fontSize: "15.5px",
            },
        },
        muiTableContainerProps: {
            sx: {
                backgroundColor: '#303030',
                fontSize: "15.5px",
                maxHeight: "500px",
                overflowY: "scroll" 
            },
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: '#303030ff',
                color: '#fff',
                fontSize: "15.5px",
            },
        },
        muiTableBodyCellProps: {
            sx: {
                backgroundColor: '#1e1e1e',
                color: '#fff',
                border: "1px solid #ffffff",
                fontSize: "15.3px",
            },
        },
    });

    
    function getRandomColor() {
        const chars = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += chars[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    return(
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
                <div className='div-general'>
                    {(driversPodiumLoaded.length != 0 && poleCounts.length != null && poleConstructors.length != null && poleDrivers.length != null && constructorsOnPodium.length != null && podiumPositions.length != null) && <div>
                        <div className='div-section div-content'>
                            <div className='div-infos'>
                                <div className='div-infos-left'>
                                    <img className="season-image" src={img}></img>
                                    <span className="season-name">{props.season}</span>
                                </div>
                                <div className='div-infos-right'>
                                    <div className='text-info'>Rounds: {driversInfoData.rounds}</div>
                                    <div className='text-info'>Diferent drivers race winners: {driversInfoData.diferentDriversRaceWinners}</div>
                                    <div className='text-info'>Diferent constructors race winners: {driversInfoData.diferentConstructorsRaceWinners}</div>
                                    <div className='text-info'>Diferent drivers on podium: { podiumPositions.length }</div>
                                    <div className='text-info'>Diferent constructors on podium: {constructorsOnPodium.length} </div>
                                    <div className='text-info'>Diferent drivers on pole: {poleDrivers.length}</div>
                                    <div className='text-info'>Diferent constructors on pole: {poleConstructors.length} </div>
                                </div>
                            </div>
                        </div>
                        <div className='div-search-type'>
                            <select className='search-type-chart' name="search-type-chart1" onChange={handleSearchTypeChart} value={searchTypeChart}>
                                <option value='drivers' key={Math.random()}>drivers</option>
                                <option value='constructors' key={Math.random()}>constructors</option>
                            </select>
                        </div>
                        <div className='div-section div-podium'>
                            <div className='div-podium-drivers-info'>
                                <div className='driver-section-header'>
                                    <p className='title-driver-section'>SEASON PODIUM</p>
                                </div>
                                <div className='podium-bars'>
                                    <div className='second-podium'>
                                        <div>
                                            {searchTypeChart == 'drivers' && <img onClick = {() => onClickDriverNameHandler(driversPodiumLoaded[1].driverId)} className="pilot-image" src={driversPodiumLoaded[1]?.picture} title={driversPodiumLoaded[1]?.forename + " " + driversPodiumLoaded[1]?.surname}></img>}
                                            {searchTypeChart == 'constructors' && <img className="constructor-image" src={constructorsPodiumLoaded[1]?.picture} title={constructorsPodiumLoaded[1]?.name}></img>}
                                        </div>
                                        <div className='second-bar'>
                                            <span>2nd</span>
                                        </div>
                                    </div>
                                    <div className='first-podium'>
                                        <div>
                                            {searchTypeChart == 'drivers' && <img onClick = {() => onClickDriverNameHandler(driversPodiumLoaded[0].driverId)} className="pilot-image" src={driversPodiumLoaded[0]?.picture} title={driversPodiumLoaded[0]?.forename + " " + driversPodiumLoaded[0]?.surname}></img>}
                                            {searchTypeChart == 'constructors' && <img className="constructor-image" src={constructorsPodiumLoaded[0]?.picture} title={constructorsPodiumLoaded[0]?.name}></img>}
                                        </div>
                                        <div className='first-bar'>
                                            <span>1st</span>
                                        </div>
                                    </div>
                                    <div className='third-podium'>
                                        <div>
                                            {searchTypeChart == 'drivers' && <img onClick = {() => onClickDriverNameHandler(driversPodiumLoaded[2].driverId)} className="pilot-image" src={driversPodiumLoaded[2]?.picture} title={driversPodiumLoaded[2]?.forename + " " + driversPodiumLoaded[2]?.surname}></img>}
                                            {searchTypeChart == 'constructors' && <img className="constructor-image" src={constructorsPodiumLoaded[2]?.picture} title={constructorsPodiumLoaded[2]?.name}></img>}
                                        </div>
                                        <div className='third-bar'>
                                            <span>3rd</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='div-section div-charts'>
                            <div className='div-chart-line-championchip'>
                                <div className='driver-section-header'>
                                    {searchTypeChart == 'drivers' && <p className='title-driver-section'>CHAMPIONCHIP DRIVERS RUN CHART</p>}
                                    {searchTypeChart == 'constructors' && <p className='title-constructor-section'>CHAMPIONCHIP CONSTRUCTORS RUN CHART</p>}
                                </div>
                                <Line data={chart1Data} options={chart1Options}/>
                            </div>
                        </div>
                        <div className='div-section div-tables'>
                            <div className='div-table-championchip'>
                                <div className='driver-section-header'>
                                    {searchTypeChart == 'drivers' && <p className='title-driver-section'>CHAMPIONCHIP DRIVERS  RUN TABLE</p>}
                                    {searchTypeChart == 'constructors' && <p className='title-constructor-section'>CHAMPIONCHIP CONSTRUCTORS RUN TABLE</p>}
                                </div>
                                <select className='table2Selector' name="" onChange={handleTable2Selector} value={table2Selector}>
                                    <option value='position' key={Math.random()}>position</option>
                                    <option value='points' key={Math.random()}>points</option>
                                </select>
                                <div className='div-table'>
                                    <div style={{ width: "100%", paddingBottom: "8px" }}>
                                        <div style={{ minWidth: "100px" }}>
                                            <MaterialReactTable table={table2}/>
                                        </div>
                                    </div>

                                    <Table2Legend />
                                </div>
                            </div>
                        </div>
                        <div className='div-section div-charts'>
                            <div className='div-chart-line-championchip'>
                                <div className='driver-section-header'>
                                    {searchTypeChart == 'drivers' && <p className='title-driver-section'>DRIVERS CHAMPIONCHIP TABLE RESUME</p>}
                                    {searchTypeChart == 'constructors' && <p className='title-constructor-section'>CONSTRUCTORS CHAMPIONCHIP TABLE RESUME</p>}
                                </div>
                                <div className='div-table'>
                                    <div style={{ width: "100%", paddingBottom: "8px" }}>
                                        <div style={{ minWidth: "100px" }}>
                                            <MaterialReactTable table={table}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}
                </div>
        </ThemeProvider>
    );
}

export default SeasonInfo;