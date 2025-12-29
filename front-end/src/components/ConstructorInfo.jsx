import './ConstructorInfo.css';


const ConstructorInfo = (props) =>{

    return(
        <div className = 'painel-inner'>
            <div className='constructor-section info-section row'>
                <div className='col-4 constructor-image-container'>
                    <img className="constructor-image-info" src={`images/constructors/${props.Constructor_data.name}.png`}></img>
                </div> 
                <div className='col-8 constructor-informations'>
                    <div className='text-info'>Name: {props.Constructor_data.name}</div>
                    <div className='text-info'>Nationality: {props.Constructor_data.nationality}</div>
                    {/* <div className='text-info'>First appearance: {props.Constructor_data.first_constructor_entry}</div>
                    <div className='text-info'>World championships: {props.Constructor_data.world_championships}</div>
                    { props.Constructor_data.highest_race_finish.position == '1'  ? <div className='text-info'>Wins: {props.Constructor_data.highest_race_finish.number}</div> : <div className='text-info'>Wins: 0</div>}
                    <div className='text-info'>Pole positions: {props.Constructor_data.pole_positions}</div>
                    <div className='text-info'>Fastest laps: {props.Constructor_data.fastest_laps}</div> */}
                </div> 
            </div>
            {/* <DriverChart driver_id={props.driver_data.id}/> */}
        </div>
    );
}

export default ConstructorInfo;