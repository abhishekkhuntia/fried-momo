window.lastStickyPosition = { x: 0, y: 0 };
window.MIRO_TAG_IDS = {};
const STICKY_WIDTH = 200;
const COLOR_CYLCE = ['gray', 'light_yellow', 'yellow', 'orange', 'light_green', 'green', 'dark_green'];

async function getTags() { 
  if (!miro || !miro.board && !miro.board.get) { 
    return;
  }
  const items = await miro.board.get();
  window.MIRO_TAG_IDS = items.filter((item) => item.type === 'tag')
  .reduce((acc, tag) => {
    acc[tag.title] = tag.id;
    return acc;
  });
}

async function createTags(tagNames) {
  tagNames.map(async (tagName) => { 
    const color = COLOR_CYLCE[0];
    const tag = await miro.board.createTag({ title: tagName, color });
    window.MIRO_TAG_IDS[tagName] = tag.id;
  });
}

async function addStickyNode(nodeContent) {
  const { summary, link, linkLabel, labels } = nodeContent;
  const content = `<p><a href="${link}">${linkLabel}</a></p>
  <p style="font-family: 'cursive'">${summary}</p>`;
  const color = COLOR_CYLCE.pop();


  if (!(miro && miro.board && miro.board.createStickyNote)) { 
    return;
  }

  await createTags(labels.filter(label => !window.MIRO_TAG_IDS[label]));

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
    tagIds: labels.map(label => window.MIRO_TAG_IDS[label]),
  });

  window.lastStickyPosition.x += STICKY_WIDTH + 50;
  // window.lastStickyPosition.y += 100;
  COLOR_CYLCE.unshift(color);

  const execFile = document.getElementById('execute-add-sticky-node');
  if(execFile) {
    execFile.remove();
  }
}

window.addEventListener('message', async function (event) {
  const { data } = event;
  if(data.action === 'add-to-miro') {
    await getTags();
    addStickyNode(data);
  }
});

window.addStickyNode = addStickyNode;
window.getTags = getTags;
