let arabOverride = {};
fetch("arabOverride.json")
  .then(r => r.json())
  .then(d => arabOverride = d);

/* MAP */
const pegonMap = {
  ng:'ڠ', ny:'پ', sy:'ش', kh:'خ', ch:'چ',
  a:'ا', i:'ي', u:'و', e:'ٓ', o:'و',
  b:'ب', c:'چ', d:'د', f:'ف', g:'ڮ', h:'ه',
  j:'ج', k:'ك', l:'ل', m:'م', n:'ن',
  p:'ف', q:'ق', r:'ر', s:'س', t:'ت',
  v:'ڤ', w:'و', x:'خ', y:'ي', z:'ز'
};

const awalanVokal = { a:'أ', i:'إي', u:'أو', o:'أو', e:'آ' };
const angkaMap = { '0':'٠','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩' };

/* ARABIC PUNCTUATION */
const punctMap = {
  ',': '،',
  '?': '؟',
  ';': '؛'
};

/* UTIL */
const stripPunc = s =>
  s.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'');

const wrapWithPunct = (o,a) =>
  o.replace(stripPunc(o),a);

function normalizeArabicPunct(text){
  return text.replace(/[,\?;]/g, m => punctMap[m] || m);
}

/* CORE */
function convert(){
  const input = latinInput.value;
  if(!input.trim()){
    showToast("⚠️ Teks kosong","red");
    pegonOutput.innerText="";
    return;
  }

  const converted = convertToPegon(input);
  pegonOutput.innerText = normalizeArabicPunct(converted);
}

function convertToPegon(text){
  return text.split(/(\s+)/).map(w=>{
    if(/^\s+$/.test(w)) return w;

    const raw = stripPunc(w);
    const lower = raw.toLowerCase();

    if(arabOverride[lower])
      return wrapWithPunct(w, arabOverride[lower]);

    if(/^\d+$/.test(raw))
      return wrapWithPunct(
        w,
        raw.split('').map(n=>angkaMap[n]).join('')
      );

    return wrapWithPunct(w, convertWord(lower));
  }).join('');
}

function convertWord(word){
  let out="", i=0;

  if(/^[aeiou]/.test(word)){
    out += awalanVokal[word[0]];
    i = 1;
  }

  while(i < word.length){
    const d = word.slice(i,i+2);
    if(pegonMap[d]){
      out += pegonMap[d];
      i += 2;
    } else {
      out += pegonMap[word[i]] || word[i];
      i++;
    }
  }
  return out;
}

/* UX */
function clearText(){
  latinInput.value="";
  pegonOutput.innerText="";
}

function copyPegon(){
  const t = pegonOutput.innerText.trim();
  if(!t) return showToast("⚠️ Teks Pegon kosong","red");
  navigator.clipboard.writeText(t);
  showToast("✅ Berhasil disalin");
}

function showToast(msg,color){
  toastText.innerText = msg;
  toast.style.background = color==="red" ? "#dc2626" : "#14532d";
  toast.classList.add("toast-show");
  setTimeout(()=>toast.classList.remove("toast-show"),2000);
}

function openDownloadModal(){
  if(!pegonOutput.innerText.trim())
    return showToast("⚠️ Tidak ada teks","red");
  downloadModal.classList.remove("hidden");
}

function closeDownloadModal(){
  downloadModal.classList.add("hidden");
}

function confirmDownload(){
  closeDownloadModal();
  showToast("⬇️ Download siap");
}

/* SHIFT + ENTER */
latinInput.addEventListener("keydown", e=>{
  if(e.shiftKey && e.key === "Enter"){
    e.preventDefault();
    convert();
  }
});

