import './SeasonCard.css'

const SeasonCard = (props) => {
    const onClickCardHandler = () => {
        props.onClickSeason(props.season);
    }
    
    return(
        <div className='seasonCard' onClick = {onClickCardHandler}>
            <img className="seasonCard-image" src={"/images/pngwing.png"}></img>
            <span className="seasonCard-name">{props.season}</span>
        </div>
    );

}

export default SeasonCard;