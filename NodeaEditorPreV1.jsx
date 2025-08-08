import React, { useState, useRef, useEffect } from "react";
import "./NodeaEditor.css";

export default function NodeaEditor() {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const containerRef = useRef();

  // Initialize with start node
  useEffect(() => {
    if (nodes.length === 0) {
      const centerX = window.innerWidth / 2 - 75;
      const centerY = window.innerHeight / 2 - 30;
      const startNode = {
        id: "start",
        text: "Startknoten",
        x: centerX,
        y: centerY,
      };
      setNodes([startNode]);
      saveHistory([startNode], []);
    }
  }, []);

  const saveHistory = (nodesSnapshot, connectionsSnapshot) => {
    setHistory((h) => [...h, { nodes: nodesSnapshot, connections: connectionsSnapshot }]);
    setFuture([]);
  };

  const handleCreateNode = () => {
    if (!selectedNode) return;
    const newNode = {
      id: Date.now().toString(),
      text: "Neuer Knoten",
      x: selectedNode.x + 150,
      y: selectedNode.y,
    };
    const newNodes = [...nodes, newNode];
    const newConnections = [...connections, { from: selectedNode.id, to: newNode.id }];
    setNodes(newNodes);
    setConnections(newConnections);
    saveHistory(newNodes, newConnections);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    const previous = newHistory.splice(newHistory.length - 2, 1)[0];
    setFuture((f) => [history[history.length - 1], ...f]);
    setHistory(newHistory);
    setNodes(previous.nodes);
    setConnections(previous.connections);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const [next, ...rest] = future;
    setHistory((h) => [...h, next]);
    setFuture(rest);
    setNodes(next.nodes);
    setConnections(next.connections);
  };

  const handleDrag = (id, e) => {
    e.preventDefault();
    const nodeIndex = nodes.findIndex((n) => n.id === id);
    const node = nodes[nodeIndex];
    const startX = e.clientX || e.touches[0].clientX;
    const startY = e.clientY || e.touches[0].clientY;

    const handleMove = (moveEvent) => {
      const currentX = moveEvent.clientX || moveEvent.touches[0].clientX;
      const currentY = moveEvent.clientY || moveEvent.touches[0].clientY;
      const dx = currentX - startX;
      const dy = currentY - startY;
      const updatedNode = { ...node, x: node.x + dx, y: node.y + dy };
      const newNodes = [...nodes];
      newNodes[nodeIndex] = updatedNode;
      setNodes(newNodes);
    };

    const handleUp = () => {
      saveHistory([...nodes], [...connections]);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleUp);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleUp);
  };

  const handleTextChange = (id, text) => {
    const newNodes = nodes.map((n) =>
      n.id === id ? { ...n, text } : n
    );
    setNodes(newNodes);
    saveHistory(newNodes, connections);
  };

  return (
    <div className="editor-container" ref={containerRef}>
      {connections.map((c) => {
        const fromNode = nodes.find((n) => n.id === c.from);
        const toNode = nodes.find((n) => n.id === c.to);
        if (!fromNode || !toNode) return null;
        return (
          <svg key={c.from + c.to} className="connection-line">
            <line
              x1={fromNode.x + 75}
              y1={fromNode.y + 30}
              x2={toNode.x + 75}
              y2={toNode.y + 30}
              stroke="#888"
              strokeWidth="2"
            />
          </svg>
        );
      })}
      {nodes.map((node) => (
        <div
          key={node.id}
          className={`node ${selectedNode?.id === node.id ? "selected" : ""}`}
          style={{ left: node.x, top: node.y }}
          onMouseDown={(e) => handleDrag(node.id, e)}
          onTouchStart={(e) => handleDrag(node.id, e)}
          onClick={() => setSelectedNode(node)}
        >
          <textarea
            value={node.text}
            onChange={(e) => handleTextChange(node.id, e.target.value)}
            rows="2"
          />
        </div>
      ))}
      <div className="toolbar">
        <button onClick={handleCreateNode} disabled={!selectedNode}>Knoten erstellen</button>
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleRedo}>Redo</button>
      </div>
    </div>
  );
}
