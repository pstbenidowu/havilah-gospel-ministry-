const $ = s => document.querySelector(s), esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const get = c => fetch('/api/content/' + c).then(r => r.json()).catch(() => []);
const fmt = d => d ? new Date(d).toLocaleDateString('en-GB', {day:'numeric', month:'long', year:'numeric'}) : '';
const empty = t => `<p class="empty">${t}</p>`;

// ---------- Activities (edit here) ----------
const weekly = [['Glorious Service','Every Sunday','9:00 AM'],['Solution Hour','Every Tuesday','10:00 AM – 12:00 PM']];
const monthly = [
  ['12 Hours Covenant Yearly Praise','Every second Friday in December','6:00 PM – 6:00 AM',1],
  ['3 Days Open Doors Service','The 1st, 2nd and 3rd day of every month','All three days'],
  ['Power Night','Every 2nd Friday of the month','11:00 PM till dawn'],
  ['Church Anniversary Day','Every last Sunday in April','10:00 AM']];
const act = ([t,w,h,big]) => `<div class="act ${big?'big':''}"><h3>${t}</h3><p class="when">${w}</p><p>${h}</p></div>`;
$('#weekly').innerHTML = weekly.map(act).join('');
$('#monthly').innerHTML = monthly.map(act).join('');

// ---------- Dynamic content ----------
get('programs').then(a => $('#programs-list').innerHTML = a.length ? a.map(p => `<div class="card">${p.file?`<img class="flyer" src="${p.file}" alt="${esc(p.title)} flyer" loading="lazy">`:''}<h3>${esc(p.title)}</h3><p class="meta">${esc(p.programDate)} · ${esc(p.time)}</p><p>${esc(p.venue)}</p></div>`).join('') : empty('New programs will be announced here soon.'));
get('departments').then(a => { const d = a.length ? a : [['Choir & Worship','Leading the church into the presence of God.'],['Ushering & Protocol','Welcoming every guest with excellence.'],['Children Church','Raising young hearts for Christ.'],['Youth Ministry','Equipping a generation for destiny.'],['Prayer Team','Standing in the gap day and night.'],['Media & Technology','Taking the message to the nations.'],['Evangelism','Reaching the lost with the gospel.'],['Women Ministry','Strengthening women in faith.'],['Men Ministry','Raising men of purpose and integrity.'],['Welfare & Care','Serving the needy in love.']].map(([name,description])=>({name,description})); $('#dept-list').innerHTML = d.map(x => `<div class="card"><h3>${esc(x.name)}</h3><p>${esc(x.description)}</p></div>`).join(''); });
get('sermons').then(a => $('#sermon-list').innerHTML = a.length ? a.map(s => `<div class="card dark">${s.file?`<video controls preload="none" src="${s.file}"></video>`:''}<h3>${esc(s.title)}</h3><p class="meta">${esc(s.preacher)} · ${fmt(s.date)}</p><p>${esc(s.description)}</p></div>`).join('') : empty('Sermons and teachings will appear here.'));
get('audio').then(a => $('#audio-list').innerHTML = a.length ? a.map(s => `<div class="card"><h3>${esc(s.title)}</h3><p class="meta">${esc(s.speaker)} · ${fmt(s.date)}</p><audio controls preload="none" src="${s.file}"></audio><p><a href="${s.file}" download>Download message</a></p></div>`).join('') : empty('Audio messages will appear here.'));
get('gallery').then(a => $('#gal').innerHTML = a.length ? a.map(g => `<img src="${g.file}" alt="${esc(g.title)}" loading="lazy">`).join('') : empty('Photos from our events will appear here.'));
get('books').then(a => $('#book-list').innerHTML = a.length ? a.map(b => `<div class="card">${b.file?`<img class="thumb" src="${b.file}" alt="${esc(b.title)} cover" loading="lazy">`:''}<h3>${esc(b.title)}</h3><p class="meta">${esc(b.author)}</p><p>${esc(b.description)}</p><p class="price">${esc(b.price)}</p><a class="btn" target="_blank" rel="noopener" href="https://wa.me/2348168629983?text=${encodeURIComponent('I would like to order the book: ' + b.title)}">Order on WhatsApp</a></div>`).join('') : empty('Our books are coming soon.'));
get('testimonies').then(a => $('#testi-list').innerHTML = a.length ? a.map(t => `<div class="card"><p>“${esc(t.message)}”</p><p class="meta">— ${esc(t.name)}</p></div>`).join('') : empty('Be the first to share what God has done.'));
get('devotionals').then(a => $('#devo').innerHTML = a.length ? a.slice(0,5).map((d,i) => `<div class="card" style="margin-bottom:18px"><p class="meta">${fmt(d.devoDate||d.date)}</p><h3>${esc(d.title)}</h3><p><b>${esc(d.scripture)}</b></p><p style="white-space:pre-line">${esc(d.body)}</p>${d.prayer?`<p><i>Prayer: ${esc(d.prayer)}</i></p>`:''}</div>`).join('') : empty("Today's devotional will be posted here."));

