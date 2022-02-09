import React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import './Game.css';
import x_mark from './img/small_blue_comic_x.png';
import o_mark from './img/small_pink_comic_o.png';
import question_mark from './img/green_small_question.png';
import rewind_mark from './img/red_rewind.png';
import fast_fwd_mark from './img/green_fast_forward.png';
import logo from './img/eXtreme_nOughts_crOsses.png';

/*
Bugs
1. Game draw detector
2. Optimise for mobile
3. It's completely broken in mobile safari
4. Instructions!
5. Tests
6. Migrate pop-up to MUI
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
        display = <img src={props.value === "X" ? x_mark : o_mark} alt={props.value}/>
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
            },
            winners: null
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

        let status = (
            <div>
                <div>Next player</div>
                <img src={this.state.xIsNext ? x_mark : o_mark} alt={this.state.xIsNext ? "X" : "O"}/>
            </div>
        );
        if (this.state.winners) {
            status = (
                <div>
                    Winner:
                    <img
                        src={this.state.wins[this.state.winners[0]] === WinState.X_WON ? x_mark : o_mark}
                        alt={this.state.wins[this.state.winners[0]] === WinState.X_WON ? "X" : "O"}
                    />;
                </div>
            );
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
                <div className="logo">
                    <img src={logo} alt="logo: eXtreme nOughts and crOsses"/>
                </div>
                <div className="game-info">
                    <button onClick={() => this.reset()}><img src={rewind_mark} alt="reset"/></button>
                    <button onClick={(event) => this.setState({anchorEl: event.currentTarget})}>
                        <img src={question_mark} alt="help"/>
                    </button>
                    <Popover
                        id="instructions-popover"
                        open={Boolean(this.state.anchorEl)}
                        anchorEl={this.state.anchorEl}
                        onClose={() => this.setState({anchorEl: null})}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}>
                        <Typography sx={{ p: 2 }}>
                            eXtreme nOughts and crOsses
                        </Typography>
                        <Typography sx={{ p: 2 }}>
                            It's just noughts and crosses, but you're playing on two levels at the same time — the main game, and nine mini-games.
                            You win the main game by winning on three mini-games in a row (again: up/down, left/right, or diagonal).
                            Each mini-game is just regular noughts and crosses — you win by placing three in a row (up/down, left/right, or diagonal).
                            Each turn, only one mini-game is activated. The square you play in the active mini-game determines the next mini-game to be activated — play the bottom left square in the current mini-game, and your opponent will have to play on the bottom left mini-game.
                            Play the middle square on your mini-game, and send your opponent to the centre mini-game next.
                            Beware — if you send your opponent to a mini-game that's already been won, then every mini-games is unlocked for the next turn.
                            Inspired by the game Extreme Tic Tac Toe, from the book <a href="https://smile.amazon.co.uk/Math-Bad-Drawings-Illuminating-Reality/dp/0316509035/ref=sr_1_1?crid=DYNG16GQEM7Q&keywords=Math+with+Bad+Drawings&qid=1643926706&s=books&sprefix=math+with+bad+drawings%2Cstripbooks%2C201&sr=1-1">Math with Bad Drawings</a> by Ben Orlin.
                        </Typography>
                    </Popover>
                    <button onClick={() => this.generateTestLayout()}>
                        <img src={fast_fwd_mark} alt="dummy game"/>
                    </button>
                    <div>{status}</div>
                </div>
                <div className="outer">{boards}</div>
            </div>
        );
    }
}

export default Game;
