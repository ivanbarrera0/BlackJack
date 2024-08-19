import HandDisplay from './HandDisplay';
import './App.css';
import { useEffect, useRef, useState } from 'react';

function App() {

  const [deck, setDeck] = useState([]);
  const [playerHands, setPlayerHands] = useState([[]]);
  const [dealerHand, setDealerHand] = useState([]);
  const [hasRoundEnded, setHasRoundEnded] = useState(false);
  const [endRoundPhrase, setEndRoundPhrase] = useState("");
  const [playerChips, setPlayerChips] = useState(1000);
  const [bet, setBet] = useState(0);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [activeHandIndex, setActiveHandIndex] = useState(0);

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

    if(playerHands[0].length === 0 && dealerHand.length === 0 && !hasRoundEnded && gameHasStarted) {
      dealInitialHands(deck);
    }  

    if(playerHands[0].length === 2 && dealerHand.length === 2) {
      earlyBlackJack();
    }
  }, [playerHands, dealerHand]);

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
      setPlayerHands([playerCards]);
      setDealerHand(dealerCards);
      setDeck(newDeck);
    } else {
      console.log("Not enough cards or deck is not initialized");
    } 
  }

  const startNewRound = () => {

    reshuffleDiscardToDeck();
    setBet(10);
    setHasRoundEnded(false);
    setPlayerHands([[]]);
    setActiveHandIndex(0);
    setEndRoundPhrase("");
  }

  const earlyBlackJack = () => {

    let playerValue = calculateHandValue(playerHands);
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

    let combinedDeck = deck.concat(...playerHands.flat(), ...dealerHand);
    const newDeck = shuffleDeck(combinedDeck);
    setDeck(newDeck);
    setPlayerHands([[]]);
    setDealerHand([]);
  }

  const calculateHandValue = (hand) => {
    let total = 0;
    let aceCount = 0;

    hand.forEach(card => {
      if(card.symbol === 'A') {
        aceCount++;
        total++;
      } else {
        total += card.value;
      }
    });

    while(aceCount > 0 && total + 10 <= 21) {
      total += 10;
      aceCount--;
    }

    return total;
  }
  const handleStand = () => {
    moveToNextHandOrEndRound();
  }

  const moveToNextHandOrEndRound = () => {
    if(activeHandIndex < playerHands.length - 1) {
      setActiveHandIndex(activeHandIndex + 1);
    } else {
      handleDealerTurn();
    }
  }

  const canSplitHand = (hand) => {
    return hand.length === 2 && hand[0].symbol === hand[1].symbol;
  }

  const handleSplit = () => {
    let currentHands = [...playerHands];
    let currentHand = currentHands[activeHandIndex];

    if(canSplitHand(currentHand)) {
      const firstHand = [currentHand[0]];
      const secondHand = [currentHand[1]];

      const {newHand : firstHandWithCard, newDeck: updatedDeck1} = drawCard(firstHand, deck);
      const {newHand: secondHandWithCard, newDeck: updatedDeck2} = drawCard(secondHand, updatedDeck1);
    

      currentHands.splice(activeHandIndex, 1, firstHandWithCard, secondHandWithCard);

      setPlayerHands(currentHands);
      setDeck(updatedDeck2);
    }
  }
  
  const drawCard = (hand, deck) => {

    if(deck && deck.length > 0) {
      let newDeck = deck.slice();
      const drawnCard = newDeck.shift();
      const newHand = [...hand, drawnCard];
      return {newHand, newDeck};
    } else {
      console.log("deck is empty or not defined");
      return {hand, deck};
    }
  }

  const handlePlayerDraw = () => {
    let currentHands = [...playerHands];
    let currentHand = currentHands[activeHandIndex];

    const {newHand, newDeck} = drawCard(currentHand, deck);
    const newHandValue = calculateHandValue(newHand);

    currentHands[activeHandIndex] = newHand;
    setPlayerHands(currentHands);
    setDeck(newDeck);

    if(newHandValue > 21) {
      moveToNextHandOrEndRound();
    }

  }

  const handleDoubleDown = () => {
    setPlayerChips(prevChips => prevChips - bet);
    setBet(prevBet => prevBet * 2);

    let currentHands = [...playerHands];
    let currentHand = currentHands[activeHandIndex];

    const {newHand, newDeck} = drawCard(currentHand, deck);

    currentHands[activeHandIndex] = newHand;
    setPlayerHands(currentHands);
    setDeck(newDeck);

    const newHandValue = calculateHandValue(newHand);

    // NOTE: Handle the round ending by calling on determineRoundWinner 
    // to handle the case of busting
    if(newHandValue > 21) {
      setEndRoundPhrase("You busted...")
      setHasRoundEnded(true);
    } else {
      moveToNextHandOrEndRound();
    }
  }

  const handleDealerTurn = () => {

    let newDealerHand = dealerHand.slice();
    let newDeck = deck.slice();
    let dealerHandValue = calculateHandValue(newDealerHand);

    while(dealerHandValue <= 17 && newDeck.length > 0) {
      const drawnCard = newDeck.shift();
      newDealerHand.push(drawnCard);
      dealerHandValue = calculateHandValue(newDealerHand);
    }

    setDeck(newDeck);
    setDealerHand(newDealerHand);

    let finalRoundResults = playerHands.map((hand, index) => {
      let result = determineRoundWinner(hand, newDealerHand);
      return `Hand ${index + 1}: ${result}`;
    })

    // playerHands.forEach((hand) => {
    //   determineRoundWinner(hand, newDealerHand);
    // });
    
    setEndRoundPhrase(finalRoundResults.join("\n"));
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
    let resultMessage = "";

    if(playerValue > 21) {
      resultMessage = "Busted...";
    } else if(dealerValue > 21 || playerValue > dealerValue) {
      playerCurrentChips += (currentBet * 2);
      resultMessage = "Win!";
    } else if(playerValue === dealerValue) {
      playerCurrentChips += currentBet;
      resultMessage = "Draw";
    } else {
      resultMessage = "Lost";
    }

    setPlayerChips(playerCurrentChips);
    return resultMessage;
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
          <h2>Player's Hands</h2>
          {playerHands.map((hand, index) => (
            <div key={index}>
              <p>Hand {index + 1} Value: {calculateHandValue(hand)}</p>
              <HandDisplay hand={hand} isActive={index === activeHandIndex}></HandDisplay>
              </div>
          ))}

          <button onClick={handlePlayerDraw} disabled={hasRoundEnded}>Hit</button>
          <button onClick={handleStand} disabled={hasRoundEnded}>Stand</button>
          <button onClick={handleDoubleDown} disabled={hasRoundEnded || playerHands[activeHandIndex].length !== 2}>Double Down</button>
          <button onClick={handleSplit} disabled={hasRoundEnded || !canSplitHand(playerHands[activeHandIndex])}>Split</button>

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
