import './App.css';
import { useEffect, useRef, useState } from 'react';

function App() {

  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [isPlayerBusted, setIsPlayerBusted] = useState(false);
  const [hasRoundEnded, setHasRoundEnded] = useState(false);
  const [endRoundPhrase, setEndRoundPhrase] = useState("");

  useEffect(() => {
    const newDeck = generateDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    setDeck(shuffledDeck);
    dealInitialHands(shuffledDeck);
  },[]);

  useEffect(() => {

    if(playerHand.length === 0 && dealerHand === 0) {
      dealInitialHands(deck);
    }

    if(playerHand.length === 2 && dealerHand.length === 2) {
      earlyBlackJack();
    }
  }, [playerHand, dealerHand]);

  const generateDeck = () => {
    const newDeck= [];

    for(let i = 0; i < 13; i++) {

      let symbol = i + 1;
      let value = i + 1;
  
      if(value === 1) {
        symbol = "A";
      } else if(value === 11) {
        symbol = "J";
        value = 10;
      } else if(value === 12) {
        symbol = "Q";
        value = 10;
      } else if(value === 13) {
        symbol = "K";
        value = 10;
      }
  
      for(let j = 0; j < 4; j++) {
  
        const suit = ["Clubs", "Spades", "Diamond", "Hearts"];
  
        const card = new Card(symbol, suit[j], value);
  
        newDeck.push(card);
      }
    }
    return newDeck; 
  };

  const dealInitialHands = (deck) => {

    if(deck.length >= 4) {
      const newDeck = deck.slice();
      const playerCards = [newDeck.shift(), newDeck.shift()];
      const dealerCards = [newDeck.shift(), newDeck.shift()];
      setPlayerHand(playerCards);
      setDealerHand(dealerCards);
      setDeck(newDeck);
      earlyBlackJack();
    } else {
      console.log("Run out of cards!");
    }
  }

  const startNewRound = () => {
    const emptyHand = [];
    setPlayerHand(emptyHand);
    setDealerHand(emptyHand);
    setHasRoundEnded(false);
  }

  const earlyBlackJack = () => {

    let playerValue = calculateHandValue(playerHand);
    let dealerValue = calculateHandValue(dealerHand);

    if(playerValue === 21 && dealerValue === 21) {
      setEndRoundPhrase("Standoff");
      setHasRoundEnded(true);
    } else if(playerValue === 21) {
      setEndRoundPhrase("You won with BlackJack!");
      setHasRoundEnded(true);
    } else if(dealerValue === 21) {
      setEndRoundPhrase("You lose dealer has BlackJack");
      setHasRoundEnded(true);
    }
  }

  const shuffleDeck = (deck) => {

    const shuffledDeck = deck.slice();
    for(let i = shuffledDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    return shuffledDeck;
  };

  const calculateHandValue = (hand) => {
    let total = 0;
    let aceCount = 0;

    for(const card of hand) {
      if(card.symbol === 'A') {
        aceCount++;
        total++;
      } else {
        total += card.value;
      }
    }

    while(aceCount > 0 && total + 10 <= 21) {
      total += 10;
      aceCount--;
    }

    return total;
  }
  
  const drawCard = (hand, deck) => {

    if(deck.length > 0) {
      const newDeck = deck.slice();
      const drawnCard = newDeck.shift();
      const newHand = [...hand, drawnCard];
      return {newHand, newDeck};
    }
    
    return {hand, deck};
  }

  const handlePlayerDraw = () => {
    const {newHand, newDeck} = drawCard(playerHand, deck);
    const newHandValue = calculateHandValue(newHand);
    setPlayerHand(newHand);
    setDeck(newDeck);

    if(newHandValue > 21) {
      setEndRoundPhrase("You busted...")
      setHasRoundEnded(true);
    }
  }

  const handleDealerTurn = () => {
    let newDealerHand = dealerHand.slice();
    let newDeck = deck.slice();
    let dealerHandValue = calculateHandValue(newDealerHand);

    while(dealerHandValue < 16 && newDeck.length > 0) {
      const drawnCard = newDeck.shift();
      newDealerHand.push(drawnCard);
      dealerHandValue = calculateHandValue(newDealerHand);
    }

    if(dealerHandValue > 21) {
      setEndRoundPhrase("You won!");
      setHasRoundEnded(true);
      setDeck(newDeck);
      setDealerHand(newDealerHand);
    } else {
      setDeck(newDeck);
      setDealerHand(newDealerHand);
      determineRoundWinner();
    }
  }

  const determineRoundWinner = () => {

    let playerValue = calculateHandValue(playerHand);
    let dealerValue = calculateHandValue(dealerHand);
    
    if(playerValue === dealerValue) {
      setEndRoundPhrase("Draw");
    } else if(playerValue > dealerValue) {
      setEndRoundPhrase("You won!")
    } else {
      setEndRoundPhrase("You lost...")
    }

    setHasRoundEnded(true);
  }

  const reShuffleDeck = () => {
    setDeck(shuffleDeck(deck));
  }
  
  return (

    <div className="App">
      <div>
          <h2>Player's Hand</h2>
          <p>Value: {calculateHandValue(playerHand)}</p>
          {playerHand.map((card, index) => (
            <div key={index}>{card.toString()}</div>
          ))}

          <button onClick={handlePlayerDraw} disabled={hasRoundEnded}>Hit</button>
          <button onClick={handleDealerTurn} disabled={hasRoundEnded}>Stand</button>

          <br></br>

          <h2>Dealer's Hand</h2>
          <p>Value: {calculateHandValue(dealerHand)}</p>
          {dealerHand.map((card, index) => (
            <div key={index}>{card.toString()}</div>
          ))}

          <br></br>

          <div>
            {hasRoundEnded && (
              <div>
                {endRoundPhrase}
                <br></br>
                <button onClick={startNewRound}>Play another round</button>
              </div>
            )}
          </div>
      </div>


    </div>

    
  );
}

class Card {

  constructor(symbol, suit, value) {
    this.symbol = symbol;
    this.suit = suit;
    this.value = value;
  }

  toString() {
    return `${this.symbol} of ${this.suit}`;
  }
}

export default App;
