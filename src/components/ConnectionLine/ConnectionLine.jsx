// src/components/ConnectionLine.jsx

const ConnectionLine = ({ from, to, type }) => {
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke="black"
      strokeWidth={2}
    />
  );
};

export default ConnectionLine;