// ---------- Bible reading plan: whole Bible in 365 days ----------
const B = 'Genesis 50,Exodus 40,Leviticus 27,Numbers 36,Deuteronomy 34,Joshua 24,Judges 21,Ruth 4,1 Samuel 31,2 Samuel 24,1 Kings 22,2 Kings 25,1 Chronicles 29,2 Chronicles 36,Ezra 10,Nehemiah 13,Esther 10,Job 42,Psalms 150,Proverbs 31,Ecclesiastes 12,Song of Solomon 8,Isaiah 66,Jeremiah 52,Lamentations 5,Ezekiel 48,Daniel 12,Hosea 14,Joel 3,Amos 9,Obadiah 1,Jonah 4,Micah 7,Nahum 3,Habakkuk 3,Zephaniah 3,Haggai 2,Zechariah 14,Malachi 4,Matthew 28,Mark 16,Luke 24,John 21,Acts 28,Romans 16,1 Corinthians 16,2 Corinthians 13,Galatians 6,Ephesians 6,Philippians 4,Colossians 4,1 Thessalonians 5,2 Thessalonians 3,1 Timothy 6,2 Timothy 4,Titus 3,Philemon 1,Hebrews 13,James 5,1 Peter 5,2 Peter 3,1 John 5,2 John 1,3 John 1,Jude 1,Revelation 22'.split(',').map(x => { const i = x.lastIndexOf(' '); return [x.slice(0,i), +x.slice(i+1)]; });
const chapters = B.flatMap(([n,c]) => Array.from({length:c}, (_,i) => [n,i+1])); // 1189
function reading(day){ const a = Math.floor((day-1)*chapters.length/365), b = Math.floor(day*chapters.length/365) - 1; const s = chapters[a], e = chapters[b]; return s[0] === e[0] ? (s[1] === e[1] ? `${s[0]} ${s[1]}` : `${s[0]} ${s[1]}–${e[1]}`) : `${s[0]} ${s[1]} – ${e[0]} ${e[1]}`; }
const done = new Set(JSON.parse(localStorage.getItem('plan') || '[]'));
const today = Math.min(365, Math.floor((new Date() - new Date(new Date().getFullYear(),0,0)) / 864e5));
function drawPlan(){ const n = done.size; $('#plan-bar').style.width = (n/365*100) + '%'; $('#plan-count').textContent = `${n} of 365 days completed`;
  const from = Math.max(1, today-2); $('#plan-list').innerHTML = Array.from({length:Math.min(14,366-from)}, (_,i) => from+i).map(d => `<label><input type="checkbox" data-d="${d}" ${done.has(d)?'checked':''}> <span><b>Day ${d}</b>${d===today?' (today)':''} — ${reading(d)}</span></label>`).join(''); }
$('#plan-list').addEventListener('change', e => { const d = +e.target.dataset.d; e.target.checked ? done.add(d) : done.delete(d); localStorage.setItem('plan', JSON.stringify([...done])); drawPlan(); });
$('#plan-all').addEventListener('click', () => { $('#plan-full').innerHTML = Array.from({length:365}, (_,i) => `<li>Day ${i+1}: ${reading(i+1)}</li>`).join(''); $('#plan-all').remove(); });
drawPlan();

