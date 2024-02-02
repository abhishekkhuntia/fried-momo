window.addEventListener('load', function (event) {
  document.getElementById('configForm')
  .addEventListener('submit', function (e) { 
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const { miroLink, jiraLink } = data;

    if(!miroLink || !jiraLink) {
      alert('Please fill both the links!');
      return;
    }

    chrome.storage.local.set({ miroLink, jiraLink }, function () { 
      alert('Saved!, You can start frying some momo!');
    });
  });

  preFillForm();
});

function preFillForm() { 
  chrome.storage.local.get(['miroLink', 'jiraLink'], function (data) { 
    const { miroLink, jiraLink } = data;
    document.getElementById('miroLink').value = miroLink || ''; 
    document.getElementById('jiraLink').value = jiraLink || '';
  });
}
