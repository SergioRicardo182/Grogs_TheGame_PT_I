// Sistema de batalha por turnos (Kassius + Kassinho vs 1 inimigo) com dificuldade e pequenos efeitos

(function(){
  const rnd = (min, max)=> Math.floor(Math.random()*(max-min+1))+min;

  function startBattle(enemyId, onWin, onLose){
    const baseEnemy = GameData.enemies[enemyId];
    const eData = JSON.parse(JSON.stringify(baseEnemy));
    const state = window.GameState;
    const player = state.player;
    const dog = state.dog;
    const boss = eData.id === "judge";

    // Aplicar multiplicadores de dificuldade
    const M = state.multipliers || { enemyHp:1, enemyAtk:1, playerAtk:1, playerDef:1, playerHeal:1 };
    eData.maxHp = Math.round(eData.maxHp * M.enemyHp);
    eData.hp = eData.maxHp;
    eData.atk = Math.round(eData.atk * M.enemyAtk);
    player.defBase = player.defBase ?? player.def;
    player.def = Math.round(player.defBase * M.playerDef);

    let enemyStun = 0; // atordoamento de 1 turno (Latido)
    let barkTimer = 0; // controla recarga visual/contagem por turno

    const $enemies = UI.$("#battleEnemies");
    const $party = UI.$("#battleParty");
    const $log = UI.$("#battleLog");
    const $actions = UI.$("#battleActions");

    function log(t){ const d=document.createElement("div"); d.textContent=t; $log.appendChild(d); $log.scrollTop=$log.scrollHeight; }

    // montar cenário
    $enemies.innerHTML = `<img src="${eData.img}" alt="${eData.name}">`;
    $party.innerHTML = `
      <img src="assets/sprites/kassius.svg" alt="Kassius">
      <img src="assets/sprites/kassinho.svg" alt="Kassinho">
    `;
    UI.$("#battle").classList.remove("hidden");
    UI.$("#game-ui").classList.add("hidden");

    if(boss){
      log("Um arrepio percorre a espinha. O Juiz ergue a balança.");
      log("Algo invisível se liga a Kassius. A maldição borbulha sob a pele.");
    } else {
      log(`${eData.name} aparece!`);
    }

    function alive(x){ return x.hp>0; }

    function dmg(base, atk, def, critChance, scale){
      let val = base + atk - Math.floor(def/2);
      val = Math.max(5, val + rnd(-3, 3));
      const crit = Math.random()<critChance;
      let out = Math.floor(crit? val*1.6 : val);
      out = Math.max(1, Math.round(out * (scale||1)));
      return { amount: out, crit };
    }

    function updateUi(){
      UI.setBars(player, dog);
      if(eData.hp < 0) eData.hp = 0;
    }

    function endBattle(victory){
      UI.$("#battle").classList.add("hidden");
      UI.$("#game-ui").classList.remove("hidden");
      // restaurar defesa base
      player.def = player.defBase;
      if(victory){ onWin && onWin(); }
      else { onLose && onLose(); }
    }

    function endTurnTick(){
      // reduzir bark cooldown
      if(dog.barkCd>0) dog.barkCd -= 1;
      barkTimer = Math.max(0, barkTimer-1);
    }

    function enemyTurn(){
      if(!alive(eData)) return playerTurn();

      if(enemyStun>0){
        enemyStun -= 1;
        log(`${eData.name} está atordoado e perde a vez!`);
        endTurnTick();
        updateUi();
        return setTimeout(playerTurn, 350);
      }

      // AI simples
      let txt;
      const roll = Math.random();
      if(eData.ai==="boss" && roll<0.3){
        // Golpe ritual (roubo de vida leve)
        const hit = dmg(6, eData.atk, state.player.def, 0.05, 1);
        state.player.hp -= hit.amount;
        eData.hp = Math.min(eData.maxHp, eData.hp + Math.floor(hit.amount*0.3));
        txt = `O Juiz profere um veredito arcano. ${state.player.name} perde ${hit.amount} HP. O Juiz drena um pouco de vida.`;
      } else if(roll<0.2 && alive(dog)){
        const hit = dmg(4, eData.atk, state.dog.def, 0.05, 1);
        state.dog.hp -= hit.amount;
        txt = `${eData.name} atinge Kassinho por ${hit.amount}.`;
      } else {
        const hit = dmg(6, eData.atk, state.player.def, 0.08, 1);
        state.player.hp -= hit.amount;
        txt = `${eData.name} golpeia ${state.player.name} por ${hit.amount}.`;
      }
      log(txt);
      if(state.player.hp<=0){ log("Kassius cai. Tudo escurece."); updateUi(); return setTimeout(()=> endBattle(false), 600); }
      updateUi();
      endTurnTick();
      setTimeout(playerTurn, 350);
    }

    function useItem(){
      const pocao = player.items.find(i=>i.id==="pocao" && i.qty>0);
      if(!pocao){ log("Sem poções."); return; }
      pocao.qty -= 1;
      const heal = Math.round(40 * (state.multipliers?.playerHeal || 1));
      player.hp = Math.min(player.maxHp, player.hp + heal);
      log(`Kassius usa poção. +${heal} HP.`);
      updateUi();
      endTurnTick();
      setTimeout(enemyTurn, 350);
    }

    function kassinhoBark(){
      if(dog.barkCd>0){ log("Kassinho precisa de fôlego."); return; }
      dog.barkCd = 3;
      barkTimer = 3;
      enemyStun = 1;
      // também reduz defesa do inimigo temporariamente
      eData.def = Math.max(0, eData.def-2);
      log("Kassinho solta um latido atordoante! Inimigo perde a próxima ação e sua defesa cai (-2).");
      endTurnTick();
      setTimeout(enemyTurn, 350);
    }

    function kassiusSlash(){
      if(player.mp<12){ log("MP insuficiente."); return; }
      player.mp -= 12;
      const hit = dmg(14, Math.round((player.atk+6) * (M.playerAtk||1)), eData.def, 0.18, 1);
      eData.hp -= hit.amount;
      log(`Golpe da Espada Amaldiçoada causa ${hit.amount} de dano${hit.crit?" (CRÍTICO)":"."}`);
      if(eData.hp<=0){
        log(`${eData.name} é derrotado!`);
        updateUi(); return setTimeout(()=> endBattle(true), 600);
      }
      updateUi();
      endTurnTick();
      setTimeout(enemyTurn, 350);
    }

    function attack(){
      const hit = dmg(8, Math.round(player.atk * (M.playerAtk||1)), eData.def, player.crit, 1);
      eData.hp -= hit.amount;
      log(`Kassius ataca: ${hit.amount} de dano${hit.crit?" (CRÍTICO)":"."}`);
      if(eData.hp<=0){
        log(`${eData.name} cai ao chão.`);
        updateUi(); return setTimeout(()=> endBattle(true), 600);
      }
      updateUi();
      endTurnTick();
      setTimeout(enemyTurn, 350);
    }

    function defend(){
      // defesa aumenta temporariamente e recupera um pouco de MP
      player.def += 4;
      const mpGain = 5;
      player.mp = Math.min(player.maxMp, player.mp + mpGain);
      log(`Kassius assume guarda. Defesa +4 neste turno. Recupera ${mpGain} MP.`);
      setTimeout(()=>{ enemyTurn(); player.def -= 4; }, 300);
    }

    function renderActions(){
      const $a = $actions; $a.innerHTML = "";
      const mk=(label, fn, cls="action")=>{
        const b=document.createElement("button"); b.className=cls; b.textContent=label; b.onclick=fn; $a.appendChild(b);
      };
      mk("Atacar", attack);
      mk("Defender (+MP)", defend);
      mk("Golpe Amaldiçoado (-12 MP)", kassiusSlash, "action tag tag--mp");
      mk("Usar Poção", useItem);
      mk(`Latido de Kassinho${dog.barkCd>0?` (${dog.barkCd})`:""}`, kassinhoBark, "action tag tag--ok");
    }

    function playerTurn(){
      updateUi();
      if(!alive(eData)) return endBattle(true);
      renderActions();
    }

    updateUi();
    playerTurn();
  }

  window.Battle = { startBattle };
})();
