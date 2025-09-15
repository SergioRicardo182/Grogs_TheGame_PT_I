// Renderização e lógica das cenas de exploração

(function(){
  const pct = (v)=> v+"%";

  function renderScene(sceneId){
    const s = GameData.scenes[sceneId];
    const st = window.GameState;
    st.currentScene = sceneId;

    const scene = UI.$("#scene");
    scene.innerHTML = `
      <div class="scene__bg" style="background-image:url('${s.bg}')"></div>
      <div class="scene__layer" id="layer"></div>
    `;

    // log inicial da cena (uma vez)
    if(!st.seen) st.seen = {};
    if(!st.seen[sceneId]){
      s.log.forEach(UI.appendLog);
      st.seen[sceneId] = true;
    }

    // hotspots
    const layer = UI.$("#layer");
    (s.hotspots||[]).forEach(h=>{
      if(h.once && st.usedHotspots && st.usedHotspots[h.id]) return;
      const el = document.createElement("div");
      el.className="hotspot";
      el.style.left = pct(h.x); el.style.top = pct(h.y); el.style.width=pct(h.w); el.style.height=pct(h.h);
      const lab = document.createElement("div"); lab.className="hotspot__label"; lab.textContent = h.label;
      el.appendChild(lab);
      el.onclick = ()=>{
        if(h.once){ st.usedHotspots = st.usedHotspots||{}; st.usedHotspots[h.id] = true; el.remove(); }
        h.onClick && h.onClick(Context);
      };
      layer.appendChild(el);
    });

    // actions
    const actions = UI.$("#actions"); actions.innerHTML = "";
    (s.actions||[]).forEach(a=>{
      if(a.showIf && !a.showIf(Context)) return;
      const b = document.createElement("button");
      b.className = "action";
      b.textContent = a.label;
      b.onclick = ()=> a.action(Context);
      actions.appendChild(b);
    });
  }

  // Contexto exposto para callbacks das cenas
  const Context = {
    addClue(cl){ const p=GameState.player; if(!p.clues.includes(cl)){ p.clues.push(cl); UI.renderInventory(p); } },
    giveItem(id, qty=1){
      const p=GameState.player;
      const item = p.items.find(i=>i.id===id);
      if(item) item.qty += qty; else if(id==="pocao") p.items.push({id:"pocao", name:"Poção (+40 HP)", qty});
      UI.renderInventory(p);
      UI.appendLog(`Você recebeu ${qty} ${qty>1?"poções":"poção"}.`);
    },
    hasClue(cl){ return GameState.player.clues.includes(cl); },
    toScene(id){ renderScene(id); },
    log(t){ UI.appendLog(t); },
    modal(text, choices){ UI.modal(text, choices); },
    battle(enemyId, onWin){
      Battle.startBattle(enemyId,
        ()=>{ UI.appendLog("Vitória!"); if(onWin) onWin(); UI.renderInventory(GameState.player); renderScene(GameState.currentScene); },
        ()=> GameOver()
      );
    },
    cutscene(texts, done){
      const show = (i=0)=>{
        if(i>=texts.length){ UI.hideModal(); done && done(); return; }
        UI.modal(texts[i], [{ label:"Continuar", action:()=> show(i+1) }]);
      };
      show(0);
    },
    continues(){
      const overlay = document.getElementById("overlay");
      overlay.classList.remove("hidden");
      overlay.style.opacity="0.95";
      UI.modal("<h2>Continua...</h2>", [{label:"Voltar ao início", action:()=> location.reload()}]);
    }
  };

  function GameOver(){
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("hidden");
    overlay.style.opacity="0.9";
    UI.modal("<h2>Game Over</h2><p>O destino de Kassius se apaga por ora.</p>", [
      { label:"Reiniciar", action:()=> location.reload() }
    ]);
  }

  window.Scenes = { renderScene, Context };
})();
