import * as d3 from "d3";
import React from "react";
import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";

function ZoomableSVG({ width, height, children }) {
  const svgRef = useRef();
  const [k, setK] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  useEffect(() => {
    const zoom = d3.zoom().on("zoom", (event) => {
      const { x, y, k } = event.transform;
      setK(k);
      setX(x);
      setY(y);
    });
    d3.select(svgRef.current).call(zoom);
  }, []);
  return (
    <svg
      ref={svgRef}
      className="graph"
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ border: "solid 1px" }}
    >
      <g transform={`translate(${x},${y})scale(${k})`}>{children}</g>
    </svg>
  );
}

const FormSet = (props) => {
  const select = {
    width: 100,
  };
  function linkCountChange(event) {
    props.setLinkCount(event.target.value);
  }
  function NodeCountChange(event) {
    props.setNodeCount(event.target.value);
  }
  function linkLengthChange(event) {
    props.setLinkLength(event.target.value);
  }
  function nodeSizeChange(event) {
    props.setNodeSize(event.target.value);
  }
  function strengthChange(event) {
    props.setStrength(event.target.value);
  }

  return (
    <div>
      <div className="filed is-horizontal">
        <div className="filed-label is-normal">
          <label class="label">共起回数</label>
        </div>
        <div className="filed-body">
          <div className="field is-narrow">
            <div className="control">
              <div className="select">
                <select
                  style={select}
                  size="1"
                  defaultValue="1"
                  onChange={linkCountChange}
                >
                  <option value="1">1</option>
                  <option value="10">10</option>
                  <option value="100">100</option>
                  <option value="1000">1000</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="filed is-horizontal">
          <div className="filed-label is-normal">
            <label class="label">出現回数</label>
          </div>
          <div className="filed-body">
            <div className="field is-narrow">
              <div className="control">
                <div className="select">
                  <select
                    style={select}
                    size="1"
                    defaultValue="1"
                    onChange={NodeCountChange}
                  >
                    <option value="1">1</option>
                    <option value="10">10</option>
                    <option value="100">100</option>
                    <option value="1000">1000</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="filed is-horizontal">
        <div className="filed-label is-normal">
          <label class="label">線の長さ</label>
        </div>
        <div className="filed-body">
          <div className="field is-narrow">
            <div className="control">
              <div className="select">
                <select
                  style={select}
                  size="1"
                  defaultValue="400"
                  onChange={linkLengthChange}
                >
                  <option value="200">200</option>
                  <option value="400">400</option>
                  <option value="600">600</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="filed is-horizontal">
        <div className="filed-label is-normal">
          <label class="label"> ノードの引き合う力</label>
        </div>
        <div className="filed-body">
          <div className="field is-narrow">
            <div className="control">
              <div className="select">
                <select
                  style={select}
                  size="1"
                  defaultValue="1"
                  onChange={strengthChange}
                >
                  <option value="-800">1</option>
                  <option value="-600">2</option>
                  <option value="-400">3</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="filed is-horizontal">
        <div className="filed-label is-normal">
          <label class="label">ノードの大きさ</label>
        </div>
        <div className="filed-body">
          <div className="field is-narrow">
            <div className="control">
              <div className="select">
                <select
                  style={select}
                  size="1"
                  defaultValue="40"
                  onChange={nodeSizeChange}
                >
                  <option value="30">30</option>
                  <option value="40">40</option>
                  <option value="50">50</option>
                  <option value="60">60</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [nodeCount, setNodeCount] = useState(1);
  const [linkCount, setLinkCount] = useState(1);
  const [linkLength, setLinkLength] = useState(400);
  const [nodeSize, setNodeSize] = useState(40);
  const [strength, setStrength] = useState(-800);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(1);

  useEffect(() => {
    const startSimulation = (nodes, links) => {
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
            .distance(() => linkLength)
            .id((d) => d.id)
            .iterations(1)
        ) //stength:linkの強さ（元に戻る力 distance: linkの長さ iterations: 計算回数 default=1
        .force("charge", d3.forceManyBody().strength(strength)) // 引き合う力を設定
        .force("x", d3.forceX().x(size / 2))
        .force("y", d3.forceY().y(size / 2))
        .force("center", d3.forceCenter(size / 2, size / 4)); // 描画するときの中心を設定

      // forceSimulationの影響下にnodesを置く
      simulation.nodes(nodes).on("tick", ticked);
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
        const nodes = [];
        const links = [];

        for (const item of data.nodes) {
          if (item.value >= nodeCount) {
            nodes.push({
              id: item.id,
              label: item.label,
              r: nodeSize,
              value: item.value,
            });
          }
        }
        for (const link of data.links) {
          let isSource = false;
          let isTarget = false;
          for (const node of nodes) {
            if (node.id === link.source) {
              isSource = true;
            }
            if (node.id === link.target) {
              isTarget = true;
            }
            if (isSource && isTarget) {
              break;
            }
          }

          // sourceとtargetのnodeが存在する かつ 共起回数が設定された値以上ならlinkを表示
          if (isSource && isTarget && link.value >= linkCount) {
            links.push({
              source: link.source,
              target: link.target,
              value: link.value,
            });
          }
        }
        setMin(nodes.reduce((a, b) => (a.value < b.value ? a : b)).value);
        setMax(nodes.reduce((a, b) => (a.value > b.value ? a : b)).value);
        return [nodes, links];
      })();
      startSimulation(nodes, links);
    };

    startLineChart();
  }, [nodeCount, linkCount, linkLength, nodeSize, strength]);

  const size =
    window.innerWidth < window.innerWidth
      ? window.innerHeight
      : window.innerHeight;
  // const svgWidth = margin.left + margin.right + contentWidth;
  // const svgHeight = margin.bottom + margin.top + contentHeight;
  const colorScale = d3.interpolateBlues;

  //  const colorScale = d3.scaleOrdinal().range(d3.schemePaired); // group振ったら設定
  return (
    <div>
      <Header />
      <div className="container">
        <div className="columns is-multiline margin-top mt-5">
          <div className="column is-one-quarter">
            <div className="box">
              <FormSet
                setLinkCount={setLinkCount}
                setNodeCount={setNodeCount}
                setLinkLength={setLinkLength}
                setNodeSize={setNodeSize}
                setStrength={setStrength}
              ></FormSet>
            </div>
            <div className="box">a</div>
          </div>
          <div className="column">
            <ZoomableSVG width={size} height={size}>
              {/* <svg
          viewBox={`${-margin.left} ${-margin.top} ${svgWidth} ${svgHeight}`}
          style={{ border: "solid 1px" }}
        > */}
              <g>
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
                    const normalizedValue = (node.value - min) / (max - min);
                    // console.log(normalizedValue);
                    return (
                      <g className="node" key={node.id}>
                        <circle
                          r={node.r}
                          stroke="black"
                          fill={colorScale(normalizedValue)}
                          cx={node.x}
                          cy={node.y}
                        ></circle>
                        <text
                          className="node-label"
                          textAnchor="middle"
                          stroke="black"
                          fill="white"
                          fontSize={"20px"}
                          x={node.x}
                          y={node.y}
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </g>
              {/* </svg> */}
            </ZoomableSVG>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
