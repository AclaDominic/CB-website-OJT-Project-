const fs = require('fs');

const files = [
    'src/pages/About.jsx',
    'src/pages/Services.jsx',
    'src/pages/Projects.jsx',
    'src/pages/Resources.jsx',
    'src/pages/Contact.jsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Change curve points so they stay within the viewBox and don't get clipped:
    // Instead of passing through >100% Y, it will peak at ~97% height inside the box.
    content = content.replace(
        /d="M0,90 Q33,120 100,70"/g,
        'd="M0,85 Q33,115 100,70"'
    );

    content = content.replace(
        /d="M0,0 L1,0 L1,0.7 Q0.33,1.2 0,0.9 Z"/g,
        'd="M0,0 L1,0 L1,0.7 Q0.33,1.15 0,0.85 Z"'
    );

    // Increase the height of the hero wrapper to act as 'padding' per user request
    content = content.replace(
        /className="relative w-full h-\[250px\] sm:h-\[300px\] lg:h-\[350px\] xl:h-\[400px\] flex items-center justify-center overflow-hidden transition-all duration-500"/g,
        'className="relative w-full h-[280px] sm:h-[340px] lg:h-[390px] xl:h-[440px] flex items-center justify-center overflow-hidden transition-all duration-500"'
    );

    fs.writeFileSync(file, content, 'utf8');
});

console.log("Applied curve height adjustments and padding to all 5 pages.");
