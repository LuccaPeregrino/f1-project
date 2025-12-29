import './DriverInfo.css';
import DriverChart from './DriverChart.jsx';
import { useEffect, useState } from 'react';
import {getResultsByDriverId, getDriverChampionchipStandingPosition, getRaces, getConstructors, getDriverChampionchipStanding, getDriverByDriversId} from '../../api/api.js';


const DriverInfo = (props) =>{
    const [driver, setDriver] = useState([]);
    const [driverResults, setDriverResults] = useState([]);
    const [driverStandings, setDriverStandings] = useState([]);
    const [driverStandingsPosition, setDriverStandingsPosition] = useState([]);
    const [races, setRaces] = useState([]);
    const [constructors, setConstructors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    let driver_teams = [];
    let driver_champion_quantity = 0;
    let driver_season_list = []
    let driver_champion_years = []
    let driver_races = 0;
    let driver_wins = 0;
    let driver_poles = 0;
    let driver_podiums = 0;



    useEffect(() => {
        async function fetchData() {
            try {
                await getDriverChampionchipStanding(props.driverId)
                    .then((response) => 
                        setDriverStandings(response.data)
                    )
                    .catch((error) => console.error(error));

                await getDriverChampionchipStandingPosition(props.driverId, 1)
                    .then((response) => 
                        setDriverStandingsPosition(response.data)
                    )
                    .catch((error) => console.error(error));

                await getResultsByDriverId(props.driverId)
                    .then((response) => 
                        setDriverResults(response.data)
                    )
                    .catch((error) => console.error(error));

                await getRaces()
                    .then((response) => 
                        setRaces(response.data)
                    )
                    .catch((error) => console.error(error));

                await getConstructors()
                    .then((response) => 
                        setConstructors(response.data)
                    )
                    .catch((error) => console.error(error));

                await getDriverByDriversId(props.driverId)
                    .then((response) => {
                        setDriver(response.data[0])
                        }
                    )
                    .catch((error) => console.error(error));
            } catch (err) {
                console.log('err')
            } finally {
               setIsLoading(false);
            }
        }

         fetchData();     
    }, []);
        
   
    const getDriverTotalWins = () => {
        driverResults.forEach(function(race) {
            if(race.position === 1){
                driver_wins = driver_wins + 1;
            }
        })
        return driver_wins;
    }

    const getDriverTotalPoles = () => {
        driverResults.forEach(function(race) {
            if(race.grid === 1){
                driver_poles = driver_poles + 1;
            }
        })
        return driver_poles;
    }

    const getDriverTotalRaces = () => {
        driver_races = removerDuplicatasRaceIdComBaseNaPositionN(driverResults).length
        return driver_races;
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

    const getDriverTotalPodiums = () => {
        driverResults.forEach(function(race) {
            if(race.position === 1 || race.position === 2 || race.position === 3){
                driver_podiums = driver_podiums + 1;
            }
        })
        return driver_podiums;
    }

    const getDriverTeams = () => {
        const driverConstructorIds = [...new Set(driverResults.map(result => result.constructorId))]

        driver_teams = constructors.filter(constructor => driverConstructorIds.includes(constructor.constructorId)).map(obj => ({name: obj.name, constructorId: obj.constructorId}));

        return driver_teams;
    }

    const formatDate = (index) => {
        const [year, month, day] = index.split('T')[0].split('-');
        const result = [day, month, year].join('/');

        return result;
    }

    const getDriverSeasons = () =>{
        const driverRaceIds = driverStandings.map(race => race.raceId)

        driver_season_list = [...new Set(races.filter(race => driverRaceIds.includes(race.raceId)).map(result => result.year))]
    }

    const getChampionDriverInfos = () =>{
        let aux;

        const driverRaceIds = [...new Set(driverStandingsPosition.map(race => race.raceId))]

        aux = races.filter(race => driverRaceIds.includes(race.raceId)).map(obj => obj).sort(function(a, b) {return a.year - b.year });

        driver_champion_years = (aux.filter(race => race.round == races.map(race => race.year).filter(year => year == race.year).length)).map(obj => obj.year).sort(function(a, b) {return a - b })
        driver_champion_quantity = driver_champion_years.length;

    }
    
    getDriverSeasons();
    getChampionDriverInfos();

    return(
        <div>
            {isLoading == false && driver != undefined && <div className = 'painel-inner'>
                <div className='driver-section info-section row'>
                    <div className='col-4 pilot-image-container'>
                        <img className="pilot-image-info" alt='imagem piloto' src={driver.picture}></img>
                    </div> 
                    <div className='col-4 pilot-informations'>
                        <div className='text-info'>Name: {driver.forename} {driver.surname}</div>
                        {driver.number != '\\N' && <div className='text-info'>Number: {driver.number}</div>}
                        <div className='text-info'>Birthdate: {formatDate(driver.dob)}</div>
                        <div className='text-info'>
                        {/*  Country: {props.driver_data.country.code} - <img className='pilot-flag' src={`https://countryflagsapi.com/png/${props.driver_data.country.code}`}></img> */}
                        Nationality: {driver.nationality}
                        </div>
                        {driver_champion_quantity > 0 && <div className='text-info'>World championships: {driver_champion_quantity} ({driver_champion_years.join(', ')})</div>}
                        {driver_champion_quantity == 0 &&<div className='text-info'>World championships: {driver_champion_quantity}</div>}
                    </div>
                    <div className='col-4 pilot-informations'>
                        <div className='text-info'>Grands prix entered: {getDriverTotalRaces()}</div>
                        <div className='text-info'>Podiums: {getDriverTotalPodiums()}</div>
                        <div className='text-info'>Poles: {getDriverTotalPoles()}</div>
                        <div className='text-info'>Wins: {getDriverTotalWins()}</div>
                        <div className='container pilot-teams'>
                            <p>Teams:</p> 
                            <div className='container pilot-teams-list-container'>
                                {getDriverTeams().map(constructor => constructor.name).join(' | ')}
                            </div>
                        </div>
                    </div>
                </div>
                <DriverChart races_data = {races} driver_results_data ={driverResults} driver_season_list = {driver_season_list} driver_constructor_list = {driver_teams} key={Math.random()}/>
            </div>}   
        </div>
    );
}

export default DriverInfo;