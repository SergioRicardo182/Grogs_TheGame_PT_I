// Boot do jogo, estado global e início com prólogo e BGM

(function(){
  const DIFFS = {
    easy:   { enemyHp:0.9, enemyAtk:0.9, playerAtk:1.1, playerDef:1.1, playerHeal:1.2 },
    normal: { enemyHp:1.0, enemyAtk:1.0, playerAtk:1.0, playerDef:1.0, playerHeal:1.0 },
    heroic: { enemyHp:1.15, enemyAtk:1.1, playerAtk:0.95, playerDef:0.95, playerHeal:0.9 }
  };

  const state = {
    player: JSON.parse(JSON.stringify(GameData.player)),
    dog: JSON.parse(JSON.stringify(GameData.dog)),
    currentScene: "tavern",
    usedHotspots: {},
    seen: {},
    multipliers: DIFFS.normal
  };
  window.GameState = state;

  function startBgm(){
    const bgm = document.getElementById("bgm");
    if(!bgm) return;
    bgm.volume = 0.45;
    const play = ()=> bgm.play().catch(()=>{/* ignore */});
    play();
  }

  function showPrologue(next){
    // Falas personalizadas no tom heróico e divertido
    const lines = [
      "<p><b>Ricardito</b>: 'Se é encrenca, eu aponto o caminho. Você aponta a espada!'</p>",
      "<p><b>Nalsya</b>: 'Lembre de respirar entre os golpes, campeão. E de não pisar no Kassinho.'</p>",
      "<p><b>Big K</b>: 'Se voltar sem o cachorro, nem entra. Eu e ele temos um acordo.'</p>",
      "<p>A porta da taverna se escancara. Uma jovem surge, a voz trêmula pedindo ajuda... e desmaia.</p>",
      "<p><b>Kassius II</b>: 'Pelos dados de doze lados... Kassinho, comigo. Vamos desvendar esse feitiço.'</p>"
    ];
    const show = (i=0)=>{
      if(i>=lines.length) return next();
      UI.modal(lines[i], [{label:"Continuar", action:()=> show(i+1)}]);
    };
    show(0);
  }

  const start = ()=>{
    // definir dificuldade
    const sel = document.getElementById("difficulty");
    const choice = sel?.value || "normal";
    state.multipliers = DIFFS[choice] || DIFFS.normal;

    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("game-ui").classList.remove("hidden");

    UI.renderInventory(state.player);
    UI.setBars(state.player, state.dog);

    startBgm();

    // Evento automático de abertura (prólogo com falas)
    showPrologue(()=>{
      UI.hideModal();
      Scenes.renderScene("tavern");
    });
  };

  document.getElementById("btnStart").addEventListener("click", start);
})();
