// Fetch ou Axios
import axios from "axios";

// const { NODE_ENV } = process.env;
const URL = "http://localhost:3001/api";
// const URL = "https://spotify-project-of17.onrender.com/api";


const getDriversFilter = async(season, constructorId) => {
    return await axios.get(`${URL}/driversFilter`, {
        params: {
            season: season,
            constructorId: constructorId,
        }
    })
}

const getDriverByDriversId = async(driverId) => {
    return await axios.get(`${URL}/getDriver/${driverId}`)
}

const getResults = async() => {
    return await axios.get(`${URL}/driverResults`)
}


const getResultsByRacesIds = async(racesIds) => {
    return await axios.get(`${URL}/resultsByRaceIds`,{
      params: {
        racesIds: JSON.stringify(racesIds)
        }
    })
}


const getResultsByDriverId = async(racesIds) => {
    return await axios.get(`${URL}/driverResultsByDriverId/${racesIds}`)
}


const getDriversResultsByRacesId = async(racesIds) => {
    return await axios.get(`${URL}/driversResultsByRacesIds`,{
      params: {
        racesIds: JSON.stringify(racesIds)
        }
    })
}


const getConstructorsResultsByRacesId = async(racesIds) => {
    return await axios.get(`${URL}/constructorsResultsByRacesIds`,{
      params: {
        racesIds: JSON.stringify(racesIds)
        }
    })
}


const getResultsByConstructorId = async(constructorId) => {
    return await axios.get(`${URL}/driverResultsByConstructorId/${constructorId}`)
}


const getDriverChampionchipStanding = async(driverId) => {
    return await axios.get(`${URL}/getDriverChampionchipStanding/${driverId}`)
}


const getDriversChampionchipStanding = async(year) => {
    return await axios.get(`${URL}/getDriversChampionchipStanding/${year}`);
}


const getConstructorsChampionchipStanding = async(year) => {
    return await axios.get(`${URL}/getConstructorsChampionchipStanding/${year}`);
}


const getDriverChampionchipStandingPosition = async(driverId, championchipStandingPosition) => {
    return await axios.get(`${URL}/championchipStandingPosition/${driverId}/${championchipStandingPosition}`)
}


const getRaces = async() => {
    return await axios.get(`${URL}/races`)
}


const getRacesByYear = async(year) => {
    return await axios.get(`${URL}/races/${year}`)
}


const getCircuitsByYear = async(year) => {
    return await axios.get(`${URL}/circuitsByYear/${year}`)
}


const getConstructors = async() => {
    return await axios.get(`${URL}/constructors`)
}


const getCircuit = async() => {
    return await axios.get(`${URL}/circuits`)
}


const getSeasons = async() => {
    return await axios.get(`${URL}/seasons`)
}


const getConstructorsBySeason = async(season) => {
    return await axios.get(`${URL}/constructorsBySeason/${season}`)
}


const getSeasonsByConstructor = async(constructorId) => {
    return await axios.get(`${URL}/seasonsByConstructor/${constructorId}`)
}


const getDriversByDriversId = async(driversId) => {
    return await axios.get(`${URL}/driversByDriversIds`,{
      params: {
        driversId: JSON.stringify(driversId)
        }
    })
}


const getConstructorsByConstructorsId = async(constructorsId) => {
    return await axios.get(`${URL}/constructorsByConstructorsIds`,{
      params: {
        constructorsId: JSON.stringify(constructorsId)
        }
    })
}


export {getResultsByDriverId, getCircuitsByYear, getDriverChampionchipStandingPosition, getRaces, getConstructors, getDriverChampionchipStanding, getCircuit, getResults, getDriversResultsByRacesId, getResultsByRacesIds, getResultsByConstructorId, getDriversFilter, getSeasons, getConstructorsBySeason, getSeasonsByConstructor, getDriversChampionchipStanding, getConstructorsChampionchipStanding, getRacesByYear, getDriversByDriversId, getConstructorsByConstructorsId, getDriverByDriversId, getConstructorsResultsByRacesId};
