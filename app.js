/**
 * Simulatore Verifiche Funzionali Gas - Cabina REMI / GRF (UNI/PdR 39 - Tipo 3)
 * - Manometro e Sfiato nel TRONCHETTO (tra Monitor e Regolatore Principale):
 *   1) Se lavora il Regolatore Principale -> il Monitor è aperto -> nel Tronchetto c'è la Pressione di Monte (Pu).
 *   2) Se lavora il Monitor (Regolatore spalancato) -> nel Tronchetto c'è la Pressione di Valle (Pm).
 *   3) Con Regolatore Principale completamente chiuso -> usando lo Sfiato del Tronchetto si verifica la tenuta / chiusura (SG) del Monitor!
 * - Regolatori Pilotati (Fail-Close) vs Regolatori ad Azione Diretta (Fail-Open).
 */

const PRESETS = {
  'remi-piloted': {
    id: 'remi-piloted',
    arch: 'PILOTED',
    name: 'Cabina REMI Pilotata [FAIL-CLOSE] (Aperflux 851 + Pilota 204/A + Preriduttore R14)',
    archSubtitle:
      'Architettura: <strong>REGOLATORI PILOTATI (Fail-Close)</strong> — Osserva il Manometro TRONCHETTO (tra Monitor e Regolatore): segna Pu (24 bar) se lavora il Regolatore, o Pd (1,65 bar) se lavora il Monitor!',
    unit: 'bar',
    decimals: 2,
    pu: 24.0,
    nominalFlow: 450,
    maxFlow: 1000,
    pumpMax: 3.0,
    pumpStep: 0.01,
    fineStep: 0.02,
    sgAllowance: 0.03,
    seatLeakDelta: 0.55,
    pilotLeakDelta: 0.32,
    pilotSupplyNominal: 3.20,
    defaultImpulseTap: 'manifold',
    line1: {
      regModel: 'Pietro Fiorentini Aperflux 851 + Pilota 204/A (Fail-Close)',
      monModel: 'Pietro Fiorentini Aperflux 851 Monitor + Pilota 204/A',
      blkModel: 'Valvola di Blocco SB/82 (OPSO/UPSO)',
      regSet: 1.50,
      monSet: 1.65,
      blkMax: 1.90,
      blkMin: 0.80
    },
    line2: {
      regModel: 'Pietro Fiorentini Aperflux 851 (2ª Linea Riserva)',
      monModel: 'Pietro Fiorentini Aperflux 851 Monitor L2',
      blkModel: 'Valvola di Blocco SB/82 (OPSO/UPSO)',
      regSet: 1.35,
      monSet: 1.65,
      blkMax: 1.90,
      blkMin: 0.80
    },
    vsSet: 1.75
  },
  'grf-piloted': {
    id: 'grf-piloted',
    arch: 'PILOTED',
    name: 'GRF Cittadino Pilotato [FAIL-CLOSE] (Reval 182 Pilotato + Monitor)',
    archSubtitle:
      'Architettura: <strong>GRF CON REGOLATORI PILOTATI (Fail-Close)</strong> — Monte Pu = 5,0 bar nel Tronchetto quando lavora il Regolatore; scende a 26,0 mbar se subentra il Monitor',
    unit: 'mbar',
    decimals: 1,
    pu: 5.0,
    nominalFlow: 250,
    maxFlow: 600,
    pumpMax: 60.0,
    pumpStep: 0.5,
    fineStep: 0.5,
    sgAllowance: 0.8,
    seatLeakDelta: 11.0,
    pilotLeakDelta: 6.5,
    pilotSupplyNominal: 150.0,
    defaultImpulseTap: 'manifold',
    line1: {
      regModel: 'Pietro Fiorentini Reval 182 Pilotato (Fail-Close)',
      monModel: 'Pietro Fiorentini Reval 182 Monitor Pilotato',
      blkModel: 'Dispositivo di Blocco SB / LA',
      regSet: 22.0,
      monSet: 26.0,
      blkMax: 35.0,
      blkMin: 12.0
    },
    line2: {
      regModel: 'Pietro Fiorentini Reval 182 Pilotato (2ª Linea)',
      monModel: 'Pietro Fiorentini Reval 182 Monitor L2',
      blkModel: 'Dispositivo di Blocco SB / LA',
      regSet: 19.5,
      monSet: 26.0,
      blkMax: 35.0,
      blkMin: 12.0
    },
    vsSet: 29.0
  },
  'dival-direct': {
    id: 'dival-direct',
    arch: 'DIRECT',
    name: 'GRF Azione Diretta [FAIL-OPEN] (Dival 600 / Norval Molla Diretta)',
    archSubtitle:
      'Architettura: <strong>REGOLATORI AD AZIONE DIRETTA (Fail-Open)</strong> — Assenza di pilota: la molla apre l\'otturatore e la pressione nella presa d\'impulso comprime direttamente la membrana',
    unit: 'mbar',
    decimals: 1,
    pu: 1.5,
    nominalFlow: 120,
    maxFlow: 300,
    pumpMax: 60.0,
    pumpStep: 0.5,
    fineStep: 0.5,
    sgAllowance: 2.2,
    seatLeakDelta: 12.0,
    pilotLeakDelta: 0.0,
    pilotSupplyNominal: 0,
    defaultImpulseTap: 'trunk',
    line1: {
      regModel: 'Pietro Fiorentini Dival 600 / Norval (Azione Diretta - Fail-Open)',
      monModel: 'Monitor Azione Diretta in Serie',
      blkModel: 'Blocco Incorporato LA (OPSO/UPSO)',
      regSet: 23.0,
      monSet: 27.0,
      blkMax: 35.0,
      blkMin: 13.0
    },
    line2: {
      regModel: 'Pietro Fiorentini Dival 600 (2ª Linea Soccorso)',
      monModel: 'Monitor Azione Diretta L2',
      blkModel: 'Blocco Incorporato LA (OPSO/UPSO)',
      regSet: 20.0,
      monSet: 27.0,
      blkMax: 35.0,
      blkMin: 13.0
    },
    vsSet: 30.0
  }
};

