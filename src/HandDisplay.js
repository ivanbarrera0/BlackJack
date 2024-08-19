import React from "react";

const HandDisplay = ({hand, isActive}) => {
    return (
        <div style={{border: isActive ? '2px solid green' : '1px solid black', padding: '10px', margin: '10px'}}>
            <h3>{isActive ? 'Active Hand' : 'Hand'}</h3>
            <div>
                {hand.map((card, index) => (
                    <span key={index} style={{marginRight: '10px'}}>
                        {card.symbol} of {card.suit}
                    </span>
                ))}
            </div>
        </div>       
    )
}

export default HandDisplay;