import React from 'react';
import './Game.css';
import blue_x from './img/small_blue_comic_x.png';
import pink_o from './img/small_pink_comic_o.png';

/*
Bugs
1. Winner confetti
2. Game draw detector
*/

class WinState {
    static X_WON = Symbol("x_won");
    static O_WON = Symbol("o_won");
    static DRAW = Symbol("draw");

    constructor(name) {
        this.name = name;
    }
}

function Square(props) {
    let className = "cell";
    if (props.lastClicked) {
        className += " lastClicked";
    }

    let display = null;
    if (props.value) {
        display = <img src={props.value === "X" ? blue_x : pink_o} alt={props.value}/>
    }
    return (
        <button className={className} onClick={props.onClick}>
            {display}
        </button>
    );
}

class RegularBoard extends React.Component {
    renderSquare(i) {
        return (
            <Square
                key={i}
                value={this.props.squares[i]}
                lastClicked={this.props.lastClicked === i}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        let board = [];
        for (let cell = 0; cell < 9; ++cell) {
            board.push(this.renderSquare(cell));
        }
        return (
            <div
                className={
                    "inner " +
                    (this.props.winState ? this.props.winState.description : "") +
                    " " +
                    (this.props.playable ? "playable" : "closed") +
                    " " +
                    (this.props.partOfWinRow ? "winningBoard" : "")
                }
            >
                {board}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            // outer array: boards; inner arrays: cells in board
            squares: Array.from(Array(9), () => Array(9).fill(null)),
            wins: Array(9).fill(null),
            playable: [true].concat(Array(8).fill(false)),
            xIsNext: true,
            lastClicked: {
                board: null,
                index: null
            }

        };
    }

    reset() {
        this.setState(this.getInitialState());
    }

    generateTestLayout() {
        const wonBoard = `
            X O O
            - X -
            O - X
        `;
        const drawBoard = `
            X O X
            O X O
            O X O
        `;

        const boardToArr = b => b.replaceAll(/[\s\n]/g, '').split('').map(c => c === "-" ? null : c );
        this.setState({
            squares: [
                boardToArr(wonBoard),
                boardToArr(wonBoard),
                boardToArr(wonBoard).slice(0, 8, null).concat(null),
                boardToArr(wonBoard).map(c => c === "X" ? "O" : c === "O" ? "X" : c),
                boardToArr(drawBoard),
            ].concat(Array.from(Array(4), () => Array(9).fill(null))),
            wins: [WinState.X_WON, WinState.X_WON, null, WinState.O_WON, WinState.DRAW, null, null, null, null],
            playable: [false, false, true, false, false, false, false, false, false],
            xIsNext: true,
            lastClicked: {
                board: 2,
                index: 2
            }
        });
    }

    calculateBoardWinner(cells) {
        const winner = this.calculateWinnerImpl(cells);
        if (winner) {
            return cells[winner[0]] === "X" ? WinState.X_WON : WinState.O_WON;
        }
        if (cells.every((x) => x)) {
            return WinState.DRAW;
        }
        return null;
    }

    calculateWinnerImpl(squares) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (
                squares[a] &&
                squares[a] === squares[b] &&
                squares[a] === squares[c]
            ) {
                return [a, b, c];
            }
        }
        return null;
    }

    handleClick(board, index) {
        if (!this.state.playable[board] || this.state.squares[board][index] || this.state.winners) {
            return;
        }

        const squares = this.state.squares.slice();
        squares[board][index] = this.state.xIsNext ? "X" : "O";

        const wins = this.state.wins.slice();
        wins[board] = this.calculateBoardWinner(squares[board]);
        const winners = this.calculateWinnerImpl(wins)
        const nextIsComplete = squares[index].every((x) => x);
        const playable = squares.map((sq, i) => {
            if (winners) {
                // don't move to the next square if the game is won
                return this.state.playable[i];
            }
            if (nextIsComplete) {
                // every incomplete square is open
                return !sq.every((x) => x);
            }
            return i === index;
        });

        this.setState((state) => ({
            squares: squares,
            wins: wins,
            playable: playable,
            lastClicked: {
                board: board,
                index: index
            },
            xIsNext: !state.xIsNext,
            winners: winners
        }));
    }

    render() {

        let status;
        if (this.state.winners) {
            status = "Winner: " + (this.state.wins[this.state.winners[0]] === WinState.X_WON ? "X" : "O");
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }

        const boards = [];
        for (let b = 0; b < 9; ++b) {
            boards.push(
                <RegularBoard
                    key={b}
                    squares={this.state.squares[b]}
                    lastClicked={
                        this.state.lastClicked?.board === b
                            ? this.state.lastClicked.index
                            : null
                    }
                    winState={this.state.wins[b]}
                    playable={this.state.playable[b]}
                    partOfWinRow={this.state.winners?.includes(b)}
                    onClick={(i) => this.handleClick(b, i)}
                />
            );
        }
        return (
            <div className="game">
                <div className="outer">{boards}</div>
                <div className="game-info">
                    <div>{status}</div>
                    <button onClick={() => this.reset()}>Reset</button>
                    <button onClick={() => this.generateTestLayout()}>Dummy Game</button>
                </div>
            </div>
        );
    }
}

export default Game;
