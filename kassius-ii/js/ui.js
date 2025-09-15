// UI helpers, modal, log, inventory, bars

(function(){
  const $ = (sel, el=document)=> el.querySelector(sel);

  function setBars(p, d){
    const hpK = $("#hpKassius"); const mpK = $("#mpKassius"); const hpD = $("#hpKassinho");
    hpK.style.width = Math.max(0, (p.hp/p.maxHp)*100) + "%";
    mpK.style.width = Math.max(0, (p.mp/p.maxMp)*100) + "%";
    hpD.style.width = Math.max(0, (d.hp/d.maxHp)*100) + "%";
  }

  function renderInventory(player){
    const wrap = $("#inventory"); wrap.innerHTML = "";
    player.items.forEach(it=>{
      if(it.qty<=0) return;
      const tag = document.createElement("div");
      tag.className="inv-item";
      tag.textContent = `${it.name} x${it.qty}`;
      wrap.appendChild(tag);
    });
    player.clues.forEach(c=>{
      const tag = document.createElement("div");
      tag.className="inv-item";
      tag.textContent = `Pista: ${c}`;
      wrap.appendChild(tag);
    });
  }

  function appendLog(text){
    const log = $("#log");
    const p = document.createElement("div");
    p.textContent = text;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
  }

  function modal(text, choices){
    const m = $("#modal");
    $("#modalText").innerHTML = text;
    const ch = $("#modalChoices");
    ch.innerHTML = "";
    choices.forEach(c=>{
      const b = document.createElement("button");
      b.className="btn";
      b.textContent = c.label;
      b.onclick = ()=>{ hideModal(); c.action && c.action(); };
      ch.appendChild(b);
    });
    m.classList.remove("hidden");
    $("#overlay").classList.remove("hidden");
  }
  function hideModal(){
    $("#modal").classList.add("hidden");
    $("#overlay").classList.add("hidden");
  }

  window.UI = { $, setBars, renderInventory, appendLog, modal, hideModal };
})();
