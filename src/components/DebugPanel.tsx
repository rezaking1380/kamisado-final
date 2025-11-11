import React from 'react';
import { useGame } from '@/contexts/GameContext';

const DebugPanel = () => {
  const { state } = useGame();
  
  // پیدا کردن مهره‌هایی که در ردیف برد هستند
  const piecesAtGoal = state.pieces.filter(piece => 
    (piece.player === 'black' && piece.position.row === 7) ||
    (piece.player === 'white' && piece.position.row === 0)
  );

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg max-w-md text-xs font-mono shadow-2xl z-50 max-h-[80vh] overflow-auto">
      <h3 className="font-bold mb-2 text-green-400">🐛 Debug Info</h3>
      
      <div className="space-y-1 mb-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Game Started:</span>
          <span className={state.gameStarted ? 'text-green-400' : 'text-red-400'}>
            {state.gameStarted ? '✅ YES' : '❌ NO'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Current Player:</span>
          <span className="text-yellow-400">{state.currentPlayer}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Winner:</span>
          <span className={state.winner ? 'text-red-400 font-bold animate-pulse' : 'text-gray-500'}>
            {state.winner || 'None'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Last Moved Color:</span>
          <span className="text-purple-400">{state.lastMovedPieceColor || 'None'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">AI Enabled:</span>
          <span className={state.aiEnabled ? 'text-green-400' : 'text-gray-500'}>
            {state.aiEnabled ? '✅ ON' : '❌ OFF'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Move Count:</span>
          <span className="text-blue-400">{state.history?.length || 0}</span>
        </div>
      </div>

      {piecesAtGoal.length > 0 && (
        <div className="mt-3 border-t border-white/20 pt-2">
          <h4 className="font-bold mb-2 text-red-400 animate-pulse">⭐ Pieces at Goal Row:</h4>
          <div className="text-xs text-green-300 mb-2">
            ✅ Rule: Any piece reaching opponent's home row WINS!
          </div>
          {piecesAtGoal.map(piece => {
            const goalRow = piece.player === 'black' ? 7 : 0;
            const cellColor = state.board[goalRow][piece.position.col];
            
            return (
              <div key={piece.id} className="mb-2 p-2 bg-red-500/20 rounded border border-red-500/50">
                <div className="text-yellow-300 font-bold">{piece.id} ({piece.player})</div>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  <span className="text-gray-400">Position:</span>
                  <span>[{piece.position.row}, {piece.position.col}]</span>
                  
                  <span className="text-gray-400">Piece Color:</span>
                  <span className="text-yellow-300">{piece.color}</span>
                  
                  <span className="text-gray-400">Cell Color:</span>
                  <span className="text-purple-300">{cellColor}</span>
                  
                  <span className="text-gray-400">Status:</span>
                  <span className="text-red-400 font-bold">
                    🏆 SHOULD WIN!
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {state.winner && piecesAtGoal.length === 0 && (
        <div className="mt-3 border-t border-red-500/50 pt-2 bg-red-500/20 p-2 rounded">
          <div className="text-red-400 font-bold">⚠️ WARNING:</div>
          <div className="text-yellow-300 text-xs mt-1">
            Winner declared but no piece at goal row!<br/>
            This might be a bug or blocked situation.
          </div>
        </div>
      )}
      
      <div className="mt-3 pt-2 border-t border-white/20 text-gray-400 text-[10px]">
        💡 Press F12 to see detailed console logs
      </div>
    </div>
  );
};

export default DebugPanel;