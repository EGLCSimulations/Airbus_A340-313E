class CDUNavRadioPage {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.refreshPageCallback = () => {
            CDUNavRadioPage.ShowPage(mcdu);
        };
        let radioOn = mcdu.isRadioNavActive();
        let vor1FrequencyCell = "";
        let vor1CourseCell = "";
        let ilsFrequencyCell = "";
        let ilsCourseCell = "";
        let adf1FrequencyCell = "";
        if (!radioOn) {
            vor1FrequencyCell = "[]/";
            if (mcdu.vor1FrequencyIdent != "") {
                vor1FrequencyCell = mcdu.vor1FrequencyIdent + "/";
            }
            else {
                let approach = mcdu.flightPlanManager.getApproach();
                if (approach && approach.name && approach.name.indexOf("VOR") !== -1) {
                    if (approach.vorIdent != "") {
                        mcdu.vor1FrequencyIdent = approach.vorIdent;
                        vor1FrequencyCell = approach.vorIdent + "/";
                    }
                    else {
                        vor1FrequencyCell = Avionics.Utils.formatRunway(approach.name, true) + "/";
                    }
                }
            }
            if (mcdu.vor1Frequency > 0) {
                vor1FrequencyCell += fastToFixed(mcdu.vor1Frequency, 2);
            }
            else {
                vor1FrequencyCell += "[.]";
            }
            mcdu.onLeftInput[0] = () => {
                let value = mcdu.inOut;
                let numValue = parseFloat(value);
                mcdu.clearUserInput();
                if (isFinite(numValue) && numValue >= 108 && numValue <= 117.95 && RadioNav.isHz50Compliant(numValue)) {
                    mcdu.vor1Frequency = numValue;
                    if (mcdu.isRadioNavActive()) {
                        mcdu.requestCall(() => {
                            CDUNavRadioPage.ShowPage(mcdu);
                        });
                    }
                    else {
                        mcdu.radioNav.setVORStandbyFrequency(1, numValue).then(() => {
                            mcdu.radioNav.swapVORFrequencies(1);
                            mcdu.requestCall(() => {
                                CDUNavRadioPage.ShowPage(mcdu);
                            });
                        });
                    }
                }
                else if (value === FMCMainDisplay.clrValue) {
                    mcdu.vor1Frequency = 0;
                    CDUNavRadioPage.ShowPage(mcdu);
                }
                else if (Avionics.Utils.isIdent(value)) {
                    mcdu.vor1FrequencyIdent = value;
                    mcdu.requestCall(() => {
                        CDUNavRadioPage.ShowPage(mcdu);
                    });
                }
                else {
                    mcdu.showErrorMessage(mcdu.defaultInputErrorMessage);
                }
            };
            vor1CourseCell = "[]";
            if (mcdu.vor1Course >= 0) {
                vor1CourseCell = fastToFixed(mcdu.vor1Course, 0) + "°";
            }
            mcdu.onLeftInput[1] = () => {
                let value = mcdu.inOut;
                let numValue = parseFloat(value);
                mcdu.clearUserInput();
                if (isFinite(numValue) && numValue >= 0 && numValue < 360) {
                    SimVar.SetSimVarValue("K:VOR1_SET", "number", numValue).then(() => {
                        mcdu.vor1Course = numValue;
                        mcdu.requestCall(() => {
                            CDUNavRadioPage.ShowPage(mcdu);
                        });
                    });
                }
                else {
                    mcdu.showErrorMessage(mcdu.defaultInputErrorMessage);
                }
            };
            ilsFrequencyCell = "[]/ ";
            ilsCourseCell = "[]";
            if (mcdu.ilsFrequencyIdent != "") {
                ilsFrequencyCell = mcdu.ilsFrequencyIdent + "/ ";
            }
            else {
                let approach = mcdu.flightPlanManager.getApproach();
                if (approach && approach.name && approach.isLocalizer()) {
                    ilsFrequencyCell = Avionics.Utils.formatRunway(approach.name, true) + "/ ";
                    let runway = mcdu.flightPlanManager.getApproachRunway();
                    if (runway) {
                        let magvar = SimVar.GetSimVarValue("MAGVAR", "degrees");
                        ilsCourseCell = fastToFixed((runway.direction - magvar), 0) + "°";
                    }
                }
            }
            if (isFinite(mcdu.ilsFrequency) && mcdu.ilsFrequency > 0) {
                ilsFrequencyCell += fastToFixed(mcdu.ilsFrequency, 2);
            }
            else {
                ilsFrequencyCell += "[ ]";
            }
            mcdu.onLeftInput[2] = () => {
                let value = mcdu.inOut;
                mcdu.clearUserInput();
                if (Avionics.Utils.isIdent(value)) {
                    mcdu.ilsFrequencyIdent = value;
                    mcdu.requestCall(() => {
                        CDUNavRadioPage.ShowPage(mcdu);
                    });
                }
                else if (mcdu.setIlsFrequency(value)) {
                    CDUNavRadioPage.ShowPage(mcdu);
                }
            };
            adf1FrequencyCell = "[]/[.]";
            if (mcdu.adf1Frequency > 0) {
                adf1FrequencyCell = "[]/" + fastToFixed(mcdu.adf1Frequency, 2);
            }
            mcdu.onLeftInput[4] = () => {
                let value = mcdu.inOut;
                let numValue = parseFloat(value);
                mcdu.clearUserInput();
                if (isFinite(numValue) && numValue >= 100 && numValue <= 1699.9) {
                    SimVar.SetSimVarValue("K:ADF_ACTIVE_SET", "Frequency ADF BCD32", Avionics.Utils.make_adf_bcd32(numValue * 1000)).then(() => {
                        mcdu.adf1Frequency = numValue;
                        mcdu.requestCall(() => {
                            CDUNavRadioPage.ShowPage(mcdu);
                        });
                    });
                }
                else {
                    mcdu.showErrorMessage(mcdu.defaultInputErrorMessage);
                }
            };
        }
        let vor2FrequencyCell = "";
        let vor2CourseCell = "";
        let adf2FrequencyCell = "";
        if (!radioOn) {
            vor2FrequencyCell = "[]/";
            if (mcdu.vor2FrequencyIdent != "") {
                vor2FrequencyCell = mcdu.vor2FrequencyIdent + "/";
            }
            if (mcdu.vor2Frequency > 0) {
                vor2FrequencyCell = "[]/" + fastToFixed(mcdu.vor2Frequency, 2);
            }
            else {
                vor2FrequencyCell += "[.]";
            }
            mcdu.onRightInput[0] = () => {
                let value = mcdu.inOut;
                let numValue = parseFloat(value);
                mcdu.clearUserInput();
                if (isFinite(numValue) && numValue >= 108 && numValue <= 117.95 && RadioNav.isHz50Compliant(numValue)) {
                    mcdu.vor2Frequency = numValue;
                    if (mcdu.isRadioNavActive()) {
                        mcdu.requestCall(() => {
                            CDUNavRadioPage.ShowPage(mcdu);
                        });
                    }
                    else {
                        mcdu.radioNav.setVORStandbyFrequency(2, numValue).then(() => {
                            mcdu.radioNav.swapVORFrequencies(2);
                            mcdu.requestCall(() => {
                                CDUNavRadioPage.ShowPage(mcdu);
                            });
                        });
                    }
                }
                else if (value === FMCMainDisplay.clrValue) {
                    mcdu.vor2Frequency = 0;
                    CDUNavRadioPage.ShowPage(mcdu);
                }
                else if (Avionics.Utils.isIdent(value)) {
                    mcdu.vor2FrequencyIdent = value;
                    mcdu.requestCall(() => {
                        CDUNavRadioPage.ShowPage(mcdu);
                    });
                }
                else {
                    mcdu.showErrorMessage(mcdu.defaultInputErrorMessage);
                }
            };
            vor2CourseCell = "[]";
            if (mcdu.vor2Course >= 0) {
                vor2CourseCell = fastToFixed(mcdu.vor2Course, 0) + "°";
            }
            mcdu.onRightInput[1] = () => {
                let value = mcdu.inOut;
                let numValue = parseFloat(value);
                mcdu.clearUserInput();
                if (isFinite(numValue) && numValue >= 0 && numValue < 360) {
                    SimVar.SetSimVarValue("K:VOR2_SET", "number", numValue).then(() => {
                        mcdu.vor2Course = numValue;
                        mcdu.requestCall(() => {
                            CDUNavRadioPage.ShowPage(mcdu);
                        });
                    });
                }
                else {
                    mcdu.showErrorMessage(mcdu.defaultInputErrorMessage);
                }
            };
            adf2FrequencyCell = "[.]/[]";
            if (mcdu.adf2Frequency > 0) {
                adf2FrequencyCell = fastToFixed(mcdu.adf2Frequency, 2) + "/[]";
            }
            mcdu.onRightInput[4] = () => {
                let value = mcdu.inOut;
                let numValue = parseFloat(value);
                mcdu.clearUserInput();
                if (isFinite(numValue) && numValue >= 100 && numValue <= 1699.9) {
                    SimVar.SetSimVarValue("K:ADF2_ACTIVE_SET", "Frequency ADF BCD32", Avionics.Utils.make_adf_bcd32(numValue * 1000)).then(() => {
                        mcdu.adf2Frequency = numValue;
                        mcdu.requestCall(() => {
                            CDUNavRadioPage.ShowPage(mcdu);
                        });
                    });
                }
                else {
                    mcdu.showErrorMessage(mcdu.defaultInputErrorMessage);
                }
            };
        }
        mcdu.setTemplate([
            ["RADIO NAV"],
            ["VOR1/FREQ", "FREQ/VOR2"],
            [vor1FrequencyCell + "[color]blue", vor2FrequencyCell + "[color]blue"],
            ["CRS", "CRS"],
            [vor1CourseCell + "[color]blue", vor2CourseCell + "[color]blue"],
            ["ILS/FREQ"],
            [ilsFrequencyCell + "[color]blue"],
            ["CRS"],
            [ilsCourseCell],
            ["ADF1/FREQ", "FREQ/ADF2"],
            [adf1FrequencyCell + "[color]blue", adf2FrequencyCell + "[color]blue"],
            [""],
            [""]
        ]);
    }
}
//# sourceMappingURL=A320_Neo_CDU_NavRadioPage.js.map