const GUIDED_PROCEDURES = {
  'guided-tronchetto': [
    {
      title: 'Passo 1 (Tronchetto): Diagnosi a Colpo d\'Occhio — Regolatore vs Monitor in Lavoro',
      desc: 'In marcia normale il Monitor L1 è completamente aperto e chi lamina il gas è il Regolatore Principale L1: perciò il manometro TRONCHETTO (tra Monitor e Regolatore) segna la Pressione di Monte (Pu = 24,0 bar). Ora simula il subentro del Monitor: clicca su REG. PRINC. L1 e premi "Scarica Impulso a 0 (Prova Monitor)" (oppure spunta "Simula rottura membrana Regolatore L1") e osserva il manometro TRONCHETTO!',
      check: (s) => {
        if (s.l1.activeRole !== 'MONITOR_WORK') {
          return {
            ok: false,
            msg: 'Manda in lavoro il Monitor L1: clicca su REG. PRINC. L1 e premi "Scarica Impulso a 0 (Prova Monitor)".'
          };
        }
        return {
          ok: true,
          msg: `Visto? Appena il Regolatore Principale si spalanca e inizia a lavorare il Monitor, la pressione nel TRONCHETTO crolla da Pu (${s.preset.pu.toFixed(
            1
          )} bar) alla Pressione di Valle del Monitor (${formatPressure(s.l1.pTrunk, s.preset)})!`
        };
      }
    },
    {
      title: 'Passo 2 (Tronchetto): Chiusura Totale del Regolatore Principale L1 per Isolare il Tronchetto a Valle',
      desc: 'Ora vogliamo usare lo Sfiato del Tronchetto per verificare la tenuta del Monitor! Prima dobbiamo chiudere completamente il Regolatore Principale L1: 1) Riconnetti l\'impulso di REG. PRINC. L1 in Linea; 2) Chiudi la valvola di valle V2-L1 (e assicurati che SF-L1 sia chiuso, oppure su un Regolatore Pilotato chiudi "Alim.Pil" di REG. PRINC. L1 per forzarlo in Fail-Close ermetico).',
      check: (s) => {
        if (s.l1.regImpulseState !== 'connected') {
          return { ok: false, msg: 'Riconnetti prima l\'impulso di REG. PRINC. L1 in Linea.' };
        }
        const regCompletelyClosed =
          (!s.l1.v2Open && !s.l1.sfOpen && s.l1.regImpulseTap === 'trunk') ||
          (s.preset.arch === 'PILOTED' && !s.l1.regPilotSupplyOpen);
        if (!regCompletelyClosed) {
          return {
            ok: false,
            msg: 'Per chiudere completamente il Regolatore Principale L1: chiudi Alim.Pil di REG. PRINC. L1 (Fail-Close), oppure chiudi V2-L1 con Imp.Reg su MONTE V2 e SF-L1 chiuso.'
          };
        }
        return {
          ok: true,
          msg: 'Perfetto! Il Regolatore Principale L1 è ora completamente chiuso e fa da tenuta stagna a valle del Tronchetto.'
        };
      }
    },
    {
      title: 'Passo 3 (Tronchetto): Apertura Sfiato del Tronchetto per Scaricare Pu e Portare in Regolazione il Monitor',
      desc: 'Con il Regolatore Principale chiuso, nel Tronchetto è rimasta intrappolata la Pressione di Monte (Pu). Clicca sul componente "Sfiato Tronch." / "TRONCHETTO" (tra Monitor e Regolatore L1) e premi "Apri Sfiato Tronchetto": la pressione nel tronchetto scenderà da Pu fino alla taratura del Monitor (Pm)!',
      check: (s) => {
        if (!s.l1.sfIntOpen) {
          return {
            ok: false,
            msg: 'Clicca su "TRONCHETTO / Sfiato Tronch." (tra Monitor L1 e Regolatore L1) e apri lo Sfiato del Tronchetto.'
          };
        }
        return {
          ok: true,
          msg: `Ottimo! Aprendo lo Sfiato del Tronchetto con Regolatore chiuso, hai scaricato la Pu e il Monitor sta regolando il tronchetto a ${formatPressure(
            s.l1.pMidDisplay,
            s.preset
          )}.`
        };
      }
    },
    {
      title: 'Passo 4 (Tronchetto): Chiusura Sfiato del Tronchetto e Verifica Tenuta / SG del Monitor',
      desc: 'Ora richiudi lo "Sfiato Tronchetto" (con Regolatore Principale sempre chiuso) e osserva il manometro TRONCHETTO: la pressione si stabilizza alla pressione di chiusura (SG) del Monitor senza risalire a Pu! Prova anche a spuntare "Simula trafilamento sede Otturatore MONITOR L1" per vedere come il manometro del tronchetto smaschera subito un Monitor che non tiene!',
      check: (s) => {
        if (s.l1.sfIntOpen) {
          return { ok: false, msg: 'Richiudi ora lo Sfiato del Tronchetto per verificare la tenuta in chiusura del Monitor.' };
        }
        if (s.faultMonSeat1Leak) {
          return {
            ok: true,
            msg: 'Con il trafilamento Monitor attivo vedi infatti il manometro TRONCHETTO risalire a Pu (24 bar)! Hai padroneggiato la verifica della tenuta del Monitor tramite il tronchetto.'
          };
        }
        return {
          ok: true,
          msg: `Verifica Tenuta Monitor completata! Con Regolatore chiuso e Sfiato Tronchetto chiuso, il manometro TRONCHETTO resta stabile a ${formatPressure(
            s.l1.pMidDisplay,
            s.preset
          )} (non risale a ${s.preset.pu.toFixed(1)} bar), confermando la perfetta tenuta del Monitor!`
        };
      }
    }
  ],
  'guided-piloted-sg': [
    {
      title: 'Passo 1 (Reg. Pilotato): Effetto della Presa d\'Impulso a Valle di V2 e Lettura del Tronchetto',
      desc: 'Chiudi la valvola di valle V2-L1 lasciando la presa d\'impulso di REG. PRINC. L1 su COLLETTORE (valle V2). Poiché il collettore scende alla pressione della 2ª Linea, il pilota L1 legge una pressione inferiore al proprio set e SPALANCA il regolatore L1: guarda il manometro TRONCHETTO scendere da Pu (24 bar) a 1,65 bar perché è entrato il Monitor!',
      check: (s) => {
        if (s.preset.arch !== 'PILOTED') {
          return { ok: false, msg: 'Seleziona una configurazione Pilotata [FAIL-CLOSE] in alto a sinistra.' };
        }
        if (s.l1.v2Open) {
          return { ok: false, msg: 'Clicca sulla valvola di valle V2-L1 e premi "Chiudi Valvola".' };
        }
        return {
          ok: true,
          msg: `Esatto! Con V2-L1 chiusa e impulso a valle di V2, il Regolatore L1 si è spalancato e il manometro TRONCHETTO è sceso da 24 bar a ${formatPressure(
            s.l1.pMidDisplay,
            s.preset
          )} (sta tenendo il Monitor)!`
        };
      }
    },
    {
      title: 'Passo 2 (Reg. Pilotato): Commutazione Presa d\'Impulso a MONTE di V2 e Sfiato SF-L1',
      desc: 'Ora commuta il Punto di Presa Impulso di REG. PRINC. L1 su "MONTE V2 (Valle Regolatore)" e apri lo sfiato a candela SF-L1: il Regolatore Principale L1 riprende la regolazione, il Monitor torna tutto aperto e il manometro TRONCHETTO risale a Pu (24 bar)!',
      check: (s) => {
        if (s.l1.v2Open || s.l1.regImpulseTap !== 'trunk' || !s.l1.sfOpen) {
          return {
            ok: false,
            msg: 'Imposta il Punto di Presa Impulso di REG. PRINC. L1 su "MONTE V2" e apri lo sfiato SF-L1.'
          };
        }
        return {
          ok: true,
          msg: `Perfetto! Ora sta lavorando di nuovo il Regolatore Principale L1 (manometro TRONCHETTO tornato a ${s.preset.pu.toFixed(
            1
          )} bar e P VALLE L1 a ${formatPressure(s.l1.pTrunk, s.preset)}).`
        };
      }
    },
    {
      title: 'Passo 3 (Reg. Pilotato): Chiusura Sfiato SF-L1 e Misura dell\'SG',
      desc: 'Richiudi lo sfiato SF-L1 per verificare l\'SG del Regolatore Principale L1 sul manometro P VALLE L1 (e se vuoi verificare anche la tenuta del Monitor, usa poi lo Sfiato del Tronchetto come visto nella procedura dedicata!).',
      check: (s) => {
        if (s.l1.v2Open || s.l1.regImpulseTap !== 'trunk' || s.l1.sfOpen) {
          return { ok: false, msg: 'Richiudi lo sfiato SF-L1 mantenendo V2-L1 chiusa.' };
        }
        return {
          ok: true,
          msg: `SG Regolatore Pilotato verificato: P VALLE L1 stabile a ${formatPressure(
            s.l1.pTrunk,
            s.preset
          )} e Pmot scaricata (${formatPressure(s.l1.regPmot, s.preset)}).`
        };
      }
    }
  ],
  'guided-direct-sg': [
    {
      title: 'Passo 1 (Azione Diretta): Chiusura V2-L1 e Verifica SG',
      desc: 'Nel gruppo ad Azione Diretta (Dival 600 / Norval, Fail-Open) chiudi la valvola di valle V2-L1 (con SF-L1 chiuso) e osserva l\'SG (+2,2 mbar) sul manometro P VALLE L1 mentre il manometro TRONCHETTO segna la pressione di monte Pu (1,5 bar).',
      check: (s) => {
        if (s.preset.arch !== 'DIRECT') {
          return { ok: false, msg: 'Seleziona la configurazione "GRF Azione Diretta [FAIL-OPEN]" in alto a sinistra.' };
        }
        if (s.l1.v2Open || s.l1.sfOpen) {
          return { ok: false, msg: 'Chiudi V2-L1 e assicurati che SF-L1 sia chiuso.' };
        }
        return {
          ok: true,
          msg: `SG Azione Diretta verificato: P VALLE L1 a ${formatPressure(s.l1.pTrunk, s.preset)} e TRONCHETTO a ${
            s.preset.pu
          } bar.`
        };
      }
    },
    {
      title: 'Passo 2 (Azione Diretta): Prova del Monitor e Osservazione del Manometro TRONCHETTO',
      desc: 'Apri lo sfiato SF-L1 e scarica la Presa d\'Impulso di REG. PRINC. L1 ("Scarica Impulso a 0"): la molla spalanca il regolatore principale, il Monitor entra in regolazione e il manometro TRONCHETTO scende da 1,5 bar a 27,0 mbar!',
      check: (s) => {
        if (s.l1.v2Open || !s.l1.sfOpen || s.l1.regImpulseState !== 'vented') {
          return {
            ok: false,
            msg: 'Con V2-L1 chiusa, apri SF-L1 e clicca su "Scarica Impulso a 0 (Prova Monitor)" su REG. PRINC. L1.'
          };
        }
        return {
          ok: true,
          msg: `Perfetto! Sia il manometro TRONCHETTO che P VALLE L1 segnano ora ${formatPressure(
            s.l1.pTrunk,
            s.preset
          )}: sta lavorando il Monitor!`
        };
      }
    }
  ],
  'guided-full': [
    {
      title: 'Passo 1: Scambio Linea (Isolamento V2-L1 e Commutazione Impulso a Monte V2)',
      desc: 'Chiudi V2-L1 per passare il carico sulla 2ª Linea e, se il regolatore è pilotato, commuta il Punto di Presa Impulso di REG. PRINC. L1 su "MONTE V2 (Valle Regolatore)".',
      check: (s) => {
        if (s.l1.v2Open || s.l1.regImpulseTap !== 'trunk') {
          return { ok: false, msg: 'Chiudi V2-L1 e imposta il Punto di Presa Impulso di REG. PRINC. L1 su "MONTE V2".' };
        }
        return { ok: true, msg: 'Scambio linea eseguito correttamente!' };
      }
    },
    {
      title: 'Passo 2: Verifica SG Regolatore L1 e Tenuta Monitor nel Tronchetto',
      desc: 'Verifica che P VALLE L1 con SF-L1 chiuso sia stabile all\'SG del Regolatore. Poi apri e richiudi lo "Sfiato Tronch." (nel Tronchetto tra Monitor e Regolatore chiuso) per verificare sul manometro TRONCHETTO anche la chiusura e tenuta del Monitor L1!',
      check: (s) => {
        if (s.l1.v2Open || s.l1.sfOpen || s.l1.sfIntOpen || !s.l1.testedMonitorLockup) {
          return {
            ok: false,
            msg: 'Con V2-L1 e SF-L1 chiusi, clicca su "TRONCHETTO / Sfiato Tronch.", apri lo Sfiato del Tronchetto e poi richiudilo per testare la tenuta del Monitor!'
          };
        }
        return {
          ok: true,
          msg: `Sia l'SG del Regolatore (${formatPressure(s.l1.pTrunk, s.preset)}) sia la tenuta del Monitor nel Tronchetto (${formatPressure(
            s.l1.pMidDisplay,
            s.preset
          )}) sono stati verificati!`
        };
      }
    },
    {
      title: 'Passo 3: Verifica Scatto OPSO (Max) e UPSO (Min) del Blocco SB-L1',
      desc: 'Metti il rubinetto Imp.Blk di SB-L1 in posizione TEST, collega la Cassettina di Prova a SB-L1 e fai scattare il blocco sia per Massima (OPSO) sia per Minima (UPSO).',
      check: (s) => {
        if (!s.l1.testedMaxTrip || !s.l1.testedMinTrip) {
          return { ok: false, msg: 'Esegui entrambi i test di scatto OPSO e UPSO su SB-L1 con la Cassettina di Prova.' };
        }
        return { ok: true, msg: `Scatti OPSO (${s.l1.lastMaxTripVal}) e UPSO (${s.l1.lastMinTripVal}) certificati!` };
      }
    },
    {
      title: 'Passo 4: Riarmo Blocco SB-L1 e Ritorno in Servizio sulla 1ª Linea',
      desc: 'Riporta Imp.Blk in LINEA, riarma SB-L1 e riapri V2-L1. Osserva il manometro TRONCHETTO tornare a Pu (24 bar) confermando che il Regolatore Principale L1 è tornato al comando.',
      check: (s) => {
        if (s.l1.blkImpulseMode !== 'line' || !s.l1.sbArmed || !s.l1.v2Open) {
          return { ok: false, msg: 'Riporta Imp.Blk in LINEA, riarma SB-L1 e riapri V2-L1.' };
        }
        return { ok: true, msg: 'VERIFICA FUNZIONALE COMPLETA TERMINATA CON SUCCESSO!' };
      }
    }
  ]
};

let state = {
  presetKey: 'remi-piloted',
  preset: PRESETS['remi-piloted'],
  mode: 'free',
  viewMode: 'both',
  zoomPercent: 100,
  guidedStepIndex: 0,
  selectedComp: 'sfint-l1',
  flowDemand: 450,
  faultSeat1Leak: false,
  faultMonSeat1Leak: false,
  faultPilot1Leak: false,
  faultRupture1: false,
  pdManifold: 1.50,
  vsVenting: false,
  supplyStatus: 'OK_L1',
  testbox: {
    target: 'none',
    pressure: 1.50,
    lastTripText: '—'
  },
  l1: {},
  l2: {}
};

function createLineState(cfg, preset) {
  return {
    v1Open: true,
    v2Open: true,
    bpOpen: false,
    sbArmed: true,
    sbTripReason: null,
    blkImpulseMode: 'line',

    regPilotSupplyOpen: true,
    regImpulseTap: preset.defaultImpulseTap,
    regImpulseState: 'connected',
    regPmot: preset.arch === 'PILOTED' ? cfg.regSet + 0.6 : 0,

    monPilotSupplyOpen: true,
    monImpulseState: 'connected',
    monPmot: preset.arch === 'PILOTED' ? preset.pilotSupplyNominal : 0,

    // Sfiato nel TRONCHETTO tra Monitor e Regolatore (sfIntOpen) e Sfiato Valle Linea (sfOpen)
    sfIntOpen: false,
    sfOpen: false,
    tronchettoDepressurized: false, // Memoria se il tronchetto è stato scaricato con Sfiato Tronchetto a Regolatore chiuso
    testedMonitorLockup: false,

    regSet: cfg.regSet,
    monSet: cfg.monSet,
    blkMax: cfg.blkMax,
    blkMin: cfg.blkMin,

    // pMidBar = Pressione nel Tronchetto in bar (quando = Pu) oppure pMidDisplay nell'unità del preset (quando laminata dal Monitor)
    pMidIsPu: true, // true = nel tronchetto c'è Pu (Monitor aperto, lavora il Regolatore); false = nel tronchetto c'è pressione ridotta dal Monitor!
    pMidDisplay: preset.pu, // Valore numerico mostrato sul manometro TRONCHETTO
    pMidUnit: 'bar',

    pTrunk: cfg.regSet, // Pressione a valle del Regolatore Principale (prima di V2)
    trappedTrunkP: cfg.regSet,
    activeRole: 'ACTIVE',
    testedMaxTrip: false,
    testedMinTrip: false,
    lastMaxTripVal: null,
    lastMinTripVal: null
  };
}

