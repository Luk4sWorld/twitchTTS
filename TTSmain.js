var audio, chatbox, button, channelInput, audioqueue, isPlaying, add, client, skip;

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
  "Brian (English, British)": "Brian",
  "Amy (English, British)": "Amy",
  "Emma (English, British)": "Emma",
  "Geraint (English, Welsh)": "Geraint",
  "Russell (English, Australian)": "Russell",
  "Nicole (English, Australian)": "Nicole",
  "Joey (English, American)": "en_us_006",
  "Justin (English, American)": "Justin",
  "Matthew (English, American)": "Matthew",
  "Ivy (English, American)": "Ivy",
  "Joanna (English, American)": "Joanna",
  "Kendra (English, American)": "Kendra",
  "Kimberly (English, American)": "Kimberly",
  "Salli (English, American)": "Salli",
  "Raveena (English, Indian)": "Raveena",
  "Zhiyu (Chinese, Mandarin)": "Zhiyu",
  "Mads (Danish)": "Mads",
  "Naja (Danish)": "Naja",
  "Ruben (Dutch)": "Ruben",
  "Lotte (Polly) (Dutch)": "Lotte",
  "Mathieu (French)": "Mathieu",
  "Céline (French)": "Celine",
  "Chantal (French, Canadian)": "Chantal",
  "Hans (German)": "Hans",
  "Marlene (German)": "Marlene",
  "Vicki (German)": "Vicki",
  "Aditi (+English) (Hindi)": "Aditi",
  "Karl (Icelandic)": "Karl",
  "Dóra (Icelandic)": "Dora",
  "Carla (Italian)": "Carla",
  "Bianca (Italian)": "1-7-7",
  "Giorgio (Italian)": "Giorgio",
  "Takumi (Japanese)": "Takumi",
  "Mizuki (Japanese)": "Mizuki",
  "Seoyeon (Korean)": "Seoyeon",
  "Liv (Norwegian)": "Liv",
  "Ewa (Polish)": "Ewa",
  "Maja (Polish)": "Maja",
  "Jacek (Polish)": "Jacek",
  "Jan (Polish)": "Jan",
  "Ricardo (Portuguese, Brazilian)": "Ricardo",
  "Vitória (Portuguese, Brazilian)": "Vitoria",
  "Cristiano (Portuguese, European)": "Cristiano",
  "Inês (Portuguese, European)": "Ines",
  "Carmen (Romanian)": "Carmen",
  "Maxim (Russian)": "Maxim",
  "Tatyana (Russian)": "Tatyana",
  "Enrique (Spanish, European)": "Enrique",
  "Conchita (Spanish, European)": "Conchita",
  "Mia (Spanish, Mexican)": "Mia",
  "Miguel (Spanish, American)": "Miguel",
  "Penélope (Spanish, American)": "Penelope",
  "Astrid (Swedish)": "1-7-9",
  "Filiz (Turkish)": "Filiz",
  "Gwyneth (Welsh)": "Gwyneth",
  "Carter (English, American)": "en-US-Wavenet-A",
  "Paul (English, American)": "2-3-1",
  "Evelyn (English, American)": "en-US-Wavenet-C",
  "Liam (English, American)": "en-US-Wavenet-D",
  "Jasmine (English, American)": "en-US-Wavenet-E",
  "Madison (English, American)": "en-US-Wavenet-F",
  "Mark (English, American)": "en-US-Standard-B",
  "Vanessa (English, American)": "en-US-Standard-C",
  "Zachary (English, American)": "en-US-Standard-D",
  "Audrey (English, American)": "en-US-Standard-E",
  "Layla (English, British)": "en-GB-Standard-A",
  "Ali (English, British)": "en-GB-Standard-B",
  "Scarlett (English, British)": "en-GB-Standard-C",
  "Oliver (English, British)": "2-7-1",
  "Bella (English, British)": "en-GB-Wavenet-A",
  "John (English, British)": "en-GB-Wavenet-B",
  "Victoria (English, British)": "en-GB-Wavenet-C",
  "Ron (English, British)": "en-GB-Wavenet-D",
  "Zoe (English, Australian)": "en-AU-Standard-A",
  "Luke (English, Australian)": "en-AU-Standard-B",
  "Samantha (English, Australian)": "en-AU-Wavenet-A",
  "Steve (English, Australian)": "en-AU-Wavenet-B",
  "Courtney (English, Australian)": "en-AU-Wavenet-C",
  "Jayden (English, Australian)": "en-AU-Wavenet-D",
  "Ashleigh (English, Australian)": "en-AU-Standard-C",
  "Daniel (English, Australian)": "en-AU-Standard-D",
  "Anushri (English, Indian)": "en-IN-Wavenet-A",
  "Sundar (English, Indian)": "en-IN-Wavenet-B",
  "Satya (English, Indian)": "en-IN-Wavenet-C",
  "Sonya (Afrikaans)": "af-ZA-Standard-A",
  "Aisha (Arabic)": "ar-XA-Wavenet-A",
  "Ahmad 1 (Arabic)": "ar-XA-Wavenet-B",
  "Ahmad 2 (Arabic)": "ar-XA-Wavenet-C",
  "Nikolina (Bulgarian)": "bg-bg-Standard-A",
  "Li Na (Chinese, Mandarin)": "cmn-CN-Wavenet-A",
  "Wang (Chinese, Mandarin)": "cmn-CN-Wavenet-B",
  "Bai (Chinese, Mandarin)": "cmn-CN-Wavenet-C",
  "Mingli (Chinese, Mandarin)": "cmn-CN-Wavenet-D",
  "Silvia (Czech)": "cs-CZ-Wavenet-A",
  "Marie (Danish)": "da-DK-Wavenet-A",
  "Annemieke (Dutch)": "nl-NL-Standard-A",
  "Eva (Dutch)": "nl-NL-Wavenet-A",
  "Lars (Dutch)": "nl-NL-Wavenet-B",
  "Marc (Dutch)": "nl-NL-Wavenet-C",
  "Verona (Dutch)": "nl-NL-Wavenet-D",
  "Lotte (Wavenet) (Dutch)": "nl-NL-Wavenet-E",
  "Tala (Filipino (Tagalog))": "fil-PH-Wavenet-A",
  "Marianne (Finnish)": "fi-FI-Wavenet-A",
  "Yvonne (French)": "fr-FR-Standard-C",
  "Gaspard (French)": "fr-FR-Standard-D",
  "Emilie (French)": "fr-FR-Wavenet-A",
  "Marcel (French)": "fr-FR-Wavenet-B",
  "Brigitte (French)": "fr-FR-Wavenet-C",
  "Simon (French)": "fr-FR-Wavenet-D",
  "Juliette (French, Canadian)": "fr-CA-Standard-A",
  "Felix (French, Canadian)": "1-4-4",
  "Camille (French, Canadian)": "fr-CA-Standard-C",
  "Jacques (French, Canadian)": "fr-CA-Standard-D",
  "Karolina (German)": "de-DE-Standard-A",
  "Albert (German)": "de-DE-Standard-B",
  "Angelika (German)": "de-DE-Wavenet-A",
  "Oskar (German)": "de-DE-Wavenet-B",
  "Nina (German)": "de-DE-Wavenet-C",
  "Sebastian (German)": "de-DE-Wavenet-D",
  "Thalia (Greek)": "el-GR-Wavenet-A",
  "Sneha (Hindi)": "hi-IN-Wavenet-A",
  "Arnav (Hindi)": "hi-IN-Wavenet-B",
  "Aadhav (Hindi)": "hi-IN-Wavenet-C",
  "Ishtevan (Hungarian)": "hu-HU-Wavenet-A",
  "Helga (Icelandic)": "is-is-Standard-A",
  "Anisa (Indonesian)": "id-ID-Wavenet-A",
  "Budi (Indonesian)": "id-ID-Wavenet-B",
  "Bayu (Indonesian)": "id-ID-Wavenet-C",
  "Gianna (Italian)": "it-IT-Standard-A",
  "Valentina (Italian)": "3-2-7",
  "Stella (Italian)": "it-IT-Wavenet-B",
  "Alessandro (Italian)": "2-7-7",
  "Luca (Italian)": "5-2-7",
  "Koharu (Japanese)": "ja-JP-Standard-A",
  "Miho (Japanese)": "ja-JP-Wavenet-A",
  "Eiko (Japanese)": "ja-JP-Wavenet-B",
  "Haruto (Japanese)": "ja-JP-Wavenet-C",
  "Eichi (Japanese)": "ja-JP-Wavenet-D",
  "Heosu (Korean)": "ko-KR-Standard-A",
  "Grace (Korean)": "ko-KR-Wavenet-A",
  "Juris (Latvian)": "lv-lv-Standard-A",
  "Nora (Norwegian, Bokmål)": "nb-no-Wavenet-E",
  "Malena (Norwegian, Bokmål)": "nb-no-Wavenet-A",
  "Jacob (Norwegian, Bokmål)": "nb-no-Wavenet-B",
  "Thea (Norwegian, Bokmål)": "nb-no-Wavenet-C",
  "Aksel (Norwegian, Bokmål)": "nb-no-Wavenet-D",
  "Amelia (Polish)": "pl-PL-Wavenet-A",
  "Stanislaw (Polish)": "pl-PL-Wavenet-B",
  "Tomasz (Polish)": "pl-PL-Wavenet-C",
  "Klaudia (Polish)": "pl-PL-Wavenet-D",
  "Beatriz (Portuguese, Portugal)": "pt-PT-Wavenet-A",
  "Francisco (Portuguese, Portugal)": "pt-PT-Wavenet-B",
  "Lucas (Portuguese, Portugal)": "pt-PT-Wavenet-C",
  "Carolina (Portuguese, Portugal)": "pt-PT-Wavenet-D",
  "Alice (Portuguese, Brazilian)": "pt-BR-Standard-A",
  "Маша (Masha) (Russian)": "ru-RU-Wavenet-A",
  "Илья (Ilya) (Russian)": "ru-RU-Wavenet-B",
  "Алёна (Alena) (Russian)": "ru-RU-Wavenet-C",
  "Пётр (Petr) (Russian)": "ru-RU-Wavenet-D",
  "Aleksandra (Serbian)": "sr-rs-Standard-A",
  "Eliska (Slovak)": "1-7-37",
  "Rosalinda (Spanish, Castilian)": "es-ES-Standard-A",
  "Elsa (Swedish)": "sv-SE-Standard-A",
  "Zehra (Turkish)": "1-7-16",
  "Yagmur (Turkish)": "tr-TR-Wavenet-A",
  "Mehmet (Turkish)": "tr-TR-Wavenet-B",
  "Miray (Turkish)": "tr-TR-Wavenet-C",
  "Elif (Turkish)": "tr-TR-Wavenet-D",
  "Enes (Turkish)": "tr-TR-Wavenet-E",
  "Vladislava (Ukrainian)": "uk-UA-Wavenet-A",
  "Linh (Vietnamese)": "vi-VN-Wavenet-A",
  "Nguyen (Vietnamese)": "vi-VN-Wavenet-B",
  "Phuong (Vietnamese)": "vi-VN-Wavenet-C",
  "Viet (Vietnamese)": "vi-VN-Wavenet-D",
  "Linda (English, Canadian)": "Linda",
  "Heather (English, Canadian)": "Heather",
  "Sean (English, Irish)": "Sean",
  "Hoda (Arabic, Egypt)": "Hoda",
  "Naayf (Arabic, Saudi Arabia)": "Naayf",
  "Ivan (Bulgarian)": "Ivan",
  "Herena (Catalan)": "Herena",
  "Tracy (Chinese, Cantonese, Traditional)": "Tracy",
  "Danny (Chinese, Cantonese, Traditional)": "Danny",
  "Huihui (Chinese, Mandarin, Simplified)": "Huihui",
  "Yaoyao (Chinese, Mandarin, Simplified)": "Yaoyao",
  "Kangkang (Chinese, Mandarin, Simplified)": "Kangkang",
  "HanHan (Chinese, Taiwanese, Traditional)": "HanHan",
  "Zhiwei (Chinese, Taiwanese, Traditional)": "Zhiwei",
  "Matej (Croatian)": "Matej",
  "Jakub (Czech)": "Jakub",
  "Guillaume (French, Switzerland)": "Guillaume",
  "Michael (German, Austria)": "Michael",
  "Karsten (German, Switzerland)": "Karsten",
  "Stefanos (Greek)": "Stefanos",
  "Szabolcs (Hungarian)": "Szabolcs",
  "Andika (Indonesian)": "Andika",
  "Heidi (Finnish)": "Heidi",
  "Kalpana (Hindi)": "Kalpana",
  "Hemant (Hindi)": "Hemant",
  "Rizwan (Malay)": "Rizwan",
  "Filip (Slovak)": "Filip",
  "Lado (Slovenian)": "Lado",
  "Valluvar (Tamil, India)": "ta-IN-ValluvarNeural",
  "Pattara (Thai)": "Pattara",
  "An (Vietnamese)": "An"
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

function skipAudio() {
  if(audio.paused) return console.error("skipped player while paused");
  if(audioqueue.isEmpty()) {
    isPlaying = false;
    audio.pause();
  } else {
    isPlaying = true;
    audio.src = audioqueue.dequeue();
    audio.load();
    audio.play();
  }
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
  return Promise.all(client.getChannels()
    .map(oldChannel => client.part(oldChannel))
  ).then(()=>
    client.join(newChannel)
  ).then(l=>
    console.log('joined channel',l[0])
  );
}

window.onload = async function () {
  audio         = document.getElementById("audio");
  chatbox       = document.getElementById("chatbox");
  button        = document.getElementById("channel-button");
  skip          = document.getElementById("skip-button");
  channelInput  = document.getElementById("channel");
  isPlaying = false;
  add = (DESCENDING ? chatbox.prepend : chatbox.append).bind(chatbox);
  audioqueue = new Queue();
  button.onclick = changeChannel;
  skip.onclick = skipAudio;
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
