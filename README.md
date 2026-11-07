# Simulatore Verifiche Funzionali Gas — Cabina REMI / GRF (UNI/PdR 39 · Tipo 3)

Applicazione web statica interattiva (HTML5 + CSS3 + Vanilla JS con schema P&ID in SVG) progettata per l'addestramento pratico e la simulazione delle **Verifiche Funzionali sugli impianti di riduzione della pressione del gas naturale** (Cabine REMI di 1ª→4ª Specie e Gruppi di Riduzione Finale GRF di 4ª→7ª Specie), con riferimento alla qualifica **Operatore Tipo 3 (UNI/PdR 39 / UNI 11632 / UNI 10702)** e alla componentistica tipica **Pietro Fiorentini**.

## Caratteristiche principali

1. **Tre Configurazioni d'Impianto (Preset selezionabili):**
   - **Cabina REMI 1ª→4ª Specie:** Riduttori ad azione pilotata tipo *Pietro Fiorentini Aperflux 851* + Regolatore *Monitor* in serie + Valvola di Blocco *SB/82* ($P_u = 24\text{ bar} \rightarrow P_d = 1{,}50\text{ bar}$).
   - **Gruppo GRF 4ª→7ª Specie (Rete Cittadina):** Regolatori tipo *Pietro Fiorentini Reval 182 / Norval* + Monitor + Blocco *SB/LA* ($P_u = 5{,}0\text{ bar} \rightarrow P_d = 22{,}0\text{ mbar}$).
   - **Gruppo Azione Diretta:** Riduttori tipo *Pietro Fiorentini Dival 600* con dispositivo di blocco *LA* incorporato ($P_u = 1{,}5\text{ bar} \rightarrow P_d = 23{,}0\text{ mbar}$).

2. **Schema P&ID Doppia Linea Interattivo (1ª Linea Attiva + 2ª Linea di Riserva):**
   - Manovra delle valvole di intercettazione di monte (`V1-L1`, `V1-L2`), di valle (`V2-L1`, `V2-L2`) e dei by-pass di riempimento (`BP-L1`, `BP-L2`).
   - Simulazione del subentro automatico della **Seconda Linea (Linea di Emergenza)** tarata a pressione inferiore ($P_{d2} < P_{d1}$).
   - Controllo delle prese d'impulso con rubinetto a 3 vie (`LINEA` / `TEST`), candele di sfiato di tronco (`SF-L1`, `SF-L2`) e **Valvola di Sfioro (`VS`)** sul collettore di valle.
   - **Cassettina / Pompa di Prova digitale** collegabile alle prese di test per rilevare i punti di scatto per Massima Pressione (**OPSO**) e Minima Pressione (**UPSO**) delle valvole di blocco.

3. **Modalità Libera & Procedure Guidate Passo-Passo (Esame Tipo 3):**
   - *Simulazione Libera P&ID*
   - *Procedura Guidata Completa (6 passi):* Scambio linea su 2ª Linea, prova di chiusura statica ($SG$), verifica del Monitor in serie, test strumentale OPSO/UPSO del blocco e rimessa in servizio.
   - *Procedura Guidata Blocco 2ª Linea:* Verifica periodica del dispositivo di blocco sulla linea di riserva.
   - *Scenario Guasto:* Rottura membrana regolatore principale o trafilamento sede otturatore.

## Avvio locale e pubblicazione su GitHub Pages

Il progetto non richiede dipendenze esterne né build step:
- Apri direttamente `index.html` nel browser oppure avvia un server statico locale (`npx serve .` o `python -m http.server 8080`).
- Su GitHub, abilita **Settings → Pages → Deploy from a branch (`main` / root)** per pubblicare immediatamente il simulatore online.