function formatPressure(val, preset) {
  return `${Number(val).toFixed(preset.decimals).replace('.', ',')} ${preset.unit}`;
}

function formatShort(val, preset) {
  return Number(val).toFixed(preset.decimals);
}

function formatTronchetto(line, preset) {
  if (line.pMidIsPu) {
    return `${Number(line.pMidDisplay).toFixed(1).replace('.', ',')} bar (Pu)`;
  }
  return `${Number(line.pMidDisplay).toFixed(preset.decimals).replace('.', ',')} ${preset.unit}`;
}

function addLog(message, type = 'info') {
  const ul = document.getElementById('event-log');
  if (!ul) return;
  const li = document.createElement('li');
  if (type === 'warn') li.className = 'log-warn';
  if (type === 'trip') li.className = 'log-trip';
  if (type === 'ok') li.className = 'log-ok';
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);
  li.textContent = `[${timeStr}] ${message}`;
  ul.prepend(li);
  while (ul.children.length > 45) {
    ul.removeChild(ul.lastChild);
  }
}

function initPlant(presetKey) {
  const preset = PRESETS[presetKey] || PRESETS['remi-piloted'];
  state.presetKey = preset.id;
  state.preset = preset;
  state.flowDemand = preset.nominalFlow;
  state.faultSeat1Leak = false;
  state.faultMonSeat1Leak = false;
  state.faultPilot1Leak = false;
  state.faultRupture1 = false;
  state.vsSet = preset.vsSet;
  state.l1 = createLineState(preset.line1, preset);
  state.l2 = createLineState(preset.line2, preset);

  state.testbox.target = 'none';
  state.testbox.pressure = preset.line1.regSet;
  state.testbox.lastTripText = '—';

  const flowSlider = document.getElementById('flow-slider');
  flowSlider.max = preset.maxFlow;
  flowSlider.value = state.flowDemand;

  const pumpSlider = document.getElementById('testbox-slider');
  pumpSlider.max = preset.pumpMax;
  pumpSlider.step = preset.pumpStep;
  pumpSlider.value = preset.line1.regSet;

  document.getElementById('testbox-target').value = 'none';
  document.getElementById('chk-fault-seat1').checked = false;
  document.getElementById('chk-fault-monseat1').checked = false;
  document.getElementById('chk-fault-pilot1').checked = false;
  document.getElementById('chk-fault-pilot1').disabled = preset.arch !== 'PILOTED';
  document.getElementById('chk-fault-rupture1').checked = false;

  recalculatePhysics();
  renderAll();
  addLog(`Configurazione caricata: ${preset.name}`, 'ok');
}

/**
 * Motore Fisico / Pneumatico con calcolo esplicito del TRONCHETTO (tra Monitor e Regolatore)
 * e del TRONCO DI VALLE (tra Regolatore e V2)
 */
function recalculatePhysics() {
  const p = state.preset;
  const l1 = state.l1;
  const l2 = state.l2;

  computeLinePneumatics(l2, 2, state.pdManifold);
  computeLinePneumatics(l1, 1, state.pdManifold);

  const l1CanFeed = canLineDeliverGas(l1);
  const l2CanFeed = canLineDeliverGas(l2);

  let pd = 0;
  if (l1CanFeed && l2CanFeed) {
    pd = Math.max(l1.pTrunk, l2.pTrunk);
  } else if (l1CanFeed) {
    pd = l1.pTrunk;
  } else if (l2CanFeed) {
    pd = l2.pTrunk;
  } else {
    pd = state.flowDemand > 0 ? 0.0 : state.pdManifold;
  }

  state.pdManifold = pd;

  computeLinePneumatics(l1, 1, state.pdManifold);
  computeLinePneumatics(l2, 2, state.pdManifold);

  const l1FeedsNow = canLineDeliverGas(l1);
  const l2FeedsNow = canLineDeliverGas(l2);
  if (l1FeedsNow && l2FeedsNow) {
    pd = Math.max(l1.pTrunk, l2.pTrunk);
    if (pd > l2.regSet + p.sgAllowance * 0.5) {
      l2.pTrunk = pd;
      l2.activeRole = 'STANDBY';
      // In Stand-by automatico il Regolatore L2 è chiuso (sente Pd > Set_L2), mentre il Monitor L2 (Set_Mon2 > Pd) è APERTO -> nel tronchetto L2 c'è Pu!
      l2.pMidIsPu = true;
      l2.pMidDisplay = p.pu;
      if (p.arch === 'PILOTED') {
        l2.regPmot = pd;
      }
    }
  } else if (l1FeedsNow) {
    pd = l1.pTrunk;
    if (l2.v2Open) l2.pTrunk = pd;
  } else if (l2FeedsNow) {
    pd = l2.pTrunk;
    if (l1.v2Open) l1.pTrunk = pd;
  } else {
    pd = 0.0;
  }

  const vsSenseP = state.testbox.target === 'vs' ? state.testbox.pressure : pd;
  state.vsVenting = vsSenseP >= state.vsSet;
  if (state.vsVenting && state.testbox.target !== 'vs' && pd > state.vsSet) {
    pd = Math.min(pd, state.vsSet + p.sgAllowance);
  }
  state.pdManifold = pd;

  checkSlamShut(l1, 'blk-l1', 'SB-L1 (1ª Linea)');
  checkSlamShut(l2, 'blk-l2', 'SB-L2 (2ª Linea)');

  if (!l1.sbArmed) computeLinePneumatics(l1, 1, state.pdManifold);
  if (!l2.sbArmed) computeLinePneumatics(l2, 2, state.pdManifold);

  const finalL1 = canLineDeliverGas(l1);
  const finalL2 = canLineDeliverGas(l2);
  if (!finalL1 && !finalL2) {
    state.supplyStatus = 'OUTAGE';
    if (state.flowDemand > 0) state.pdManifold = 0;
  } else if (!finalL1 && finalL2) {
    state.supplyStatus = 'L2_EMERGENCY';
    state.pdManifold = l2.pTrunk;
  } else if (l1.activeRole === 'MONITOR_WORK') {
    state.supplyStatus = 'L1_MONITOR';
  } else {
    state.supplyStatus = 'OK_L1';
  }
}

function canLineDeliverGas(line) {
  const upstreamOk = (line.v1Open || line.bpOpen) && line.sbArmed;
  if (!upstreamOk || !line.v2Open) return false;
  if (state.preset.arch === 'PILOTED') {
    if (!line.regPilotSupplyOpen || !line.monPilotSupplyOpen) {
      return false;
    }
  }
  return true;
}

/**
 * Calcola sia la pressione nel TRONCHETTO (tra Monitor e Regolatore, line.pMidDisplay)
 * sia la pressione nel TRONCO DI VALLE (tra Regolatore e V2, line.pTrunk).
 */
