/* eslint-disable consistent-return */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-alert */
/* eslint-disable no-undef */
/**
 * DOM CODE
 */
/**
 * TODO:
 * 1. Add location sharing feature to the chat
 * 2. Clean up code
 * 3. Rewrite & restructure some repetition
 */
const socket = io();
const userInput = document.getElementById('userInput');
const sendMsgBtn = document.getElementById('sendMsgBtn');
const sendLocationBtn = document.getElementById('sendLocationBtn');
const chatTemplate = document.getElementById('template');
const chatContainer = document.getElementById('chatContainer');

function sendMessageToServer(qs, msg) {
  const now = new Date();
  const time = moment(now).format('h:mm a');
  socket.emit('userMessage', { qs, msg, time }, (delivered) => {
    if (!delivered) {
      return alert('something went wrong');
    }
  });
}

function sendUserLocationToChannel() {
  const qs = location.search;
  const isUserNameExist = qs.search(/(username=)\w+/) === 1 ? 1 : false;
  if (!navigator.geolocation) {
    return alert('Sorry ! Unfortunately your browser does not support GEOLOCATION API');
  }
  if (!isUserNameExist) {
    return alert('please provide a username');
  }
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit('userLocation', { qs, latitude, longitude }, (delivered) => {
      if (!delivered) {
        return alert('something went wrong');
      }
    });
  });
}

function prepareMessageAndSend() {
  const msg = userInput.value;
  const qs = location.search;
  const isUserNameExist = qs.search(/(username=)\w+/) === 1 ? 1 : false;
  if (!isUserNameExist) {
    return alert('please provide a username');
  }
  if (!msg) {
    return alert('please type in a message to send');
  }
  sendMessageToServer(qs, msg);
}

sendMsgBtn.addEventListener('click', prepareMessageAndSend);
sendLocationBtn.addEventListener('click', sendUserLocationToChannel);

/**
 * SOCKET CODE
 */
socket.on('channelMessage', (msgObj) => {
  const { username, msg, time } = msgObj;
  const messageView = Mustache.render(chatTemplate.innerHTML, { username, message: msg, time });
  chatContainer.insertAdjacentHTML('beforeend', messageView);
  // This is for keeping the chat container at the bottom of the div
  chatContainer.scrollTop = chatContainer.scrollHeight;
});

socket.on('channelLocation', (msgObj) => {
  const { username, latitude, longitude } = msgObj;
  const now = new Date();
  const time = moment(now).format('h:mm a');
  const messageView = Mustache.render(chatTemplate.innerHTML, { username, location: msg, time });
  chatContainer.insertAdjacentHTML('beforeend', messageView);
  // This is for keeping the chat container at the bottom of the div
  chatContainer.scrollTop = chatContainer.scrollHeight;
});
