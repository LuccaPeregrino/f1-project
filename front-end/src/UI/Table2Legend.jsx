function Table2Legend() {
    const boxStyle = {
        width: 18,
        height: 18,
        borderRadius: 4,
        display: "inline-block",
        marginRight: 8,
        border: "1px solid #ffffff55"
    };

    return (
        <div style={{ 
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "18px",
            marginBottom: "12px",
            color: "#fff",
            fontSize: "14px",
        }}>

            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px 24px",
                justifyContent: "center",
                maxWidth: "1000px",
                textAlign: "center",
            }}>

                <div><span style={{ ...boxStyle, backgroundColor: "#FFD700" }} /> 1º place</div>
                <div><span style={{ ...boxStyle, backgroundColor: "#C0C0C0" }} /> 2º place</div>
                <div><span style={{ ...boxStyle, backgroundColor: "#CD7F32" }} /> 3º place</div>
                <div><span style={{ ...boxStyle, backgroundColor: "green" }} /> Points zone</div>
                <div><span style={{ ...boxStyle, backgroundColor: "purple" }} /> No points zone</div>

                <div style={{ 
                    display: "flex",
                    alignItems: "center",    
                    gap: "6px",    
                }}>
                    <span style={{
                        ...boxStyle,
                        backgroundColor: "white",
                        color: "red",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "12px",
                    }}>!</span>

                    <span>
                        R (Retired), W (Withdrawn), D (Disqualified)…
                    </span>
                </div>

            </div>
        </div>
    );
}

 export default Table2Legend;