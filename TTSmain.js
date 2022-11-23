var audio, chatbox, button, channelInput, audioqueue, isPlaying, add, client, voice;

const URLPREFIX = 'https://api.streamelements.com/kappa/v2/speech?'; // unprotected API - use with caution
const maxMsgInChat = 2* 10;
const DESCENDING = true; // newest on top
var CHANNEL_BLACKLIST = [
  'streamlabs',
  'streamelements',
  'moobot',
  'nightbot',
  'ch4tsworld',
  'streamstickers'
];
var VOICE_LIST = {
  "Brian": "Brian",
  "Ivy": "Ivy",
  "Justin": "Justin",
  "Russell": "Russell",
  "Nicole": "Nicole",
  "Emma": "Emma",
  "Amy": "Amy",
  "Joanna": "Joanna",
  "Salli": "Salli",
  "Kimberly": "Kimberly",
  "Kendra": "Kendra",
  "Joey": "Joey",
  "Mizuki (Japanese)": "Mizuki",
  "Chantal (French)": "Chantal",
  "Mathieu (French)": "Mathieu",
  "Maxim (Russian)": "Maxim",
  "Hans (German)": "Hans",
  "Raveena (Indian)": "Raveena"
};
class Queue {
  constructor() { this.items = []; }
  enqueue(e) {
    this.items.push(e);
  }
  dequeue() {
    if(this.isEmpty())
      return "Underflow";
    return this.items.shift();
  }
  front() {
    if(this.isEmpty())
      return "No elements in Queue";
    return this.items[0];
  }
  isEmpty(){ return !this.items.length; }
  to_string() { JSON.stringify(this.items); }
}

function makeParameters(params) {
  return Object.keys(params)
    .map(k=> `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");
}

function kickstartPlayer() {
  if(audioqueue.isEmpty()) return isPlaying = false;
  if(!audio.paused) return console.error("started player while running");
  isPlaying = true;
  audio.src = audioqueue.dequeue();
  audio.load();
  audio.play();
}

async function fetchAudio(txt, customVoice) {
  const resp = await fetch(URLPREFIX + makeParameters({voice:customVoice||voice, text:txt}));
  if(resp.status != 200) return console.error("bad Message");
  const blob = URL.createObjectURL(await resp.blob());
  audioqueue.enqueue(blob);
  if(!isPlaying) kickstartPlayer();
}

function insertText (txt) {
  const txtbox = document.createElement('text');
  txtbox.innerText = txt;
  add(document.createElement('br'));
  add(txtbox);
  Array.from(chatbox.children)
    .slice(maxMsgInChat,Infinity)
    .forEach(e=>e.remove());
}

async function onMessage(channel, tags, msg, self) {
  if(self) return; // never true, but better safe than sorry
  if(CHANNEL_BLACKLIST.some(ch=>tags.username == ch))
    return console.log('ignored msg of,', tags.username);
  const txt = `${tags.username}: ${msg}`;
  console.log('value:',txt);
  insertText(txt);

  /*
  //let sex = voice;
  let resp = await fetch('https://pronouns.alejo.io/api/users/' + tags.username);
  let pronoun = JSON.parse(await resp.text())
  if(pronoun.length) {
    pronoun[0].pronoun_id;
    sex = ['sheher','shethey'].some(g=>g==pronoun) ? 'Ivy' : 'Brian';
  }
  // if(sex !== 'Ivy') return; // testing
  */
  fetchAudio(`${tags.username} says: ${msg}`);
}

async function changeChannel() {
  const newChannel = channelInput.value;
  client.getChannels()
    .forEach(async oldChannel => await client.part(oldChannel) );
  return client.join(newChannel).then(l=>console.log('joined channel',l[0]));
}

window.onload = async function () {
  audio         = document.getElementById("audio");
  chatbox       = document.getElementById("chatbox");
  button        = document.getElementById("channel-button");
  channelInput  = document.getElementById("channel");
  isPlaying = false;
  add = (DESCENDING ? chatbox.prepend : chatbox.append).bind(chatbox);
  voice = VOICE_LIST[Object.keys(VOICE_LIST)[0]];
  audioqueue = new Queue();
  button.onclick = changeChannel;
  document.addEventListener("keyup", ({key}) => {
    if(key === "Enter") changeChannel();
  });
  audio.onended = kickstartPlayer;
  client = tmi.client();
  await client.connect()
    .catch(e=>console.error('could not connect to twitch:',e))
  client.on('chat',onMessage);
}