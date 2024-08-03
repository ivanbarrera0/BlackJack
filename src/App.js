import './App.css';
import { useEffect, useRef, useState } from 'react';

function App() {

  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [hasRoundEnded, setHasRoundEnded] = useState(false);
  const [endRoundPhrase, setEndRoundPhrase] = useState("");
  const [playerChips, setPlayerChips] = useState(1000);
  const [bet, setBet] = useState(0);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [firstTurn, setFirstTurn] = useState(true);

  useEffect(() => {
    const newDeck = generateDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    setDeck(shuffledDeck);
  },[]);

  useEffect(() => {
    if (gameHasStarted) {
      dealInitialHands(deck);
    }
  }, [gameHasStarted]);

  useEffect(() => {

    if(playerHand.length === 0 && dealerHand.length === 0 && !hasRoundEnded && gameHasStarted) {
      dealInitialHands(deck);
    }  

    if(playerHand.length === 2 && dealerHand.length === 2) {
      earlyBlackJack();
    }
  }, [playerHand, dealerHand]);

  const generateDeck = () => {
    const suits = ["Clubs", "Spades", "Diamond", "Hearts"];

    const values = [
      {symbol: "A", value: 1},
      {symbol: "2", value: 2},
      {symbol: "3", value: 3},
      {symbol: "4", value: 4},
      {symbol: "5", value: 5},
      {symbol: "6", value: 6},
      {symbol: "7", value: 7},
      {symbol: "8", value: 8},
      {symbol: "9", value: 9},
      {symbol: "10", value: 10},
      {symbol: "J", value: 10},
      {symbol: "Q", value: 10},
      {symbol: "K", value: 10},
    ]

    const newDeck = suits.flatMap(suit =>
      values.map(({symbol, value}) => new Card(symbol, suit, value))
    )
    
    return newDeck; 
  }

  const dealInitialHands = (deck) => {
    if(deck && deck.length >= 4) {
      const newDeck = deck.slice();
      console.log("Deck before dealing: " + newDeck.length);
      const playerCards = [newDeck.shift(), newDeck.shift()];
      const dealerCards = [newDeck.shift(), newDeck.shift()];
      setPlayerChips((playerChips) => playerChips - bet);
      setPlayerHand(playerCards);
      setDealerHand(dealerCards);
      setDeck(newDeck);
    } else {
      console.log("Cards are have run out or deck is not initialized");
    } 
  }

  const startNewRound = () => {

    reshuffleDiscardToDeck();
    setBet(10);
    setHasRoundEnded(false);
    setFirstTurn(true);
  }

  const earlyBlackJack = () => {

    let playerValue = calculateHandValue(playerHand);
    let dealerValue = calculateHandValue(dealerHand);
    let playerCurrentChips = playerChips;
    let currentBet = bet;

    if(playerValue === 21 && dealerValue === 21) {
      setEndRoundPhrase("Standoff");
      setHasRoundEnded(true);
    } else if(playerValue === 21) {
      playerCurrentChips += (currentBet * 2.5);
      setPlayerChips(playerCurrentChips);
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
  }

  const reshuffleDiscardToDeck = () => {

    let combinedDeck = deck.slice();
    const newDeck = shuffleDeck(combinedDeck.concat(playerHand, dealerHand));
    setDeck(newDeck);
    setPlayerHand([]);
    setDealerHand([]);
  }

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

    let newDeck = deck.slice();

    if(newDeck && newDeck.length > 0) {
      const drawnCard = newDeck.shift();
      const newHand = [...hand, drawnCard];
      return {newHand, newDeck};
    } 
    
    return {hand, deck};
  }

  const handlePlayerDraw = () => {

    const {newHand, newDeck} = drawCard(playerHand, deck);
    const newHandValue = calculateHandValue(newHand);
    setFirstTurn(false);
    setPlayerHand(newHand);
    setDeck(newDeck);

    if(newHandValue > 21) {
      setEndRoundPhrase("You busted...")
      setHasRoundEnded(true);
    }
  }

  const handleDoubleDown = () => {
    setPlayerChips(prevChips => prevChips - bet);
    setBet(prevBet => prevBet * 2);

    // Check if the deck increases here
    // NOTE: highlight 'newDeck' here
    const {newHand, newDeck} = drawCard(playerHand, deck);
    const newHandValue = calculateHandValue(newHand);
    setPlayerHand(newHand);
    setDeck(newDeck);

    if(newHandValue > 21) {
      setEndRoundPhrase("You busted...")
      setHasRoundEnded(true);
    } else {
      handleDealerTurn(newHand, newDeck);
    }
  }

  const handleDealerTurn = (newHand, updatedDeck) => {

    let newDealerHand = dealerHand.slice();
    let newDeck = updatedDeck.slice();
    let dealerHandValue = calculateHandValue(newDealerHand);

    while(dealerHandValue <= 17 && newDeck.length > 0) {
      // Switch to drawing the cards similar to the way the player draws cards?
      const drawnCard = newDeck.shift();
      newDealerHand.push(drawnCard);
      dealerHandValue = calculateHandValue(newDealerHand);
    }

    setDeck(newDeck);
    setDealerHand(newDealerHand);
    determineRoundWinner(newHand, newDealerHand);
    setHasRoundEnded(true);
  }

  const determineRoundWinner = (playerHand, dealerHand) => {

    console.log("Value during comparison");

    let playerValue = calculateHandValue(playerHand);
    console.log(playerValue);
    let dealerValue = calculateHandValue(dealerHand);
    console.log(dealerValue);
    let playerCurrentChips = playerChips;
    let currentBet = bet;

    if(playerValue > 21) {
      setEndRoundPhrase("You lost...")
    } else if(dealerValue > 21) {
      playerCurrentChips += (currentBet * 2);
      setEndRoundPhrase("You win!")
    } else if(playerValue === dealerValue) {
      playerCurrentChips += currentBet;
      setEndRoundPhrase("Draw");
    } else if(playerValue > dealerValue) {
      playerCurrentChips += (currentBet * 2);
      setEndRoundPhrase("You win!")
    } else {
      setEndRoundPhrase("You lost...")
    }

    setPlayerChips(playerCurrentChips);
  }

  const startGame = () => {
    setBet(10);
    setGameHasStarted(true);
  }
  
  return (

    <div className="App">

      {!gameHasStarted ? (
        <div>
          <h1>Welcome to BlackJack</h1>
          <button onClick={startGame}>Start the Game</button>
        </div>
      ) : (
        <div>
          <h2>Your chips: {playerChips}</h2>
          <h2>Current Bet: {bet}</h2>
          <h2>Player's Hand</h2>
          <p>Value: {calculateHandValue(playerHand)}</p>
          {playerHand.map((card, index) => (
            <div key={index}>{card.toString()}</div>
          ))}

          <button onClick={handlePlayerDraw} disabled={hasRoundEnded}>Hit</button>
          <button onClick={() => handleDealerTurn(playerHand, deck)} disabled={hasRoundEnded}>Stand</button>
          <button onClick={handleDoubleDown} disabled={hasRoundEnded || !firstTurn}>Double Down</button>

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
    )}
    </div>
  )
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
