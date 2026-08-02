import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { PipelineNode, CustomVariables } from "../types";

interface D3TopologyGraphProps {
  nodes: PipelineNode[];
  selectedNodeId: string;
  onSelectNode: (node: PipelineNode) => void;
  vars: CustomVariables;
}

interface D3Node extends d3.SimulationNodeDatum, PipelineNode {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
  protocol: string;
  dataFlowRate: string;
}

export const D3TopologyGraph: React.FC<D3TopologyGraphProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  vars
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 420;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("viewBox", `0 0 ${width} ${height}`)
       .attr("width", width)
       .attr("height", height);

    // Defs for gradients and markers
    const defs = svg.append("defs");

    // Glow filter
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");

    filter.append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "coloredBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Linear gradient for links
    const gradient = defs.append("linearGradient")
      .attr("id", "link-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#06b6d4");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#3b82f6");

    // Arrow marker
    defs.append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 28)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#06b6d4");

    // Define topology links between pipeline stages
    const graphNodes: D3Node[] = nodes.map((n, idx) => ({
      ...n,
      // Fixed layout coordinates across screen width for clean horizontal flow
      fx: width * (0.15 + idx * 0.17),
      fy: height * (idx % 2 === 0 ? 0.42 : 0.58)
    }));

    const graphLinks: D3Link[] = [
      { source: "edge-vector", target: "msk-kafka", protocol: "TLS 1.3", dataFlowRate: `${vars.epsTarget || "10,000"} EPS` },
      { source: "msk-kafka", target: "vector-eks", protocol: "mTLS", dataFlowRate: "Vector DaemonSet" },
      { source: "vector-eks", target: "kafka-connect", protocol: "mTLS / KMS", dataFlowRate: "Confluent Engine" },
      { source: "kafka-connect", target: "matano-s3", protocol: "IAM / KMS", dataFlowRate: "Apache Iceberg" },
      { source: "sigma-s3", target: "vector-eks", protocol: "S3 Read", dataFlowRate: "Sigma Watch" },
      { source: "cicd-pipeline", target: "vector-eks", protocol: "Helm / CodeBuild", dataFlowRate: "Checkov Pass" }
    ];

    // Force simulation
    const simulation = d3.forceSimulation<D3Node>(graphNodes)
      .force("link", d3.forceLink<D3Node, D3Link>(graphLinks).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const g = svg.append("g");

    // Draw Links
    const link = g.append("g")
      .selectAll("path")
      .data(graphLinks)
      .enter()
      .append("path")
      .attr("stroke", "url(#link-gradient)")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6)
      .attr("fill", "none")
      .attr("marker-end", "url(#arrow)");

    // Draw Link Labels
    const linkLabel = g.append("g")
      .selectAll("text")
      .data(graphLinks)
      .enter()
      .append("text")
      .text(d => d.protocol)
      .attr("font-size", "9px")
      .attr("font-family", "monospace")
      .attr("fill", "#94a3b8")
      .attr("text-anchor", "middle");

    // Animated Particles along links
    const particles = g.append("g")
      .selectAll("circle")
      .data(graphLinks)
      .enter()
      .append("circle")
      .attr("r", 3)
      .attr("fill", "#38bdf8")
      .attr("filter", "url(#glow)");

    // Animate particles
    let t = 0;
    const timer = d3.timer(() => {
      t = (t + 0.008) % 1;
      particles.each(function(d) {
        const sourceNode = d.source as D3Node;
        const targetNode = d.target as D3Node;
        if (sourceNode.x && sourceNode.y && targetNode.x && targetNode.y) {
          const cx = sourceNode.x + (targetNode.x - sourceNode.x) * t;
          const cy = sourceNode.y + (targetNode.y - sourceNode.y) * t;
          d3.select(this).attr("cx", cx).attr("cy", cy);
        }
      });
    });

    // Draw Nodes
    const nodeGroup = g.append("g")
      .selectAll("g")
      .data(graphNodes)
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        onSelectNode(d);
      });

    // Outer glow ring for selected node
    nodeGroup.append("circle")
      .attr("r", 26)
      .attr("fill", "none")
      .attr("stroke", d => d.id === selectedNodeId ? "#06b6d4" : "#334155")
      .attr("stroke-width", d => d.id === selectedNodeId ? 3 : 1)
      .attr("stroke-dasharray", d => d.id === selectedNodeId ? "4 2" : "none")
      .attr("filter", d => d.id === selectedNodeId ? "url(#glow)" : "none");

    // Main node circle
    nodeGroup.append("circle")
      .attr("r", 20)
      .attr("fill", d => d.id === selectedNodeId ? "#0891b2" : "#0f172a")
      .attr("stroke", d => d.id === selectedNodeId ? "#22d3ee" : "#475569")
      .attr("stroke-width", 2);

    // Node Category Colored Dot
    nodeGroup.append("circle")
      .attr("r", 4)
      .attr("cx", 14)
      .attr("cy", -14)
      .attr("fill", d => {
        if (d.category === "ingestion") return "#10b981"; // green
        if (d.category === "processing") return "#f59e0b"; // amber
        if (d.category === "datalake") return "#a855f7"; // purple
        return "#3b82f6"; // blue
      });

    // Node Titles
    nodeGroup.append("text")
      .text(d => d.name)
      .attr("y", 36)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .attr("fill", d => d.id === selectedNodeId ? "#38bdf8" : "#e2e8f0");

    // Provider Badges
    nodeGroup.append("text")
      .text(d => d.provider)
      .attr("y", 48)
      .attr("text-anchor", "middle")
      .attr("font-size", "9px")
      .attr("font-family", "monospace")
      .attr("fill", "#64748b");

    // Simulation tick callback
    simulation.on("tick", () => {
      link.attr("d", d => {
        const s = d.source as D3Node;
        const t = d.target as D3Node;
        if (!s.x || !s.y || !t.x || !t.y) return "";
        // Curved quadratic bezier
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
        return `M${s.x},${s.y}A${dr},${dr} 0 0,1 ${t.x},${t.y}`;
      });

      linkLabel
        .attr("x", d => {
          const s = d.source as D3Node;
          const t = d.target as D3Node;
          return (s.x! + t.x!) / 2;
        })
        .attr("y", d => {
          const s = d.source as D3Node;
          const t = d.target as D3Node;
          return (s.y! + t.y!) / 2 - 8;
        });

      nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    return () => {
      timer.stop();
      simulation.stop();
    };
  }, [nodes, selectedNodeId, vars]);

  return (
    <div ref={containerRef} className="w-full relative">
      <svg
        ref={svgRef}
        className="w-full bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl"
      />
      <div className="absolute top-3 right-4 flex items-center space-x-3 text-[10px] font-mono bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-lg text-slate-300">
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Ingestion</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Processing</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span>Data Lake</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>D3 Active Topology</span>
        </div>
      </div>
    </div>
  );
};
