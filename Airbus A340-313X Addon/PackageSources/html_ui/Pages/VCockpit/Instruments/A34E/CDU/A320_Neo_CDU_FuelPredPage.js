class CDUFuelPredPage {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        let isFlying = parseInt(SimVar.GetSimVarValue("GROUND VELOCITY", "knots")) > 30;
        let destIdentCell = "---";
        let destTimeCell = "";
        if (mcdu.flightPlanManager.getDestination()) {
            destIdentCell = mcdu.flightPlanManager.getDestination().ident;
            if (isFlying) {
                destTimeCell = FMCMainDisplay.secondsTohhmm(mcdu.flightPlanManager.getDestination().infos.etaInFP);
            }
            else {
                destTimeCell = FMCMainDisplay.secondsTohhmm(mcdu.flightPlanManager.getDestination().infos.totalTimeInFP);
            }
        }
        let rteRsvWeightCell = "--.-";
        let rteRsvWeight = mcdu.getRouteReservedWeight();
        if (isFinite(rteRsvWeight)) {
            rteRsvWeightCell = fastToFixed(rteRsvWeight, 1);
        }
        let rteRsvPercentCell = "-.-";
        let rteRsvPercent = mcdu.getRouteReservedPercent();
        if (isFinite(rteRsvPercent)) {
            rteRsvPercentCell = fastToFixed(rteRsvPercent, 1);
        }
        let zfwColor = "[color]red";
        let zfwCell = "□□□.□";
        if (isFinite(mcdu.zeroFuelWeight)) {
            zfwCell = fastToFixed(mcdu.zeroFuelWeight, 1);
            zfwColor = "[color]blue;";
        }
        let zfwCgCell = " /□□.□";
        if (isFinite(mcdu.zeroFuelWeightMassCenter)) {
            zfwCgCell = fastToFixed(mcdu.zeroFuelWeightMassCenter, 1);
        }
        mcdu.onRightInput[2] = async () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (await mcdu.trySetZeroFuelWeightZFWCG(value)) {
                CDUInitPage.ShowPage2(mcdu);
            }
        };
        mcdu.setTemplate([
            ["FUEL PRED"],
            ["AT", "EFOB", isFlying ? "UTC" : "TIME"],
            [destIdentCell + "[color]green", "", destTimeCell + "[color]green"],
            [""],
            [""],
            ["RTE RSV/ %", "ZFW/ ZFWCG"],
            [rteRsvWeightCell + " /" + rteRsvPercentCell + "[color]green", zfwCell + zfwCgCell + zfwColor],
            ["ALTN /TIME", "FOB"],
            [""],
            ["FINAL /TIME", "GW/ CG"],
            [""],
            ["MIN DEST FOB", "EXTRA /TIME"],
            [""]
        ]);
    }
}
//# sourceMappingURL=A320_Neo_CDU_FuelPredPage.js.map