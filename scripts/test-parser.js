const fs = require('fs');
const JSZip = require('jszip');

async function parseDocx(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const docXmlStr = await zip.file('word/document.xml').async('text');

  // Basic Regex XML Parser for Paragraphs & Tables
  const paragraphs = [];
  const movements = [];
  let currentDocTitle = '';
  let currentMovement = null;

  // We can parse body tags sequentially
  // Regex to split body children: <w:p ...>...</w:p> and <w:tbl ...>...</w:tbl>
  const bodyMatch = docXmlStr.match(/<w:body[^>]*>([\s\S]*?)<\/w:body>/);
  if (!bodyMatch) return null;
  const bodyXml = bodyMatch[1];

  // Tokenize p and tbl
  const elementRegex = /<(w:p|w:tbl)[^>]*>([\s\S]*?)<\/\1>/g;
  let match;

  while ((match = elementRegex.exec(bodyXml)) !== null) {
    const tag = match[1];
    const content = match[2];

    if (tag === 'w:p') {
      // Extract text content of paragraph
      const text = (content.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [])
        .map(t => t.replace(/<[^>]+>/g, ''))
        .join('')
        .trim();

      if (text) {
        if (!currentDocTitle) {
          currentDocTitle = text;
        } else if (!text.toLowerCase().includes('citation') && !text.toLowerCase().includes('procédé')) {
          // Check if this looks like a section/movement heading
          currentMovement = {
            id: 'm_' + Math.random().toString(36).substring(2, 9),
            title: text,
            citations: []
          };
          movements.push(currentMovement);
        }
      }
    } else if (tag === 'w:tbl') {
      // Parse table rows <w:tr>
      const trRegex = /<w:tr[^>]*>([\s\S]*?)<\/w:tr>/g;
      let trMatch;
      let isHeader = true;

      while ((trMatch = trRegex.exec(content)) !== null) {
        const rowContent = trMatch[1];
        const tcRegex = /<w:tc[^>]*>([\s\S]*?)<\/w:tc>/g;
        let tcMatch;
        const rowCells = [];

        while ((tcMatch = tcRegex.exec(rowContent)) !== null) {
          const cellContent = tcMatch[1];
          const cellText = (cellContent.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [])
            .map(t => t.replace(/<[^>]+>/g, ''))
            .join(' ')
            .trim();
          rowCells.push(cellText);
        }

        if (rowCells.length >= 2) {
          const c0 = (rowCells[0] || '').toLowerCase();
          const c1 = (rowCells[1] || '').toLowerCase();

          if (c0.includes('citation') || c1.includes('procéd')) {
            isHeader = true;
            continue;
          }

          if (currentMovement) {
            currentMovement.citations.push({
              id: 'c_' + Math.random().toString(36).substring(2, 9),
              citation: rowCells[0] || '',
              procede: rowCells[1] || '',
              interpretation: rowCells[2] || '',
            });
          }
        }
      }
    }
  }

  return { title: currentDocTitle, movements };
}

const fileBuf = fs.readFileSync('Francais EL1 rempli.docx');
parseDocx(fileBuf).then(res => {
  console.log('Parsed Docx Result:');
  console.log('Title:', res.title);
  console.log('Movements count:', res.movements.length);
  res.movements.forEach((m, idx) => {
    console.log(`\nMovement ${idx+1}: ${m.title} (${m.citations.length} items)`);
    m.citations.slice(0, 3).forEach(c => console.log('  -', c.citation, '=>', c.procede));
  });
});