function computeLinePneumatics(line, lineNum, currentManifoldP) {
  const p = state.preset;
  const isPiloted = p.arch === 'PILOTED';
  const upstreamAvailable = (line.v1Open || line.bpOpen) && line.sbArmed;
  const hasMonSeatLeak = lineNum === 1 && state.faultMonSeat1Leak;

  // 1. Se a monte il flusso è intercettato (V1 chiusa o Blocco scattato)
  if (!upstreamAvailable) {
    if (line.sfIntOpen || line.sfOpen) {
      line.pMidIsPu = false;
      line.pMidDisplay = 0;
    }
    if (line.sfOpen || (line.v2Open && state.flowDemand > 0 && !canOtherLineFeed(lineNum))) {
      line.pTrunk = 0;
      line.trappedTrunkP = 0;
    }
    line.regPmot = isPiloted ? line.pTrunk : 0;
    line.monPmot = isPiloted ? line.pTrunk : 0;
    line.activeRole = !line.sbArmed ? 'TRIPPED' : 'ISOLATED';
    return;
  }

  // 2. Verifichiamo se il Regolatore Principale è COMPLETAMENTE CHIUSO:
  // Ciò avviene quando:
  // a) Nei regolatori pilotati si chiude il rubinetto Alim.Pil del Regolatore Principale (Fail-Close), OPPURE
  // b) V2 è chiusa e SF di valle è chiuso (portata a valle = 0) e il Regolatore Principale non è forzato aperto!
  const regForcedOpenByImpulse =
    line.regImpulseState === 'vented' ||
    (lineNum === 1 && state.faultRupture1) ||
    (!line.v2Open && line.regImpulseTap === 'manifold' && currentManifoldP < line.regSet);

  const hasDownstreamFlow = (line.v2Open && state.flowDemand > 0) || line.sfOpen;
  const regIsClosedShut =
    (isPiloted && !line.regPilotSupplyOpen) || (!hasDownstreamFlow && !regForcedOpenByImpulse);

  // 3. Se il Regolatore Principale è COMPLETAMENTE CHIUSO, analizziamo cosa succede nel TRONCHETTO (tra Monitor e Regolatore):
  if (regIsClosedShut) {
    // Calcolo prima la pressione a valle del Regolatore Principale chiuso (pTrunk)
    if (isPiloted && !line.regPilotSupplyOpen) {
      line.activeRole = 'PILOT_CLOSED';
      if (hasDownstreamFlow) {
        line.pTrunk = line.v2Open ? currentManifoldP : 0;
      } else {
        line.pTrunk =
          lineNum === 1 && state.faultSeat1Leak
            ? Math.min(line.monSet + p.sgAllowance, line.regSet + p.seatLeakDelta)
            : Math.min(line.trappedTrunkP, line.regSet + p.sgAllowance);
      }
      line.trappedTrunkP = line.pTrunk;
      line.regPmot = line.pTrunk;
    } else {
      // V2 chiusa e SF chiuso con Regolatore Principale in chiusura statica (SG)
      line.activeRole = 'ACTIVE';
      let lockupP = line.regSet + p.sgAllowance;
      if (line.trappedTrunkP > lockupP) lockupP = line.trappedTrunkP;
      if (lineNum === 1) {
        if (state.faultSeat1Leak) {
          lockupP = Math.max(lockupP, line.regSet + p.seatLeakDelta);
        } else if (isPiloted && state.faultPilot1Leak && line.regPilotSupplyOpen) {
          lockupP = Math.max(lockupP, line.regSet + p.pilotLeakDelta);
        }
      }
      line.pTrunk = lockupP;
      line.trappedTrunkP = lockupP;
      if (isPiloted) {
        line.regPmot =
          lineNum === 1 && state.faultPilot1Leak && line.regPilotSupplyOpen
            ? +(line.pTrunk + (p.unit === 'bar' ? 0.25 : 15)).toFixed(2)
            : line.pTrunk;
      }
    }

    // ★ DINAMICA DEL TRONCHETTO (TRA MONITOR E REGOLATORE CHIUSO) ★
    // Come giustamente evidenziato: quando il Regolatore Principale è chiuso, aprendo e richiudendo lo Sfiato del Tronchetto (sfIntOpen)
    // si verifica la regolazione e la tenuta in chiusura (SG) del Monitor!
    if (line.sfIntOpen) {
      // Lo Sfiato del Tronchetto è APERTO mentre il Regolatore Principale a valle è chiuso:
      line.tronchettoDepressurized = true;
      if (isPiloted && !line.monPilotSupplyOpen) {
        // Se anche l'alimentazione pilota del Monitor è chiusa, il Monitor è in Fail-Close e lo sfiato scarica il tronchetto a 0!
        line.pMidIsPu = false;
        line.pMidDisplay = 0;
        line.monPmot = 0;
      } else {
        // Il Monitor lamina sul flusso dello Sfiato del Tronchetto portando il Tronchetto a Pm (set-point del Monitor)!
        line.pMidIsPu = false;
        line.pMidDisplay = line.monSet;
        if (isPiloted) {
          const deltaMot = p.unit === 'bar' ? 0.65 : 35.0;
          line.monPmot = +(line.monSet + deltaMot).toFixed(2);
        }
      }
    } else if (line.tronchettoDepressurized) {
      // Lo Sfiato del Tronchetto è stato RICHIUSO con il Regolatore Principale sempre chiuso -> PROVA DI TENUTA DEL MONITOR!
      line.testedMonitorLockup = true;
      if (hasMonSeatLeak) {
        // Se la sede dell'otturatore del Monitor trafila, la pressione nel Tronchetto chiuso risale fino alla Pressione di Monte (Pu)!
        line.pMidIsPu = true;
        line.pMidDisplay = p.pu;
      } else if (isPiloted && !line.monPilotSupplyOpen) {
        line.pMidIsPu = false;
        line.pMidDisplay = 0;
      } else {
        // Il Monitor chiude ermeticamente nel tronchetto al proprio valore di SG (Pm + SG)!
        line.pMidIsPu = false;
        line.pMidDisplay = +(line.monSet + p.sgAllowance).toFixed(2);
      }
      if (isPiloted) line.monPmot = line.pMidDisplay;
    } else {
      // Se lo Sfiato del Tronchetto non è stato aperto, tra il Monitor (che legge Pd < Pm ed è rimasto aperto) e il Regolatore chiuso c'è Pu!
      line.pMidIsPu = true;
      line.pMidDisplay = p.pu;
      if (isPiloted) line.monPmot = p.pilotSupplyNominal;
    }
    return;
  }

  // Se il Regolatore Principale riapre, il tronchetto segue il regime dinamico normale
  line.tronchettoDepressurized = false;

  // 4. Caso in cui (nei pilotati) solo l'alimentazione pilota del Monitor è chiusa
  if (isPiloted && !line.monPilotSupplyOpen) {
    line.activeRole = 'PILOT_CLOSED';
    line.pMidIsPu = false;
    line.pMidDisplay = hasMonSeatLeak ? p.pu : 0;
    line.pTrunk = line.v2Open ? currentManifoldP : 0;
    line.monPmot = 0;
    line.regPmot = line.pTrunk;
    return;
  }

  // 5. Regime di Erogazione / Regolazione Attiva (con portata attraverso V2 o SF di valle):
  if (regForcedOpenByImpulse) {
    // ★ IL REGOLATORE PRINCIPALE È SPALANCATO -> STA LAVORANDO IL MONITOR! ★
    // Poiché la laminazione avviene sul Monitor e il Regolatore Principale è tutto aperto,
    // il manometro nel TRONCHETTO legge la Pressione di Valle regolata dal Monitor (Pm)!
    line.activeRole = 'MONITOR_WORK';
    const regulatedP = hasDownstreamFlow ? line.monSet : +(line.monSet + p.sgAllowance).toFixed(2);
    line.pTrunk = regulatedP;
    line.trappedTrunkP = regulatedP;

    line.pMidIsPu = false;
    line.pMidDisplay = regulatedP;

    if (isPiloted) {
      const deltaMot = p.unit === 'bar' ? 0.65 : 35.0;
      line.regPmot = p.pilotSupplyNominal; // Regolatore 1 spalancato
      line.monPmot = hasDownstreamFlow ? +(line.monSet + deltaMot).toFixed(2) : regulatedP; // Monitor in lavoro
    }
  } else {
    // ★ STA LAVORANDO IL REGOLATORE PRINCIPALE (MARCIA NORMALE)! ★
    // Il Monitor è completamente aperto (perché legge Pd < Pm):
    // quindi nel TRONCHETTO tra Monitor e Regolatore c'è la Pressione di Monte (Pu)!
    line.activeRole = 'ACTIVE';
    line.pTrunk = line.regSet;
    line.trappedTrunkP = line.regSet;

    if (line.sfIntOpen) {
      // Anche se apri leggermente lo sfiato del tronchetto in marcia normale con Monitor spalancato, nel tronchetto c'è Pu
      line.pMidIsPu = true;
      line.pMidDisplay = +(p.pu * 0.98).toFixed(1);
    } else {
      line.pMidIsPu = true;
      line.pMidDisplay = p.pu;
    }

    if (isPiloted) {
      const deltaMot = p.unit === 'bar' ? 0.65 : 35.0;
      line.regPmot = +(line.regSet + deltaMot).toFixed(2);
      line.monPmot = p.pilotSupplyNominal; // Monitor tenuto completamente aperto dal suo pilota
    }
  }
}

function canOtherLineFeed(lineNum) {
  const other = lineNum === 1 ? state.l2 : state.l1;
  return canLineDeliverGas(other);
}

function checkSlamShut(line, targetId, label) {
  if (!line.sbArmed) return;

  let sensedP = line.pTrunk;
  if (line.blkImpulseMode === 'test') {
    if (state.testbox.target === targetId) {
      sensedP = state.testbox.pressure;
    } else {
      return;
    }
  }

  if (sensedP >= line.blkMax) {
    line.sbArmed = false;
    line.sbTripReason = 'MAX (OPSO)';
    line.testedMaxTrip = true;
    line.lastMaxTripVal = formatPressure(sensedP, state.preset);
    if (state.testbox.target === targetId) {
      state.testbox.lastTripText = `OPSO @ ${line.lastMaxTripVal}`;
    }
    addLog(`SCATTO BLOCCO ${label} per Massima Pressione (OPSO) a ${formatPressure(sensedP, state.preset)}!`, 'trip');
  } else if (sensedP <= line.blkMin) {
    line.sbArmed = false;
    line.sbTripReason = 'MIN (UPSO)';
    line.testedMinTrip = true;
    line.lastMinTripVal = formatPressure(sensedP, state.preset);
    if (state.testbox.target === targetId) {
      state.testbox.lastTripText = `UPSO @ ${line.lastMinTripVal}`;
    }
    addLog(`SCATTO BLOCCO ${label} per Minima Pressione (UPSO) a ${formatPressure(sensedP, state.preset)}!`, 'trip');
  }
}

function applyViewAndZoom() {
  const svg = document.getElementById('pid-svg');
  const gL1 = document.getElementById('svg-line-1');
  const gL2 = document.getElementById('svg-line-2');
  const gGaugePd = document.getElementById('svg-gauge-pd-group');
  const otherSummary = document.getElementById('other-line-summary');
  const otherText = document.getElementById('other-line-text');
  const p = state.preset;

  document.querySelectorAll('[data-view-mode]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-view-mode') === state.viewMode);
  });

  if (state.viewMode === 'both') {
    gL1.style.display = 'block';
    gL2.style.display = 'block';
    gGaugePd.setAttribute('transform', 'translate(1145, 500)');
    svg.setAttribute('viewBox', '0 0 1240 760');
    otherSummary.hidden = true;
  } else if (state.viewMode === 'l1') {
    gL1.style.display = 'block';
    gL2.style.display = 'none';
    gGaugePd.setAttribute('transform', 'translate(1145, 315)');
    svg.setAttribute('viewBox', '0 8 1240 365');
    otherSummary.hidden = false;
    const l2Badge = document.getElementById('svg-l2-badge').textContent;
    otherText.textContent = `⚡ 2ª Linea (in background): ${l2Badge} | P Valle L2 = ${formatPressure(
      state.l2.pTrunk,
      p
    )}`;
  } else if (state.viewMode === 'l2') {
    gL1.style.display = 'none';
    gL2.style.display = 'block';
    gGaugePd.setAttribute('transform', 'translate(1145, 500)');
    svg.setAttribute('viewBox', '0 365 1240 355');
    otherSummary.hidden = false;
    const l1Badge = document.getElementById('svg-l1-badge').textContent;
    otherText.textContent = `⚡ 1ª Linea (in background): ${l1Badge} | P Valle L1 = ${formatPressure(
      state.l1.pTrunk,
      p
    )}`;
  }

  svg.style.width = `${state.zoomPercent}%`;
  document.getElementById('zoom-readout').textContent = `${state.zoomPercent}%`;
}

function renderAll() {
  const p = state.preset;
  const l1 = state.l1;
  const l2 = state.l2;

  document.getElementById('plant-arch-subtitle').innerHTML = p.archSubtitle;
  document.getElementById('kpi-pu').textContent = `${p.pu.toFixed(1).replace('.', ',')} bar`;
  document.getElementById('kpi-pint1').textContent = formatTronchetto(l1, p);
  document.getElementById('kpi-ptr1').textContent = formatPressure(l1.pTrunk, p);
  document.getElementById('kpi-pd').textContent = formatPressure(state.pdManifold, p);
  document.getElementById('kpi-flow').textContent = `${state.flowDemand} Sm³/h`;
  document.getElementById('flow-val-label').textContent = `${state.flowDemand} Sm³/h`;

  const statusEl = document.getElementById('kpi-status-text');
  const pdBox = document.getElementById('kpi-pd-box');
  if (state.supplyStatus === 'OK_L1') {
    statusEl.textContent = 'REGOLARE (1ª LINEA)';
    statusEl.className = 'kpi-value status-ok';
    pdBox.style.setProperty('--status-border', '#10b981');
  } else if (state.supplyStatus === 'L1_MONITOR') {
    statusEl.textContent = 'LAVORA MONITOR L1!';
    statusEl.className = 'kpi-value status-warn';
    pdBox.style.setProperty('--status-border', '#f59e0b');
  } else if (state.supplyStatus === 'L2_EMERGENCY') {
    statusEl.textContent = 'ATTIVA 2ª LINEA (RISERVA)';
    statusEl.className = 'kpi-value status-warn';
    pdBox.style.setProperty('--status-border', '#f59e0b');
  } else {
    statusEl.textContent = 'FUORI SERVIZIO (0 Sm³/h)';
    statusEl.className = 'kpi-value status-danger';
    pdBox.style.setProperty('--status-border', '#f43f5e');
  }

  document.getElementById('svg-gauge-pu').textContent = `${p.pu.toFixed(1)}`;
  document.getElementById('svg-gauge-l1').textContent = formatShort(l1.pTrunk, p);
  document.getElementById('svg-gauge-l2').textContent = formatShort(l2.pTrunk, p);
  document.getElementById('svg-gauge-pd').textContent = formatShort(state.pdManifold, p);

  const archTag = p.arch === 'PILOTED' ? 'REGOLATORE PILOTATO FAIL-CLOSE' : 'AZIONE DIRETTA FAIL-OPEN';
  document.getElementById('svg-l1-title').textContent = `LINEA 1 — PRINCIPALE (${archTag})`;
  document.getElementById('svg-l2-title').textContent = `LINEA 2 — SECONDA LINEA DI RISERVA (${archTag})`;

  const showPilotSupply = p.arch === 'PILOTED';
  document.getElementById('svg-pilot-supply-l1').style.display = showPilotSupply ? 'block' : 'none';
  document.getElementById('svg-pilot-supply-l2').style.display = showPilotSupply ? 'block' : 'none';

  renderLineSVG(1, l1);
  renderLineSVG(2, l2);

  document.getElementById('sub-vs').textContent = `Set: ${formatShort(state.vsSet, p)} ${p.unit}`;
  document.getElementById('shape-vs').setAttribute('class', state.vsVenting ? 'relief-venting' : 'relief-closed');

  document.querySelectorAll('.svg-interactive').forEach((el) => {
    const compId = el.id.replace('svg-btn-', '');
    el.classList.toggle('selected-comp', compId === state.selectedComp);
  });

  applyViewAndZoom();
  renderTestbox();
  renderInspector();
  renderGuidedBanner();
}

