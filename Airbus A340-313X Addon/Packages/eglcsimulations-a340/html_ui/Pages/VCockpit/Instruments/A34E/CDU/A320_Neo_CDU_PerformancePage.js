class CDUPerformancePage {
    static ShowPage(mcdu) {
        if (mcdu.currentFlightPhase <= FlightPhase.FLIGHT_PHASE_TAKEOFF) {
            CDUPerformancePage.ShowTAKEOFFPage(mcdu);
        }
        else if (mcdu.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB) {
            CDUPerformancePage.ShowCLBPage(mcdu);
        }
        else if (mcdu.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {
            CDUPerformancePage.ShowCRZPage(mcdu);
        }
        else if (mcdu.currentFlightPhase === FlightPhase.FLIGHT_PHASE_DESCENT) {
            CDUPerformancePage.ShowDESPage(mcdu);
        }
        else if (mcdu.currentFlightPhase === FlightPhase.FLIGHT_PHASE_APPROACH) {
            CDUPerformancePage.ShowAPPRPage(mcdu);
        }
    }
    static ShowTAKEOFFPage(mcdu) {
        mcdu.clearDisplay();
        CDUPerformancePage._timer = 0;
        CDUPerformancePage._lastPhase = mcdu.currentFlightPhase;
        mcdu.pageUpdate = () => {
            CDUPerformancePage._timer++;
            if (CDUPerformancePage._timer >= 15) {
                if (mcdu.currentFlightPhase === CDUPerformancePage._lastPhase) {
                    CDUPerformancePage.ShowTAKEOFFPage(mcdu);
                }
                else {
                    CDUPerformancePage.ShowPage(mcdu);
                }
            }
        };
        let titleColor = "white";
        if (mcdu.currentFlightPhase === FlightPhase.FLIGHT_PHASE_TAKEOFF) {
            titleColor = "green";
        }
        let runway = "---";
        let selectedRunway = mcdu.flightPlanManager.getDepartureRunway();
        if (selectedRunway) {
            runway = Avionics.Utils.formatRunway(selectedRunway.designation);
        }
        else {
            let predictedRunway = mcdu.flightPlanManager.getDetectedCurrentRunway();
            if (predictedRunway) {
                runway = Avionics.Utils.formatRunway(predictedRunway.designation);
            }
        }
        let v1 = "□□□[color]red";
        if (mcdu.v1Speed) {
            v1 = mcdu.v1Speed + "[color]blue";
        }
        mcdu.onLeftInput[0] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (value === FMCMainDisplay.clrValue) {
                mcdu.trySetV1Speed(undefined);
                CDUPerformancePage.ShowTAKEOFFPage(mcdu);
            }
            else if (value === "") {
                mcdu._computeV1Speed();
                CDUPerformancePage.ShowTAKEOFFPage(mcdu);
            }
            else {
                if (mcdu.trySetV1Speed(value)) {
                    CDUPerformancePage.ShowTAKEOFFPage(mcdu);
                }
            }
        };
        let vR = "□□□[color]red";
        if (mcdu.vRSpeed) {
            vR = mcdu.vRSpeed + "[color]blue";
        }
        mcdu.onLeftInput[1] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (value === FMCMainDisplay.clrValue) {
                mcdu.trySetVRSpeed(undefined);
                CDUPerformancePage.ShowTAKEOFFPage(mcdu);
            }
            else if (value === "") {
                mcdu._computeVRSpeed();
                CDUPerformancePage.ShowTAKEOFFPage(mcdu);
            }
            else {
                if (mcdu.trySetVRSpeed(value)) {
                    CDUPerformancePage.ShowTAKEOFFPage(mcdu);
                }
            }
        };
        let v2 = "□□□[color]red";
        if (mcdu.v2Speed) {
            v2 = mcdu.v2Speed + "[color]blue";
        }
        mcdu.onLeftInput[2] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (value === FMCMainDisplay.clrValue) {
                mcdu.trySetV2Speed(undefined);
                CDUPerformancePage.ShowTAKEOFFPage(mcdu);
            }
            else if (value === "") {
                mcdu._computeV2Speed();
                CDUPerformancePage.ShowTAKEOFFPage(mcdu);
            }
            else {
                if (mcdu.trySetV2Speed(value)) {
                    CDUPerformancePage.ShowTAKEOFFPage(mcdu);
                }
            }
        };
        let transAlt = "---[color]blue";
        if (isFinite(mcdu.transitionAltitude)) {
            transAlt = mcdu.transitionAltitude + "[color]blue";
        }
        mcdu.onLeftInput[3] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (mcdu.trySetTransAltitude(value)) {
                CDUPerformancePage.ShowTAKEOFFPage(mcdu);
            }
        };
        let thrRedAcc = "";
        if (isFinite(mcdu.thrustReductionAltitude)) {
            thrRedAcc = fastToFixed(mcdu.thrustReductionAltitude, 0);
        }
        else {
            thrRedAcc = "---";
        }
        thrRedAcc += " /";
        if (isFinite(mcdu.accelerationAltitude)) {
            thrRedAcc += fastToFixed(mcdu.accelerationAltitude, 0);
        }
        else {
            thrRedAcc += "---";
        }
        thrRedAcc += "[color]blue";
        mcdu.onLeftInput[4] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (mcdu.trySetThrustReductionAccelerationAltitude(value)) {
                CDUPerformancePage.ShowTAKEOFFPage(mcdu);
            }
        };
        let flpRetrCell = "165" + "[color]green";
        let flapSpeed = mcdu.getFlapTakeOffSpeed();
        if (isFinite(flapSpeed)) {
            flpRetrCell = fastToFixed(flapSpeed, 0) + "[color]green";
        }
        let sltRetrCell = "195" + "[color]green";
        let slatSpeed = mcdu.getSlatTakeOffSpeed();
        if (isFinite(slatSpeed)) {
            sltRetrCell = fastToFixed(slatSpeed, 0) + "[color]green";
        }
        let cleanCell = "210" + "[color]green";
        let cleanSpeed = mcdu.getCleanTakeOffSpeed();
        if (isFinite(cleanSpeed)) {
            cleanCell = fastToFixed(cleanSpeed, 0) + "[color]green";
        }
        let flapsThs = "[]/[]";
        if (mcdu.flaps) {
            flapsThs = mcdu.flaps + "/";
            if (mcdu.ths) {
                flapsThs += mcdu.ths;
            }
            else {
                flapsThs += "[]";
            }
        }
        mcdu.onRightInput[2] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (mcdu.trySetFlapsTHS(value)) {
                CDUPerformancePage.ShowTAKEOFFPage(mcdu);
            }
        };
        let flexTakeOffTempCell = "[]°";
        if (isFinite(mcdu.perfTOTemp)) {
            flexTakeOffTempCell = mcdu.perfTOTemp + "°";
        }
        mcdu.onRightInput[3] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (mcdu.setPerfTOFlexTemp(value)) {
                CDUPerformancePage.ShowTAKEOFFPage(mcdu);
            }
        };
        mcdu.setTemplate([
            ["TAKE OFF[color]" + titleColor],
            ["V1", "RWY", "FLP RETR"],
            [v1, runway, "F=" + flpRetrCell],
            ["VR", "TO SHIFT", "SLT RETR"],
            [vR, "[M][]*[color]blue", "S=" + sltRetrCell],
            ["V2", "FLAPS/THS", "CLEAN"],
            [v2, flapsThs + "[color]blue", "O=" + cleanCell],
            ["TRANS ALT", "FLEX TO TEMP"],
            [transAlt, flexTakeOffTempCell + "[color]blue"],
            ["THR RED/ACC", "ENG OUT ACC"],
            [thrRedAcc, "1680[color]blue"],
            ["", "NEXT"],
            ["", "PHASE>"]
        ]);
        mcdu.onRightInput[5] = () => {
            CDUPerformancePage.ShowCLBPage(mcdu);
        };
    }
    static ShowCLBPage(mcdu, confirmAppr = false) {
        mcdu.clearDisplay();
        CDUPerformancePage._timer = 0;
        CDUPerformancePage._lastPhase = mcdu.currentFlightPhase;
        mcdu.pageUpdate = () => {
            CDUPerformancePage._timer++;
            if (CDUPerformancePage._timer >= 100) {
                if (mcdu.currentFlightPhase === CDUPerformancePage._lastPhase) {
                    CDUPerformancePage.ShowCLBPage(mcdu);
                }
                else {
                    CDUPerformancePage.ShowPage(mcdu);
                }
            }
        };
        let titleColor = "white";
        if (mcdu.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB) {
            titleColor = "green";
        }
        let isFlying = mcdu.getIsFlying();
        let actModeCell = "SELECTED";
        if (mcdu.isAirspeedManaged()) {
            actModeCell = "MANAGED";
        }
        let costIndexCell = "[][color]blue";
        if (isFinite(mcdu.costIndex)) {
            costIndexCell = fastToFixed(mcdu.costIndex, 0) + "[color]blue";
        }
        let managedSpeedCell = "";
        let managedSpeed = mcdu.getClbManagedSpeed();
        if (isFinite(managedSpeed)) {
            managedSpeedCell = fastToFixed(managedSpeed, 0);
        }
        let selectedSpeedCell = "";
        if (isFinite(mcdu.preSelectedClbSpeed)) {
            selectedSpeedCell = fastToFixed(mcdu.preSelectedClbSpeed, 0);
        }
        else {
            selectedSpeedCell = "[]";
        }
        mcdu.onLeftInput[3] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (mcdu.trySetPreSelectedClimbSpeed(value)) {
                CDUPerformancePage.ShowCLBPage(mcdu);
            }
        };
        let timeLabel = "TIME";
        if (isFlying) {
            timeLabel = "UTC";
        }
        let bottomRowLabels = ["PREV", "NEXT"];
        let bottomRowCells = ["\<PHASE", "PHASE>"];
        if (mcdu.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB) {
            if (confirmAppr) {
                bottomRowLabels[0] = "CONFIRM[color]red";
                bottomRowCells[0] = "←APPR PHASE[color]red";
                mcdu.onLeftInput[5] = async () => {
                    if (await mcdu.tryGoInApproachPhase()) {
                        CDUPerformancePage.ShowAPPRPage(mcdu);
                    }
                };
            }
            else {
                bottomRowLabels[0] = "ACTIVATE[color]blue";
                bottomRowCells[0] = "←APPR PHASE[color]blue";
                mcdu.onLeftInput[5] = () => {
                    CDUPerformancePage.ShowCLBPage(mcdu, true);
                };
            }
        }
        else {
            mcdu.onLeftInput[5] = () => {
                CDUPerformancePage.ShowTAKEOFFPage(mcdu);
            };
        }
        mcdu.onRightInput[5] = () => {
            CDUPerformancePage.ShowCRZPage(mcdu);
        };
        mcdu.setTemplate([
            ["CLB[color]" + titleColor],
            ["ACT MODE", "EFOB", timeLabel],
            [actModeCell + "[color]green", "6.0[color]green", "----[color]green"],
            ["CI"],
            [costIndexCell + "[color]blue"],
            ["MANAGED"],
            ["*" + managedSpeedCell + "[color]green"],
            ["SELECTED"],
            [selectedSpeedCell + "[color]green"],
            [""],
            [""],
            bottomRowLabels,
            bottomRowCells
        ]);
    }
    static ShowCRZPage(mcdu, confirmAppr = false) {
        mcdu.clearDisplay();
        CDUPerformancePage._timer = 0;
        CDUPerformancePage._lastPhase = mcdu.currentFlightPhase;
        mcdu.pageUpdate = () => {
            CDUPerformancePage._timer++;
            if (CDUPerformancePage._timer >= 100) {
                if (mcdu.currentFlightPhase === CDUPerformancePage._lastPhase) {
                    CDUPerformancePage.ShowCRZPage(mcdu);
                }
                else {
                    CDUPerformancePage.ShowPage(mcdu);
                }
            }
        };
        let titleColor = "white";
        if (mcdu.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {
            titleColor = "green";
        }
        let isFlying = false;
        let actModeCell = "SELECTED";
        if (mcdu.isAirspeedManaged()) {
            actModeCell = "MANAGED";
        }
        let costIndexCell = "[][color]blue";
        if (isFinite(mcdu.costIndex)) {
            costIndexCell = fastToFixed(mcdu.costIndex, 0) + "[color]blue";
        }
        let managedSpeedCell = "";
        let managedSpeed = mcdu.getCrzManagedSpeed();
        if (isFinite(managedSpeed)) {
            managedSpeedCell = fastToFixed(managedSpeed, 0);
        }
        let selectedSpeedCell = "";
        if (isFinite(mcdu.preSelectedCrzSpeed)) {
            selectedSpeedCell = fastToFixed(mcdu.preSelectedCrzSpeed, 0);
        }
        else {
            selectedSpeedCell = "[]";
        }
        mcdu.onLeftInput[3] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (mcdu.trySetPreSelectedCruiseSpeed(value)) {
                CDUPerformancePage.ShowCRZPage(mcdu);
            }
        };
        let timeLabel = "TIME";
        if (isFlying) {
            timeLabel = "UTC";
        }
        let bottomRowLabels = ["PREV", "NEXT"];
        let bottomRowCells = ["\<PHASE", "PHASE>"];
        if (mcdu.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {
            if (confirmAppr) {
                bottomRowLabels[0] = "CONFIRM[color]red";
                bottomRowCells[0] = "←APPR PHASE[color]red";
                mcdu.onLeftInput[5] = async () => {
                    if (await mcdu.tryGoInApproachPhase()) {
                        CDUPerformancePage.ShowAPPRPage(mcdu);
                    }
                };
            }
            else {
                bottomRowLabels[0] = "ACTIVATE[color]blue";
                bottomRowCells[0] = "←APPR PHASE[color]blue";
                mcdu.onLeftInput[5] = () => {
                    CDUPerformancePage.ShowCRZPage(mcdu, true);
                };
            }
        }
        else {
            mcdu.onLeftInput[5] = () => {
                CDUPerformancePage.ShowCLBPage(mcdu);
            };
        }
        mcdu.onRightInput[5] = () => {
            CDUPerformancePage.ShowDESPage(mcdu);
        };
        mcdu.setTemplate([
            ["CRZ[color]" + titleColor],
            ["ACT MODE", "EFOB", timeLabel],
            [actModeCell + "[color]green", "6.0[color]green", "----[color]green"],
            ["CI"],
            [costIndexCell + "[color]blue"],
            ["MANAGED"],
            ["*" + managedSpeedCell + "[color]green"],
            ["SELECTED"],
            [selectedSpeedCell + "[color]blue"],
            ["", "DES CABIN RATE>"],
            ["", "-350FT/MIN[color]green"],
            bottomRowLabels,
            bottomRowCells
        ]);
    }
    static ShowDESPage(mcdu, confirmAppr = false) {
        mcdu.clearDisplay();
        CDUPerformancePage._timer = 0;
        CDUPerformancePage._lastPhase = mcdu.currentFlightPhase;
        mcdu.pageUpdate = () => {
            CDUPerformancePage._timer++;
            if (CDUPerformancePage._timer >= 100) {
                if (mcdu.currentFlightPhase === CDUPerformancePage._lastPhase) {
                    CDUPerformancePage.ShowDESPage(mcdu);
                }
                else {
                    CDUPerformancePage.ShowPage(mcdu);
                }
            }
        };
        let titleColor = "white";
        if (mcdu.currentFlightPhase === FlightPhase.FLIGHT_PHASE_DESCENT) {
            titleColor = "green";
        }
        let isFlying = false;
        let actModeCell = "SELECTED";
        if (mcdu.isAirspeedManaged()) {
            actModeCell = "MANAGED";
        }
        let costIndexCell = "[][color]blue";
        if (isFinite(mcdu.costIndex)) {
            costIndexCell = fastToFixed(mcdu.costIndex, 0) + "[color]blue";
        }
        let managedSpeedCell = "";
        let managedSpeed = mcdu.getDesManagedSpeed();
        if (isFinite(managedSpeed)) {
            managedSpeedCell = fastToFixed(managedSpeed, 0);
        }
        let selectedSpeedCell = "";
        if (isFinite(mcdu.preSelectedDesSpeed)) {
            selectedSpeedCell = fastToFixed(mcdu.preSelectedDesSpeed, 0);
        }
        else {
            selectedSpeedCell = "[]";
        }
        mcdu.onLeftInput[3] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (mcdu.trySetPreSelectedDescentSpeed(value)) {
                CDUPerformancePage.ShowDESPage(mcdu);
            }
        };
        let timeLabel = "TIME";
        if (isFlying) {
            timeLabel = "UTC";
        }
        let bottomRowLabels = ["PREV", "NEXT"];
        let bottomRowCells = ["\<PHASE", "PHASE>"];
        if (mcdu.currentFlightPhase === FlightPhase.FLIGHT_PHASE_DESCENT) {
            if (confirmAppr) {
                bottomRowLabels[0] = "CONFIRM[color]red";
                bottomRowCells[0] = "←APPR PHASE[color]red";
                mcdu.onLeftInput[5] = async () => {
                    if (await mcdu.tryGoInApproachPhase()) {
                        CDUPerformancePage.ShowAPPRPage(mcdu);
                    }
                };
            }
            else {
                bottomRowLabels[0] = "ACTIVATE[color]blue";
                bottomRowCells[0] = "←APPR PHASE[color]blue";
                mcdu.onLeftInput[5] = () => {
                    CDUPerformancePage.ShowDESPage(mcdu, true);
                };
            }
        }
        else {
            mcdu.onLeftInput[5] = () => {
                CDUPerformancePage.ShowCRZPage(mcdu);
            };
        }
        mcdu.onRightInput[5] = () => {
            CDUPerformancePage.ShowAPPRPage(mcdu);
        };
        mcdu.setTemplate([
            ["DES[color]" + titleColor],
            ["ACT MODE", "EFOB", timeLabel],
            [actModeCell + "[color]green", "6.0[color]green", "----[color]green"],
            ["CI"],
            [costIndexCell + "[color]blue"],
            ["MANAGED"],
            ["*" + managedSpeedCell + "[color]green"],
            ["SELECTED"],
            [selectedSpeedCell + "[color]blue"],
            [""],
            [""],
            bottomRowLabels,
            bottomRowCells
        ]);
    }
    static ShowAPPRPage(mcdu) {
        mcdu.clearDisplay();
        CDUPerformancePage._timer = 0;
        CDUPerformancePage._lastPhase = mcdu.currentFlightPhase;
        mcdu.pageUpdate = () => {
            CDUPerformancePage._timer++;
            if (CDUPerformancePage._timer >= 100) {
                if (mcdu.currentFlightPhase === CDUPerformancePage._lastPhase) {
                    CDUPerformancePage.ShowAPPRPage(mcdu);
                }
            }
        };
        let titleColor = "white";
        if (mcdu.currentFlightPhase === FlightPhase.FLIGHT_PHASE_APPROACH) {
            titleColor = "green";
        }
        let qnhCell = "[ ]";
        if (isFinite(mcdu.perfApprQNH)) {
            qnhCell = fastToFixed(mcdu.perfApprQNH, 2);
        }
        mcdu.onLeftInput[0] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (mcdu.setPerfApprQNH(value)) {
                CDUPerformancePage.ShowAPPRPage(mcdu);
            }
        };
        let tempCell = "[ ]";
        if (isFinite(mcdu.perfApprTemp)) {
            tempCell = fastToFixed(mcdu.perfApprTemp, 0);
        }
        mcdu.onLeftInput[1] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (mcdu.setPerfApprTemp(value)) {
                CDUPerformancePage.ShowAPPRPage(mcdu);
            }
        };
        let magWindHeadingCell = "[ ]";
        if (isFinite(mcdu.perfApprWindHeading)) {
            magWindHeadingCell = fastToFixed(mcdu.perfApprWindHeading, 0);
        }
        let magWindSpeedCell = "[ ]";
        if (isFinite(mcdu.perfApprWindSpeed)) {
            magWindSpeedCell = fastToFixed(mcdu.perfApprWindSpeed, 0);
        }
        mcdu.onLeftInput[2] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (mcdu.setPerfApprWind(value)) {
                CDUPerformancePage.ShowAPPRPage(mcdu);
            }
        };
        let transAltCell = "---";
        if (isFinite(mcdu.perfApprTransAlt)) {
            transAltCell = fastToFixed(mcdu.perfApprTransAlt, 0);
        }
        mcdu.onLeftInput[3] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (mcdu.setPerfApprTransAlt(value)) {
                CDUPerformancePage.ShowAPPRPage(mcdu);
            }
        };
        let vappCell = "---";
        let vApp = mcdu.getVApp();
        if (isFinite(vApp)) {
            vappCell = fastToFixed(vApp, 0);
        }
        mcdu.onLeftInput[4] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (mcdu.setPerfApprVApp(value)) {
                CDUPerformancePage.ShowAPPRPage(mcdu);
            }
        };
        let vlsCell = "---";
        let vls = mcdu.getVLS();
        if (isFinite(vls)) {
            vlsCell = fastToFixed(vls, 0);
        }
        let finalCell = "-----";
        let approach = mcdu.flightPlanManager.getApproach();
        if (approach && approach.name) {
            finalCell = Avionics.Utils.formatRunway(approach.name);
        }
        let mdaCell = "[ ]";
        if (isFinite(mcdu.perfApprMDA)) {
            mdaCell = fastToFixed(mcdu.perfApprMDA, 0);
        }
        mcdu.onRightInput[1] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (mcdu.setPerfApprMDA(value)) {
                CDUPerformancePage.ShowAPPRPage(mcdu);
            }
        };
        let dhCell = "[ ]";
        if (isFinite(mcdu.perfApprDH)) {
            dhCell = fastToFixed(mcdu.perfApprDH, 0);
        }
        mcdu.onRightInput[2] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            if (mcdu.setPerfApprDH(value)) {
                CDUPerformancePage.ShowAPPRPage(mcdu);
            }
        };
        let flpRetrCell = "---";
        let flapSpeed = mcdu.getFlapApproachSpeed();
        if (isFinite(flapSpeed)) {
            flpRetrCell = fastToFixed(flapSpeed, 0) + "[color]green";
        }
        let sltRetrCell = "---";
        let slatSpeed = mcdu.getSlatApproachSpeed();
        if (isFinite(slatSpeed)) {
            sltRetrCell = fastToFixed(slatSpeed, 0) + "[color]green";
        }
        let cleanCell = "---";
        let cleanSpeed = mcdu.getCleanApproachSpeed();
        if (isFinite(cleanSpeed)) {
            cleanCell = fastToFixed(cleanSpeed, 0) + "[color]green";
        }
        mcdu.setTemplate([
            ["APPR[color]" + titleColor],
            ["QNH", "FINAL", "FLP RETR"],
            [qnhCell + "[color]blue", finalCell + "[color]green", "F=" + flpRetrCell + "[color]green"],
            ["TEMP", "MDA", "SLT RETR"],
            [tempCell + "°[color]blue", mdaCell + "[color]blue", "S=" + sltRetrCell + "[color]green"],
            ["MAG WIND", "DH", "CLEAN"],
            [magWindHeadingCell + "°/" + magWindSpeedCell + "[color]blue", dhCell + "[color]blue", "0=" + cleanCell + "[color]green"],
            ["TRANS ALT", "LDG CONF"],
            [transAltCell + "[color]blue", "CONF3*[color]green"],
            ["VAPP", "", "VLS"],
            [vappCell + "[color]blue", "FULL[color]green", vlsCell + "[color]green"],
            ["PREV", "NEXT"],
            ["\<PHASE", "PHASE>"]
        ]);
        mcdu.onLeftInput[5] = () => {
            CDUPerformancePage.ShowDESPage(mcdu);
        };
        mcdu.onRightInput[5] = () => {
            CDUPerformancePage.ShowGOAROUNDPage(mcdu);
        };
    }
    static ShowGOAROUNDPage(mcdu) {
        mcdu.clearDisplay();
        CDUPerformancePage._timer = 0;
        CDUPerformancePage._lastPhase = mcdu.currentFlightPhase;
        mcdu.pageUpdate = () => {
            CDUPerformancePage._timer++;
            if (CDUPerformancePage._timer >= 100) {
                if (mcdu.currentFlightPhase === CDUPerformancePage._lastPhase) {
                    CDUPerformancePage.ShowGOAROUNDPage(mcdu);
                }
                else {
                    CDUPerformancePage.ShowPage(mcdu);
                }
            }
        };
        mcdu.setTemplate([
            ["GO AROUND"],
            ["", "", "FLP RETR"],
            ["", "", "F=---"],
            ["", "", "SLT RETR"],
            ["", "", "S=---"],
            ["", "", "CLEAN"],
            ["", "", "0=---"],
            [""],
            [""],
            ["THR RED/ACC", "OUT ACC", "ENG"],
            ["1490/1490[color]blue", "1490[color]blue", "---"],
            ["PREV"],
            ["\<PHASE"]
        ]);
        mcdu.onLeftInput[5] = () => {
            CDUPerformancePage.ShowAPPRPage(mcdu);
        };
    }
}
CDUPerformancePage._timer = 0;
//# sourceMappingURL=A320_Neo_CDU_PerformancePage.js.map