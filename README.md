# Simulatore Verifiche Funzionali Gas — Cabina REMI / GRF (UNI/PdR 39 · Tipo 3)

Applicazione web statica interattiva (HTML5 + CSS3 + Vanilla JS con schema P&ID in SVG) progettata per l'addestramento pratico e la simulazione delle **Verifiche Funzionali sugli impianti di riduzione della pressione del gas naturale** (Cabine REMI e Gruppi di Riduzione Finale GRF), con riferimento alla qualifica **Operatore Tipo 3 (UNI/PdR 39 / UNI 11632 / UNI 10702)** e alla componentistica tipica **Pietro Fiorentini**.

## Regolatori Pilotati (Fail-Close) vs Regolatori ad Azione Diretta (Fail-Open)

Il simulatore modella fedelmente la differenza fisica, pneumatica e procedurale tra le due famiglie di regolatori:

1. **Regolatori Pilotati (`FAIL-CLOSE`, es. *Pietro Fiorentini Aperflux 851*, *Reflux 819*, *Reval 182 Pilotato*):**
   - **Principio di funzionamento:** L'otturatore principale è tenuto **CHIUSO** da una molla e dalla pressione a monte ($P_u$). Per aprirsi richiede la **Pressione Motrice ($P_{mot}$)** generata dal circuito del **Pilota** (alimentato da monte tramite preriduttore `R14` e rubinetto `Alim.Pilota`).
   - **Ruolo della Presa d'Impulso (`TRONCO a monte di V2` vs `COLLETTORE a valle di V2`):**
     - Quando si chiude la valvola di valle `V2-L1` e la rete passa sulla Seconda Linea ($P_{d2} < P_{d1}$), se la presa d'impulso del regolatore L1 rimane collegata al **Collettore a valle di V2**, il pilota legge $P_{d2} < P_{d1}$, manda la massima pressione motrice ($P_{mot}$) e **spalanca** il regolatore principale L1 facendo salire il tronco fino al Monitor!
     - Per verificare l'$SG$ (Sovrapressione di Chiusura), la presa d'impulso deve essere commutata sul **Tronco intermedio (a monte di V2)** (e il tronco va sfiorato con la candela `SF-L1`): appena la pressione nel tronco sale di pochi centesimi di bar sopra il set-point ($SG$ strettissimo, Classe $SG\ 2{,}5$), il pilota chiude l'ugello e scarica la pressione motrice ($P_{mot} = P_{tronco}$), facendo chiudere ermeticamente l'otturatore principale.
   - **Diagnostica Differenziale $SG$ (Sede Otturatore vs Ugello Pilota):**
     - Chiudendo il rubinetto **`Alim.Pilota`**, il regolatore pilotato va forzatamente in chiusura (**Fail-Close**). Se un rialzo anomalo di pressione a portata zero si arresta chiudendo `Alim.Pilota`, il trafilamento è nell'**ugello del pilota**; se prosegue anche con `Alim.Pilota` chiuso, trafila la **sede dell'otturatore principale**.
   - **Verifica del Monitor:**
     - Su un regolatore pilotato, per far entrare in lavoro il Monitor **non** si deve chiudere `Alim.Pilota` (altrimenti il regolatore si chiude!), ma si deve mantenere aperta `Alim.Pilota` e **scaricare in atmosfera la presa d'impulso (`Imp.Reg`)**, così che il pilota senta $0\text{ bar}$ e mandi la massima $P_{mot}$ spalancando il regolatore principale.

2. **Regolatori ad Azione Diretta (`FAIL-OPEN`, es. *Pietro Fiorentini Dival 600*, *Norval*):**
   - **Principio di funzionamento:** Non hanno circuito pilota né alimentazione da monte. La molla di taratura spinge direttamente per **aprire** l'otturatore, mentre la pressione di valle nella presa d'impulso spinge direttamente sotto la membrana per **chiudere**.
   - **Verifica dell'$SG$ e del Monitor:** Chiudendo `V2-L1`, la pressione nel tronco deve salire di un $\Delta P$ maggiore (Classe $SG\ 10$) per comprimere fisicamente la molla e chiudere l'otturatore. Scaricando la presa d'impulso a $0\text{ bar}$, la molla non ha più contrasto e spalanca il regolatore (**Fail-Open**), facendo intervenire il Monitor.

## Avvio locale e pubblicazione su GitHub Pages

Il progetto non richiede dipendenze esterne né build step:
- Apri direttamente `index.html` nel browser oppure visita la pagina GitHub Pages del repository.
