/**
 * Simulatore Verifiche Funzionali Gas - Cabina REMI / GRF (UNI/PdR 39 - Tipo 3)
 * Gestione differenziata:
 * 1) Regolatori PILOTATI (Fail-Close, es. Pietro Fiorentini Aperflux 851 / Reflux 819 / Reval 182 Pilotato)
 *    con Preriduttore (R14), Rubinetto Alimentazione Pilota, Pressione Motrice (Pmot), Presa d'Impulso (Tronco vs Valle V2)
 *    e verifica SG / diagnostica differenziale Pilota vs Sede Otturatore.
 * 2) Regolatori ad AZIONE DIRETTA (Fail-Open, es. Pietro Fiorentini Dival 600 / Norval)
 *    con azione diretta molla/membrana, verifica SG per spinta diretta su membrana e prova Monitor.
 */

const PRESETS = {
  'remi-piloted': {
    id: 'remi-piloted',
    arch: 'PILOTED', // Fail-Close: necessita di Pmot generata dal pilota alimentato da monte
    name: 'Cabina REMI Pilotata [FAIL-CLOSE] (Aperflux 851 + Pilota 204/A + Preriduttore R14)',
    archSubtitle:
      'Architettura: <strong>REGOLATORI PILOTATI (Normalmente Chiusi / Fail-Close)</strong> — Richiedono Alimentazione Pilota (Pmot) per aprire; la presa d\'impulso comanda la modulazione e l\'SG',
    unit: 'bar',
    decimals: 2,
    pu: 24.0,
    nominalFlow: 450,
    maxFlow: 1000,
    pumpMax: 3.0,
    pumpStep: 0.01,
    fineStep: 0.02,
    sgAllowance: 0.03, // SG strettissimo tipico dei pilotati (Classe SG 2,5: +0,03 bar)
    seatLeakDelta: 0.55, // Incremento anomalo per trafilamento sede otturatore
    pilotLeakDelta: 0.32, // Incremento anomalo per trafilamento ugello pilota/preriduttore
    pilotSupplyNominal: 3.20, // Pressione uscita preriduttore R14 (Pd + ~1,7 bar)
    defaultImpulseTap: 'manifold', // Nei pilotati REMI spesso l'impulso legge a valle di V2 e va commutato sul tronco per l'SG!
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
      'Architettura: <strong>GRF CON REGOLATORI PILOTATI (Fail-Close)</strong> — Bassa pressione con altissima precisione (AC 2,5 / SG 5) governata da pilota e presa d\'impulso',
    unit: 'mbar',
    decimals: 1,
    pu: 5.0,
    nominalFlow: 250,
    maxFlow: 600,
    pumpMax: 60.0,
    pumpStep: 0.5,
    fineStep: 0.5,
    sgAllowance: 0.8, // +0,8 mbar in chiusura con pilota sano
    seatLeakDelta: 11.0,
    pilotLeakDelta: 6.5,
    pilotSupplyNominal: 150.0, // mbar motrice pilota
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
    arch: 'DIRECT', // Fail-Open: la molla apre direttamente l'otturatore, la presa d'impulso spinge sulla membrana per chiudere
    name: 'GRF Azione Diretta [FAIL-OPEN] (Dival 600 / Norval Molla Diretta)',
    archSubtitle:
      'Architettura: <strong>REGOLATORI AD AZIONE DIRETTA (Normalmente Aperti / Fail-Open)</strong> — Assenza di pilota: la molla apre l\'otturatore e la pressione nella presa d\'impulso comprime direttamente la membrana per chiudere (SG)',
    unit: 'mbar',
    decimals: 1,
    pu: 1.5,
    nominalFlow: 120,
    maxFlow: 300,
    pumpMax: 60.0,
    pumpStep: 0.5,
    fineStep: 0.5,
    sgAllowance: 2.2, // SG più ampio (+2,2 mbar, Classe SG 10) necessario a vincere direttamente la rigidezza della molla
    seatLeakDelta: 12.0,
    pilotLeakDelta: 0.0,
    pilotSupplyNominal: 0,
    defaultImpulseTap: 'trunk', // Nei gruppi diretti compatti la presa d'impulso è tipicamente sul tronco prima di V2
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

/**
 * Procedure Guidate Step-by-Step con focus sulle differenze tra Regolatori Pilotati e Azione Diretta
 */
const GUIDED_PROCEDURES = {
  'guided-piloted-sg': [
    {
      title: 'Passo 1 (Reg. Pilotato): Osserva l\'effetto della Presa d\'Impulso a Valle di V2 durante lo Scambio Linea',
      desc: 'In una cabina con Regolatori Pilotati, spesso la presa d\'impulso legge il Collettore a VALLE di V2. Chiudi ora la valvola di valle V2-L1: vedrai che il collettore passa sulla 2ª Linea (1,35 bar), ma poiché l\'impulso del pilota L1 legge ancora il collettore (1,35 < 1,50 bar), il pilota L1 NON va in chiusura SG bensì SPALANCA il regolatore L1 (P tronco L1 sale al Monitor 1,65 bar)!',
      check: (s) => {
        if (s.preset.arch !== 'PILOTED') {
          return { ok: false, msg: 'Seleziona la configurazione "Cabina REMI Pilotata [FAIL-CLOSE]" in alto a sinistra.' };
        }
        if (s.l1.v2Open) {
          return { ok: false, msg: 'Clicca sulla valvola di valle V2-L1 e premi "Chiudi Valvola" per isolare la Linea 1.' };
        }
        return {
          ok: true,
          msg: `Esatto! Con V2-L1 chiusa e presa d'impulso su COLLETTORE (valle V2), il pilota L1 legge ${formatPressure(
            s.pdManifold,
            s.preset
          )} (< ${formatPressure(s.l1.regSet, s.preset)}), quindi manda la massima Pmot e fa salire il tronco L1 fino al Monitor (${formatPressure(
            s.l1.pTrunk,
            s.preset
          )})!`
        };
      }
    },
    {
      title: 'Passo 2 (Reg. Pilotato): Commutazione Presa d\'Impulso sul TRONCO e Innesco con Sfiato SF-L1',
      desc: 'Per verificare la Sovrapressione di Chiusura (SG) del regolatore pilotato L1: 1) Clicca su REG. PRINC. L1 (o su Imp.Reg) e commuta il "Punto di Presa Impulso" su TRONCO (a monte di V2); 2) Apri brevemente lo sfiato a candela SF-L1 per scaricare l\'eccesso accumulato e osservare il pilota modulare a 1,50 bar.',
      check: (s) => {
        if (s.l1.v2Open) {
          return { ok: false, msg: 'Mantieni V2-L1 chiusa.' };
        }
        if (s.l1.regImpulseTap !== 'trunk') {
          return {
            ok: false,
            msg: 'Clicca su REG. PRINC. L1 e imposta il Punto di Presa Impulso su "TRONCO (a monte di V2)".'
          };
        }
        if (!s.l1.sfOpen) {
          return {
            ok: false,
            msg: 'Ora apri lo sfiato a candela SF-L1 per far scendere la pressione del tronco al set-point del regolatore L1 (1,50 bar).'
          };
        }
        return {
          ok: true,
          msg: `Perfetto! Con l'impulso sul TRONCO e SF-L1 aperto, il pilota modula la pressione motrice (Pmot = ${formatPressure(
            s.l1.regPmot,
            s.preset
          )}) e mantiene il tronco a ${formatPressure(s.l1.pTrunk, s.preset)}.`
        };
      }
    },
    {
      title: 'Passo 3 (Reg. Pilotato): Chiusura Sfiato SF-L1 e Misura dell\'SG (Azzeramento Pmot)',
      desc: 'Richiudi ora lo sfiato a candela SF-L1 per portare la portata a ZERO. Osserva cosa fa il pilota: appena la pressione nel tronco sale di appena +0,03 bar (SG), la membrana del pilota chiude l\'ugello e scarica la pressione motrice (Pmot scende uguale a P tronco), facendo chiudere ermeticamente l\'otturatore principale!',
      check: (s) => {
        if (s.l1.v2Open || s.l1.regImpulseTap !== 'trunk' || s.l1.sfOpen) {
          return {
            ok: false,
            msg: 'Assicurati che V2-L1 sia chiusa, l\'impulso sia su TRONCO e richiudi lo sfiato a candela SF-L1.'
          };
        }
        return {
          ok: true,
          msg: `SG Regolatore Pilotato verificato! P tronco stabile a ${formatPressure(
            s.l1.pTrunk,
            s.preset
          )} e pressione motrice scaricata (Pmot = ${formatPressure(s.l1.regPmot, s.preset)} -> spinta motrice = 0).`
        };
      }
    },
    {
      title: 'Passo 4 (Reg. Pilotato): Diagnostica Differenziale con Rubinetto Alimentazione Pilota (Fail-Close)',
      desc: 'Nei regolatori pilotati, se trovi un SG fuori tolleranza, come capisci se trafila l\'ugello del pilota o la sede dell\'otturatore principale? 1) Spunta "Simula trafilamento ugello Pilota L1" nel pannello in basso a destra (vedi P tronco salire); 2) Chiudi il rubinetto "Alim.Pilota" (Alimentazione Pilota OFF) e fai un rapido apri/chiudi di SF-L1: vedrai che senza pilota la pressione resta ferma!',
      check: (s) => {
        if (!s.faultPilot1Leak) {
          return {
            ok: false,
            msg: 'Attiva la casella "Simula trafilamento ugello Pilota L1 (solo Reg. Pilotati)" nel pannello a destra.'
          };
        }
        if (s.l1.regPilotSupplyOpen) {
          return {
            ok: false,
            msg: 'Con il trafilamento pilota attivo la pressione è salita! Ora clicca su REG. PRINC. L1 (o Alim.Pilota) e CHIUDI l\'Alimentazione Pilota per verificare che l\'otturatore principale tenga.'
          };
        }
        return {
          ok: true,
          msg: 'Bravissimo! Chiudendo l\'alimentazione pilota (Fail-Close), l\'otturatore principale ha chiuso ermeticamente, dimostrando che il trafilamento proveniva dal pilota e non dalla sede principale!'
        };
      }
    },
    {
      title: 'Passo 5 (Reg. Pilotato): Come mandare in lavoro il Monitor su un Regolatore Pilotato',
      desc: 'Togli il guasto al pilota, RIAPRI l\'Alimentazione Pilota (Alim.Pilota ON) e apri lo sfiato SF-L1. Ricorda: su un regolatore pilotato per provare il Monitor NON devi chiudere l\'alimentazione pilota (altrimenti chiude!), ma devi SCARICARE la Presa d\'Impulso del Regolatore L1 ("Stato Presa Impulso -> SCARICATA IN ATMOSFERA"). Così il pilota sente 0 bar, manda la massima Pmot e spalanca il regolatore, facendo entrare in regolazione il Monitor L1!',
      check: (s) => {
        if (s.faultPilot1Leak) {
          return { ok: false, msg: 'Disattiva prima la casella "Simula trafilamento ugello Pilota L1".' };
        }
        if (!s.l1.regPilotSupplyOpen) {
          return {
            ok: false,
            msg: 'Riapri il rubinetto Alimentazione Pilota (Alim.Pilota ON): senza alimentazione motrice il regolatore pilotato rimane chiuso!'
          };
        }
        if (!s.l1.sfOpen) {
          return { ok: false, msg: 'Apri lo sfiato a candela SF-L1 per dare portata di regolazione al Monitor.' };
        }
        if (s.l1.regImpulseState !== 'vented') {
          return {
            ok: false,
            msg: 'Seleziona REG. PRINC. L1 e imposta la Presa d\'Impulso su "SCARICATA IN ATMOSFERA (Forza Apertura -> Prova Monitor)".'
          };
        }
        return {
          ok: true,
          msg: `Eccellente! Con l'impulso scaricato a 0 bar e alimentazione pilota attiva, Pmot è salita al massimo (${formatPressure(
            s.l1.regPmot,
            s.preset
          )}), il Regolatore L1 si è spalancato e il Monitor L1 governa il tronco a ${formatPressure(s.l1.pTrunk, s.preset)}!`
        };
      }
    }
  ],
  'guided-direct-sg': [
    {
      title: 'Passo 1 (Azione Diretta): Chiusura V2-L1 e Verifica SG per compressione diretta membrana/molla',
      desc: 'Nel gruppo ad Azione Diretta (Dival 600 / Norval, Fail-Open) non esiste pilota né alimentazione motrice: la presa d\'impulso è sul tronco e agisce direttamente sotto la membrana contro la molla di taratura. Chiudi la valvola di valle V2-L1 (con SF-L1 chiuso) e osserva l\'SG più pronunciato (+2,2 mbar) necessario per vincere fisicamente la molla.',
      check: (s) => {
        if (s.preset.arch !== 'DIRECT') {
          return { ok: false, msg: 'Seleziona la configurazione "GRF Azione Diretta [FAIL-OPEN]" in alto a sinistra.' };
        }
        if (s.l1.v2Open || s.l1.sfOpen) {
          return { ok: false, msg: 'Chiudi la valvola di valle V2-L1 e assicurati che lo sfiato SF-L1 sia chiuso.' };
        }
        return {
          ok: true,
          msg: `Verifica SG Azione Diretta completata: la pressione nel tronco è salita da ${formatPressure(
            s.l1.regSet,
            s.preset
          )} a ${formatPressure(s.l1.pTrunk, s.preset)} comprimendo direttamente la molla dell'otturatore.`
        };
      }
    },
    {
      title: 'Passo 2 (Azione Diretta): Verifica del Monitor per Fail-Open (Scarico Presa d\'Impulso)',
      desc: 'In un regolatore ad Azione Diretta (Fail-Open), la molla spinge sempre per aprire. Apri lo sfiato SF-L1 e imposta la Presa d\'Impulso del Regolatore L1 su "SCARICATA IN ATMOSFERA": mancando la pressione sotto la membrana, la molla spalanca immediatamente l\'otturatore e il Monitor entra in regolazione.',
      check: (s) => {
        if (s.l1.v2Open || !s.l1.sfOpen || s.l1.regImpulseState !== 'vented') {
          return {
            ok: false,
            msg: 'Con V2-L1 chiusa, apri lo sfiato SF-L1 e imposta la Presa d\'Impulso di REG. PRINC. L1 su "SCARICATA IN ATMOSFERA".'
          };
        }
        return {
          ok: true,
          msg: `Perfetto! Il regolatore ad azione diretta si è portato in Fail-Open per spinta della molla e il Monitor regola il tronco a ${formatPressure(
            s.l1.pTrunk,
            s.preset
          )}.`
        };
      }
    }
  ],
  'guided-full': [
    {
      title: 'Passo 1: Scambio Linea (Isolamento V2-L1 e Presa di Carico 2ª Linea)',
      desc: 'Assicurati che la Seconda Linea (L2) sia pronta e chiudi la valvola di valle V2-L1. Se stai operando su un Regolatore Pilotato con presa d\'impulso su Collettore, ricordati anche di commutare il Punto di Presa Impulso di REG. PRINC. L1 su "TRONCO (a monte di V2)".',
      check: (s) => {
        if (s.l1.v2Open) {
          return { ok: false, msg: 'Chiudi la valvola di intercettazione di valle V2-L1.' };
        }
        if (s.l1.regImpulseTap !== 'trunk') {
          return {
            ok: false,
            msg: 'Poiché il regolatore è pilotato, commuta il Punto di Presa Impulso di REG. PRINC. L1 su "TRONCO (a monte di V2)" (e scarica un istante con SF-L1) affinché non legga la pressione inferiore della 2ª Linea!'
          };
        }
        return { ok: true, msg: 'Seconda Linea in erogazione regolare e tronco L1 correttamente isolato con impulso sul tronco!' };
      }
    },
    {
      title: 'Passo 2: Verifica Chiusura Statica (SG) del Regolatore Principale L1',
      desc: 'Con V2-L1 chiusa e impulso sul tronco, se il tronco era salito di pressione apri e richiudi lo sfiato SF-L1. Verifica con SF-L1 chiuso che la pressione si stabilizzi al valore di chiusura (SG) senza trafilamenti.',
      check: (s) => {
        if (s.l1.v2Open || s.l1.sfOpen || s.l1.regImpulseTap !== 'trunk') {
          return { ok: false, msg: 'Mantieni V2-L1 chiusa, impulso su TRONCO e sfiato SF-L1 chiuso.' };
        }
        if (s.l1.pTrunk > s.l1.regSet + s.preset.sgAllowance + 0.05) {
          return {
            ok: false,
            msg: 'La pressione nel tronco è rimasta alta: apri per un secondo lo sfiato SF-L1 e poi richiudilo per far assestare il regolatore al suo SG.'
          };
        }
        return {
          ok: true,
          msg: `SG conforme: P tronco L1 stabile a ${formatPressure(s.l1.pTrunk, s.preset)}.`
        };
      }
    },
    {
      title: 'Passo 3: Verifica Funzionale del Monitor L1',
      desc: 'Apri lo sfiato a candela SF-L1 e manda in apertura il Regolatore Principale L1 scaricando la sua presa d\'impulso ("SCARICATA IN ATMOSFERA", mantenendo aperta l\'alimentazione pilota se pilotato) per leggere la taratura del Monitor L1.',
      check: (s) => {
        if (s.l1.v2Open || !s.l1.sfOpen || s.l1.regImpulseState !== 'vented' || !s.l1.regPilotSupplyOpen) {
          return {
            ok: false,
            msg: 'Apri SF-L1, assicurati che Alim.Pilota sia attiva e imposta la Presa d\'Impulso di REG. PRINC. L1 su "SCARICATA IN ATMOSFERA".'
          };
        }
        return {
          ok: true,
          msg: `Monitor L1 verificato con successo: regola il tronco a ${formatPressure(s.l1.pTrunk, s.preset)}.`
        };
      }
    },
    {
      title: 'Passo 4: Verifica Scatto OPSO (Max) e UPSO (Min) del Blocco SB-L1',
      desc: 'Riconnetti l\'impulso di REG. PRINC. L1 in LINEA e chiudi SF-L1. Poi metti il rubinetto Imp.Blk di SB-L1 in posizione TEST, collega la Cassettina di Prova a SB-L1 e verifica lo scatto sia per Massima (OPSO) sia per Minima (UPSO).',
      check: (s) => {
        if (!s.l1.testedMaxTrip || !s.l1.testedMinTrip) {
          return {
            ok: false,
            msg: 'Metti Imp.Blk su TEST, collega la Cassettina a SB-L1 e fai scattare il blocco sia per Massima (OPSO) sia per Minima (UPSO).'
          };
        }
        return {
          ok: true,
          msg: `Scatti OPSO (${s.l1.lastMaxTripVal}) e UPSO (${s.l1.lastMinTripVal}) certificati!`
        };
      }
    },
    {
      title: 'Passo 5: Riarmo e Ritorno in Servizio sulla 1ª Linea',
      desc: 'Riporta il rubinetto Imp.Blk in LINEA, riarma la leva del blocco SB-L1 e riapri la valvola di valle V2-L1 per riportare la Linea 1 al comando e la Seconda Linea in stand-by automatico.',
      check: (s) => {
        if (s.l1.blkImpulseMode !== 'line' || !s.l1.sbArmed || !s.l1.v1Open || !s.l1.v2Open || s.l1.sfOpen || s.l1.regImpulseState !== 'connected') {
          return {
            ok: false,
            msg: 'Verifica che Imp.Blk e Imp.Reg siano connessi in LINEA, SF-L1 sia chiuso, SB-L1 sia ARMATO e V2-L1 sia APERTA.'
          };
        }
        return {
          ok: true,
          msg: 'VERIFICA FUNZIONALE COMPLETA TERMINATA! Linea 1 regolarmente in servizio e Seconda Linea armata in stand-by.'
        };
      }
    }
  ],
  'guided-block-l2': [
    {
      title: 'Passo 1: Isolamento Presa Impulso Blocco 2ª Linea (SB-L2)',
      desc: 'Imposta il rubinetto Imp.Blk della Seconda Linea (SB-L2) su TEST e collega la Cassettina di Prova a "Presa Impulso Blocco SB-L2 (2ª Linea)".',
      check: (s) => {
        if (s.l2.blkImpulseMode !== 'test' || s.testbox.target !== 'blk-l2') {
          return { ok: false, msg: 'Imposta Imp.Blk L2 su TEST e collega la Cassettina a SB-L2.' };
        }
        return { ok: true, msg: 'Presa impulso SB-L2 isolata e pronta al test.' };
      }
    },
    {
      title: 'Passo 2: Test Scatto OPSO e UPSO su SB-L2 e Riarmo Finale',
      desc: 'Fai scattare SB-L2 per Massima e per Minima con la pompa di prova, poi riporta Imp.Blk L2 in LINEA e riarma SB-L2.',
      check: (s) => {
        if (!s.l2.testedMaxTrip || !s.l2.testedMinTrip) {
          return { ok: false, msg: 'Esegui prima entrambi gli scatti per Massima (OPSO) e Minima (UPSO) con la pompa.' };
        }
        if (s.l2.blkImpulseMode !== 'line' || !s.l2.sbArmed) {
          return { ok: false, msg: 'Ora riporta Imp.Blk L2 in LINEA e riarma la leva di SB-L2.' };
        }
        return { ok: true, msg: 'Blocco 2ª Linea verificato e riarmato in pronta riserva!' };
      }
    }
  ]
};

// Stato globale
let state = {
  presetKey: 'remi-piloted',
  preset: PRESETS['remi-piloted'],
  mode: 'free',
  guidedStepIndex: 0,
  selectedComp: 'reg-l1',
  flowDemand: 450,
  faultSeat1Leak: false,
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
    blkImpulseMode: 'line', // 'line' | 'test'

    // Parametri specifici Regolatore Principale (Pilotato vs Azione Diretta)
    regPilotSupplyOpen: true, // Rubinetto alimentazione pilota da monte (solo per PILOTED)
    regImpulseTap: preset.defaultImpulseTap, // 'trunk' (monte V2) | 'manifold' (valle V2)
    regImpulseState: 'connected', // 'connected' | 'isolated' | 'vented' (scaricato in atmosfera)
    regTrappedImpulseP: cfg.regSet,
    regPmot: preset.arch === 'PILOTED' ? cfg.regSet + 0.6 : 0, // Pressione motrice servomotore pilota

    // Parametri specifici Regolatore Monitor
    monPilotSupplyOpen: true,
    monImpulseState: 'connected', // 'connected' | 'vented'
    monPmot: preset.arch === 'PILOTED' ? preset.pilotSupplyNominal : 0,

    sfOpen: false,
    regSet: cfg.regSet,
    monSet: cfg.monSet,
    blkMax: cfg.blkMax,
    blkMin: cfg.blkMin,
    pTrunk: cfg.regSet,
    trappedTrunkP: cfg.regSet, // Memoria pressione intrappolata nel tronco chiuso
    activeRole: 'ACTIVE', // 'ACTIVE' | 'MONITOR_WORK' | 'STANDBY' | 'ISOLATED' | 'TRIPPED' | 'PILOT_CLOSED'
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
  state.faultPilot1Leak = false;
  state.faultRupture1 = false;
  state.vsSet = preset.vsSet;
  state.l1 = createLineState(preset.line1, preset);
  state.l2 = createLineState(preset.line2, preset);

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
  document.getElementById('chk-fault-seat1').checked = false;
  document.getElementById('chk-fault-pilot1').checked = false;
  document.getElementById('chk-fault-pilot1').disabled = preset.arch !== 'PILOTED';
  document.getElementById('chk-fault-rupture1').checked = false;

  recalculatePhysics();
  renderAll();
  addLog(`Configurazione caricata: ${preset.name}`, 'ok');
}

/**
 * Motore Fisico / Pneumatico con distinzione rigorosa:
 * - Regolatori Pilotati (Fail-Close, servomotore a pressione motrice Pmot + pilota + presa d'impulso)
 * - Regolatori Azione Diretta (Fail-Open, molla diretta contro membrana presa d'impulso)
 */
function recalculatePhysics() {
  const p = state.preset;
  const l1 = state.l1;
  const l2 = state.l2;

  // Passo 1: Stima preliminare del collettore di valle per le prese d'impulso collegate a valle di V2
  // (Se L2 è attiva mentre V2-L1 è chiusa, il collettore è alla pressione di L2)
  computeLinePneumatics(l2, 2, state.pdManifold);
  computeLinePneumatics(l1, 1, state.pdManifold);

  // Passo 2: Calcolo effettivo del Collettore di Valle (Pd)
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

  // Passo 3: Ricalcolo di precisione dei tronchi L1 e L2 con il valore aggiornato di Pd sul collettore
  computeLinePneumatics(l1, 1, state.pdManifold);
  computeLinePneumatics(l2, 2, state.pdManifold);

  // Ricalcolo finale Pd dopo l'assestamento dei piloti
  const l1FeedsNow = canLineDeliverGas(l1);
  const l2FeedsNow = canLineDeliverGas(l2);
  if (l1FeedsNow && l2FeedsNow) {
    pd = Math.max(l1.pTrunk, l2.pTrunk);
    if (pd > l2.regSet + p.sgAllowance * 0.5) {
      l2.pTrunk = pd;
      l2.activeRole = 'STANDBY';
      if (p.arch === 'PILOTED') {
        // In stand-by il pilota della 2ª linea sente Pd > Set_L2, quindi scarica la pressione motrice (Pmot = Pd)
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
    pd = state.flowDemand > 0 ? 0.0 : 0.0;
  }

  // Passo 4: Valuta Valvola di Sfioro (VS)
  const vsSenseP = state.testbox.target === 'vs' ? state.testbox.pressure : pd;
  state.vsVenting = vsSenseP >= state.vsSet;
  if (state.vsVenting && state.testbox.target !== 'vs' && pd > state.vsSet) {
    pd = Math.min(pd, state.vsSet + p.sgAllowance);
  }
  state.pdManifold = pd;

  // Passo 5: Controllo scatto Valvole di Blocco (SB-L1 e SB-L2)
  checkSlamShut(l1, 'blk-l1', 'SB-L1 (1ª Linea)');
  checkSlamShut(l2, 'blk-l2', 'SB-L2 (2ª Linea)');

  // Se un blocco è appena scattato, aggiorna lo stato della linea
  if (!l1.sbArmed) computeLinePneumatics(l1, 1, state.pdManifold);
  if (!l2.sbArmed) computeLinePneumatics(l2, 2, state.pdManifold);

  // Passo 6: Stato generale dell'erogazione
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
    // Nel regolatore pilotato Fail-Close, se si chiude l'alimentazione pilota sia del Regolatore che del Monitor, il regolatore chiude!
    if (!line.regPilotSupplyOpen || !line.monPilotSupplyOpen) {
      return false;
    }
  }
  return true;
}

/**
 * Calcola il comportamento pneumatico del Regolatore Principale + Monitor (Pilotato vs Azione Diretta)
 */
function computeLinePneumatics(line, lineNum, currentManifoldP) {
  const p = state.preset;
  const isPiloted = p.arch === 'PILOTED';
  const upstreamAvailable = (line.v1Open || line.bpOpen) && line.sbArmed;

  // Se non c'è gas a monte (V1 chiusa o Blocco scattato)
  if (!upstreamAvailable) {
    if (line.sfOpen || (line.v2Open && state.flowDemand > 0 && !canOtherLineFeed(lineNum))) {
      line.pTrunk = 0;
      line.trappedTrunkP = 0;
    }
    line.regPmot = isPiloted ? line.pTrunk : 0;
    line.monPmot = isPiloted ? line.pTrunk : 0;
    line.activeRole = !line.sbArmed ? 'TRIPPED' : 'ISOLATED';
    return;
  }

  // CASO ESCLUSIVO REGOLATORE PILOTATO (FAIL-CLOSE):
  // Se l'alimentazione pilota (Alim.Pilota o Alim.Mon) è CHIUSA, viene a mancare la pressione motrice Pmot -> l'otturatore CHIUDE!
  if (isPiloted && (!line.regPilotSupplyOpen || !line.monPilotSupplyOpen)) {
    line.activeRole = 'PILOT_CLOSED';
    const hasSeatLeak = lineNum === 1 && state.faultSeat1Leak;
    const hasOutflow = line.sfOpen || (line.v2Open && state.flowDemand > 0);

    if (hasOutflow) {
      // Se lo sfiato è aperto o V2 è aperta verso utenza mentre il pilota è spento, il tronco si svuota (o prende la P del collettore se V2 aperta)
      line.pTrunk = line.v2Open ? currentManifoldP : 0;
      line.trappedTrunkP = line.pTrunk;
    } else {
      // V2 chiusa e SF chiuso (tronco isolato) con Alimentazione Pilota CHIUSA:
      // Ottimo test diagnostico Tipo 3! Se trafila la sede principale (faultSeat1Leak), la pressione sale comunque;
      // se invece trafilava solo l'ugello del pilota (faultPilot1Leak), chiudendo Alim.Pilota la pressione NON sale!
      if (hasSeatLeak) {
        line.pTrunk = Math.min(line.monSet + p.sgAllowance, line.regSet + p.seatLeakDelta);
      } else {
        line.pTrunk = Math.min(line.trappedTrunkP, line.regSet + p.sgAllowance);
      }
      line.trappedTrunkP = line.pTrunk;
    }
    line.regPmot = line.pTrunk; // Pmot scaricata a P tronco (nessun differenziale di apertura)
    line.monPmot = line.monPilotSupplyOpen ? p.pilotSupplyNominal : line.pTrunk;
    return;
  }

  // Determiniamo cosa legge la presa d'impulso del Regolatore Principale:
  // 1) Se lo stato impulso è 'vented' (scaricato in atmosfera), legge 0 -> spalanca!
  // 2) Se il punto di presa è 'manifold' (a valle di V2) e V2 è chiusa, legge currentManifoldP (es. 1,35 bar della 2ª linea)!
  const regForcedOpenByImpulse =
    line.regImpulseState === 'vented' ||
    (lineNum === 1 && state.faultRupture1) ||
    (!line.v2Open && line.regImpulseTap === 'manifold' && currentManifoldP < line.regSet);

  // Determiniamo la pressione obiettivo regolata dal treno (Regolatore vs Monitor):
  let targetP = line.regSet;
  if (regForcedOpenByImpulse) {
    // Il regolatore principale è spalancato -> interviene il MONITOR in serie!
    targetP = line.monSet;
    line.activeRole = 'MONITOR_WORK';
  } else {
    line.activeRole = 'ACTIVE';
  }

  // C'è portata attraverso la linea?
  const hasFlow = (line.v2Open && state.flowDemand > 0) || line.sfOpen;

  if (hasFlow) {
    // Con portata attiva (V2 aperta o sfiato a candela SF aperto), il regolatore/monitor regola esattamente al suo set-point!
    line.pTrunk = targetP;
    line.trappedTrunkP = targetP;

    if (isPiloted) {
      const deltaMot = p.unit === 'bar' ? 0.65 : 35.0;
      if (line.activeRole === 'MONITOR_WORK') {
        line.regPmot = p.pilotSupplyNominal; // Pilota Reg.1 tutto aperto
        line.monPmot = +(targetP + deltaMot).toFixed(2); // Pilota Monitor in modulazione
      } else {
        line.regPmot = +(targetP + deltaMot).toFixed(2); // Pilota Reg.1 in modulazione
        line.monPmot = p.pilotSupplyNominal; // Pilota Monitor tutto aperto
      }
    }
  } else {
    // PORTATA ZERO (V2 chiusa e SF chiuso -> Condizione di Verifica SG / Tenuta Interna!):
    let lockupP = targetP + p.sgAllowance;

    // Se prima di chiudere SF il tronco era rimasto intrappolato a una pressione superiore (es. perché prima l'impulso era su Collettore),
    // in assenza di sfiato la pressione intrappolata nel tronco chiuso non può scendere da sola finché non si apre SF!
    if (line.trappedTrunkP > lockupP && !regForcedOpenByImpulse) {
      lockupP = line.trappedTrunkP;
    }

    // Eventuali trafilamenti sulla Linea 1 a portata zero:
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
      if (regForcedOpenByImpulse) {
        line.regPmot = p.pilotSupplyNominal;
        line.monPmot = line.pTrunk; // Il Monitor va in chiusura SG
      } else {
        // In chiusura SG il pilota scarica la pressione motrice a P tronco (Pmot = Ptrunk -> differenziale zero -> chiusura ermetica!)
        line.regPmot =
          lineNum === 1 && state.faultPilot1Leak && line.regPilotSupplyOpen
            ? +(line.pTrunk + (p.unit === 'bar' ? 0.25 : 15)).toFixed(2)
            : line.pTrunk;
        line.monPmot = p.pilotSupplyNominal;
      }
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

/**
 * Rendering P&ID SVG + KPI + Inspector
 */
function renderAll() {
  const p = state.preset;
  const l1 = state.l1;
  const l2 = state.l2;

  document.getElementById('plant-arch-subtitle').innerHTML = p.archSubtitle;
  document.getElementById('kpi-pu').textContent = `${p.pu.toFixed(1).replace('.', ',')} bar`;
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

  // Titoli Linee
  const archTag = p.arch === 'PILOTED' ? 'REGOLATORE PILOTATO FAIL-CLOSE' : 'AZIONE DIRETTA FAIL-OPEN';
  document.getElementById('svg-l1-title').textContent = `LINEA 1 — PRINCIPALE (${archTag})`;
  document.getElementById('svg-l2-title').textContent = `LINEA 2 — SECONDA LINEA DI RISERVA (${archTag})`;

  // Mostra/nascondi circuito alimentazione piloti da monte
  const showPilotSupply = p.arch === 'PILOTED';
  document.getElementById('svg-pilot-supply-l1').style.display = showPilotSupply ? 'block' : 'none';
  document.getElementById('svg-pilot-supply-l2').style.display = showPilotSupply ? 'block' : 'none';

  renderLineSVG(1, l1);
  renderLineSVG(2, l2);

  // Valvola di Sfioro (VS)
  document.getElementById('sub-vs').textContent = `Set: ${formatShort(state.vsSet, p)} ${p.unit}`;
  document.getElementById('shape-vs').setAttribute('class', state.vsVenting ? 'relief-venting' : 'relief-closed');

  // Evidenziazione componente selezionato
  document.querySelectorAll('.svg-interactive').forEach((el) => {
    const compId = el.id.replace('svg-btn-', '');
    el.classList.toggle('selected-comp', compId === state.selectedComp);
  });

  renderTestbox();
  renderInspector();
  renderGuidedBanner();
}

function renderLineSVG(num, line) {
  const p = state.preset;
  const sfx = `l${num}`;
  const yPipe = num === 1 ? 180 : 485;
  const yImpReg = num === 1 ? 110 : 415;
  const yRegTop = num === 1 ? 136 : 441;

  // Valvole V1, V2, BP
  document.getElementById(`shape-v1-${sfx}`).setAttribute('class', line.v1Open ? 'valve-open' : 'valve-closed');
  document.getElementById(`shape-v2-${sfx}`).setAttribute('class', line.v2Open ? 'valve-open' : 'valve-closed');
  document.getElementById(`shape-bp-${sfx}`).setAttribute('class', line.bpOpen ? 'valve-open' : 'valve-closed');

  // Blocco SB
  document.getElementById(`head-sb-${sfx}`).setAttribute('class', line.sbArmed ? 'slam-armed' : 'slam-tripped');
  document.getElementById(`txt-sb-${sfx}`).textContent = line.sbArmed ? 'ARMATO' : 'BLOCCATO';
  document.getElementById(`sub-sb-${sfx}`).textContent =
    `Max ${formatShort(line.blkMax, p)} | Min ${formatShort(line.blkMin, p)}`;

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
    document.getElementById(`pmot-reg-${sfx}`).textContent = `Pmot: ${formatShort(line.regPmot, p)} ${p.unit}`;
    document.getElementById(`pmot-mon-${sfx}`).textContent = `Pmot: ${formatShort(line.monPmot, p)} ${p.unit}`;
  } else {
    document.getElementById(`pmot-reg-${sfx}`).textContent = 'Molla Diretta (Fail-Open)';
    document.getElementById(`pmot-mon-${sfx}`).textContent = 'Molla Diretta';
  }

  // Tracciato dinamico Presa d'Impulso Regolatore Principale (TRONCO a monte di V2 [x=742] vs COLLETTORE a valle di V2 [x=855])
  const tapX = line.regImpulseTap === 'trunk' ? 742 : 855;
  const impRegPath = document.getElementById(`imp-reg-${sfx}`);
  impRegPath.setAttribute('d', `M 595 ${yRegTop} L 595 ${yImpReg} L ${tapX} ${yImpReg} L ${tapX} ${yPipe}`);
  const tapDot = document.getElementById(`tap-dot-reg-${sfx}`);
  tapDot.setAttribute('cx', String(tapX));

  // Stato Rubinetto Presa d'Impulso Regolatore
  const dotRreg = document.getElementById(`dot-rreg-${sfx}`);
  const lblRreg = document.getElementById(`lbl-rreg-${sfx}`);
  if (line.regImpulseState === 'connected') {
    dotRreg.setAttribute('class', 'cock-open');
    lblRreg.textContent = line.regImpulseTap === 'trunk' ? 'Imp.Reg: TRONCO' : 'Imp.Reg: VALLE V2';
    impRegPath.setAttribute(
      'class',
      line.regImpulseTap === 'trunk' ? 'impulse-line' : 'impulse-manifold-line'
    );
  } else {
    dotRreg.setAttribute('class', 'cock-test');
    lblRreg.textContent = 'Imp.Reg: SCARICO!';
    impRegPath.setAttribute('class', 'impulse-test-active');
  }

  // Candela di Sfiato SF
  const dotSf = document.getElementById(`dot-sf-${sfx}`);
  const lblSf = document.getElementById(`lbl-sf-${sfx}`);
  dotSf.setAttribute('class', line.sfOpen ? 'cock-test' : 'cock-closed');
  lblSf.textContent = line.sfOpen ? `SF-L${num}: APERTO` : `Sfiato SF-L${num}`;

  // Setpoint labels
  document.getElementById(`sub-mon-${sfx}`).textContent = `Set: ${formatShort(line.monSet, p)} ${p.unit}`;
  document.getElementById(`sub-reg-${sfx}`).textContent = `Set: ${formatShort(line.regSet, p)} ${p.unit}`;

  // Colori Regolatore, Monitor e Badge Linea
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
    badge.textContent = 'CHIUSO PER ASSENZA ALIM. PILOTA (FAIL-CLOSE)';
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
        ? 'PROVA MONITOR IN CORSO (SF APERTO)'
        : 'SPALANCATO (IMPULSO SU VALLE V2 -> ENTRA MONITOR!)';
    } else {
      badge.textContent = line.sfOpen
        ? 'IN REGOLAZIONE SU SFIATO SF'
        : `TRONCO CHIUSO (SG = ${formatShort(line.pTrunk, p)} ${p.unit})`;
    }
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
 * Pannello Inspector Contestuale con tutti i comandi per Regolatori Pilotati vs Azione Diretta
 */
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

  // 1. Regolatore Principale o i suoi rubinetti (Impulso / Alimentazione Pilota)
  if (id.startsWith('reg-') || id.startsWith('rreg-') || id.startsWith('palim-reg-')) {
    tagEl.textContent = `${isPiloted ? 'REGOLATORE PILOTATO (FAIL-CLOSE)' : 'AZIONE DIRETTA (FAIL-OPEN)'} · ${lineLabel}`;
    titleEl.textContent = lineCfg.regModel;
    descEl.textContent = isPiloted
      ? 'Regolatore pilotato normalmente chiuso (Fail-Close). Il pilota riceve gas da monte tramite il preriduttore (Alim.Pilota) e modula la Pressione Motrice (Pmot) in base alla pressione letta dalla Presa d\'Impulso.'
      : 'Regolatore ad azione diretta normalmente aperto (Fail-Open). La molla apre direttamente l\'otturatore e la pressione nella presa d\'impulso agisce sotto la membrana per chiudere.';

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
              ${line.regPilotSupplyOpen ? 'Chiudi Alimentazione Pilota (Fail-Close / Test Sede)' : 'Apri Alimentazione Pilota'}
            </button>
          </div>
        </div>
      `;
    }

    const impulseTapWarning =
      !line.v2Open && line.regImpulseTap === 'manifold'
        ? `<div class="diagnostic-callout">
             ⚠️ <strong>Attenzione Presa d'Impulso:</strong> Con <code>V2-${isL2 ? 'L2' : 'L1'}</code> chiusa, la presa d'impulso sta leggendo il <strong>Collettore a valle di V2</strong> (${formatPressure(
               state.pdManifold,
               p
             )}) invece del Tronco! Poiché ${formatShort(state.pdManifold, p)} &lt; ${formatShort(
            line.regSet,
            p
          )}, il regolatore non può andare in chiusura SG e si spalanca fino al Monitor. Commuta la presa su <strong>TRONCO (a monte di V2)</strong>!
           </div>`
        : '';

    ctrlsEl.innerHTML = `
      <div class="inspector-stat-row">
        <span>Set-point Taratura (Pd):</span>
        <strong>${formatPressure(line.regSet, p)} (SG nominale: +${formatShort(p.sgAllowance, p)} ${p.unit})</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Pressione Tronco Attuale:</span>
        <strong>${formatPressure(line.pTrunk, p)}</strong>
      </div>
      ${pilotHTML}
      <div class="inspector-subbox">
        <div class="inspector-subbox-title">Gestione Presa d'Impulso Regolatore (${formatPressure(sensedImpulseP, p)})</div>
        <div class="inspector-stat-row">
          <span>Punto di Presa Impulso:</span>
          <strong class="${line.regImpulseTap === 'trunk' ? 'status-ok' : 'status-warn'}">
            ${line.regImpulseTap === 'trunk' ? 'TRONCO (a monte di V2)' : 'COLLETTORE (a valle di V2)'}
          </strong>
        </div>
        <div class="inspector-stat-row">
          <span>Stato Rubinetto Impulso:</span>
          <strong class="${line.regImpulseState === 'connected' ? 'status-ok' : 'status-warn'}">
            ${line.regImpulseState === 'connected' ? 'IN LINEA (Lettura attiva)' : 'SCARICATO IN ATMOSFERA (0 bar → Spalanca)'}
          </strong>
        </div>
        ${impulseTapWarning}
        <div class="inspector-btn-row">
          <button type="button" class="btn btn-xs btn-primary" id="act-toggle-imp-tap">
            Commuta Presa: ${line.regImpulseTap === 'trunk' ? 'Passa a VALLE V2 (Collettore)' : 'Passa a MONTE V2 (Tronco)'}
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
              : 'CHIUSA -> Pmot azzerata, il regolatore pilotato va in chiusura (Fail-Close)!'
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
          line.regImpulseTap === 'trunk' ? 'TRONCO (a monte di V2)' : 'COLLETTORE (a valle di V2)'
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
            ? 'RICONNESSA IN LINEA'
            : 'SCARICATA IN ATMOSFERA (0 bar) -> Regolatore spalancato per verifica Monitor!'
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

  // 2. Regolatore Monitor o i suoi rubinetti
  if (id.startsWith('mon-') || id.startsWith('rmon-') || id.startsWith('palim-mon-')) {
    tagEl.textContent = `REGOLATORE MONITOR IN SERIE · ${lineLabel}`;
    titleEl.textContent = lineCfg.monModel;
    descEl.textContent = isPiloted
      ? 'Monitor pilotato installato in serie. Finché la pressione è inferiore al suo set-point (Pm), il suo pilota tiene la massima pressione motrice (Pmot) mantenendolo aperto. Entra in modulazione appena il regolatore principale si spalanca.'
      : 'Monitor ad azione diretta in serie. Normalmente mantenuto aperto dalla propria molla finché la pressione non raggiunge la soglia di emergenza Pm.';

    ctrlsEl.innerHTML = `
      <div class="inspector-stat-row">
        <span>Set-point Monitor (Pm):</span>
        <strong>${formatPressure(line.monSet, p)}</strong>
      </div>
      <div class="inspector-stat-row">
        <span>Stato Operativo:</span>
        <strong class="${line.activeRole === 'MONITOR_WORK' ? 'status-warn' : 'status-ok'}">
          ${line.activeRole === 'MONITOR_WORK' ? 'IN REGOLAZIONE ATTIVA DI EMERGENZA!' : 'Aperto in Sorveglianza'}
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

  // 3. Valvole di linea V1, V2, BP
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
      ? 'Valvola di isolamento a valle della linea. Nei regolatori pilotati, ricorda di verificare che la presa d\'impulso sia commutata sul TRONCO (a monte di V2) per eseguire la prova di chiusura SG!'
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

  // 4. Valvola di Blocco SB o rubinetto impulso blocco
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

  // 5. Candela di Sfiato SF
  if (id.startsWith('sf-')) {
    tagEl.textContent = `SFIATO A CANDELA · ${lineLabel}`;
    titleEl.textContent = `Rubinetto di Sfiato Tronco SF-${isL2 ? 'L2' : 'L1'}`;
    descEl.textContent =
      'Valvola di sfiato verso candela esterna. Fondamentale con V2 chiusa per: 1) scaricare la sovrapressione intrappolata nel tronco e innescare la regolazione prima di rilevare l\'SG; 2) garantire la portata minima durante la prova del Monitor.';

    ctrlsEl.innerHTML = `
      <div class="inspector-stat-row">
        <span>Stato Rubinetto Sfiato:</span>
        <strong class="${line.sfOpen ? 'status-warn' : 'status-ok'}">
          ${line.sfOpen ? 'APERTO (Flusso di sfiato attivo)' : 'CHIUSO (Portata tronco = 0)'}
        </strong>
      </div>
      <div class="inspector-btn-row">
        <button type="button" class="btn btn-sm ${line.sfOpen ? 'btn-secondary' : 'btn-primary'}" id="act-toggle-sf">
          ${line.sfOpen ? 'Chiudi Sfiato SF (Misura SG)' : 'Apri Sfiato a Candela SF'}
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

  // 6. Valvola di Sfioro (VS)
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

/**
 * Inizializzazione Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.svg-interactive').forEach((el) => {
    el.addEventListener('click', () => {
      state.selectedComp = el.id.replace('svg-btn-', '');
      renderAll();
    });
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

  // Simulazione Guasti differenziati (Sede Otturatore vs Ugello Pilota vs Rottura Membrana)
  document.getElementById('chk-fault-seat1').addEventListener('change', (e) => {
    state.faultSeat1Leak = e.target.checked;
    addLog(
      state.faultSeat1Leak
        ? 'ANOMALIA ATTIVATA: Trafilamento sede Otturatore Principale L1 (la pressione a portata zero sale anche chiudendo l\'alimentazione pilota!).'
        : 'Sede Otturatore Principale L1 ripristinata.',
      state.faultSeat1Leak ? 'warn' : 'ok'
    );
    recalculatePhysics();
    renderAll();
  });

  document.getElementById('chk-fault-pilot1').addEventListener('change', (e) => {
    state.faultPilot1Leak = e.target.checked;
    addLog(
      state.faultPilot1Leak
        ? 'ANOMALIA ATTIVATA: Trafilamento ugello Pilota L1 (SG alto con pilota attivo, ma si arresta se chiudi Alim.Pilota!).'
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
        ? 'GUASTO ATTIVATO: Cedimento membrana / spalancamento Regolatore L1 (intervento Monitor L1).'
        : 'Membrana Regolatore L1 ripristinata.',
      state.faultRupture1 ? 'warn' : 'ok'
    );
    recalculatePhysics();
    renderAll();
  });

  // Dialog Manuale
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
