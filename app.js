const LABELS={quarter:'Quarter',half:'Half kg',kg1:'1 kg',kg2:'2 kg',piece:'1 piece'};
const STATUS={available:'Available',low:'Low stock',out:'Out of stock',notoffered:'Not offered'};
const naira=n=>'₦'+n.toLocaleString('en-US');
const clean=v=>String(v||'').toLowerCase().replace(/\s/g,'');
const orderOn=ORDERING==='yes';

function sizes(p){
  const base={quarter:Math.round(p.perKg/4/50)*50,half:p.perKg/2,kg1:p.perKg,kg2:p.perKg*2,piece:p.piecePrice};
  return ['quarter','half','kg1','kg2'].concat(p.piecePrice?['piece']:[]).map(k=>{
    const s=clean(p.all||p[k]);
    return {k,label:LABELS[k],price:p[k+'Price']||base[k],status:STATUS[s]?s:'available'};
  });
}
function orderBtn(p,s){
  if(orderOn&&(s.status==='available'||s.status==='low')){
    const msg="Hello An-Nurr Frozen Foods, I'd like to order "+p.name+' - '+s.label+' ('+naira(s.price)+')';
    return '<a class="order-btn" href="https://wa.me/2348023672076?text='+encodeURIComponent(msg)+'" target="_blank" rel="noopener">Order</a>';
  }
  return '<button class="order-btn" disabled'+(orderOn?'':' title="Ordering opens soon"')+'>Order</button>';
}
function card(p){
  const rows=sizes(p).map(s=>{
    const off=s.status==='notoffered';
    return '<div class="size-row'+(off?' row-notoffered':'')+'"><span class="size-name">'+s.label+'</span><span class="size-price">'+(off?'':naira(s.price))+'</span><span class="size-status status-'+s.status+'">'+STATUS[s.status]+'</span>'+orderBtn(p,s)+'</div>';
  }).join('');
  return '<div class="goods-card" data-name="'+p.name.toLowerCase()+'"><div class="goods-img"><img src="'+p.photo+'" alt="'+p.name+'" loading="lazy">'+(p.tag?'<span class="tag">'+p.tag+'</span>':'')+'</div><div class="goods-body"><h3>'+p.name+'</h3><p class="sub">'+(p.piecePrice?'Per kg or per piece':'Per kg')+'</p><div class="sizes"><div class="sizes-label">Sizes available</div>'+rows+(p.note?'<p class="note-line">'+p.note+'</p>':'')+'</div></div></div>';
}
function cell(s){
  if(s.status==='notoffered')return '<td class="pc">—</td>';
  if(s.status==='out')return '<td class="pc"><span class="cell-out">'+naira(s.price)+'</span></td>';
  return '<td class="pc cell-'+s.status+'">'+naira(s.price)+(s.status==='low'?'<small>low</small>':'')+'</td>';
}
['fish','chicken'].forEach(t=>{
  document.getElementById(t+'-grid').innerHTML=PRODUCTS.filter(p=>p.type===t).map(card).join('');
});
const cols=['quarter','half','kg1','kg2'].concat(PRODUCTS.some(p=>p.piecePrice)?['piece']:[]);
document.getElementById('price-head').innerHTML='<tr><th>Item</th>'+cols.map(k=>'<th class="pc">'+LABELS[k]+'</th>').join('')+'</tr>';
document.getElementById('price-body').innerHTML=PRODUCTS.map(p=>{
  const all=sizes(p);
  return '<tr><td>'+p.name+'</td>'+cols.map(k=>{const s=all.find(x=>x.k===k);return s?cell(s):'<td class="pc">—</td>';}).join('')+'</tr>';
}).join('');
document.getElementById('updated').textContent='Prices last updated '+UPDATED+'.';

document.getElementById('search').addEventListener('input',e=>{
  const q=e.target.value.trim().toLowerCase();
  document.querySelectorAll('.goods-card').forEach(c=>{c.hidden=!c.dataset.name.includes(q);});
});

(function(){
  const t=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Lagos',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());
  const m=(+t.find(x=>x.type==='hour').value)*60+(+t.find(x=>x.type==='minute').value);
  const open=m>=450&&m<1290;
  const b=document.getElementById('open-badge');
  b.textContent=open?'Open now · until 9:30 pm':'Closed · opens 7:30 am';
  b.classList.add(open?'live':'closed');
})();

function send(form,note){
  fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()})
    .then(r=>{if(!r.ok)throw 0;note.textContent=note.dataset.ok;form.reset();})
    .catch(()=>{note.textContent='Could not send right now. Please message us on WhatsApp instead.';})
    .finally(()=>note.classList.add('show'));
}
[['feedback-form','fb-note'],['newsletter-form','news-note']].forEach(([f,n])=>{
  const form=document.getElementById(f);
  form.addEventListener('submit',e=>{e.preventDefault();send(form,document.getElementById(n));});
});
