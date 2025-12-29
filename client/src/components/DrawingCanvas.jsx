// DrawingCanvas.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';

const DrawingCanvas = ({ salaId, socket, userRole }) => { // <--- RECEBE O SOCKET AQUI
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);

  const isProfessor = userRole?.toLowerCase() === 'professor';

  useEffect(() => {
    if (!socket || !salaId) return;

    // Receber o histórico completo (disparado no join_room)
    socket.on('canvas_history', (history) => {
      setLines(history);
    });

    socket.on('draw_line', (newLine) => {
      setLines((prev) => [...prev, newLine]);
    });

    socket.on('clear_canvas', () => setLines([]));

    return () => {
      socket.off('canvas_history');
      socket.off('draw_line');
      socket.off('clear_canvas');
    };
  }, [salaId, socket]);

  // Esta função corre no momento exato em que clicas com o rato no quadro
  const handleMouseDown = (e) => {
    // Se não fores o professor, não te deixa começar a desenhar
    if (!isProfessor) return;

    // Avisa o sistema que o rato está premido e o desenho começou
    isDrawing.current = true;

    // O Konva captura a coordenada (x, y) de onde o teu clique aconteceu dentro do palco
    const pos = e.target.getStage().getPointerPosition();

    // Cria uma nova linha na lista, guardando este primeiro ponto como o início do traço
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  // Esta função corre sempre que moves o rato sobre o quadro
  const handleMouseMove = (e) => {
    // Se não estiveres a carregar no rato ou não fores o professor, não faz nada
    if (!isDrawing.current || !isProfessor) return;

    // O Konva descobre a posição exata do teu rato dentro do quadro branco
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    // Vamos buscar a linha que estamos a desenhar neste momento
    let lastLine = { ...lines[lines.length - 1] };

    // Se a linha não existir por algum motivo, paramos aqui
    if (!lastLine) return;

    // O Konva desenha ligando pontos (x,y). Aqui "colamos" as novas coordenadas 
    // do rato ao final da linha para ela crescer enquanto te moves
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // Atualizamos a lista de linhas para o React mostrar o desenho no teu ecrã
    const newLines = lines.slice(0, -1).concat(lastLine);
    setLines(newLines);

    // Enviamos a linha atualizada para o servidor para que os alunos vejam o mesmo traço
    socket.emit('draw_line', {
      roomId: salaId,
      line: lastLine,
      userRole: userRole
    });
  };

  return (
    <div className="w-full h-full bg-white border rounded-lg overflow-hidden">
      {!isProfessor ?(
        <div className=" top-2 right-2 z-10 bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold">
          Modo Visualização
        </div>
      ):(<button onClick={() => { setLines([]); socket.emit('clear_canvas', salaId); }}
        className="m-2 px-3 py-1 bg-red-500 text-white text-xs rounded">
        Limpar
      </button>)}
      
      <Stage
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={() => isDrawing.current = false}
        listening={isProfessor}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line key={i} points={line.points} stroke="#000" strokeWidth={3} tension={0.5} lineCap="round" lineJoin="round" />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default DrawingCanvas;