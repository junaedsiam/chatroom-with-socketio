/* eslint-disable consistent-return */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-alert */
/* eslint-disable no-undef */

/**
 * DOM SELECTION
 */
const socket = io();
const userInput = document.getElementById('userInput');
const sendMsgBtn = document.getElementById('sendMsgBtn');
const sendLocationBtn = document.getElementById('sendLocationBtn');
const chatTemplate = document.getElementById('template');
const chatContainer = document.getElementById('chatContainer');

/**
 * REUSABLE FUNCTIONS
 */
function sendDataToServer(socketEvent, data) {
  return new Promise((resolve, reject) => {
    socket.emit(socketEvent, data, (delivered) => {
      if (!delivered) {
        return reject(new Error('Internal Server Error'));
      }
      resolve();
    });
  });
}

function isUserNameExist(queryString) {
  return queryString.search(/(username=)\w+/) === 1 ? 1 : false;
}

function generateChatUi(msgObj) {
  const messageView = Mustache.render(chatTemplate.innerHTML, msgObj);
  chatContainer.insertAdjacentHTML('beforeend', messageView);
  // This is for keeping the chat container at the bottom of the div
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function getCurrentTime() {
  const today = new Date();
  return moment(today).format('hh:mm a');
}

/**
 * APPLICATION CODE
 */

function sendUserLocationToChannel() {
  try {
    const qs = location.search;
    if (!navigator.geolocation) {
      throw new Error('Sorry ! Unfortunately your browser does not support GEOLOCATION API');
    }
    if (!isUserNameExist(qs)) {
      throw new Error('please provide a username');
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      await sendDataToServer('userLocation', { qs, latitude, longitude });
    });
  } catch (err) {
    alert(err);
  }
}

async function sendUserMessageToChannel() {
  try {
    const message = userInput.value;
    const qs = location.search;
    if (!isUserNameExist(qs)) {
      throw new Error('please provide a username');
    }
    if (!message) {
      throw new Error('please type in a message to send');
    }
    await sendDataToServer('userMessage', { qs, message });
    userInput.value = '';
  } catch (err) {
    alert(err);
  }
}

sendMsgBtn.addEventListener('click', sendUserMessageToChannel);
sendLocationBtn.addEventListener('click', sendUserLocationToChannel);

/**
 * SOCKET CODE
 */
socket.on('channelMessage', (obj) => {
  const finalObj = {
    ...obj,
    time: getCurrentTime(),
  };
  generateChatUi(finalObj);
});

socket.on('channelLocation', (obj) => {
  const finalObj = {
    ...obj,
    time: getCurrentTime(),
  };
  generateChatUi(finalObj);
});
