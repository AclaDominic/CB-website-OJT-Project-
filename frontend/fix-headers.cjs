const fs = require('fs');

const files = [
    'src/pages/About.jsx',
    'src/pages/Services.jsx',
    'src/pages/Projects.jsx',
    'src/pages/Resources.jsx',
    'src/pages/Contact.jsx'
];

const newSvgBlock = `        {/* Seamless Responsive Border & ClipPath definition */}
        <svg
          className="absolute inset-0 w-full h-full z-10 pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#8bc34a" />
            </linearGradient>
            <clipPath id="heroClipPath" clipPathUnits="objectBoundingBox">
              <path d="M0,0 L1,0 L1,0.7 Q0.33,1.2 0,0.9 Z" />
            </clipPath>
          </defs>
          <path
            d="M0,90 Q33,120 100,70"
            stroke="url(#curveGradient)"
            strokeWidth="10"
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
          />
        </svg>`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Replace wrapper padding/overflow
    content = content.replace(
        /className="relative h-\[250px\] sm:h-\[300px\] lg:h-\[350px\] xl:h-\[400px\] flex items-center justify-center overflow-visible transition-all duration-500"/g,
        'className="relative w-full h-[250px] sm:h-[300px] lg:h-[350px] xl:h-[400px] flex items-center justify-center overflow-hidden transition-all duration-500"'
    );

    // Replace SVG block with the new seamless overlay
    const regex = /<div className="absolute bottom-\[-10px\][^>]*>[\s\S]*?<\/svg>\s*<\/div>|<div className="absolute bottom-\[-20px\][^>]*>[\s\S]*?<\/svg>\s*<\/div>/g;
    content = content.replace(regex, newSvgBlock);

    fs.writeFileSync(file, content, 'utf8');
});

console.log("Replaced headers in all 5 pages.");
