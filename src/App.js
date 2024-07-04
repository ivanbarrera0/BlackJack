import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';

function App() {

  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);

  useEffect(() => {
    const newDeck = generateDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    setDeck(shuffledDeck);
    dealInitialHands(shuffledDeck);
  }, []);

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
      setDeck(deck);
    } else {
      console.log("Run out of cards!");
    }
  };

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

        <br></br>
        <br></br>

        <h2>Dealer's Hand</h2>
        <p>Value: {calculateHandValue(dealerHand)}</p>
        {dealerHand.map((card, index) => (
          <div key={index}>{card.toString()}</div>
        ))}
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
