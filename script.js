const toggle = document.getElementById('chat-toggle');
const chatBox = document.getElementById('chat-box');

toggle.addEventListener('click', () => {
  if (chatBox.style.display === 'none' || chatBox.style.display === '') {
    chatBox.style.display = 'block';
  } else {
    chatBox.style.display = 'none';
  }
});