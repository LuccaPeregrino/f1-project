import './Panel.css'

const Panel = (props) => {
   /*  const classes = 'panel ' + props.className; */
    
    return(
        <div className="panel">{props.children}</div>
    );

}

export default Panel;