// ---------- New believers: 9 weeks ----------
const lessons = [
 ['Salvation: The Gift of God','John 3:1-21; Ephesians 2:1-10; Romans 10:9-13','You are saved by grace through faith, not by works. In Christ you are forgiven, justified and made a new creation (2 Cor 5:17). Assurance rests on God’s promise, not on feelings.','Write down the day you gave your life to Christ and thank God for it.'],
 ['The Bible: God’s Word to You','2 Timothy 3:14-17; Psalm 119:9-16; Joshua 1:8','Scripture is inspired by God and is your standard for faith and life. Read daily, meditate, memorise and obey. Start with the Gospel of John.','Read one chapter of John each day this week and write one lesson from each.'],
 ['Prayer: Talking With Your Father','Matthew 6:5-15; Luke 11:1-13; Philippians 4:6-7','Prayer is relationship with God. Jesus taught worship, surrender, provision, forgiveness and protection. Pray in faith, in Jesus’ name, and listen.','Set a daily time to pray, starting with 15 minutes.'],
 ['The Holy Spirit: Your Helper','John 14:15-27; Acts 1:8; Acts 2:1-4; Galatians 5:22-25','The Holy Spirit lives in every believer, teaches, comforts, empowers for witness and produces the fruit of the Spirit. Ask the Father for His fullness (Luke 11:13).','Ask God daily to fill and lead you, and note where you sense His guidance.'],
 ['Water Baptism and the Lord’s Supper','Matthew 28:18-20; Romans 6:1-11; 1 Corinthians 11:23-26','Baptism publicly declares your death to the old life and new life in Christ. The Lord’s Supper remembers His sacrifice and renews fellowship with Him.','Speak with your pastor about water baptism.'],
 ['Victory Over Sin and Temptation','1 John 1:5-10; 1 Corinthians 10:13; Ephesians 6:10-18; James 4:7','Confess sin quickly and receive cleansing. Flee temptation, renew your mind and put on the whole armour of God. You are not under sin’s dominion (Romans 6:14).','Identify one area of struggle and share it with a mature believer for support.'],
 ['The Church and Fellowship','Hebrews 10:23-25; Acts 2:42-47; 1 Corinthians 12:12-27','The church is the body of Christ. You grow by gathering, serving, giving and being accountable. Find your place in a department and use your gifts.','Join a department and attend every service this month.'],
 ['Faith, Giving and Stewardship','Hebrews 11:1-6; Malachi 3:8-12; 2 Corinthians 9:6-11; Matthew 6:19-21','Faith pleases God and grows by hearing His Word. Give your tithes, offerings and time with joy. Everything belongs to God, and we are faithful stewards.','Write your commitments in time, talents and treasure.'],
 ['Purpose, Witness and Destiny','Jeremiah 29:11; Ephesians 2:10; Acts 1:8; 2 Timothy 4:7','God has a purpose for your life. Be a witness at home, work and school. Keep the faith and finish the race, elevating your destiny to divine fulfilment.','Share your testimony with three people and write your God-given goals.']];
$('#lessons').innerHTML = lessons.map((l,i) => `<details class="lesson"><summary>Week ${i+1}: ${l[0]}</summary><p><b>Read:</b> ${l[1]}</p><p>${l[2]}</p><p><b>This week:</b> ${l[3]}</p></details>`).join('');

// ---------- Forms ----------
document.querySelectorAll('form[data-f]').forEach(f => f.addEventListener('submit', async e => {
  e.preventDefault(); const out = f.querySelector('.msg'), body = Object.fromEntries(new FormData(f));
  const r = await fetch('/api/submit/' + f.dataset.f, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
  const j = await r.json(); out.textContent = r.ok ? (f.dataset.f==='prayer' ? 'Received. We are praying with you.' : 'Thank you. We have received your message.') : j.error; if (r.ok) f.reset();
}));
$('#menu').onclick = () => $('.links').classList.toggle('on');
document.querySelectorAll('.links a').forEach(a => a.onclick = () => $('.links').classList.remove('on'));
$('#gal').addEventListener('click', e => { if (e.target.tagName === 'IMG') { $('#lb img').src = e.target.src; $('#lb').classList.add('on'); } });
$('#lb').onclick = () => $('#lb').classList.remove('on');
