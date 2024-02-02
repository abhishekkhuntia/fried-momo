window.lastStickyPosition = { x: 0, y: 0 };
const STICKY_WIDTH = 200;
const COLOR_CYLCE = ['gray', 'light_yellow', 'yellow', 'orange', 'light_green', 'green', 'dark_green'];

async function addStickyNode(nodeContent) {
  const { summary, link, linkLabel } = nodeContent;
  const content = `<p><a href="${link}">${linkLabel}</a></p><p>${summary}</p>`;
  const color = COLOR_CYLCE.pop();

  await miro.board.createStickyNote({
  content,
  style: {
    fillColor: color,
    textAlign: 'center',
    textAlignVertical: 'middle', 
  },
  x: window.lastStickyPosition.x,
  y: window.lastStickyPosition.y,
  shape: 'square',
  width: STICKY_WIDTH,
  });

  window.lastStickyPosition.x += STICKY_WIDTH + 50;
  // window.lastStickyPosition.y += 100;
  COLOR_CYLCE.unshift(color);

  const execFile = document.getElementById('execute-add-sticky-node');
  if(execFile) {
    execFile.remove();
  }
}

window.addEventListener('message', function (event) {
  const { data } = event;
  if(data.action === 'add-to-miro') {
    addStickyNode(data);
  }
});

window.addStickyNode = addStickyNode;
