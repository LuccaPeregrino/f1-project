import './SeasonCard.css'
import img from '../assets/pngwing.png'

const SeasonCard = (props) => {
    const onClickCardHandler = () => {
        props.onClickSeason(props.season);
    }
    
    return(
        <div className='seasonCard' onClick = {onClickCardHandler}>
            <img className="seasonCard-image" src={img}></img>
            <span className="seasonCard-name">{props.season}</span>
        </div>
    );

}

export default SeasonCard;