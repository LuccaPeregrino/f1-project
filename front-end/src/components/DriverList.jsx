import './DriverList.css';
import Card from '../UI/Card';


const DriverList = (props) =>{
  
  const onClickCardHandler = (e) => {
    props.onClickDriver(e);
  }

  return(
  <div className="drivers container">
    {props.Drivers_Data.map((driver, i) => (
      <Card  className="pilot-card" onClickCard={onClickCardHandler} driverId = {driver.driverId} key={Math.random()}>
        <div className="card-inner">
          <img className="pilot-image" src={driver.picture}></img>
          <span className="pilot-name">{driver.forename} {driver.surname}</span>
        </div>
      </Card>
    ))}
  </div>
  );
}

export default DriverList;