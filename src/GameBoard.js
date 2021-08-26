import React,{useRef, useState} from 'react';
import './App.css';
import { checkWinner, AIMove, getOpenTiles } from './API';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import CloseIcon from '@material-ui/icons/Close';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

const initialBoard = [-9,-9,-9,-9,-9,-9,-9,-9,-9];

const GameBoard = () => {
    const [winner,setWinner] = useState(false);
    const [curPlayer,setCurPlayer] = useState(1);
    const [level,setLevel] = useState(1);
    const [totalWins,setTotalWins] = useState({1: 0, 2: 0, draw: 0,games: 0})
    const [board,setBoard] = useState(initialBoard);
    const boardRef = useRef();
    const playerRef = useRef();
    playerRef.current = curPlayer;
    boardRef.current = board;

    const handleCellClick = async (e) => {
        if(!winner){
            const [row,col] = e.target.id.split('-');
            const tile = (parseInt(row) * 3) + parseInt(col);   // get tile picked by user
            const win_ratio = parseFloat(((totalWins[`${playerRef.current}`] + totalWins.draw)/totalWins.games).toFixed(2));
            
            if(boardRef.current[tile] != -9){
                alert('cannot go here')
            }else{
                let temp = [...boardRef.current];
                temp[tile] = playerRef.current;
                setBoard(temp);
                if(checkWinner(temp) || !getOpenTiles(temp).length){
                    const who_wins = checkWinner(temp) ? checkWinner(temp) : 'draw';
                    setWinner(who_wins === 1 ? "Player" : who_wins === 2 ? "AIP-3" : "Draw")
                    if((win_ratio < 0.75 && level === 1) || (win_ratio < 0.75 && level === 2)){
                        setLevel(1);
                    }else if((win_ratio >= 0.75 && level === 1) || (win_ratio < 0.85 && level === 3) || (win_ratio >= 0.75 && win_ratio < 0.85 && level === 2)){
                        setLevel(2);
                    }else if((win_ratio >= 0.85 && level === 2) || (win_ratio === 1 && win_ratio >= 0.85 && level === 3)){
                        setLevel(3);
                    }
                    setTotalWins(prevState => ({...prevState,[who_wins]: prevState[who_wins]++,games: prevState.games++}))
                }else{
                    playAI(temp);
                }            
            }  
        }              
    }

    const startGame = () => {
        let copy = [...board]
        playAI(copy);
    }

    const playAI = async (board) => {
        if(!winner){
            let temp = [...board];
            const nextPlayer = playerRef.current === 1 ? 2 : 1;
            const result = await AIMove(temp,totalWins,nextPlayer,level);
            
            if(result.winner){
                setWinner(result.winner === 1 ? "Player" : result.winner === 2 ? "AIP-3" : 'Draw' );
                if(result.level){
                    setLevel(result.level);
                }
                setTotalWins(prevState => ({...prevState,[result.winner]: prevState[result.winner]++,games: prevState.games++}))
                setBoard(result.board);
            }else{
                if(result.level){
                    setLevel(result.level);
                }
                setBoard(result.board);
                setWinner(0);
            }
        }
    }

    const handleReset = () => {
        setBoard(initialBoard);
        setWinner(false);
    }

    // const handlePlayerStart = (event) => {
    //     const player = event.target.id;
    //     // check if game is currently playing
    //     if(getOpenTiles(board).length === initialBoard.length){
    //         const currentPlayer = player === 'p1' ? 1 : 2;
    //         setCurPlayer(currentPlayer);
    //         if(currentPlayer === 2){
    //             startGame();
    //         }
    //     }        
    // }

    return (
        <div>
            {winner ? <div className="winner-modal">
                <div style={{display: 'flex',flexDirection: 'column', alignItems: 'center'}}>
                    <h2>{winner != 'Draw' ? 'Winner!' : 'Draw'}</h2>
                    <div>
                        {winner === 'Player' ?
                            <CloseIcon style={{fontSize:100}} />
                        : winner === 'AIP-3' ?
                            <PanoramaFishEyeIcon style={{fontSize:85}} />
                        : null}
                    </div>
                </div>                
            </div> : null}
            <div style={{display: 'flex',justifyContent: 'space-between',marginBottom: 36}}>
                <div id="p1" style={{display: 'flex',width: '45%',fontSize: 24}}>
                    <div id="p1" className={`player-card ${playerRef.current === 1 ? 'active-p1' : null}`}>
                        <div style={{marginRight: 'auto'}}>
                            <CloseIcon />
                        </div>
                        <div>
                            {totalWins["1"]}
                        </div>
                    </div>                   
                </div>
                <div id="p2" style={{display: 'flex',width: '45%',fontSize: 24}}>
                    <div id="p2" className={`player-card ${playerRef.current === 2 ? 'active-p2' : null}`}>
                        <div style={{marginRight: 'auto'}}>
                            <PanoramaFishEyeIcon />
                        </div>
                        <div>
                            {totalWins["2"]}
                        </div>
                    </div>                   
                </div>                
            </div>
        <Paper elevation={3}>
            <table className="gameboard">
                <tbody>
                    <tr className="gameboard-row" key={0}>
                        <td className="gameboard-cell upper-left" id={`${0}-${0}`} onClick={handleCellClick}>{boardRef.current[0] === 1 ? <CloseIcon className="player1"  /> : boardRef.current[0] === 2 ? <PanoramaFishEyeIcon className="player2" /> : <div className="empty"></div>}</td>
                        <td className="gameboard-cell upper-middle" id={`${0}-${1}`} onClick={handleCellClick}>{boardRef.current[1] === 1 ? <CloseIcon  className="player1"  /> : boardRef.current[1] === 2 ? <PanoramaFishEyeIcon className="player2" /> : <div className="empty"></div>}</td>
                        <td className="gameboard-cell upper-right" id={`${0}-${2}`} onClick={handleCellClick}>{boardRef.current[2] === 1 ? <CloseIcon  className="player1" /> : boardRef.current[2] === 2 ? <PanoramaFishEyeIcon className="player2" /> : <div className="empty"></div>}</td>
                    </tr>
                    <tr className="gameboard-row" key={1}>
                        <td className="gameboard-cell middle-left" id={`${1}-${0}`} onClick={handleCellClick}>{boardRef.current[3] === 1 ? <CloseIcon className="player1"  /> : boardRef.current[3] === 2 ? <PanoramaFishEyeIcon className="player2" /> : <div className="empty"></div>}</td>
                        <td className="gameboard-cell middle" id={`${1}-${1}`} onClick={handleCellClick}>{boardRef.current[4] === 1 ? <CloseIcon className="player1"  /> : boardRef.current[4] === 2 ? <PanoramaFishEyeIcon className="player2" /> : <div className="empty"></div>}</td>
                        <td className="gameboard-cell middle-right" id={`${1}-${2}`} onClick={handleCellClick}>{boardRef.current[5] === 1 ? <CloseIcon className="player1"  /> : boardRef.current[5] === 2 ? <PanoramaFishEyeIcon className="player2" /> : <div className="empty"></div>}</td>
                    </tr>
                    <tr className="gameboard-row" key={2}>
                        <td className="gameboard-cell bottom-left" id={`${2}-${0}`} onClick={handleCellClick}>{boardRef.current[6] === 1 ? <CloseIcon className="player1"  /> : boardRef.current[6] === 2 ? <PanoramaFishEyeIcon className="player2" /> : <div className="empty"></div>}</td>
                        <td className="gameboard-cell bottom-middle" id={`${2}-${1}`} onClick={handleCellClick}>{boardRef.current[7] === 1 ? <CloseIcon className="player1"  /> : boardRef.current[7] === 2 ? <PanoramaFishEyeIcon className="player2" /> : <div className="empty"></div>}</td>
                        <td className="gameboard-cell bottom-right" id={`${2}-${2}`} onClick={handleCellClick}>{boardRef.current[8] === 1 ? <CloseIcon className="player1"  /> : boardRef.current[8] === 2 ? <PanoramaFishEyeIcon className="player2" /> : <div className="empty"></div>}</td>
                    </tr>
                </tbody>
            </table>
        </Paper>
        <div>
            <Button style={{width: '100%',marginTop: 16}} color="primary" onClick={handleReset}>Reset Game</Button>
        </div>
        <div style={{textAlign: 'center', padding: 12}}>
            <a style={{color: 'black', fontSize: 18}} target="_blank" href="https://www.google.com">Learn more about this program</a>
        </div>
        </div>
    )
}

export default GameBoard;
