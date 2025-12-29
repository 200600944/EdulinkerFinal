import React, { useState, useRef } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import styled from 'styled-components';

const CanvasWrapper = styled.div`
  background: #ffffff; /* Fundo branco para o quadro */
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: crosshair; /* Muda o rato para uma cruz ao desenhar */
`;

const Toolbar = styled.div`
  background: #f0f0f0;
  padding: 10px;
  display: flex;
  gap: 10px;
  border-bottom: 1px solid #ddd;
`;

const Button = styled.button`
  padding: 5px 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover { background: #0056b3; }
`;

const DrawingCanvas = () => {
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    // Adiciona uma nova linha com o ponto inicial
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    // Se não estiver a carregar no botão do rato, não faz nada
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    // Pega na última linha criada e adiciona o novo ponto
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // Atualiza o estado das linhas
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleClear = () => setLines([]);
  const handleUndo = () => setLines(lines.slice(0, -1));

  return (
    <CanvasWrapper>
      <Toolbar>
        <Button onClick={handleUndo}>Desfazer</Button>
        <Button onClick={handleClear} style={{background: '#dc3545'}}>Limpar Quadro</Button>
      </Toolbar>

      {/* O Stage é o "contentor" do canvas */}
      <Stage
        width={800} // Depois podemos tornar isto dinâmico
        height={600}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#000000" // Cor do traço
              strokeWidth={3}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          ))}
        </Layer>
      </Stage>
    </CanvasWrapper>
  );
};

export default DrawingCanvas;