function renderLineSVG(num, line) {
  const p = state.preset;
  const sfx = `l${num}`;
  const yPipe = num === 1 ? 235 : 575;
  const yImpReg = num === 1 ? 146 : 486;
  const yRegTop = num === 1 ? 186 : 526;

  document.getElementById(`shape-v1-${sfx}`).setAttribute('class', line.v1Open ? 'valve-open' : 'valve-closed');
  document.getElementById(`shape-v2-${sfx}`).setAttribute('class', line.v2Open ? 'valve-open' : 'valve-closed');
  document.getElementById(`shape-bp-${sfx}`).setAttribute('class', line.bpOpen ? 'valve-open' : 'valve-closed');

  document.getElementById(`head-sb-${sfx}`).setAttribute('class', line.sbArmed ? 'slam-armed' : 'slam-tripped');
  document.getElementById(`txt-sb-${sfx}`).textContent = line.sbArmed ? 'ARMATO' : 'BLOCCATO';
  document.getElementById(`sub-sb-${sfx}`).textContent =
    `Max ${formatShort(line.blkMax, p)} | Min ${formatShort(line.blkMin, p)}`;

  // ★ Manometro e Tubo del TRONCHETTO (tra Monitor e Regolatore Principale) ★
  const gaugeInt = document.getElementById(`svg-gauge-int-${sfx}`);
  const pipeTronchetto = document.getElementById(`pipe-${sfx}-tronchetto`);
  const dotSfInt = document.getElementById(`dot-sfint-${sfx}`);
  const lblSfInt = document.getElementById(`lbl-sfint-${sfx}`);

  if (line.pMidIsPu) {
    gaugeInt.textContent = `${Number(line.pMidDisplay).toFixed(1)} bar`;
    pipeTronchetto.setAttribute('class', 'pipe-segment pipe-hp-stroke'); // Rosso = Pressione di Monte Pu (Monitor aperto, lavora Regolatore)
  } else {
    gaugeInt.textContent = `${formatShort(line.pMidDisplay, p)}`;
    pipeTronchetto.setAttribute(
      'class',
      line.pMidDisplay === 0 ? 'pipe-segment pipe-zero-stroke' : 'pipe-segment pipe-warn-stroke'
    ); // Ambra = Pressione laminata dal Monitor!
  }
  dotSfInt.setAttribute('class', line.sfIntOpen ? 'cock-test' : 'cock-closed');
  lblSfInt.textContent = line.sfIntOpen ? 'Sf.Tronch: ON' : 'Sfiato Tronch.';

  // Rubinetto impulso Blocco
  const dotRblk = document.getElementById(`dot-rblk-${sfx}`);
  const lblRblk = document.getElementById(`lbl-rblk-${sfx}`);
  const impBlk = document.getElementById(`imp-blk-${sfx}`);
  if (line.blkImpulseMode === 'line') {
    dotRblk.setAttribute('class', 'cock-open');
    lblRblk.textContent = 'Imp.Blk: LINEA';
    impBlk.setAttribute('class', 'impulse-line');
  } else {
    dotRblk.setAttribute('class', 'cock-test');
    lblRblk.textContent = 'Imp.Blk: TEST';
    impBlk.setAttribute('class', 'impulse-test-active');
  }

  // Circuito Alimentazione Pilota (se PILOTED)
  if (p.arch === 'PILOTED') {
    document.getElementById(`dot-palim-reg-${sfx}`).setAttribute(
      'class',
      line.regPilotSupplyOpen ? 'cock-open' : 'cock-closed'
    );
    document.getElementById(`lbl-palim-reg-${sfx}`).textContent = line.regPilotSupplyOpen
      ? 'Alim.Pil: ON'
      : 'Alim.Pil: OFF';
    document.getElementById(`dot-palim-mon-${sfx}`).setAttribute(
      'class',
      line.monPilotSupplyOpen ? 'cock-open' : 'cock-closed'
    );
    document.getElementById(`lbl-palim-mon-${sfx}`).textContent = line.monPilotSupplyOpen
      ? 'Alim.Mon: ON'
      : 'Alim.Mon: OFF';
    document.getElementById(`pmot-reg-${sfx}`).textContent = `Pmot: ${formatShort(line.regPmot, p)} ${p.unit}`;
    document.getElementById(`pmot-mon-${sfx}`).textContent = `Pmot: ${formatShort(line.monPmot, p)} ${p.unit}`;
  } else {
    document.getElementById(`pmot-reg-${sfx}`).textContent = 'Molla Diretta (Fail-Open)';
    document.getElementById(`pmot-mon-${sfx}`).textContent = 'Molla Diretta';
  }

  // Tracciato dinamico Presa d'Impulso Regolatore Principale (MONTE V2 [x=810] vs VALLE V2 [x=955])
  const tapX = line.regImpulseTap === 'trunk' ? 810 : 955;
  const impRegPath = document.getElementById(`imp-reg-${sfx}`);
  impRegPath.setAttribute('d', `M 665 ${yRegTop} L 665 ${yImpReg} L ${tapX} ${yImpReg} L ${tapX} ${yPipe}`);
  const tapDot = document.getElementById(`tap-dot-reg-${sfx}`);
  tapDot.setAttribute('cx', String(tapX));

  const dotRreg = document.getElementById(`dot-rreg-${sfx}`);
  const lblRreg = document.getElementById(`lbl-rreg-${sfx}`);
  if (line.regImpulseState === 'connected') {
    dotRreg.setAttribute('class', 'cock-open');
    lblRreg.textContent = line.regImpulseTap === 'trunk' ? 'Imp.Reg: MONTE V2' : 'Imp.Reg: VALLE V2';
    impRegPath.setAttribute(
      'class',
      line.regImpulseTap === 'trunk' ? 'impulse-line' : 'impulse-manifold-line'
    );
  } else {
    dotRreg.setAttribute('class', 'cock-test');
    lblRreg.textContent = 'Imp.Reg: SCARICO!';
    impRegPath.setAttribute('class', 'impulse-test-active');
  }

  // Candela di Sfiato Valle Linea SF
  const dotSf = document.getElementById(`dot-sf-${sfx}`);
  const lblSf = document.getElementById(`lbl-sf-${sfx}`);
  dotSf.setAttribute('class', line.sfOpen ? 'cock-test' : 'cock-closed');
  lblSf.textContent = line.sfOpen ? `SF-L${num}: APERTO` : `Sfiato SF-L${num}`;

  document.getElementById(`sub-mon-${sfx}`).textContent = `Set: ${formatShort(line.monSet, p)} ${p.unit}`;
  document.getElementById(`sub-reg-${sfx}`).textContent = `Set: ${formatShort(line.regSet, p)} ${p.unit}`;

  const shapeReg = document.getElementById(`shape-reg-${sfx}`);
  const shapeMon = document.getElementById(`shape-mon-${sfx}`);
  const badge = document.getElementById(`svg-${sfx}-badge`);
  const pipeMid = document.getElementById(`pipe-${sfx}-mid`);

  if (!line.sbArmed) {
    badge.textContent = `BLOCCO INTERVENUTO (${line.sbTripReason})`;
    badge.setAttribute('class', 'line-status-badge badge-tripped');
    shapeReg.setAttribute('class', 'reg-fault');
    pipeMid.setAttribute('class', 'pipe-segment pipe-zero-stroke');
  } else if (line.activeRole === 'PILOT_CLOSED') {
    badge.textContent = 'REGOLATORE CHIUSO (FAIL-CLOSE ALIM. PILOTA OFF)';
    badge.setAttribute('class', 'line-status-badge badge-tripped');
    shapeReg.setAttribute('class', 'reg-fault');
    pipeMid.setAttribute('class', 'pipe-segment pipe-zero-stroke');
  } else if (!line.v1Open && !line.bpOpen) {
    badge.textContent = 'ISOLATA MONTE';
    badge.setAttribute('class', 'line-status-badge badge-isolated');
    shapeReg.setAttribute('class', 'reg-standby');
    pipeMid.setAttribute('class', 'pipe-segment pipe-zero-stroke');
  } else if (!line.v2Open) {
    if (line.activeRole === 'MONITOR_WORK') {
      badge.textContent = line.sfOpen
        ? 'LAVORA MONITOR (TRONCHETTO = P VALLE)'
        : 'SPALANCATO (IMPULSO SU VALLE V2 -> TENUTA MONITOR!)';
    } else {
      badge.textContent = line.sfOpen
        ? 'IN REGOLAZIONE SU SFIATO SF'
        : `CHIUSO IN SG (P VALLE = ${formatShort(line.pTrunk, p)} ${p.unit})`;
    }
    badge.setAttribute('class', 'line-status-badge badge-standby');
    shapeReg.setAttribute('class', line.activeRole === 'MONITOR_WORK' ? 'reg-fault' : 'reg-active');
    shapeMon.setAttribute('class', line.activeRole === 'MONITOR_WORK' ? 'reg-active' : 'reg-monitor');
    pipeMid.setAttribute('class', 'pipe-segment pipe-warn-stroke');
  } else if (line.activeRole === 'MONITOR_WORK') {
    badge.textContent = 'LAVORA IL MONITOR! (TRONCHETTO = P VALLE)';
    badge.setAttribute('class', 'line-status-badge badge-standby');
    shapeReg.setAttribute('class', 'reg-fault');
    shapeMon.setAttribute('class', 'reg-active');
    pipeMid.setAttribute('class', 'pipe-segment pipe-warn-stroke');
  } else if (line.activeRole === 'STANDBY') {
    badge.textContent = 'STAND-BY AUTOMATICO (PRONTA)';
    badge.setAttribute('class', 'line-status-badge badge-standby');
    shapeReg.setAttribute('class', 'reg-standby');
    shapeMon.setAttribute('class', 'reg-monitor');
    pipeMid.setAttribute('class', 'pipe-segment pipe-mp-stroke');
  } else {
    badge.textContent = 'LAVORA REGOLATORE (TRONCHETTO = Pu)';
    badge.setAttribute('class', 'line-status-badge');
    shapeReg.setAttribute('class', 'reg-active');
    shapeMon.setAttribute('class', 'reg-monitor');
    pipeMid.setAttribute('class', 'pipe-segment pipe-mp-stroke');
  }
}

function renderTestbox() {
  const p = state.preset;
  const tbBody = document.getElementById('testbox-body');
  const pill = document.getElementById('testbox-status-pill');
  const readout = document.getElementById('testbox-readout');
  const lastTrip = document.getElementById('testbox-last-trip');

  if (state.testbox.target === 'none') {
    tbBody.setAttribute('inert', '');
    pill.textContent = 'SCOLLEGATA';
    readout.textContent = `— ${p.unit}`;
    return;
  }

  tbBody.removeAttribute('inert');
  readout.textContent = formatPressure(state.testbox.pressure, p);
  lastTrip.textContent = state.testbox.lastTripText;

  if (state.testbox.target === 'blk-l1') {
    pill.textContent = state.l1.blkImpulseMode === 'test' ? 'ISOLATA (PRONTA TEST)' : 'ATTENZIONE: RUBINETTO IN LINEA!';
  } else if (state.testbox.target === 'blk-l2') {
    pill.textContent = state.l2.blkImpulseMode === 'test' ? 'ISOLATA (PRONTA TEST)' : 'ATTENZIONE: RUBINETTO IN LINEA!';
  } else {
    pill.textContent = 'TEST SFIORO VS';
  }
}

