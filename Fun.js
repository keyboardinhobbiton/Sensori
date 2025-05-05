import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function GrafoEstendibile() {
  const svgRef = useRef();
  const [nodes, setNodes] = useState([
    { id: "A", label: "Nodo A", group: 1 },
    { id: "B", label: "Nodo B", group: 1 },
    { id: "C", label: "Nodo C", group: 2 },
    { id: "D", label: "Nodo D", group: 3 },
    { id: "E", label: "Nodo E", group: 3 }
  ]);
  
  const [links, setLinks] = useState([
    { source: "A", target: "B", value: 1 },
    { source: "A", target: "C", value: 2 },
    { source: "B", target: "D", value: 1 },
    { source: "C", target: "E", value: 3 }
  ]);

  const [nodeName, setNodeName] = useState("");
  const [nodeGroup, setNodeGroup] = useState(1);
  const [sourceNode, setSourceNode] = useState("");
  const [targetNode, setTargetNode] = useState("");
  const [linkValue, setLinkValue] = useState(1);
  
  const width = 800;
  const height = 600;
  
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  
  const addNode = () => {
    if (nodeName.trim() === "") return;
    const newId = nodeName.trim();
    if (nodes.find(n => n.id === newId)) {
      alert("Esiste già un nodo con questo ID!");
      return;
    }
    
    setNodes([...nodes, { id: newId, label: `Nodo ${newId}`, group: parseInt(nodeGroup) }]);
    setNodeName("");
  };
  
  const addLink = () => {
    if (sourceNode === "" || targetNode === "") return;
    if (sourceNode === targetNode) {
      alert("Il nodo origine e destinazione non possono essere uguali!");
      return;
    }
    if (links.find(l => l.source === sourceNode && l.target === targetNode)) {
      alert("Esiste già un collegamento tra questi nodi!");
      return;
    }
    
    setLinks([...links, { source: sourceNode, target: targetNode, value: parseInt(linkValue) }]);
    setSourceNode("");
    setTargetNode("");
    setLinkValue(1);
  };
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(d => 100 / d.value))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));
    
    // Aggiungi definizione per le frecce
    const defs = svg.append("defs");
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999");
    
    // Crea i collegamenti
    const link = svg.append("g")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value) * 2)
      .attr("fill", "none")
      .attr("marker-end", "url(#arrowhead)");
    
    // Crea i nodi
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    
    // Aggiungi cerchi ai nodi
    node.append("circle")
      .attr("r", 18)
      .attr("fill", d => colorScale(d.group))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
    
    // Aggiungi etichette ai nodi
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", "#fff")
      .attr("font-weight", "bold")
      .text(d => d.id);
    
    // Aggiungi tooltip al mouseover
    node.append("title")
      .text(d => d.label);
    
    simulation.on("tick", () => {
      link.attr("d", d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });
      
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });
    
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="bg-gray-100 p-6 rounded-lg shadow-lg w-full mb-6">
        <h2 className="text-xl font-bold mb-4 text-center text-purple-800">Grafo Estendibile Interattivo</h2>
        
        <svg 
          ref={svgRef} 
          width={width} 
          height={height} 
          className="bg-white rounded-lg shadow-inner border border-gray-200"
        />
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold mb-2 text-purple-700">Aggiungi Nodo</h3>
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                placeholder="ID del nodo"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                className="border p-2 rounded"
              />
              <select
                value={nodeGroup}
                onChange={(e) => setNodeGroup(e.target.value)}
                className="border p-2 rounded"
              >
                <option value={1}>Gruppo 1</option>
                <option value={2}>Gruppo 2</option>
                <option value={3}>Gruppo 3</option>
                <option value={4}>Gruppo 4</option>
                <option value={5}>Gruppo 5</option>
              </select>
              <button
                onClick={addNode}
                className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
              >
                Aggiungi Nodo
              </button>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold mb-2 text-purple-700">Aggiungi Collegamento</h3>
            <div className="flex flex-col space-y-2">
              <select
                value={sourceNode}
                onChange={(e) => setSourceNode(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Seleziona nodo origine</option>
                {nodes.map((node) => (
                  <option key={`source-${node.id}`} value={node.id}>
                    {node.label}
                  </option>
                ))}
              </select>
              <select
                value={targetNode}
                onChange={(e) => setTargetNode(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Seleziona nodo destinazione</option>
                {nodes.map((node) => (
                  <option key={`target-${node.id}`} value={node.id}>
                    {node.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="10"
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                className="border p-2 rounded"
                placeholder="Peso del collegamento (1-10)"
              />
              <button
                onClick={addLink}
                className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
              >
                Aggiungi Collegamento
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2 text-purple-700">Informazioni</h3>
          <ul className="list-disc pl-5">
            <li>Trascina i nodi per riposizionarli</li>
            <li>Aggiungi nuovi nodi dal pannello a sinistra</li>
            <li>Crea collegamenti tra i nodi dal pannello a destra</li>
            <li>I colori differenti rappresentano gruppi diversi</li>
            <li>Lo spessore delle linee indica il peso del collegamento</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
