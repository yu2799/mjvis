import * as d3 from "d3";
import { useState, useEffect } from "react";
import { Button, Container } from "react-bootstrap";

const Home = () => {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    const startSimulation = (nodes, links) => {
      const linkLen = 1000;
      const simulation = d3
        .forceSimulation()
        .force(
          "collide",
          d3
            .forceCollide()
            .radius(function (d) {
              return d.r;
            })
            .iterations(32) // 計算回数 default=1
        )
        .force(
          "link",
          d3
            .forceLink()
            .distance(() => linkLen)
            .id((d) => d.id)
            .iterations(1)
        ) //stength:linkの強さ（元に戻る力 distance: linkの長さ iterations: 計算回数 default=1
        .force("charge", d3.forceManyBody().strength(-1000)) //引き合う力を設定。
        .force("x", d3.forceX().x(svgWidth / 2))
        .force("y", d3.forceY().y(svgHeight / 2))
        .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2)); //描画するときの中心を設定

      // forceSimulationの影響下にnodesを置く
      simulation.nodes(nodes).on("tick", ticked);

      // linkデータをセット
      simulation.force("link").links(links);

      // 呼び出して新しい座標をsetStateする
      function ticked() {
        setNodes(nodes.slice());
        setLinks(links.slice());
      }
    };

    const startLineChart = async () => {
      const [nodes, links] = await (async () => {
        const response = await fetch("./data.json");
        const data = await response.json();
        const nodes = Array();
        const links = Array();
        const r = 45;
        const nodeValueMin = data.nodes.reduce((a, b) =>
          a.value < b.value ? a : b
        ).value; // valueの最小値取得
        const nodeValueMax = data.nodes.reduce((a, b) =>
          a.value > b.value ? a : b
        ).value; // valueの最大値取得

        for (const item of data.nodes) {
          const group = Math.floor(
            (11 * (item.value - nodeValueMin)) / (nodeValueMax - nodeValueMin)
          );
          nodes.push({
            id: item.id,
            label: item.label,
            r,
            group,
          });
        }
        for (const item of data.links) {
          links.push({
            source: item.source,
            target: item.target,
            value: item.value,
          });
        }
        return [nodes, links];
      })();
      startSimulation(nodes, links);
      console.log(nodes);
    };
    startLineChart();
  }, []);
  const margin = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  };
  const contentWidth = 2000;
  const contentHeight = 2000;
  const svgWidth = margin.left + margin.right + contentWidth;
  const svgHeight = margin.bottom + margin.top + contentHeight;
  const colorScale = d3.scaleOrdinal().range(d3.schemePaired); // group振ったら設定

  return (
    <Container>
      <svg
        viewBox={`${-margin.left} ${-margin.top} ${svgWidth} ${svgHeight}`}
        style={{ border: "solid 1px" }}
      >
        <g>
          {links.map((link) => {
            return (
              <line
                key={link.source.id + "-" + link.target.id}
                stroke="black"
                strokeWidth="1"
                className="link"
                x1={link.source.x}
                y1={link.source.y}
                x2={link.target.x}
                y2={link.target.y}
              ></line>
            );
          })}
        </g>
        <g>
          {nodes.map((node) => {
            return (
              <g className="node" key={node.id}>
                <circle
                  r={node.r}
                  stroke="black"
                  fill={colorScale(node.group)}
                  cx={node.x}
                  cy={node.y}
                ></circle>
                <text
                  className="node-label"
                  textAnchor="middle"
                  fill="black"
                  fontSize={"15px"}
                  x={node.x}
                  y={node.y}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </Container>
  );
};

export default Home;
