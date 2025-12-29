import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import DriverList from './components/DriverList.jsx';
import ConstructorList from './components/ConstructorList.jsx';
import DriverInfo from './components/DriverInfo.jsx';
import ConstructorInfo from './components/ConstructorInfo.jsx';
import SeasonInfo from './components/SeasonInfo.jsx';
import SeasonCard from './UI/SeasonCard.jsx';
import { useEffect, useState, useRef } from 'react';
import { getDriversFilter, getConstructorsBySeason, getSeasonsByConstructor, getSeasons} from '../api/api.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons";
import AliceCarousel from 'react-alice-carousel';



function App() {
  const [searchType, setSearchType] = useState('drivers');
  const [searchType2, setSearchType2] = useState('All seasons');
  const [searchType3, setSearchType3] = useState('All teams');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [driverInfo, setDriverInfo] = useState({});
  const [constructorInfo, setConstructorInfo] = useState({});
  const [cardClick, setCardClick] = useState(false);
  const [inputFilled, setInputFilled] = useState('');
  const [search, setSearch] = useState();
  const [constructorsBySeason, SetConstructorsBySeason] = useState([]);
  const [seasonsByConstructor, SetSeasonsByConstructor] = useState([]);
  const [allSeasons, SetAllSeasons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [seasonClicked, setSeasonClicked] = useState(false);
  const [seasonInfo, setSeasonInfo] = useState(0);
  

  const montagemInicial1 = useRef(true);
  const montagemInicial2 = useRef(true);

  const responsive = {
      0: {
        items: 7
      }
    };
    
    

  useEffect(() => {
    getSeasons()
    .then((response) => {
      SetAllSeasons(response.data.sort((a, b) => b.year - a.year).map(season => season.year))
    })
      .catch((error) => console.error(error));

  }, []);

  useEffect(() => {
    getConstructorsBySeason(searchType2 == "All seasons" ? undefined : parseInt(searchType2))
    .then((response) => 
      SetConstructorsBySeason(response.data.sort((a, b) => a.name.localeCompare(b.name)))
      )
      .catch((error) => console.error(error));

  }, [searchType2]);


  useEffect(() => {
    getSeasonsByConstructor(searchType3 == "All teams" ? undefined : parseInt(searchType3))
    .then((response) => {
      SetSeasonsByConstructor(response.data.sort((a, b) => b.year - a.year))
    })
      .catch((error) => console.error(error));

  }, [searchType3]);
  
  


  useEffect(() => {
    if (montagemInicial2.current) {
        montagemInicial2.current = false;
        return;
    }else{
      const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getDriversFilter(searchType2 == "All seasons" ? undefined: searchType2, searchType3 == "All teams" ? undefined: searchType3);
      
        setData(response.data);
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      } finally {
        setIsLoading(false);
      }
      };

    fetchData();
    }
  }, [search]);


  useEffect(() => {
    if(montagemInicial1.current) {
      montagemInicial1.current = false;
      return;
    }else{
      if(inputFilled != ''){
        inputFilledFilter(data);
      }else{
        setFilteredData(data);
      }
    }
  }, [data])


  const handleClosePanel = () => {
    setCardClick(false);
    setSeasonClicked(false);
  }

  const handleShowPanel = () => {
    setCardClick(true);
  }

  const handleSearch = async () => {
    setData([]);
    setSearch(Math.random());
  }

  const handleSearchType = (e) => {
    setSearchType(e.target.value)
  }

  const handleSearchType2 = (e) => {
    setSearchType2(e.target.value)
  }

  const handleSearchType3 = (e) => {
    setSearchType3(e.target.value)
  }

  const onClickDriverHandler = (e) => {
    setDriverInfo(e);
    handleShowPanel();
  }

  const onClickConstructorHandler = (e) => {
    setConstructorInfo(e);
    handleShowPanel();
  }
  
  const onClickSeasonHandler = (e) => {
    setSeasonInfo(e);
    setSeasonClicked(true);
    
    handleShowPanel();
  }

  const onClickDriverNameHandler = (e) => {
    setSeasonInfo();
    setDriverInfo(e);
    console.log(e)
    setSeasonClicked(false); 
    
    handleShowPanel();
  }

  const inputFilledFilter = (totalList) => {
    const filteredList = [];
    
    totalList.forEach(function(data) {
      if(searchType == 'drivers'){
        if(data.forename.toUpperCase().startsWith(inputFilled.toUpperCase()) || data.surname.toUpperCase().startsWith(inputFilled.toUpperCase())){
          filteredList.push(data);
        }
      }else{
        if(data.name.toUpperCase().startsWith(inputFilled.toUpperCase())){
          filteredList.push(data);
        }
      } 
    })

    setFilteredData(filteredList);
  }


  return (
    <div className="App">
      <div className='app-header'>
          <img className='app-header__img' src="../src/assets/F1-Logo.png" />
          <h2 className='app-header__link'>F1 project</h2>
      </div> 
      <div className='app-panel'>
        <div className='app-div-driver-cronstructor'>
          <div className="app-div-driver-cronstructor__header">
            <h3>Drivers and Constructors</h3>
          </div>
          <div className='app-search-bar'>
            <select className='app-search__select' name="search-type" onChange={handleSearchType}>
              <option value="drivers">drivers</option>
              {/* <option value="constructors">constructors</option> */}
            </select>
            <select className='app-search__select2' value={searchType2} name="search-type2" onChange={handleSearchType2}>
              <option value="All seasons">All seasons</option>
              {seasonsByConstructor.map((data) => <option value={data.year} key={Math.random()}>{data.year}</option>)}
            </select>
            <select className='app-search__select3' value={searchType3} name="search-type3" onChange={handleSearchType3}> 
              <option value="All teams">All teams</option>
              {constructorsBySeason.map((data) => <option value={data.constructorId} key={Math.random()}>{data.name}</option>)}
            </select>
            <div className='filter'>
              <input className='app-search-input' onChange={(e) => setInputFilled(e.target.value)}></input>
              
              <button className='app-search-button' onClick={handleSearch}><FontAwesomeIcon icon={faMagnifyingGlass} /></button>
            </div>
          </div>
          {isLoading == true && <img src="../src/assets/loading.gif" alt="Loading..." style={{height: '170px', width: '170px', marginTop: '200px'}}/> }
          {isLoading == false && <div className='app-content-div'>
            {searchType === 'drivers' && filteredData !== undefined && <DriverList Drivers_Data= {filteredData} onClickDriver = {onClickDriverHandler} key={Math.random()}/>}
            {searchType === 'constructors' && filteredData !== undefined && <ConstructorList Constructor_Data= {filteredData} onClickConstructor = {onClickConstructorHandler}/>}
          </div>}
        </div>
      </div>
      <div className='app-panel-seasons'>
        <div className='app-div-seasons'>
          <div className="app-div-seasons__header">
            <h3>Seasons</h3>
          </div>
          <div className='app-content-div-seasons'>
            <div className='app-content-div-inner'>
              <AliceCarousel mouseDragEnabled={true} fadeOutAnimation={true} mouseTracking touchTracking 
              items= {allSeasons.map((season, i) => (<SeasonCard season={season} onClickSeason={onClickSeasonHandler}></SeasonCard>))}
              responsive={responsive}
              controlsStrategy="alternate"
              dotsDisabled ={true}
              >
              </AliceCarousel>
            </div>
          </div>
        </div>
      </div>
      <Modal show={cardClick} onHide={handleClosePanel} backdrop="static" keyboard={false} size="lg" centered>
        <Modal.Header closeButton data-bs-theme="dark">
          <Modal.Title className='modal-title'>Infomations</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          {(searchType === 'drivers' && seasonClicked == false) && <DriverInfo driverId = {driverInfo}/>}
          {(searchType === 'constructors' && seasonClicked == false) && <ConstructorInfo Constructor_data = {constructorInfo}/>}
          {seasonClicked == true && <SeasonInfo onClickDriverName={onClickDriverNameHandler} season = {seasonInfo}/>}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default App;
