const AI = 2;
const PLAYER = 1;
const DEPTH = 6;

export const getOpenTiles = (board) => {
    let copy = [...board]
    return copy.reduce((open,tile,index) => {
        if(tile === -9){
            open.push(index);
        }
        return open;
    },[])
}

export const checkWinner = (board) => {
    let diag1,diag2,horz1,horz2,horz3,vert1,vert2,vert3;
    diag1 = diag2 = horz1 = horz2 = horz3 = vert1 = vert2 = vert3 = 0;
    let player1,player2;
    player1 = player2 = 0;

    for(let i = 0; i < board.length; i += 3){
        diag1 += board[i+(i/3)];
        diag2 += board[2 + ((i/3)*2)];
        horz1 += board[(i/3)];
        horz2 += board[(i/3) + 3];
        horz3 += board[(i/3) + 6];
        vert1 += board[(i/3) * 3];
        vert2 += board[((i/3) * 3) + 1];
        vert3 += board[((i/3) * 3) + 2];

        player1 = (diag1 % 9) === 3 | (diag2 % 9) === 3 | (horz1 % 9) === 3 | (horz2 % 9) === 3 | (horz3 % 9) === 3 | (vert1 % 9) === 3 | (vert2 % 9) === 3 | (vert3 % 9) === 3;
        player2 = (diag1 % 9) === 6 | (diag2 % 9) === 6 | (horz1 % 9) === 6 | (horz2 % 9) === 6 | (horz3 % 9) === 6 | (vert1 % 9) === 6 | (vert2 % 9) === 6 | (vert3 % 9) === 6;
    }
    
    if(player1){
        return 1
    }else if(player2){
        return 2
    }

    return 0;
}

export const AIMove = (board,totalWins,curPlayer,level) => {
    return new Promise(async(resolve,reject) => {
        setTimeout(() => { 
            const open_tiles = getOpenTiles(board);
            const human = curPlayer === 1 ? 2 : 1;
            const win_ratio = parseFloat(((totalWins[`${human}`] + totalWins.draw)/totalWins.games).toFixed(2));

            if(open_tiles.length){
                if(totalWins.games >= 2){    // player must have played at least 2 games
                    if((win_ratio < 0.75 && level === 1) || (win_ratio < 0.75 && level === 2)){  // play novice
                        let boardCopy = [...board]
                        const move = playNovice(boardCopy);
                        boardCopy[move] = curPlayer;
        
                        if(checkWinner(boardCopy)){
                            resolve({winner: checkWinner(boardCopy), board: boardCopy, level: 1})
                        }else{
                            resolve({winner: 0, board: boardCopy})
                        }
                    }else if((win_ratio >= 0.75 && level === 1) || (win_ratio < 0.85 && level === 3) || (win_ratio >= 0.75 && win_ratio < 0.85 && level === 2)){    // play intermediate
                        let boardCopy = [...board];
                        const move = playAI(boardCopy,curPlayer,0)
                        boardCopy[move.index] = curPlayer;
                        
                        if(checkWinner(boardCopy)){
                            resolve({winner: checkWinner(boardCopy), board: boardCopy, level: 2})
                        }else{
                            resolve({winner: 0, board: boardCopy})
                        }
                    }else if((win_ratio >= 0.85 && level === 2) || (win_ratio === 1 && win_ratio >= 0.85 && level === 3)){    // play expert
                        let boardCopy = [...board];
                        const move = playAI(boardCopy,curPlayer)
                        boardCopy[move.index] = curPlayer;
                        
                        if(checkWinner(boardCopy)){
                            resolve({winner: checkWinner(boardCopy), board: boardCopy, level: 3})
                        }else{
                            resolve({winner: 0, board: boardCopy})
                        }
                    }
                }else{  // start playing novice
                    let boardCopy = [...board]
                    const move = playNovice(boardCopy);
                    boardCopy[move] = curPlayer;
    
                    if(checkWinner(boardCopy)){
                        resolve({winner: checkWinner(boardCopy), board: boardCopy, level: 1})
                    }else{
                        resolve({winner: 0, board: boardCopy})
                    }
                }                
            }else{
                resolve({winner: -1, board: board})
            }            
        },500)    
    }) 
}

const playNovice = (cur_board) => {
    let boardCopy = [...cur_board];
    const open_tiles = getOpenTiles(boardCopy);
    if(open_tiles.length){   // there are spaces available
        const rand = Math.random() * open_tiles.length;
        return open_tiles[Math.floor(rand)];
    }

    return null;
}

const playAI = (cur_board, cur_player, curDepth) => {
    // get current player.  If player is user then minimize
    // else if player is ai then maximize
    let next_move = 0;
    let moves = [];
    const total_score = cur_player === AI ? -1000 : 1000;
    let open_tiles = getOpenTiles(cur_board);   // get open tiles for current gameboard
    const total_moves = cur_board.length - open_tiles.length;
    
    // check if game is in terminal state (ie. AI Wins, Player Wins, or Draw)
    if(checkWinner(cur_board) || !open_tiles.length || curDepth != null && curDepth === DEPTH){
        return checkWinner(cur_board) === AI ? {score: 10, num_moves: total_moves, player: cur_player} : checkWinner(cur_board) === PLAYER ? {score: -10, num_moves: total_moves, player: cur_player} : {score: 0, num_moves: total_moves, player: cur_player}
    }

    // iterate through each open tile
    open_tiles.forEach(move => {
        let boardCopy = [...cur_board];
        boardCopy[move] = cur_player;   // set open tile to current player
        const nextPlayer = cur_player === AI ? PLAYER : AI;

        if(curDepth != null){   // play intermediate
            const result = playAI(boardCopy,nextPlayer,curDepth++)  // get player 1's next possible move
            moves.push({index: move, score: result.score, moves: result.num_moves, player: result.player})
        }else{  // play expert
            const result = playAI(boardCopy,nextPlayer)  // get player 1's next possible move
            moves.push({index: move, score: result.score, moves: result.num_moves, player: result.player})
        }        
    });

    // iterate through all possible moves
    moves.reduce((total,move,index) => {
        if(cur_player === AI){
            if(move.score >= total.score){ // maximize for AI
                next_move = index;
                total.score = move.score;
            }
        }else{
            if(move.score < total.score){ // minimize for Player
                next_move = index;
                total.score = move.score;
            }
        }       

        return total;
    },{score: total_score, moves: 9})

    return moves[next_move];
}