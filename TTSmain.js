var audio, chatbox, button, channelInput, audioqueue, isPlaying, add, client;

const DEFAULT_VOICE = 'Brian';
const DEFAULT_VOICE_FEM = 'Joanna';
const TTS_API_ENDPOINT = 'https://api.streamelements.com/kappa/v2/speech?'; // unprotected API - use with caution
const PRONOUN_API_ENDPOINT = 'https://pronouns.alejo.io/api/users/';
const maxMsgInChat = 2* 10;
const DESCENDING = true; // newest on top
const VOICE_PREFIX = '&';
const pronoun_DB = {}; // username -> pronound_id
const FEM_PRONOUNS = ['sheher','shethey'];
var CHANNEL_BLACKLIST = [
  'streamlabs',
  'streamelements',
  'moobot',
  'nightbot',
  'ch4tsworld',
  'streamstickers',
  'laia_bot',
  'soundalerts',
  'ankhbot',
  'phantombot',
  'wizebot',
  'botisimo',
  'coebot',
  'deepbot',
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
var VOICE_LIST_ALT = Object.keys(VOICE_LIST).map(k=>VOICE_LIST[k]);
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
  const resp = await fetch(TTS_API_ENDPOINT + makeParameters({voice:customVoice||DEFAULT_VOICE, text:txt}));
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

  let voice;
  let start_of_msg = msg.indexOf(' ');
  if(start_of_msg >= 0) {
    let tmpVoice = msg.slice(1, start_of_msg);
    if(msg[0] == VOICE_PREFIX && VOICE_LIST_ALT.indexOf(tmpVoice) >= 0) {
      voice = tmpVoice;
      console.log('changed voice to:',tmpVoice);
      msg = msg.slice(start_of_msg);
    }
  }
  
  if(CHANNEL_BLACKLIST.some(ch=>tags.username == ch))
    return console.log('ignored msg of,', tags.username);
  const txt = `${tags.username}: ${msg}`;
  console.log('value:',txt);
  insertText(txt);

  //*
  if(!voice) {
    const pronoun = tags.username in pronoun_DB ?
      pronoun_DB[tags.username] :
      await fetch(PRONOUN_API_ENDPOINT + tags.username)
        .then(resp=>resp.text())
        .then(JSON.parse)
        .then(pronouns => {
          if(pronouns.length) {
            const pronoun = pronouns[0].pronoun_id;
            pronoun_DB[tags.username] = pronoun;
            return pronoun;
          }
        });
    if(pronoun && FEM_PRONOUNS.some(g=>g==pronoun)) voice = DEFAULT_VOICE_FEM;
  }
  //*/
  fetchAudio(`${tags.username} says: ${msg}`, voice);
}

async function changeChannel() {
  const newChannel = channelInput.value;
  window.location.hash = '#' + newChannel;
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
  audioqueue = new Queue();
  button.onclick = changeChannel;
  document.addEventListener("keyup", ({key}) => {
    if(key == "Enter") changeChannel();
  });
  audio.onended = kickstartPlayer;
  client = tmi.client();
  await client.connect()
    .then(()=>{
      const hashVal = window.location.hash.slice(1);
      if(hashVal.length) {
        channelInput.value = hashVal;
        return changeChannel();
      }
    }).catch(e=>console.error('could not connect to twitch:',e))
  client.on('chat',onMessage);
}