function renderInspector() {
  const id = state.selectedComp;
  const p = state.preset;
  const isPiloted = p.arch === 'PILOTED';
  const tagEl = document.getElementById('inspector-tag');
  const titleEl = document.getElementById('inspector-title');
  const descEl = document.getElementById('inspector-desc');
  const ctrlsEl = document.getElementById('inspector-controls');
  ctrlsEl.innerHTML = '';

  const isL2 = id.endsWith('l2');
  const line = isL2 ? state.l2 : state.l1;
  const lineCfg = isL2 ? p.line2 : p.line1;
  const lineLabel = isL2 ? '2ª Linea (Riserva)' : '1ª Linea (Principale)';

  // ★ Caso 0: TRONCHETTO INTERMEDIO tra Monitor e Regolatore (Manometro TRONCHETTO + Sfiato Tronchetto) ★
  if (id.startsWith('sfint-')) {
    tagEl.textContent = `TRONCHETTO MONITOR → REGOLATORE · ${lineLabel}`;
    titleEl.textContent = `Manometro & Sfiato del Tronchetto (${isL2 ? 'L2' : 'L1'})`;
    descEl.textContent =
      'Il tronchetto tra Monitor e Regolatore Principale permette di: 1) capire subito chi sta lavorando (segna Pu se lavora il Regolatore e il Monitor è aperto; segna la Pressione di Valle se lavora il Monitor e il Regolatore è spalancato); 2) verificare la tenuta in chiusura del Monitor tramite lo Sfiato del Tronchetto quando il Regolatore Principale a valle è completamente chiuso!';

    const whoIsWorkingText = line.pMidIsPu
      ? `STA LAVORANDO IL REGOLATORE (Monitor aperto → P tronchetto = Pu)`
      : line.activeRole === 'MONITOR_WORK'
      ? `STA LAVORANDO IL MONITOR! (Regolatore spalancato → P tronchetto = P valle)`
      : `PROVA TENUTA MONITOR IN CORSO (Regolatore chiuso a valle)`;

    ctrlsEl.innerHTML = `
      <div class="inspector-stat-row">
        <span>Pressione Manometro Tronchetto:</span>
        <strong class="${line.pMidIsPu ? 'status-danger' : 'status-warn'}">${formatTronchetto(line, p)}</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Diagnosi dal Manometro:</span>
        <strong>${whoIsWorkingText}</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Rubinetto Sfiato Tronchetto:</span>
        <strong class="${line.sfIntOpen ? 'status-warn' : 'status-ok'}">
          ${line.sfIntOpen ? 'APERTO (Scarico in atmosfera)' : 'CHIUSO'}
        </strong>
      </div>
      <div class="diagnostic-callout">
        💡 <strong>Come verificare la tenuta del Monitor:</strong> Chiudi completamente il Regolatore Principale (chiudendo <code>V2</code> e <code>SF</code> di valle, oppure chiudendo <code>Alim.Pil</code> su un regolatore pilotato). Poi <strong>apri lo Sfiato del Tronchetto</strong> per scaricare la $P_u$ e <strong>richiudilo</strong>: se il Monitor tiene, la pressione nel tronchetto resta ferma a ${formatPressure(
          +(line.monSet + p.sgAllowance).toFixed(2),
          p
        )} senza risalire a $P_u$ (${p.pu} bar)!
      </div>
      <div class="inspector-btn-row">
        <button type="button" class="btn btn-sm ${line.sfIntOpen ? 'btn-secondary' : 'btn-primary'}" id="act-toggle-sfint">
          ${line.sfIntOpen ? 'Chiudi Sfiato Tronchetto (Verifica Tenuta Monitor)' : 'Apri Sfiato del Tronchetto'}
        </button>
      </div>
    `;

    document.getElementById('act-toggle-sfint').addEventListener('click', () => {
      line.sfIntOpen = !line.sfIntOpen;
      addLog(
        `Sfiato del Tronchetto (tra Monitor e Regolatore ${isL2 ? 'L2' : 'L1'}): ${
          line.sfIntOpen ? 'APERTO' : 'CHIUSO'
        }`,
        'info'
      );
      recalculatePhysics();
      renderAll();
    });
    return;
  }

  // 1. Regolatore Principale
  if (id.startsWith('reg-') || id.startsWith('rreg-') || id.startsWith('palim-reg-')) {
    tagEl.textContent = `${isPiloted ? 'REGOLATORE PILOTATO (FAIL-CLOSE)' : 'AZIONE DIRETTA (FAIL-OPEN)'} · ${lineLabel}`;
    titleEl.textContent = lineCfg.regModel;
    descEl.textContent = isPiloted
      ? 'Regolatore pilotato normalmente chiuso (Fail-Close). Quando è in regolazione normale, a monte nel Tronchetto c\'è Pu. Se scarichi la sua presa d\'impulso a 0, si spalanca facendo entrare in lavoro il Monitor (e il Tronchetto scende a Pm).'
      : 'Regolatore ad azione diretta normalmente aperto (Fail-Open). La molla apre l\'otturatore e la pressione nella presa d\'impulso agisce sotto la membrana per chiudere.';

    const sensedImpulseP =
      line.regImpulseState === 'vented'
        ? 0
        : line.regImpulseTap === 'trunk'
        ? line.pTrunk
        : state.pdManifold;

    let pilotHTML = '';
    if (isPiloted) {
      pilotHTML = `
        <div class="inspector-subbox">
          <div class="inspector-subbox-title">Circuito Pilota &amp; Pressione Motrice (Fail-Close)</div>
          <div class="inspector-stat-row">
            <span>Alimentazione Pilota (Monte → R14):</span>
            <strong class="${line.regPilotSupplyOpen ? 'status-ok' : 'status-danger'}">
              ${line.regPilotSupplyOpen ? `APERTA (${formatPressure(p.pilotSupplyNominal, p)})` : 'CHIUSA (Pmot = 0 → CHIUSO!)'}
            </strong>
          </div>
          <div class="inspector-stat-row">
            <span>Pressione Motrice Attuatore (Pmot):</span>
            <strong>${formatPressure(line.regPmot, p)} (ΔP motrice: ${formatShort(Math.max(0, line.regPmot - line.pTrunk), p)} ${p.unit})</strong>
          </div>
          <div class="inspector-btn-row">
            <button type="button" class="btn btn-sm ${line.regPilotSupplyOpen ? 'btn-danger' : 'btn-success'}" id="act-toggle-palim">
              ${line.regPilotSupplyOpen ? 'Chiudi Alimentazione Pilota (Fail-Close)' : 'Apri Alimentazione Pilota'}
            </button>
          </div>
        </div>
      `;
    }

    const impulseTapWarning =
      !line.v2Open && line.regImpulseTap === 'manifold'
        ? `<div class="diagnostic-callout">
             ⚠️ <strong>Attenzione Presa d'Impulso:</strong> Con <code>V2-${isL2 ? 'L2' : 'L1'}</code> chiusa, la presa d'impulso legge il <strong>Collettore a valle di V2</strong> (${formatPressure(
               state.pdManifold,
               p
             )})! Il regolatore si è spalancato e nel Tronchetto sta lavorando il Monitor. Commuta la presa su <strong>MONTE V2</strong>!
           </div>`
        : '';

    ctrlsEl.innerHTML = `
      <div class="inspector-stat-row">
        <span>Set-point Taratura (Pd):</span>
        <strong>${formatPressure(line.regSet, p)} (SG nominale: +${formatShort(p.sgAllowance, p)} ${p.unit})</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Pressione nel Tronchetto (a monte):</span>
        <strong>${formatTronchetto(line, p)}</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Pressione Valle Linea (a monte V2):</span>
        <strong>${formatPressure(line.pTrunk, p)}</strong>
      </div>
      ${pilotHTML}
      <div class="inspector-subbox">
        <div class="inspector-subbox-title">Gestione Presa d'Impulso Regolatore (${formatPressure(sensedImpulseP, p)})</div>
        <div class="inspector-stat-row">
          <span>Punto di Presa Impulso:</span>
          <strong class="${line.regImpulseTap === 'trunk' ? 'status-ok' : 'status-warn'}">
            ${line.regImpulseTap === 'trunk' ? 'MONTE V2 (Valle Regolatore)' : 'VALLE V2 (Collettore)'}
          </strong>
        </div>
        <div class="inspector-stat-row">
          <span>Stato Rubinetto Impulso:</span>
          <strong class="${line.regImpulseState === 'connected' ? 'status-ok' : 'status-warn'}">
            ${line.regImpulseState === 'connected' ? 'IN LINEA (Lettura attiva)' : 'SCARICATO IN ATMOSFERA (0 → Spalanca)'}
          </strong>
        </div>
        ${impulseTapWarning}
        <div class="inspector-btn-row">
          <button type="button" class="btn btn-xs btn-primary" id="act-toggle-imp-tap">
            Commuta Presa: ${line.regImpulseTap === 'trunk' ? 'Passa a VALLE V2 (Collettore)' : 'Passa a MONTE V2'}
          </button>
          <button type="button" class="btn btn-xs btn-outline" id="act-toggle-reg-imp">
            ${line.regImpulseState === 'connected' ? 'Scarica Impulso a 0 (Prova Monitor)' : 'Riconnetti Impulso in Linea'}
          </button>
        </div>
      </div>
      <div class="inspector-btn-row">
        <button type="button" class="btn btn-xs btn-outline" id="act-reg-minus">Vite Taratura -</button>
        <button type="button" class="btn btn-xs btn-outline" id="act-reg-plus">Vite Taratura +</button>
      </div>
    `;

    if (isPiloted) {
      document.getElementById('act-toggle-palim').addEventListener('click', () => {
        line.regPilotSupplyOpen = !line.regPilotSupplyOpen;
        addLog(
          `Alimentazione Pilota Regolatore ${isL2 ? 'L2' : 'L1'}: ${
            line.regPilotSupplyOpen
              ? 'APERTA (Pmot attiva)'
              : 'CHIUSA -> Regolatore principale completamente chiuso (Fail-Close)!'
          }`,
          line.regPilotSupplyOpen ? 'ok' : 'warn'
        );
        recalculatePhysics();
        renderAll();
      });
    }

    document.getElementById('act-toggle-imp-tap').addEventListener('click', () => {
      line.regImpulseTap = line.regImpulseTap === 'trunk' ? 'manifold' : 'trunk';
      addLog(
        `Punto presa d'impulso Regolatore ${isL2 ? 'L2' : 'L1'} commutato su: ${
          line.regImpulseTap === 'trunk' ? 'MONTE V2 (Valle Regolatore)' : 'VALLE V2 (Collettore)'
        }.`,
        'info'
      );
      recalculatePhysics();
      renderAll();
    });

    document.getElementById('act-toggle-reg-imp').addEventListener('click', () => {
      line.regImpulseState = line.regImpulseState === 'connected' ? 'vented' : 'connected';
      addLog(
        `Presa d'impulso Regolatore ${isL2 ? 'L2' : 'L1'}: ${
          line.regImpulseState === 'connected'
            ? 'RICONNESSA IN LINEA (Tronchetto torna a Pu)'
            : 'SCARICATA IN ATMOSFERA (0) -> Regolatore spalancato, entra il Monitor (Tronchetto scende a Pm)!'
        }`,
        line.regImpulseState === 'connected' ? 'ok' : 'warn'
      );
      recalculatePhysics();
      renderAll();
    });

    document.getElementById('act-reg-minus').addEventListener('click', () => {
      line.regSet = Math.max(line.blkMin + p.fineStep, +(line.regSet - p.fineStep).toFixed(2));
      addLog(`Taratura Regolatore ${isL2 ? 'L2' : 'L1'} ridotta a ${formatPressure(line.regSet, p)}`, 'info');
      recalculatePhysics();
      renderAll();
    });

    document.getElementById('act-reg-plus').addEventListener('click', () => {
      line.regSet = Math.min(line.blkMax - p.fineStep, +(line.regSet + p.fineStep).toFixed(2));
      addLog(`Taratura Regolatore ${isL2 ? 'L2' : 'L1'} aumentata a ${formatPressure(line.regSet, p)}`, 'info');
      recalculatePhysics();
      renderAll();
    });
    return;
  }

  // 2. Regolatore Monitor
  if (id.startsWith('mon-') || id.startsWith('rmon-') || id.startsWith('palim-mon-')) {
    tagEl.textContent = `REGOLATORE MONITOR IN SERIE · ${lineLabel}`;
    titleEl.textContent = lineCfg.monModel;
    descEl.textContent =
      'Dispositivo di regolazione d\'emergenza installato a monte del Regolatore Principale. In marcia normale è completamente aperto (nel Tronchetto a valle del Monitor c\'è Pu). Quando il Regolatore Principale si spalanca, il Monitor prende il controllo laminando la pressione nel Tronchetto a Pm!';

    ctrlsEl.innerHTML = `
      <div class="inspector-stat-row">
        <span>Set-point Monitor (Pm):</span>
        <strong>${formatPressure(line.monSet, p)}</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Pressione nel Tronchetto (uscita Monitor):</span>
        <strong>${formatTronchetto(line, p)}</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Stato Operativo Monitor:</span>
        <strong class="${line.activeRole === 'MONITOR_WORK' ? 'status-warn' : 'status-ok'}">
          ${line.activeRole === 'MONITOR_WORK' ? 'IN LAVORO (Lamina a Pm)!' : 'Completamente Aperto (Sorveglianza)'}
        </strong>
      </div>
      ${
        isPiloted
          ? `
        <div class="inspector-stat-row">
          <span>Alimentazione Pilota Monitor:</span>
          <strong class="${line.monPilotSupplyOpen ? 'status-ok' : 'status-danger'}">
            ${line.monPilotSupplyOpen ? `APERTA (Pmot: ${formatPressure(line.monPmot, p)})` : 'CHIUSA (Monitor Chiuso!)'}
          </strong>
        </div>
        <div class="inspector-btn-row">
          <button type="button" class="btn btn-xs ${line.monPilotSupplyOpen ? 'btn-danger' : 'btn-success'}" id="act-toggle-mon-palim">
            ${line.monPilotSupplyOpen ? 'Chiudi Alim. Pilota Monitor' : 'Apri Alim. Pilota Monitor'}
          </button>
        </div>
      `
          : ''
      }
      <div class="inspector-btn-row">
        <button type="button" class="btn btn-xs btn-outline" id="act-mon-minus">Vite Monitor -</button>
        <button type="button" class="btn btn-xs btn-outline" id="act-mon-plus">Vite Monitor +</button>
      </div>
    `;

    if (isPiloted) {
      document.getElementById('act-toggle-mon-palim').addEventListener('click', () => {
        line.monPilotSupplyOpen = !line.monPilotSupplyOpen;
        addLog(
          `Alimentazione Pilota Monitor ${isL2 ? 'L2' : 'L1'}: ${line.monPilotSupplyOpen ? 'APERTA' : 'CHIUSA'}`,
          line.monPilotSupplyOpen ? 'ok' : 'warn'
        );
        recalculatePhysics();
        renderAll();
      });
    }

    document.getElementById('act-mon-minus').addEventListener('click', () => {
      line.monSet = Math.max(line.regSet + p.fineStep, +(line.monSet - p.fineStep).toFixed(2));
      addLog(`Set-point Monitor ${isL2 ? 'L2' : 'L1'} tarato a ${formatPressure(line.monSet, p)}`, 'info');
      recalculatePhysics();
      renderAll();
    });

    document.getElementById('act-mon-plus').addEventListener('click', () => {
      line.monSet = Math.min(line.blkMax - p.fineStep, +(line.monSet + p.fineStep).toFixed(2));
      addLog(`Set-point Monitor ${isL2 ? 'L2' : 'L1'} tarato a ${formatPressure(line.monSet, p)}`, 'info');
      recalculatePhysics();
      renderAll();
    });
    return;
  }

  if (id.startsWith('v1-') || id.startsWith('v2-') || id.startsWith('bp-')) {
    const isV1 = id.startsWith('v1-');
    const isV2 = id.startsWith('v2-');
    const openProp = isV1 ? 'v1Open' : isV2 ? 'v2Open' : 'bpOpen';
    const isOpen = line[openProp];

    tagEl.textContent = `ORGANO DI INTERCETTAZIONE · ${lineLabel}`;
    titleEl.textContent = isV1
      ? `Valvola di Monte V1-${isL2 ? 'L2' : 'L1'}`
      : isV2
      ? `Valvola di Valle V2-${isL2 ? 'L2' : 'L1'}`
      : `Valvola di By-pass BP-${isL2 ? 'L2' : 'L1'}`;
    descEl.textContent = isV2
      ? 'Valvola di isolamento a valle della linea. Nei regolatori pilotati, ricorda di verificare che la presa d\'impulso sia commutata su MONTE V2 per eseguire la prova di chiusura SG!'
      : isV1
      ? 'Valvola di intercettazione principale d\'ingresso linea ad alta pressione (Pu).'
      : 'By-pass di pressurizzazione lenta del tronco a monte.';

    ctrlsEl.innerHTML = `
      <div class="inspector-stat-row">
        <span>Stato Attuale:</span>
        <strong class="${isOpen ? 'status-ok' : 'status-danger'}">${isOpen ? 'APERTA (Flusso libero)' : 'CHIUSA (Intercettata)'}</strong>
      </div>
      <div class="inspector-btn-row">
        <button type="button" class="btn btn-sm ${isOpen ? 'btn-danger' : 'btn-success'}" id="act-toggle-valve">
          ${isOpen ? 'Chiudi Valvola' : 'Apri Valvola'}
        </button>
      </div>
    `;
    document.getElementById('act-toggle-valve').addEventListener('click', () => {
      line[openProp] = !line[openProp];
      addLog(`${titleEl.textContent}: ${line[openProp] ? 'APERTA' : 'CHIUSA'}`, line[openProp] ? 'ok' : 'warn');
      recalculatePhysics();
      renderAll();
    });
    return;
  }

  if (id.startsWith('sb-') || id.startsWith('rblk-')) {
    tagEl.textContent = `SICUREZZA POSITIVA · ${lineLabel}`;
    titleEl.textContent = `${lineCfg.blkModel} (${isL2 ? 'SB-L2' : 'SB-L1'})`;
    descEl.textContent =
      'Valvola di blocco automatico per sovrapressione (OPSO) e sottopressione (UPSO). Dotata di rubinetto a 3 vie sulla presa d\'impulso per prove strumentali con cassettina e leva di riarmo manuale.';

    ctrlsEl.innerHTML = `
      <div class="inspector-stat-row">
        <span>Stato Otturatore:</span>
        <strong class="${line.sbArmed ? 'status-ok' : 'status-danger'}">
          ${line.sbArmed ? 'ARMATO (Aperto)' : `SCATTATO (${line.sbTripReason})`}
        </strong>
      </div>
      <div class="inspector-stat-row">
        <span>Taratura Scatto Max (OPSO) / Min (UPSO):</span>
        <strong>${formatPressure(line.blkMax, p)} / ${formatPressure(line.blkMin, p)}</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Rubinetto Presa Impulso Blocco:</span>
        <strong class="${line.blkImpulseMode === 'line' ? 'status-ok' : 'status-warn'}">
          ${line.blkImpulseMode === 'line' ? 'IN LINEA (Normale)' : 'ISOLATO / POSIZIONE TEST'}
        </strong>
      </div>
      <div class="inspector-btn-row">
        <button type="button" class="btn btn-sm btn-outline" id="act-toggle-blk-imp">
          Rubinetto Impulso (${line.blkImpulseMode === 'line' ? 'Passa a TEST' : 'Torna in LINEA'})
        </button>
        <button type="button" class="btn btn-sm btn-primary" id="act-connect-pump">
          Collega Cassettina di Prova
        </button>
      </div>
      <div class="inspector-btn-row">
        <button type="button" class="btn btn-sm btn-success" id="act-rearm-sb" ${line.sbArmed ? 'disabled' : ''}>
          Equalizza e Riarma Leva Blocco
        </button>
        <button type="button" class="btn btn-sm btn-danger" id="act-manual-trip" ${!line.sbArmed ? 'disabled' : ''}>
          Sgancio Manuale (Pulsante Test)
        </button>
      </div>
    `;

    document.getElementById('act-toggle-blk-imp').addEventListener('click', () => {
      line.blkImpulseMode = line.blkImpulseMode === 'line' ? 'test' : 'line';
      addLog(
        `Rubinetto presa d'impulso ${isL2 ? 'SB-L2' : 'SB-L1'} in posizione: ${
          line.blkImpulseMode === 'line' ? 'LINEA' : 'TEST (Isolato)'
        }`,
        line.blkImpulseMode === 'line' ? 'ok' : 'warn'
      );
      recalculatePhysics();
      renderAll();
    });

    document.getElementById('act-connect-pump').addEventListener('click', () => {
      const targetVal = isL2 ? 'blk-l2' : 'blk-l1';
      state.testbox.target = targetVal;
      state.testbox.pressure = line.pTrunk > 0 ? line.pTrunk : line.regSet;
      document.getElementById('testbox-target').value = targetVal;
      document.getElementById('testbox-slider').value = state.testbox.pressure;
      addLog(`Cassettina di prova collegata a ${isL2 ? 'SB-L2' : 'SB-L1'}.`, 'info');
      recalculatePhysics();
      renderAll();
    });

    document.getElementById('act-rearm-sb').addEventListener('click', () => {
      const targetId = isL2 ? 'blk-l2' : 'blk-l1';
      const sensedP =
        line.blkImpulseMode === 'test' && state.testbox.target === targetId
          ? state.testbox.pressure
          : line.regSet;

      if (sensedP >= line.blkMax || sensedP <= line.blkMin) {
        addLog(
          `Impossibile riarmare ${isL2 ? 'SB-L2' : 'SB-L1'}: pressione nella testata (${formatPressure(
            sensedP,
            p
          )}) fuori campo! Riporta prima la pressione di prova entro [${formatShort(line.blkMin, p)} ÷ ${formatShort(
            line.blkMax,
            p
          )} ${p.unit}].`,
          'trip'
        );
        return;
      }

      line.sbArmed = true;
      line.sbTripReason = null;
      line.pTrunk = line.regSet;
      line.trappedTrunkP = line.regSet;
      addLog(`Valvola di blocco ${isL2 ? 'SB-L2' : 'SB-L1'} equalizzata e RIARMATA.`, 'ok');
      recalculatePhysics();
      renderAll();
    });

    document.getElementById('act-manual-trip').addEventListener('click', () => {
      line.sbArmed = false;
      line.sbTripReason = 'PULSANTE MANUALE';
      addLog(`Test di sgancio meccanico manuale eseguito su ${isL2 ? 'SB-L2' : 'SB-L1'}.`, 'warn');
      recalculatePhysics();
      renderAll();
    });
    return;
  }

  if (id.startsWith('sf-')) {
    tagEl.textContent = `SFIATO DI VALLE LINEA · ${lineLabel}`;
    titleEl.textContent = `Rubinetto di Sfiato Valle SF-${isL2 ? 'L2' : 'L1'} (tra Regolatore e V2)`;
    descEl.textContent =
      'Valvola di sfiato posta a valle del Regolatore Principale (prima di V2). Serve per innescare e controllare la pressione regolata (e l\'SG del Regolatore Principale) quando V2 è chiusa.';

    ctrlsEl.innerHTML = `
      <div class="inspector-stat-row">
        <span>Pressione Valle Linea (P VALLE ${isL2 ? 'L2' : 'L1'}):</span>
        <strong>${formatPressure(line.pTrunk, p)}</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Stato Rubinetto Sfiato Valle:</span>
        <strong class="${line.sfOpen ? 'status-warn' : 'status-ok'}">
          ${line.sfOpen ? 'APERTO (Flusso di sfiato attivo)' : 'CHIUSO (Portata valle = 0)'}
        </strong>
      </div>
      <div class="inspector-btn-row">
        <button type="button" class="btn btn-sm ${line.sfOpen ? 'btn-secondary' : 'btn-primary'}" id="act-toggle-sf">
          ${line.sfOpen ? 'Chiudi Sfiato SF (Misura SG Regolatore)' : 'Apri Sfiato a Candela SF'}
        </button>
      </div>
    `;

    document.getElementById('act-toggle-sf').addEventListener('click', () => {
      line.sfOpen = !line.sfOpen;
      addLog(`Rubinetto di sfiato valle SF-${isL2 ? 'L2' : 'L1'}: ${line.sfOpen ? 'APERTO' : 'CHIUSO'}`, 'info');
      recalculatePhysics();
      renderAll();
    });
    return;
  }

  if (id === 'vs') {
    tagEl.textContent = 'PRESIDIO COLLETTORE VALLE';
    titleEl.textContent = 'Valvola di Sfioro (VS)';
    descEl.textContent =
      'Dispositivo di scarico a molla tarato tra il set-point del Monitor e il Blocco di Massima.';

    ctrlsEl.innerHTML = `
      <div class="inspector-stat-row">
        <span>Soglia di Apertura (Pvs):</span>
        <strong>${formatPressure(state.vsSet, p)}</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Stato Attuale:</span>
        <strong class="${state.vsVenting ? 'status-warn' : 'status-ok'}">
          ${state.vsVenting ? 'IN SCARICO (Sfioro attivo!)' : 'CHIUSA (Tenuta stagna)'}
        </strong>
      </div>
      <div class="inspector-btn-row">
        <button type="button" class="btn btn-sm btn-primary" id="act-test-vs">
          Collega Cassettina di Prova a VS
        </button>
      </div>
    `;

    document.getElementById('act-test-vs').addEventListener('click', () => {
      state.testbox.target = 'vs';
      state.testbox.pressure = state.pdManifold;
      document.getElementById('testbox-target').value = 'vs';
      document.getElementById('testbox-slider').value = state.testbox.pressure;
      addLog('Cassettina di prova collegata alla Valvola di Sfioro (VS).', 'info');
      recalculatePhysics();
      renderAll();
    });
  }
}

