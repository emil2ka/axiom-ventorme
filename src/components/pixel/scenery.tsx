/* Authored pixel geometry. These moving parts contain no bitmap samples or background. */
const twigs = [
  [[44,89,.7],[250,87,.7]], [[78,76,1],[226,45,1]], [[49,118,.65],[269,48,1]],
  [[54,113,.5],[265,92,.6]], [[38,138,.5],[268,124,.55]], [[42,65,.45],[256,55,.45]],
];
export function LivingBranches({ index }: { index: number }) {
  return <g className="living-branches" aria-hidden="true">{twigs[index].map(([x,y,s],j)=><g key={j} transform={`translate(${x} ${y}) scale(${s})`}>
    <g className={`native-branch branch-${j}`} style={{ animationDelay: `${-index*.8-j*2.1}s`, animationDuration: `${5.4+index*.4+j}s` }}>
      <path fill="#6c6650" d="M-2 19H2V8H6V5H9V9H5V20H1V25H-2z"/>
      <path fill="#417766" d="M-13 7h5V2H2V0H10V4H16V9H20V17H15V22H6V24H-5V21H-12V17H-16V11h3z"/>
      <path fill="#71a16d" d="M-10 7h5V3H3V2h8V6h5v5h-6v5H2v5H-7v-4h-6v-6h3z"/>
      <path fill="#a5c883" d="M-7 5h7V2h7v4h5v5H5V9H-2v4H-8z"/>
      <path fill="#c8df9f" d="M-5 5h5v3h-5zM5 3h4v3H5z"/>
      <path fill="#55886a" d="M6 14h9v4h-5v4H2v-4h4zM-12 15h5v5h-5z"/>
    </g>
  </g>)}</g>;
}
export function CampusFlag() {
  return <g transform="translate(175 8)" aria-hidden="true"><g className="native-flag">
    <path fill="#3157d2" d="M0 0h6v2h8v10H7v-2H0z"/>
    <path fill="#3b6fff" d="M1 1h5v2h7v5H7V6H1z"/>
    <path fill="#e8f3ff" d="M3 4h2v2h2V4h2v4H7v1H5V8H3z"/>
  </g></g>;
}
