import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';

const DrawingCanvas = ({ roomId, socket, userRole }) => {
  // Estados para gerir as linhas desenhadas no quadro
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);

  // Verificação de permissão: apenas o professor pode interagir com o quadro
  const isProfessorUser = userRole?.toLowerCase() === 'professor';

  useEffect(() => {
    if (!socket || !roomId) return;

    // Recebe o histórico completo de desenhos ao entrar na sala
    socket.on('canvas_history', (history) => {
      setLines(history);
    });

    // Escuta novos traços desenhados por outros utilizadores (neste caso, o professor)
    socket.on('draw_line', (newLine) => {
      setLines((prev) => [...prev, newLine]);
    });

    // Escuta o evento de limpeza do quadro
    socket.on('clear_canvas', () => setLines([]));

    return () => {
      socket.off('canvas_history');
      socket.off('draw_line');
      socket.off('clear_canvas');
    };
  }, [roomId, socket]);

  // Inicia o processo de desenho quando o utilizador clica no palco
  const handleMouseDown = (e) => {
    // Bloqueia a ação se o utilizador não tiver perfil de professor
    if (!isProfessorUser) return;

    isDrawing.current = true;

    // Captura a posição inicial do ponteiro
    const pos = e.target.getStage().getPointerPosition();

    // Adiciona uma nova linha à lista com o ponto inicial
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  // Atualiza a linha em tempo real enquanto o rato se move
  const handleMouseMove = (e) => {
    // Interrompe se não houver desenho em curso ou se não for professor
    if (!isDrawing.current || !isProfessorUser) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    // Obtém a referência da última linha que está a ser criada
    let lastLine = { ...lines[lines.length - 1] };

    if (!lastLine) return;

    // Concatena as novas coordenadas ao array de pontos da linha atual
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // Atualiza o estado local para renderização imediata no ecrã do professor
    const newLines = lines.slice(0, -1).concat(lastLine);
    setLines(newLines);

    // Emite o traço via socket para que os alunos recebam a atualização em tempo real
    socket.emit('draw_line', {
      roomId: roomId,
      line: lastLine,
      userRole: userRole
    });
  };

  // Função para limpar todo o conteúdo do quadro branco
  const handleClearCanvas = () => {
    setLines([]);
    socket.emit('clear_canvas', {
      roomId: roomId,
      userRole: userRole
    });
  };

  return (
    <div className="w-full h-full bg-white border rounded-lg overflow-hidden">
      
      {/* Interface de controlo: Mostra modo visualização para alunos ou botão limpar para professor */}
      {!isProfessorUser ? (
        <div className="p-2 bg-blue-100 text-blue-700 text-[10px] font-bold">
          Modo Visualização
        </div>
      ) : (
        <button 
          onClick={handleClearCanvas}
          className="m-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
        >
          Limpar Quadro
        </button>
      )}

      {/* Palco do Konva onde o desenho é renderizado */}
      <Stage
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={() => isDrawing.current = false}
        listening={isProfessorUser}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line 
              key={i} 
              points={line.points} 
              stroke="#000" 
              strokeWidth={3} 
              tension={0.5} 
              lineCap="round" 
              lineJoin="round" 
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default DrawingCanvas;