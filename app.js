/**
 * Simulatore Verifiche Funzionali Gas - Cabina REMI / GRF (UNI/PdR 39 - Tipo 3)
 * Modello pneumatico real-time per riduttori Pietro Fiorentini (Aperflux, Reval, Dival),
 * Monitor in serie, Blocchi OPSO/UPSO (SB/82, LA), Seconda Linea di Riserva e Valvola di Sfioro.
 */

const PRESETS = {
  'remi-ap': {
    id: 'remi-ap',
    name: 'Cabina REMI 1ª→4ª Specie (Aperflux 851 + Monitor + SB/82)',
    unit: 'bar',
    decimals: 2,
    pu: 24.0,
    nominalFlow: 450,
    maxFlow: 1000,
    pumpMax: 3.0,
    pumpStep: 0.01,
    fineStep: 0.02,
    coarseStep: 0.10,
    sgAllowance: 0.08, // sovrapressione di chiusura fisiologica
    leakRate: 0.45,    // sovrapressione in caso di trafilamento sede
    line1: {
      regModel: 'Pietro Fiorentini Aperflux 851 (Az. Pilotata)',
      monModel: 'Pietro Fiorentini Aperflux 851 Monitor',
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
  'grf-mp': {
    id: 'grf-mp',
    name: 'Gruppo GRF 4ª→7ª Specie (Reval 182 / Norval + Blocco)',
    unit: 'mbar',
    puUnit: 'bar',
    decimals: 1,
    pu: 5.0,
    nominalFlow: 250,
    maxFlow: 600,
    pumpMax: 60.0,
    pumpStep: 0.5,
    fineStep: 0.5,
    coarseStep: 2.0,
    sgAllowance: 1.5,
    leakRate: 9.5,
    line1: {
      regModel: 'Pietro Fiorentini Reval 182 / Norval',
      monModel: 'Pietro Fiorentini Reval 182 Monitor',
      blkModel: 'Dispositivo di Blocco SB / LA',
      regSet: 22.0,
      monSet: 26.0,
      blkMax: 35.0,
      blkMin: 12.0
    },
    line2: {
      regModel: 'Pietro Fiorentini Reval 182 (2ª Linea)',
      monModel: 'Pietro Fiorentini Reval 182 Monitor L2',
      blkModel: 'Dispositivo di Blocco SB / LA',
      regSet: 19.5,
      monSet: 26.0,
      blkMax: 35.0,
      blkMin: 12.0
    },
    vsSet: 29.0
  },
  'dival-bp': {
    id: 'dival-bp',
    name: 'Gruppo Azione Diretta (Dival 600 + Blocco LA incorporato)',
    unit: 'mbar',
    puUnit: 'bar',
    decimals: 1,
    pu: 1.5,
    nominalFlow: 120,
    maxFlow: 300,
    pumpMax: 60.0,
    pumpStep: 0.5,
    fineStep: 0.5,
    coarseStep: 2.0,
    sgAllowance: 1.8,
    leakRate: 11.0,
    line1: {
      regModel: 'Pietro Fiorentini Dival 600 (Azione Diretta)',
      monModel: 'Monitor Incorporato / In Serie Dival',
      blkModel: 'Blocco Incorporato LA (OPSO/UPSO)',
      regSet: 23.0,
      monSet: 27.0,
      blkMax: 35.0,
      blkMin: 13.0
    },
    line2: {
      regModel: 'Pietro Fiorentini Dival 600 (2ª Linea Soccorso)',
      monModel: 'Monitor Incorporato / In Serie Dival L2',
      blkModel: 'Blocco Incorporato LA (OPSO/UPSO)',
      regSet: 20.0,
      monSet: 27.0,
      blkMax: 35.0,
      blkMin: 13.0
    },
    vsSet: 30.0
  }
};

// Procedure guidate Tipo 3
const GUIDED_PROCEDURES = {
  'guided-full': [
    {
      title: 'Passo 1: Verifica Seconda Linea e Scambio Linea (Isolamento Valle L1)',
      desc: 'Prima di eseguire le verifiche sulla Linea 1 senza interrompere l\'utenza, assicurati che la Seconda Linea (L2) sia pronta (V1-L2 aperta, SB-L2 armato, V2-L2 aperta) e chiudi la valvola di valle V2-L1. Osserva il collettore Pd scendere dolcemente sul set-point della 2ª Linea.',
      check: (s) => {
        if (!s.l2.v1Open || !s.l2.v2Open || !s.l2.sbArmed) {
          return { ok: false, msg: 'Attenzione: la Seconda Linea (L2) deve avere V1-L2 aperta, Blocco SB-L2 armato e V2-L2 aperta per sostenere l\'utenza!' };
        }
        if (s.l1.v2Open) {
          return { ok: false, msg: 'Chiudi la valvola di intercettazione di valle V2-L1 (clicca su V2-L1 nello schema e premi Chiudi).' };
        }
        return { ok: true, msg: 'Ottimo! La Seconda Linea ha preso in carico l\'utenza senza interruzioni e il tronco della Linea 1 è ora isolato a valle.' };
      }
    },
    {
      title: 'Passo 2: Verifica Tenuta Interna (Chiusura SG) Regolatore L1',
      desc: 'Con V2-L1 chiusa e sfiato SF-L1 chiuso (portata zero sulla L1), il regolatore principale L1 va in chiusura (lock-up). Verifica che lo sfiato SF-L1 sia chiuso e controlla la sovrapressione di chiusura (SG) sul manometro P tronco L1.',
      check: (s) => {
        if (s.l1.v2Open || s.l1.sfOpen) {
          return { ok: false, msg: 'Per verificare la chiusura statica (SG), sia V2-L1 che lo sfiato a candela SF-L1 devono essere chiusi.' };
        }
        return { ok: true, msg: `Verifica SG superata: P tronco L1 stabile a ${formatPressure(s.l1.pTrunk, s.preset)} (entro la classe di chiusura SG, nessun trafilamento sede).` };
      }
    },
    {
      title: 'Passo 3: Verifica Funzionale del Regolatore Monitor L1',
      desc: 'Per verificare che il Monitor L1 regoli correttamente al suo set-point (Pm1): 1) Apri leggermente lo sfiato a candela SF-L1 per creare un flusso di prova nel tronco; 2) Isola/Escludi la presa d\'impulso del Regolatore Principale L1 (Imp.Reg L1 -> ESCLUSA/APERTA) così che il Monitor prenda il controllo del tronco.',
      check: (s) => {
        if (s.l1.v2Open) {
          return { ok: false, msg: 'Mantieni V2-L1 chiusa durante le prove sul tronco L1.' };
        }
        if (!s.l1.sfOpen) {
          return { ok: false, msg: 'Apri lo sfiato a candela SF-L1 per garantire la portata minima di regolazione del Monitor.' };
        }
        if (s.l1.regImpulseConnected) {
          return { ok: false, msg: 'Clicca su REG. PRINC. L1 o sul rubinetto Imp.Reg L1 ed escludi l\'impulso per mandare in presa il Monitor L1.' };
        }
        return { ok: true, msg: `Perfetto! Il Monitor L1 è entrato in lavoro regolando il tronco esattamente a ${formatPressure(s.l1.pTrunk, s.preset)}.` };
      }
    },
    {
      title: 'Passo 4: Ripristino Regolatore L1 e Isolamento Impulso Blocco SB-L1',
      desc: 'Ora rimetti in lavoro il Regolatore Principale L1 (ripristina Imp.Reg L1 e chiudi lo sfiato SF-L1). Poi prepara la prova del Blocco SB-L1: metti il rubinetto a 3 vie Imp.L1 in posizione TEST e collega la "Cassettina / Pompa di Prova" a "Presa Impulso Blocco SB-L1".',
      check: (s) => {
        if (!s.l1.regImpulseConnected || s.l1.sfOpen) {
          return { ok: false, msg: 'Ripristina prima Imp.Reg L1 in LINEA e chiudi lo sfiato a candela SF-L1.' };
        }
        if (s.l1.blkImpulseMode !== 'test') {
          return { ok: false, msg: 'Ruota il rubinetto presa d\'impulso del Blocco SB-L1 (Imp.L1) in posizione TEST (Isolato dalla linea).' };
        }
        if (s.testbox.target !== 'blk-l1') {
          return { ok: false, msg: 'Nel pannello "Cassettina / Pompa di Prova" a destra, seleziona "Presa Impulso Blocco SB-L1 (1ª Linea)".' };
        }
        return { ok: true, msg: 'Presa d\'impulso isolata e cassettina collegata correttamente! Sei pronto per testare le soglie OPSO e UPSO.' };
      }
    },
    {
      title: 'Passo 5: Test Scatto per Massima (OPSO) e Minima (UPSO) del Blocco SB-L1',
      desc: 'Usando lo slider o i pulsanti "+ Fine / ++" della Cassettina di Prova, fai salire la pressione fino a far scattare SB-L1 per Massima Pressione (OPSO). Poi riarma temporaneamente o fai scendere la pressione sotto la soglia di Minima (UPSO) per verificare entrambi gli scatti.',
      check: (s) => {
        if (!s.l1.testedMaxTrip && !s.l1.testedMinTrip) {
          return { ok: false, msg: 'Non hai ancora provocato lo scatto del Blocco SB-L1 con la pompa di prova. Aumenta la pressione oltre il set di Massima!' };
        }
        if (!s.l1.testedMaxTrip) {
          return { ok: false, msg: 'Hai testato la Minima, ora testa anche lo scatto per Massima Pressione (OPSO) salendo con la pompa oltre il set Max.' };
        }
        if (!s.l1.testedMinTrip) {
          return { ok: false, msg: 'Scatto di Massima registrato! Ora riarma il blocco (portando la pompa a valore normale) e poi scendi sotto la soglia di Minima (UPSO) per testare anche lo scatto di minima.' };
        }
        return { ok: true, msg: `Eccellente! Scatti OPSO (${s.l1.lastMaxTripVal}) e UPSO (${s.l1.lastMinTripVal}) verificati e certificati.` };
      }
    },
    {
      title: 'Passo 6: Riarmo Blocco SB-L1 e Ritorno in Servizio su 1ª Linea',
      desc: 'Concludi la verifica funzionale: 1) Scollega la pompa o riporta il rubinetto Imp.L1 in posizione LINEA; 2) Riarma la valvola di blocco SB-L1 (con by-pass di equalizzazione); 3) Riapri la valvola di valle V2-L1 per riportare la Linea 1 in erogazione attiva e la Seconda Linea in stand-by automatico.',
      check: (s) => {
        if (s.l1.blkImpulseMode !== 'line') {
          return { ok: false, msg: 'Riporta tassativamente il rubinetto presa d\'impulso Imp.L1 in posizione LINEA!' };
        }
        if (!s.l1.sbArmed) {
          return { ok: false, msg: 'Riarma la valvola di blocco SB-L1 cliccandoci sopra e premendo "Equalizza e Riarma Leva Blocco".' };
        }
        if (!s.l1.v1Open || !s.l1.v2Open) {
          return { ok: false, msg: 'Apri completamente V1-L1 e V2-L1 per rimettere in marcia attiva la Linea 1.' };
        }
        return { ok: true, msg: 'VERIFICA FUNZIONALE TIPO 3 COMPLETATA CON SUCCESSO! La Linea 1 è attiva a regime e la Seconda Linea è armata in stand-by automatico.' };
      }
    }
  ],
  'guided-block-l2': [
    {
      title: 'Passo 1: Isolamento Presa Impulso Blocco 2ª Linea (SB-L2)',
      desc: 'La Linea 1 è in servizio attivo. Per verificare il blocco SB-L2 della Seconda Linea senza disturbare il collettore: chiudi V2-L2 per sicurezza, metti il rubinetto Imp.L2 in posizione TEST e collega la Cassettina di Prova a "Presa Impulso Blocco SB-L2".',
      check: (s) => {
        if (s.l2.blkImpulseMode !== 'test' || s.testbox.target !== 'blk-l2') {
          return { ok: false, msg: 'Imposta il rubinetto Imp.L2 su TEST e collega la Cassettina di Prova a "Presa Impulso Blocco SB-L2 (2ª Linea)".' };
        }
        return { ok: true, msg: 'Camera del blocco SB-L2 isolata e collegata al manometro campione.' };
      }
    },
    {
      title: 'Passo 2: Verifica Scatto OPSO (Max) e UPSO (Min) su SB-L2',
      desc: 'Usa la pompa di prova per provocare lo scatto per Massima Pressione (OPSO) e per Minima Pressione (UPSO) sulla valvola di blocco della Seconda Linea SB-L2.',
      check: (s) => {
        if (!s.l2.testedMaxTrip || !s.l2.testedMinTrip) {
          return { ok: false, msg: 'Esegui sia la prova di scatto per Massima (OPSO) sia quella per Minima (UPSO) su SB-L2 tramite la pompa di prova.' };
        }
        return { ok: true, msg: 'Entrambe le soglie OPSO e UPSO della Seconda Linea sono state verificate!' };
      }
    },
    {
      title: 'Passo 3: Ripristino e Riarmo in Pronta Riserva della 2ª Linea',
      desc: 'Riporta il rubinetto Imp.L2 su LINEA, riarma la leva del blocco SB-L2 e assicurati che V1-L2 e V2-L2 siano aperte affinché la Seconda Linea torni in "Stand-by Automatico".',
      check: (s) => {
        if (s.l2.blkImpulseMode !== 'line' || !s.l2.sbArmed || !s.l2.v1Open || !s.l2.v2Open) {
          return { ok: false, msg: 'Assicurati che Imp.L2 sia in LINEA, SB-L2 sia ARMATO e le valvole V1-L2 e V2-L2 siano aperte.' };
        }
        return { ok: true, msg: 'Verifica Seconda Linea completata! La linea di riserva è armata e pronta a intervenire.' };
      }
    }
  ]
};

// Stato globale della simulazione
let state = {
  presetKey: 'remi-ap',
  preset: PRESETS['remi-ap'],
  mode: 'free',
  guidedStepIndex: 0,
  selectedComp: 'sb-l1',
  flowDemand: 450,
  faultReg1Open: false,
  faultReg1Leak: false,
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

function createLineState(cfg) {
  return {
    v1Open: true,
    v2Open: true,
    bpOpen: false,
    sbArmed: true,
    sbTripReason: null, // 'MAX (OPSO)' | 'MIN (UPSO)' | 'MANUALE'
    blkImpulseMode: 'line', // 'line' | 'test'
    regImpulseConnected: true,
    sfOpen: false,
    regSet: cfg.regSet,
    monSet: cfg.monSet,
    blkMax: cfg.blkMax,
    blkMin: cfg.blkMin,
    pTrunk: cfg.regSet,
    activeRole: 'ACTIVE', // 'ACTIVE' | 'MONITOR_WORK' | 'STANDBY' | 'ISOLATED' | 'TRIPPED'
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
  while (ul.children.length > 40) {
    ul.removeChild(ul.lastChild);
  }
}

function initPlant(presetKey) {
  const preset = PRESETS[presetKey] || PRESETS['remi-ap'];
  state.presetKey = preset.id;
  state.preset = preset;
  state.flowDemand = preset.nominalFlow;
  state.faultReg1Open = false;
  state.faultReg1Leak = false;
  state.vsSet = preset.vsSet;
  state.l1 = createLineState(preset.line1);
  state.l2 = createLineState(preset.line2);

  state.testbox.target = 'none';
  state.testbox.pressure = preset.line1.regSet;
  state.testbox.lastTripText = '—';

  // Aggiorna controlli DOM
  const flowSlider = document.getElementById('flow-slider');
  flowSlider.max = preset.maxFlow;
  flowSlider.value = state.flowDemand;

  const pumpSlider = document.getElementById('testbox-slider');
  pumpSlider.max = preset.pumpMax;
  pumpSlider.step = preset.pumpStep;
  pumpSlider.value = preset.line1.regSet;

  document.getElementById('testbox-target').value = 'none';
  document.getElementById('chk-fault-reg1').checked = false;
  document.getElementById('chk-fault-dirt1').checked = false;

  recalculatePhysics();
  renderAll();
  addLog(`Impianto inizializzato: ${preset.name}`, 'ok');
}

/**
 * Motore Fisico / Pneumatico Cabina REMI a Doppia Linea
 */
function recalculatePhysics() {
  const p = state.preset;
  const l1 = state.l1;
  const l2 = state.l2;

  // 1. Calcola la pressione obiettivo interna di ciascun tronco (a monte di V2)
  computeTrunkPressure(l1, 1);
  computeTrunkPressure(l2, 2);

  // 2. Valuta le pressioni lette dalle membrane dei blocchi SB-L1 e SB-L2
  checkSlamShut(l1, 'blk-l1', 'SB-L1 (1ª Linea)');
  checkSlamShut(l2, 'blk-l2', 'SB-L2 (2ª Linea)');

  // Ricalcola i tronchi se un blocco è appena scattato
  computeTrunkPressure(l1, 1);
  computeTrunkPressure(l2, 2);

  // 3. Calcola la pressione del Collettore di Valle (Pd)
  const l1CanFeed = (l1.v1Open || l1.bpOpen) && l1.sbArmed && l1.v2Open;
  const l2CanFeed = (l2.v1Open || l2.bpOpen) && l2.sbArmed && l2.v2Open;

  let pd = 0;
  if (l1CanFeed && l2CanFeed) {
    // Le due linee sono in parallelo sul collettore: vince la pressione più alta
    pd = Math.max(l1.pTrunk, l2.pTrunk);
    // Se il collettore è a pressione superiore al set-point della seconda linea, il regolatore L2 va in chiusura (Stand-by)
    if (pd > l2.regSet + (p.sgAllowance * 0.4)) {
      l2.pTrunk = pd;
      l2.activeRole = 'STANDBY';
    } else {
      l2.activeRole = 'ACTIVE';
    }
  } else if (l1CanFeed) {
    pd = l1.pTrunk;
    if (l2.v2Open) l2.pTrunk = pd;
  } else if (l2CanFeed) {
    pd = l2.pTrunk;
    if (l1.v2Open) l1.pTrunk = pd;
  } else {
    // Nessuna linea alimenta il collettore: se c'è richiesta d'utenza, la pressione crolla a 0
    pd = state.flowDemand > 0 ? 0.0 : pd;
  }

  // 4. Controlla intervento Valvola di Sfioro (VS) sul collettore o tramite pompa di prova
  const vsSenseP = state.testbox.target === 'vs' ? state.testbox.pressure : pd;
  state.vsVenting = vsSenseP >= state.vsSet;

  // Se la valvola di sfioro scarica in rete reale, limita leggermente il picco
  if (state.vsVenting && state.testbox.target !== 'vs' && pd > state.vsSet) {
    pd = Math.min(pd, state.vsSet + p.sgAllowance);
  }

  state.pdManifold = pd;

  // Riverifica se la variazione di collettore fa scattare un blocco con impulso in linea
  checkSlamShut(l1, 'blk-l1', 'SB-L1 (1ª Linea)');
  checkSlamShut(l2, 'blk-l2', 'SB-L2 (2ª Linea)');

  // 5. Determina stato sintetico dell'impianto
  if (!l1CanFeed && !l2CanFeed) {
    state.supplyStatus = 'OUTAGE';
  } else if (!l1CanFeed && l2CanFeed) {
    state.supplyStatus = 'L2_EMERGENCY';
  } else if (l1.activeRole === 'MONITOR_WORK') {
    state.supplyStatus = 'L1_MONITOR';
  } else {
    state.supplyStatus = 'OK_L1';
  }
}

function computeTrunkPressure(line, lineNum) {
  const p = state.preset;
  const upstreamAvailable = line.v1Open || line.bpOpen;

  if (!upstreamAvailable || !line.sbArmed) {
    // Se lo sfiato a candela è aperto o V2 è aperta con domanda > 0, il tronco si scarica
    if (line.sfOpen) {
      line.pTrunk = 0;
    } else if (!line.v2Open) {
      // Mantiene la pressione intrappolata o scende leggermente
      line.pTrunk = Math.max(0, line.pTrunk);
    }
    line.activeRole = !line.sbArmed ? 'TRIPPED' : 'ISOLATED';
    return;
  }

  // Se alimentato da monte e blocco armato:
  // Qual è la pressione che il regolatore principale cerca di mantenere?
  const isRegFaultOpen = (lineNum === 1 && state.faultReg1Open) || !line.regImpulseConnected;
  const isRegLeaking = (lineNum === 1 && state.faultReg1Leak);

  let targetP = line.regSet;
  if (isRegFaultOpen) {
    // Il regolatore principale è spalancato -> interviene il Regolatore MONITOR in serie!
    targetP = line.monSet;
    line.activeRole = 'MONITOR_WORK';
  } else {
    line.activeRole = 'ACTIVE';
  }

  // Portata che attraversa questa linea:
  const hasFlow = (line.v2Open && state.flowDemand > 0) || line.sfOpen;

  if (!hasFlow) {
    // Portata Zero -> Sovrapressione di chiusura (SG)
    targetP += p.sgAllowance;
    if (isRegLeaking) {
      targetP += p.leakRate;
      // Il Monitor cerca comunque di limitare al suo set + SG a meno che non trafili anche lui
      targetP = Math.min(targetP, line.monSet + p.sgAllowance * 1.5);
    }
  }

  line.pTrunk = targetP;
}

function checkSlamShut(line, targetId, label) {
  if (!line.sbArmed) return;

  // Quale pressione sente la testata del blocco?
  let sensedP = line.pTrunk;
  if (line.blkImpulseMode === 'test') {
    if (state.testbox.target === targetId) {
      sensedP = state.testbox.pressure;
    } else {
      // Isolato a rubinetto chiuso senza pompa attiva: mantiene la pressione statica
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

/**
 * Rendering completo P&ID SVG + KPI + Pannello Inspector
 */
function renderAll() {
  const p = state.preset;
  const l1 = state.l1;
  const l2 = state.l2;

  // KPI Top
  document.getElementById('kpi-pu').textContent = `${p.pu.toFixed(1).replace('.', ',')} bar`;
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
    statusEl.textContent = 'EMERGENZA MONITOR L1';
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

  // Manometri SVG
  document.getElementById('svg-gauge-pu').textContent = `${p.pu.toFixed(1)}`;
  document.getElementById('svg-gauge-l1').textContent = formatShort(l1.pTrunk, p);
  document.getElementById('svg-gauge-l2').textContent = formatShort(l2.pTrunk, p);
  document.getElementById('svg-gauge-pd').textContent = formatShort(state.pdManifold, p);

  // Render Linea 1 e Linea 2
  renderLineSVG(1, l1);
  renderLineSVG(2, l2);

  // Valvola di Sfioro (VS)
  document.getElementById('sub-vs').textContent = `Set: ${formatShort(state.vsSet, p)} ${p.unit}`;
  const shapeVs = document.getElementById('shape-vs');
  shapeVs.setAttribute('class', state.vsVenting ? 'relief-venting' : 'relief-closed');

  // Evidenziazione componente selezionato
  document.querySelectorAll('.svg-interactive').forEach((el) => {
    const compId = el.id.replace('svg-btn-', '');
    el.classList.toggle('selected-comp', compId === state.selectedComp);
  });

  // Render Testbox (Cassettina di prova)
  renderTestbox();

  // Render Inspector
  renderInspector();

  // Render Banner Procedura Guidata
  renderGuidedBanner();
}

function renderLineSVG(num, line) {
  const p = state.preset;
  const sfx = `l${num}`;

  // Valvole V1, V2, BP
  document.getElementById(`shape-v1-${sfx}`).setAttribute('class', line.v1Open ? 'valve-open' : 'valve-closed');
  document.getElementById(`shape-v2-${sfx}`).setAttribute('class', line.v2Open ? 'valve-open' : 'valve-closed');
  document.getElementById(`shape-bp-${sfx}`).setAttribute('class', line.bpOpen ? 'valve-open' : 'valve-closed');

  // Blocco SB
  const headSb = document.getElementById(`head-sb-${sfx}`);
  const txtSb = document.getElementById(`txt-sb-${sfx}`);
  headSb.setAttribute('class', line.sbArmed ? 'slam-armed' : 'slam-tripped');
  txtSb.textContent = line.sbArmed ? 'ARMATO' : 'BLOCCATO';
  document.getElementById(`sub-sb-${sfx}`).textContent =
    `Max ${formatShort(line.blkMax, p)} | Min ${formatShort(line.blkMin, p)}`;

  // Rubinetto impulso Blocco
  const dotRblk = document.getElementById(`dot-rblk-${sfx}`);
  const lblRblk = document.getElementById(`lbl-rblk-${sfx}`);
  const impBlk = document.getElementById(`imp-blk-${sfx}`);
  if (line.blkImpulseMode === 'line') {
    dotRblk.setAttribute('class', 'cock-open');
    lblRblk.textContent = `Imp.L${num}: LINEA`;
    impBlk.setAttribute('class', 'impulse-line');
  } else {
    dotRblk.setAttribute('class', 'cock-test');
    lblRblk.textContent = `Imp.L${num}: TEST`;
    impBlk.setAttribute('class', 'impulse-line impulse-test-active');
  }

  // Rubinetto impulso Regolatore
  const dotRreg = document.getElementById(`dot-rreg-${sfx}`);
  const lblRreg = document.getElementById(`lbl-rreg-${sfx}`);
  dotRreg.setAttribute('class', line.regImpulseConnected ? 'cock-open' : 'cock-test');
  lblRreg.textContent = line.regImpulseConnected ? 'Imp.Reg: ON' : 'Imp.Reg: OFF';

  // Candela di Sfiato SF
  const dotSf = document.getElementById(`dot-sf-${sfx}`);
  const lblSf = document.getElementById(`lbl-sf-${sfx}`);
  dotSf.setAttribute('class', line.sfOpen ? 'cock-test' : 'cock-closed');
  lblSf.textContent = line.sfOpen ? `SF-L${num}: APERTO` : `Sfiato SF-L${num}`;

  // Setpoint labels
  document.getElementById(`sub-mon-${sfx}`).textContent = `Set: ${formatShort(line.monSet, p)} ${p.unit}`;
  document.getElementById(`sub-reg-${sfx}`).textContent = `Set: ${formatShort(line.regSet, p)} ${p.unit}`;

  // Colori Regolatore e Monitor e Badge di Linea
  const shapeReg = document.getElementById(`shape-reg-${sfx}`);
  const shapeMon = document.getElementById(`shape-mon-${sfx}`);
  const badge = document.getElementById(`svg-${sfx}-badge`);
  const pipeMid = document.getElementById(`pipe-${sfx}-mid`);

  if (!line.sbArmed) {
    badge.textContent = `BLOCCO INTERVENUTO (${line.sbTripReason})`;
    badge.setAttribute('class', 'line-status-badge badge-tripped');
    shapeReg.setAttribute('class', 'reg-fault');
    pipeMid.setAttribute('class', 'pipe-segment pipe-zero-stroke');
  } else if (!line.v1Open && !line.bpOpen) {
    badge.textContent = 'ISOLATA MONTE';
    badge.setAttribute('class', 'line-status-badge badge-isolated');
    shapeReg.setAttribute('class', 'reg-standby');
    pipeMid.setAttribute('class', 'pipe-segment pipe-zero-stroke');
  } else if (!line.v2Open) {
    badge.textContent = line.sfOpen ? 'IN PROVA CON SFIATO ATTIVO' : 'TRONCO ISOLATO VALLE (PROVA SG)';
    badge.setAttribute('class', 'line-status-badge badge-standby');
    shapeReg.setAttribute('class', line.activeRole === 'MONITOR_WORK' ? 'reg-fault' : 'reg-active');
    shapeMon.setAttribute('class', line.activeRole === 'MONITOR_WORK' ? 'reg-active' : 'reg-monitor');
    pipeMid.setAttribute('class', 'pipe-segment pipe-warn-stroke');
  } else if (line.activeRole === 'MONITOR_WORK') {
    badge.textContent = 'IN SERVIZIO SU MONITOR!';
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
    badge.textContent = 'IN EROGAZIONE ATTIVA';
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

/**
 * Pannello Contestuale per manovrare l'organo cliccato nello schema P&ID
 */
function renderInspector() {
  const id = state.selectedComp;
  const p = state.preset;
  const tagEl = document.getElementById('inspector-tag');
  const titleEl = document.getElementById('inspector-title');
  const descEl = document.getElementById('inspector-desc');
  const ctrlsEl = document.getElementById('inspector-controls');
  ctrlsEl.innerHTML = '';

  const isL2 = id.endsWith('l2');
  const line = isL2 ? state.l2 : state.l1;
  const lineCfg = isL2 ? p.line2 : p.line1;
  const lineLabel = isL2 ? '2ª Linea (Riserva)' : '1ª Linea (Principale)';

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
      ? 'Valvola a sfera/maschio di isolamento a valle della linea. Chiudila gradualmente per effettuare lo scambio linea o isolare il tronco per le prove di tenuta (SG), Monitor e Blocco.'
      : isV1
      ? 'Valvola di intercettazione principale d\'ingresso linea ad alta pressione (Pu).'
      : 'By-pass di pressurizzazione lenta del tronco a monte per equalizzare la pressione prima di aprire V1 o riarmare i dispositivi.';

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
      'Valvola di blocco automatico per sovrapressione (OPSO) e sottopressione (UPSO). Dotata di rubinetto a 3 vie sulla presa d\'impulso per prove strumentali e leva di riarmo manuale con by-pass interno.';

    ctrlsEl.innerHTML = `
      <div class="inspector-stat-row">
        <span>Stato Otturatore:</span>
        <strong class="${line.sbArmed ? 'status-ok' : 'status-danger'}">
          ${line.sbArmed ? 'ARMATO (Aperto)' : `SCATTATO (${line.sbTripReason})`}
        </strong>
      </div>
      <div class="inspector-stat-row">
        <span>Taratura Scatto Max (OPSO):</span>
        <strong>${formatPressure(line.blkMax, p)}</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Taratura Scatto Min (UPSO):</span>
        <strong>${formatPressure(line.blkMin, p)}</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Rubinetto Presa Impulso:</span>
        <strong class="${line.blkImpulseMode === 'line' ? 'status-ok' : 'status-warn'}">
          ${line.blkImpulseMode === 'line' ? 'IN LINEA (Normale)' : 'ISOLATO / POSIZIONE TEST'}
        </strong>
      </div>
      <div class="inspector-btn-row">
        <button type="button" class="btn btn-sm btn-outline" id="act-toggle-blk-imp">
          Commuta Rubinetto Impulso (${line.blkImpulseMode === 'line' ? 'Passa a TEST' : 'Torna in LINEA'})
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
        `Rubinetto presa d'impulso ${isL2 ? 'SB-L2' : 'SB-L1'} portato in posizione: ${
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
      addLog(`Cassettina di prova collegata alla presa test di ${isL2 ? 'SB-L2' : 'SB-L1'}.`, 'info');
      recalculatePhysics();
      renderAll();
    });

    document.getElementById('act-rearm-sb').addEventListener('click', () => {
      // Verifica se la pressione nella camera impulso consente il riarmo
      const targetId = isL2 ? 'blk-l2' : 'blk-l1';
      const sensedP =
        line.blkImpulseMode === 'test' && state.testbox.target === targetId
          ? state.testbox.pressure
          : line.regSet;

      if (sensedP >= line.blkMax || sensedP <= line.blkMin) {
        addLog(
          `Impossibile riarmare ${isL2 ? 'SB-L2' : 'SB-L1'}: la pressione nella testata (${formatPressure(
            sensedP,
            p
          )}) è ancora fuori dal campo [${formatShort(line.blkMin, p)} ÷ ${formatShort(line.blkMax, p)} ${
            p.unit
          }]! Riporta prima la pressione di prova a valore nominale.`,
          'trip'
        );
        return;
      }

      line.sbArmed = true;
      line.sbTripReason = null;
      line.pTrunk = line.regSet;
      addLog(`Valvola di blocco ${isL2 ? 'SB-L2' : 'SB-L1'} equalizzata e RIARMATA correttamente.`, 'ok');
      recalculatePhysics();
      renderAll();
    });

    document.getElementById('act-manual-trip').addEventListener('click', () => {
      line.sbArmed = false;
      line.sbTripReason = 'PULSANTE MANUALE';
      addLog(`Eseguito test di sgancio meccanico manuale su ${isL2 ? 'SB-L2' : 'SB-L1'}.`, 'warn');
      recalculatePhysics();
      renderAll();
    });
    return;
  }

  if (id.startsWith('reg-') || id.startsWith('rreg-')) {
    tagEl.textContent = `REGOLAZIONE PRINCIPALE · ${lineLabel}`;
    titleEl.textContent = lineCfg.regModel;
    descEl.textContent =
      'Regolatore di pressione con dispositivo pilota/molla di taratura. Per verificare l\'entrata in servizio del Monitor in serie, puoi escludere temporaneamente la presa d\'impulso del regolatore principale (che si porterà in apertura).';

    ctrlsEl.innerHTML = `
      <div class="inspector-stat-row">
        <span>Set-point Taratura (Pd):</span>
        <strong>${formatPressure(line.regSet, p)}</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Pressione Tronco Attuale:</span>
        <strong>${formatPressure(line.pTrunk, p)}</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Presa d'Impulso Pilota:</span>
        <strong class="${line.regImpulseConnected ? 'status-ok' : 'status-warn'}">
          ${line.regImpulseConnected ? 'CONNESSA IN LINEA' : 'ESCLUSA (Forza Monitor)'}
        </strong>
      </div>
      <div class="inspector-btn-row">
        <button type="button" class="btn btn-xs btn-outline" id="act-reg-minus">Vite Taratura -</button>
        <button type="button" class="btn btn-xs btn-outline" id="act-reg-plus">Vite Taratura +</button>
        <button type="button" class="btn btn-sm btn-outline" id="act-toggle-reg-imp">
          ${line.regImpulseConnected ? 'Escludi Impulso (Prova Monitor)' : 'Riconnetti Impulso in Linea'}
        </button>
      </div>
    `;

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

    document.getElementById('act-toggle-reg-imp').addEventListener('click', () => {
      line.regImpulseConnected = !line.regImpulseConnected;
      addLog(
        `Presa d'impulso Regolatore ${isL2 ? 'L2' : 'L1'}: ${
          line.regImpulseConnected ? 'RICONNESSA (Regolatore attivo)' : 'ESCLUSA (Regolatore spalancato -> Entra il Monitor)'
        }`,
        line.regImpulseConnected ? 'ok' : 'warn'
      );
      recalculatePhysics();
      renderAll();
    });
    return;
  }

  if (id.startsWith('mon-')) {
    tagEl.textContent = `ORGANO DI EMERGENZA IN SERIE · ${lineLabel}`;
    titleEl.textContent = lineCfg.monModel;
    descEl.textContent =
      'Regolatore di emergenza in serie (Monitor). In condizioni normali è mantenuto completamente aperto perché legge una pressione inferiore al proprio set-point. Se il regolatore principale fallisce in apertura, il Monitor subentra istantaneamente.';

    ctrlsEl.innerHTML = `
      <div class="inspector-stat-row">
        <span>Set-point Monitor (Pm):</span>
        <strong>${formatPressure(line.monSet, p)}</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Stato Operativo:</span>
        <strong class="${line.activeRole === 'MONITOR_WORK' ? 'status-warn' : 'status-ok'}">
          ${line.activeRole === 'MONITOR_WORK' ? 'IN REGOLAZIONE ATTIVA!' : 'APerto in Sorveglianza'}
        </strong>
      </div>
      <div class="inspector-btn-row">
        <button type="button" class="btn btn-xs btn-outline" id="act-mon-minus">Vite Monitor -</button>
        <button type="button" class="btn btn-xs btn-outline" id="act-mon-plus">Vite Monitor +</button>
      </div>
    `;

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

  if (id.startsWith('sf-')) {
    tagEl.textContent = `SFIATO A CANDELA · ${lineLabel}`;
    titleEl.textContent = `Rubinetto di Sfiato Tronco SF-${isL2 ? 'L2' : 'L1'}`;
    descEl.textContent =
      'Valvola a spillo di sfiato verso candela esterna. Utile con V2 chiusa per creare una piccola portata di prova durante la taratura del Regolatore/Monitor o per depressurizzare il tronco.';

    ctrlsEl.innerHTML = `
      <div class="inspector-stat-row">
        <span>Stato Rubinetto Sfiato:</span>
        <strong class="${line.sfOpen ? 'status-warn' : 'status-ok'}">
          ${line.sfOpen ? 'APERTO (Scarico in atmosfera)' : 'CHIUSO'}
        </strong>
      </div>
      <div class="inspector-btn-row">
        <button type="button" class="btn btn-sm ${line.sfOpen ? 'btn-secondary' : 'btn-primary'}" id="act-toggle-sf">
          ${line.sfOpen ? 'Chiudi Sfiato SF' : 'Apri Sfiato a Candela SF'}
        </button>
      </div>
    `;

    document.getElementById('act-toggle-sf').addEventListener('click', () => {
      line.sfOpen = !line.sfOpen;
      addLog(`Rubinetto di sfiato SF-${isL2 ? 'L2' : 'L1'}: ${line.sfOpen ? 'APERTO' : 'CHIUSO'}`, 'info');
      recalculatePhysics();
      renderAll();
    });
    return;
  }

  if (id === 'vs') {
    tagEl.textContent = 'PRESIDIO COLLETTORE VALLE';
    titleEl.textContent = 'Valvola di Sfioro (VS)';
    descEl.textContent =
      'Dispositivo di scarico a molla tarato tra il set-point del Monitor e il Blocco di Massima. Assorbe piccoli trafilamenti o dilatazioni termiche senza far scattare il blocco di linea.';

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
      addLog('Cassettina di prova collegata alla presa test della Valvola di Sfioro (VS).', 'info');
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

/**
 * Inizializzazione Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
  // Click sui componenti dello schema SVG
  document.querySelectorAll('.svg-interactive').forEach((el) => {
    el.addEventListener('click', () => {
      const compId = el.id.replace('svg-btn-', '');
      // Mappa i rubinetti ai rispettivi organi principali o mostra direttamente
      state.selectedComp = compId;
      renderAll();
    });
  });

  // Selezione Preset Impianto
  document.getElementById('preset-select').addEventListener('change', (e) => {
    initPlant(e.target.value);
  });

  // Selezione Modalità Operativa
  document.getElementById('mode-select').addEventListener('change', (e) => {
    state.mode = e.target.value;
    state.guidedStepIndex = 0;
    document.getElementById('guided-feedback').hidden = true;

    if (state.mode === 'fault-sim') {
      initPlant(state.presetKey);
      state.mode = 'fault-sim';
      state.faultReg1Open = true;
      document.getElementById('chk-fault-reg1').checked = true;
      addLog(
        'SCENARIO GUASTO ATTIVATO: Rottura membrana Regolatore 1ª Linea! Osserva il subentro del Monitor L1 (e se aumenti la pressione o scatta SB-L1, il subentro automatico della 2ª Linea).',
        'warn'
      );
      recalculatePhysics();
    }
    renderAll();
  });

  // Pulsante Reset
  document.getElementById('btn-reset').addEventListener('click', () => {
    initPlant(state.presetKey);
    document.getElementById('guided-feedback').hidden = true;
  });

  // Pulsanti Procedura Guidata
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
      }, 2200);
    }
  });

  // Controlli Cassettina di Prova
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
      // Scala il passo in base al preset (bar vs mbar)
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

  // Controllo Portata Utenza (Q)
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

  // Simulazione Guasti
  document.getElementById('chk-fault-reg1').addEventListener('change', (e) => {
    state.faultReg1Open = e.target.checked;
    addLog(
      state.faultReg1Open
        ? 'GUASTO SIMULATO: Rottura membrana Regolatore Principale L1 (apertura totale)!'
        : 'Guasto membrana Regolatore L1 rimosso.',
      state.faultReg1Open ? 'warn' : 'ok'
    );
    recalculatePhysics();
    renderAll();
  });

  document.getElementById('chk-fault-dirt1').addEventListener('change', (e) => {
    state.faultReg1Leak = e.target.checked;
    addLog(
      state.faultReg1Leak
        ? 'ANOMALIA SIMULATA: Impurità sulla sede otturatore Regolatore L1 (trafilamento a portata zero / SG fuori tolleranza).'
        : 'Sede otturatore Regolatore L1 pulita.',
      state.faultReg1Leak ? 'warn' : 'ok'
    );
    recalculatePhysics();
    renderAll();
  });

  // Dialog Manuale Tecnico (con fallback closedby per browser senza supporto nativo)
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

  // Avvio iniziale
  initPlant('remi-ap');
});