function renderGuidedBanner() {
  const banner = document.getElementById('guided-banner');
  const steps = GUIDED_PROCEDURES[state.mode];
  if (!steps) {
    banner.hidden = true;
    return;
  }

  banner.hidden = false;
  const idx = state.guidedStepIndex;
  const step = steps[idx];
  document.getElementById('guided-step-num').textContent = `PASSO ${idx + 1} / ${steps.length}`;
  document.getElementById('guided-step-title').textContent = step.title;
  document.getElementById('guided-step-desc').textContent = step.desc;
  document.getElementById('btn-prev-step').disabled = idx === 0;
  document.getElementById('btn-next-step').disabled = idx === steps.length - 1;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.svg-interactive').forEach((el) => {
    el.addEventListener('click', () => {
      state.selectedComp = el.id.replace('svg-btn-', '');
      renderAll();
    });
  });

  document.querySelectorAll('[data-view-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.viewMode = btn.getAttribute('data-view-mode');
      if (state.viewMode === 'l1' && state.selectedComp.endsWith('l2')) {
        state.selectedComp = 'sfint-l1';
      } else if (state.viewMode === 'l2' && state.selectedComp.endsWith('l1')) {
        state.selectedComp = 'sfint-l2';
      }
      renderAll();
    });
  });

  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    state.zoomPercent = Math.min(200, state.zoomPercent + 20);
    applyViewAndZoom();
  });

  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    state.zoomPercent = Math.max(80, state.zoomPercent - 20);
    applyViewAndZoom();
  });

  document.getElementById('btn-zoom-reset').addEventListener('click', () => {
    state.zoomPercent = 100;
    applyViewAndZoom();
  });

  document.getElementById('preset-select').addEventListener('change', (e) => {
    initPlant(e.target.value);
  });

  document.getElementById('mode-select').addEventListener('change', (e) => {
    state.mode = e.target.value;
    state.guidedStepIndex = 0;
    document.getElementById('guided-feedback').hidden = true;

    if (state.mode === 'guided-piloted-sg' && state.preset.arch !== 'PILOTED') {
      document.getElementById('preset-select').value = 'remi-piloted';
      initPlant('remi-piloted');
      state.mode = 'guided-piloted-sg';
    } else if (state.mode === 'guided-direct-sg' && state.preset.arch !== 'DIRECT') {
      document.getElementById('preset-select').value = 'dival-direct';
      initPlant('dival-direct');
      state.mode = 'guided-direct-sg';
    }
    renderAll();
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    initPlant(state.presetKey);
    document.getElementById('guided-feedback').hidden = true;
  });

  document.getElementById('btn-prev-step').addEventListener('click', () => {
    if (state.guidedStepIndex > 0) {
      state.guidedStepIndex--;
      document.getElementById('guided-feedback').hidden = true;
      renderAll();
    }
  });

  document.getElementById('btn-next-step').addEventListener('click', () => {
    const steps = GUIDED_PROCEDURES[state.mode];
    if (steps && state.guidedStepIndex < steps.length - 1) {
      state.guidedStepIndex++;
      document.getElementById('guided-feedback').hidden = true;
      renderAll();
    }
  });

  document.getElementById('btn-check-step').addEventListener('click', () => {
    const steps = GUIDED_PROCEDURES[state.mode];
    if (!steps) return;
    const res = steps[state.guidedStepIndex].check(state);
    const fb = document.getElementById('guided-feedback');
    fb.hidden = false;
    fb.textContent = res.msg;
    fb.className = `guided-feedback ${res.ok ? 'ok' : 'warn'}`;
    if (res.ok && state.guidedStepIndex < steps.length - 1) {
      setTimeout(() => {
        state.guidedStepIndex++;
        fb.hidden = true;
        renderAll();
      }, 2800);
    }
  });

  document.getElementById('testbox-target').addEventListener('change', (e) => {
    state.testbox.target = e.target.value;
    state.testbox.pressure = state.pdManifold > 0 ? state.pdManifold : state.preset.line1.regSet;
    document.getElementById('testbox-slider').value = state.testbox.pressure;
    recalculatePhysics();
    renderAll();
  });

  const pumpSlider = document.getElementById('testbox-slider');
  pumpSlider.addEventListener('input', (e) => {
    state.testbox.pressure = parseFloat(e.target.value);
    if (!CSS.supports('accent-color', '#0ea5e9')) {
      const pct = (state.testbox.pressure / state.preset.pumpMax) * 100;
      e.target.style.setProperty('--progress', `${pct}%`);
    }
    recalculatePhysics();
    renderAll();
  });

  document.querySelectorAll('[data-pump-delta]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (state.testbox.target === 'none') return;
      const rawDelta = parseFloat(btn.getAttribute('data-pump-delta'));
      const factor = state.preset.unit === 'mbar' ? 25 : 1;
      const nextP = Math.max(
        0,
        Math.min(state.preset.pumpMax, +(state.testbox.pressure + rawDelta * factor).toFixed(2))
      );
      state.testbox.pressure = nextP;
      pumpSlider.value = nextP;
      recalculatePhysics();
      renderAll();
    });
  });

  document.getElementById('btn-pump-sync').addEventListener('click', () => {
    state.testbox.pressure = state.preset.line1.regSet;
    pumpSlider.value = state.testbox.pressure;
    recalculatePhysics();
    renderAll();
  });

  const flowSlider = document.getElementById('flow-slider');
  flowSlider.addEventListener('input', (e) => {
    state.flowDemand = parseInt(e.target.value, 10);
    if (!CSS.supports('accent-color', '#0ea5e9')) {
      const pct = (state.flowDemand / state.preset.maxFlow) * 100;
      e.target.style.setProperty('--progress', `${pct}%`);
    }
    recalculatePhysics();
    renderAll();
  });

  document.getElementById('chk-fault-seat1').addEventListener('change', (e) => {
    state.faultSeat1Leak = e.target.checked;
    addLog(
      state.faultSeat1Leak
        ? 'ANOMALIA ATTIVATA: Trafilamento sede Otturatore Regolatore Principale L1.'
        : 'Sede Otturatore Regolatore L1 ripristinata.',
      state.faultSeat1Leak ? 'warn' : 'ok'
    );
    recalculatePhysics();
    renderAll();
  });

  document.getElementById('chk-fault-monseat1').addEventListener('change', (e) => {
    state.faultMonSeat1Leak = e.target.checked;
    addLog(
      state.faultMonSeat1Leak
        ? 'ANOMALIA ATTIVATA: Trafilamento sede Otturatore MONITOR L1! (Se chiudi il Regolatore L1 e apri/chiudi lo Sfiato del Tronchetto, vedrai la pressione nel Tronchetto risalire a Pu!).'
        : 'Sede Otturatore Monitor L1 ripristinata.',
      state.faultMonSeat1Leak ? 'warn' : 'ok'
    );
    recalculatePhysics();
    renderAll();
  });

  document.getElementById('chk-fault-pilot1').addEventListener('change', (e) => {
    state.faultPilot1Leak = e.target.checked;
    addLog(
      state.faultPilot1Leak
        ? 'ANOMALIA ATTIVATA: Trafilamento ugello Pilota L1.'
        : 'Ugello Pilota L1 ripristinato.',
      state.faultPilot1Leak ? 'warn' : 'ok'
    );
    recalculatePhysics();
    renderAll();
  });

  document.getElementById('chk-fault-rupture1').addEventListener('change', (e) => {
    state.faultRupture1 = e.target.checked;
    addLog(
      state.faultRupture1
        ? 'GUASTO ATTIVATO: Rottura membrana Regolatore L1! Il Regolatore L1 si spalanca, entra in lavoro il Monitor L1 e la pressione nel TRONCHETTO crolla da Pu alla Pressione di Valle!'
        : 'Membrana Regolatore L1 ripristinata (il Tronchetto torna a Pu).',
      state.faultRupture1 ? 'warn' : 'ok'
    );
    recalculatePhysics();
    renderAll();
  });

  const manualDialog = document.getElementById('manual-dialog');
  document.getElementById('btn-open-manual').addEventListener('click', () => {
    manualDialog.showModal();
  });

  manualDialog.addEventListener('close', () => {
    manualDialog.returnValue = '';
  });

  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = outside(e, dialog);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e, dialog)) dialog.close();
      });
    }
  }

  initPlant('remi-piloted');
});
