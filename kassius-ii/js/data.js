// Dados centrais do jogo: personagens, inimigos, cenas e falas

window.GameData = {
  player: {
    name: "Kassius II",
    maxHp: 140, hp: 140,
    maxMp: 45, mp: 45,
    atk: 18, def: 7, crit: 0.12,
    items: [{ id: "pocao", name: "Poção (+40 HP)", qty: 2 }],
    clues: [],
    cursedSword: true
  },
  dog: {
    name: "Kassinho",
    maxHp: 90, hp: 90,
    atk: 11, def: 4,
    barkCd: 0
  },
  enemies: {
    bandit: { id:"bandit", name:"Bandido da Rua", maxHp:75, hp:75, atk:12, def:4, ai:"aggressive", img:"assets/sprites/bandit.svg" },
    minion: { id:"minion", name:"Lacaio do Juiz", maxHp:95, hp:95, atk:15, def:6, ai:"balanced", img:"assets/sprites/minion.svg" },
    judge: {
      id:"judge", name:"O Juiz", maxHp:170, hp:170, atk:19, def:8, ai:"boss", img:"assets/sprites/judge.svg",
      mechanics: { curseSpread:true }
    }
  },
  scenes: {
    tavern: {
      bg: "assets/sprites/bg_tavern.svg",
      log: [
        "Taverna do Carcará, noite cerrada. Kassius II brinda com Ricardito, Nalsya e Big K.",
        "As portas se abrem com um baque. Uma jovem entra cambaleante, pedindo ajuda... e desmaia.",
        "Kassius sente o coração puxado por algo sombrio. Ele jura investigar. Kassinho, atento, rosna baixo."
      ],
      hotspots: [
        { id:"moca", label:"Ver a jovem", x:58, y:58, w:14, h:18, once:true,
          onClick:(ctx)=> ctx.modal(
            "A jovem respira, mas seus olhos têm um véu estranho. Um sussurro imperceptível roça a mente de Kassius.",
            [{label:"Examinar melhor", action:()=> { ctx.addClue("Vestígios de feitiço na jovem"); ctx.toScene("street"); }}]
          )
        }
      ],
      actions: [
        { id:"prosseguir", label:"Sair da taverna", showIf:(ctx)=>ctx.hasClue("Vestígios de feitiço na jovem"), action:(ctx)=>ctx.toScene("street") }
      ]
    },
    street: {
      bg: "assets/sprites/bg_street.svg",
      log: [
        "Do lado de fora, o vento carrega cinzas frias. Há marcas de arrasto na rua e talhos na madeira."
      ],
      hotspots: [
        { id:"marca", label:"Inspecionar marcas", x:22, y:64, w:14, h:16, once:true,
          onClick:(ctx)=>{ ctx.addClue("Marcas de arrasto seguem para o leste"); ctx.log("As marcas seguem para a floresta."); } },
        { id:"bandido", label:"Sombra suspeita", x:70, y:40, w:12, h:20, once:true,
          onClick:(ctx)=> ctx.battle("bandit", ()=> ctx.giveItem("pocao",1) )
        }
      ],
      actions: [
        { id:"floresta", label:"Ir para a floresta", showIf:(c)=>c.hasClue("Marcas de arrasto seguem para o leste"), action:(c)=>c.toScene("forest") }
      ]
    },
    forest: {
      bg: "assets/sprites/bg_forest.svg",
      log: [
        "A floresta do leste vigia em silêncio. Sussurros antigos. O cheiro do feitiço pesa no ar."
      ],
      hotspots: [
        { id:"runa", label:"Runas no tronco", x:38, y:52, w:12, h:16, once:true,
          onClick:(ctx)=>{ ctx.addClue("Runas que remetem a um Juiz arcano"); ctx.log("As runas ardem frio ao toque."); } },
        { id:"lacaio", label:"Emboscada", x:62, y:58, w:12, h:18, once:true,
          onClick:(ctx)=> ctx.battle("minion")
        }
      ],
      actions: [
        { id:"esconderijo", label:"Seguir o rastro", showIf:(c)=>c.hasClue("Runas que remetem a um Juiz arcano"), action:(c)=>c.toScene("hideout") }
      ]
    },
    hideout: {
      bg: "assets/sprites/bg_hideout.svg",
      log: [
        "Ruínas antigas. No altar, um símbolo: a balança. O Juiz aguarda.",
        "Sem que Kassius perceba, o feitiço que abateu a moça serpenteia até ele, sedento."
      ],
      hotspots: [
        { id:"o-juiz", label:"Confrontar O Juiz", x:44, y:34, w:16, h:26, once:true,
          onClick:(ctx)=> ctx.battle("judge", ()=>{
            ctx.cutscene([
              "O Juiz ri: 'A última peça do ritual era a espada amaldiçoada tocar meu sangue.'",
              "O mundo apaga num suspiro. A escuridão fecha. Kassius sente o feitiço enfim ancorar."
            ], ()=> ctx.continues() );
          })
        }
      ],
      actions: []
    }
  }
}
