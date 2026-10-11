// Pixel vectors traced from the approved concept. No raster image is embedded.
// Named SVG groups keep terrain, landmarks and warm lights independently editable.
import career from './art/light/career.svg?raw';
import campus from './art/light/campus.svg?raw';
import study from './art/light/study.svg?raw';
import funding from './art/light/funding.svg?raw';
import mail from './art/light/mail.svg?raw';
import home from './art/light/home.svg?raw';
const contents = (svg: string) => svg.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>'));
export const worldArt = [career, campus, study, funding, mail].map(contents);
export const homeArt = contents(home);
// A transparent code-native sprite. One character, no raster backdrop.
export function person(x = 0, y = 0) {
  return `<g transform="translate(${x} ${y})" class="native-player">
    <g class="sprite-legs"><path fill="#223553" d="M4 29h14v10h-5v-7h-4v7H4z"/><path fill="#13243c" d="M3 38h7v4H2v-3h1zM13 38h7v4h-8v-3h1z"/><path fill="#667782" d="M3 39h6v1H3zM13 39h6v1h-6z"/></g>
    <path fill="#294ed2" d="M5 15h11v3h4v12h-4v-5H5v5H1V19h4z"/><path fill="#416fff" d="M2 20h3v8H2zM17 19h2v8h-2z"/>
    <path fill="#d5a17f" d="M0 28h4v5H1v-2H0zM18 28h3v4h-3zM8 11h7v6H8z"/>
    <path fill="#302c33" d="M6 1h9v2h3v8h-3v3H6v-3H3V5h3z"/><path fill="#56403a" d="M6 2h8v2h3v4h-4V6H5V4h1z"/><path fill="#775445" d="M6 2h6v2H6z"/>
    <path fill="#284548" d="M5 18h12v13H5z"/><path fill="#bfd12b" d="M6 19h10v12H6z"/><path fill="#dfff00" d="M6 19h10v8H6z"/><path fill="#efff66" d="M7 20h8v2H7z"/><path fill="#9aae29" d="M7 27h8v3H7z"/><path fill="#586b2e" d="M8 26h6v1H8zM8 28h1v1H8zM13 28h1v1h-1z"/>
  </g>`;
}
