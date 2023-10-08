class CDUInitPage {
    static ShowPage1(mcdu) {
        mcdu.clearDisplay();
        let fromTo = "□□□□/□□□□[color]red";
        let cruiseFlTemp = "----- /---°";
        let costIndexCell = "---";
        if (mcdu.flightPlanManager.getOrigin() && mcdu.flightPlanManager.getOrigin().ident) {
            if (mcdu.flightPlanManager.getDestination() && mcdu.flightPlanManager.getDestination().ident) {
                fromTo = mcdu.flightPlanManager.getOrigin().ident + "/" + mcdu.flightPlanManager.getDestination().ident + "[color]blue";
                costIndexCell = "□□□[color]red";
                mcdu.onLeftInput[4] = () => {
                    let value = mcdu.inOut;
                    mcdu.clearUserInput();
                    if (mcdu.tryUpdateCostIndex(value)) {
                        CDUInitPage.ShowPage1(mcdu);
                    }
                };
                cruiseFlTemp = "□□□□□ /□□□[color]red";
                if (isFinite(mcdu.cruiseFlightLevel) && mcdu.cruiseFlightLevel > 0) {
                    let temp = mcdu.tempCurve.evaluate(mcdu.cruiseFlightLevel);
                    if (isFinite(mcdu.cruiseTemperature)) {
                        temp = mcdu.cruiseTemperature;
                    }
                    cruiseFlTemp = "FL" + fastToFixed(mcdu.cruiseFlightLevel, 0).padStart(3, "0") + " /" + fastToFixed(temp, 0) + "°[color]blue";
                }
                mcdu.onLeftInput[5] = () => {
                    let value = mcdu.inOut;
                    mcdu.clearUserInput();
                    if (mcdu.setCruiseFlightLevelAndTemperature(value)) {
                        CDUInitPage.ShowPage1(mcdu);
                    }
                };
            }
        }
        let coRoute = "NONE[color]blue";
        if (mcdu.coRoute) {
            coRoute = mcdu.coRoute + "[color]blue";
            ;
        }
        let altDest = "-------[color]blue";
        if (mcdu.flightPlanManager.getDestination()) {
            altDest = "NONE[color]blue";
            if (mcdu.altDestination) {
                altDest = mcdu.altDestination.ident + "[color]blue";
            }
            mcdu.onLeftInput[1] = async () => {
                let value = mcdu.inOut;
                mcdu.clearUserInput();
                if (await mcdu.tryUpdateAltDestination(value)) {
                    CDUInitPage.ShowPage1(mcdu);
                }
            };
        }
        let flightNo = SimVar.GetSimVarValue("ATC FLIGHT NUMBER", "string");
        if (!flightNo || flightNo.length < 2) {
            flightNo = "□□□□□□□[color]red";
        }
        else {
            flightNo += "[color]blue";
        }
        let lat = "----.--";
        let long = "-----.--";
        console.log(mcdu.flightPlanManager.getOrigin());
        if (mcdu.flightPlanManager.getOrigin() && mcdu.flightPlanManager.getOrigin().infos && mcdu.flightPlanManager.getOrigin().infos.coordinates) {
            lat = mcdu.flightPlanManager.getOrigin().infos.coordinates.latToDegreeString() + "[color]blue";
            long = mcdu.flightPlanManager.getOrigin().infos.coordinates.longToDegreeString() + "[color]blue";
        }
        if (isFinite(mcdu.costIndex)) {
            costIndexCell = mcdu.costIndex + "[color]blue";
        }
        mcdu.setTemplate([
            ["INIT →"],
            ["CO RTE", "FROM/TO"],
            [coRoute, fromTo],
            ["ALTN/CO RTE"],
            [altDest],
            ["FLT NBR"],
            [flightNo],
            ["LAT", "LONG"],
            [lat, long],
            ["COST INDEX"],
            [costIndexCell, "WIND>"],
            ["CRZ FL/TEMP", "TROPO"],
            [cruiseFlTemp, "36090[color]blue"]
        ]);
        mcdu.onLeftInput[0] = async () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            mcdu.updateCoRoute(value, (result) => {
                if (result) {
                    CDUInitPage.ShowPage1(mcdu);
                }
            });
        };
        mcdu.onRightInput[0] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            mcdu.tryUpdateFromTo(value, (result) => {
                if (result) {
                    CDUAvailableFlightPlanPage.ShowPage(mcdu);
                }
            });
        };
        mcdu.onLeftInput[2] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            mcdu.updateFlightNo(value, (result) => {
                if (result) {
                    CDUInitPage.ShowPage1(mcdu);
                }
            });
        };
        mcdu.onPrevPage = () => {
            CDUInitPage.ShowPage2(mcdu);
        };
        mcdu.onNextPage = () => {
            CDUInitPage.ShowPage2(mcdu);
        };
        Coherent.trigger("AP_ALT_VAL_SET", 4200);
        Coherent.trigger("AP_VS_VAL_SET", 300);
        Coherent.trigger("AP_HDG_VAL_SET", 180);
    }
    static ShowPage2(mcdu) {
        mcdu.updateFuelVars().then(() => {
            mcdu.clearDisplay();
            CDUInitPage._timer = 0;
            mcdu.pageUpdate = () => {
                CDUInitPage._timer++;
                if (CDUInitPage._timer >= 30) {
                    CDUInitPage.ShowPage2(mcdu);
                }
            };
            let taxiFuelCell = "-.-";
            let taxiFuelWeight = mcdu.taxiFuelWeight;
            if (isFinite(taxiFuelWeight)) {
                taxiFuelCell = fastToFixed(taxiFuelWeight, 1);
            }
            mcdu.onLeftInput[0] = async () => {
                let value = mcdu.inOut;
                mcdu.clearUserInput();
                if (await mcdu.trySetTaxiFuelWeight(value)) {
                    CDUInitPage.ShowPage2(mcdu);
                }
            };
            let tripWeightCell = "--.-";
            let tripWeight = mcdu.getFuelVarsUpdatedTripCons();
            if (isFinite(tripWeight)) {
                tripWeightCell = fastToFixed(tripWeight, 1);
            }
            let tripTimeCell = "----";
            if (isFinite(mcdu.getTotalTripTime())) {
                tripTimeCell = FMCMainDisplay.secondsTohhmm(mcdu.getTotalTripTime());
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
            mcdu.onLeftInput[2] = async () => {
                let value = mcdu.inOut;
                mcdu.clearUserInput();
                if (await mcdu.trySetRouteReservedFuel(value)) {
                    CDUInitPage.ShowPage2(mcdu);
                }
            };
            let rteFinalWeightCell = "--.-";
            let rteFinalWeight = mcdu.getRouteFinalFuelWeight();
            if (isFinite(rteFinalWeight)) {
                rteFinalWeightCell = fastToFixed(rteFinalWeight, 1);
            }
            let rteFinalTimeCell = "----";
            let rteFinalTime = mcdu.getRouteFinalFuelTime();
            if (isFinite(rteFinalTime)) {
                rteFinalTimeCell = FMCMainDisplay.secondsTohhmm(rteFinalTime);
            }
            mcdu.onLeftInput[4] = async () => {
                let value = mcdu.inOut;
                mcdu.clearUserInput();
                if (await mcdu.trySetRouteFinalFuel(value)) {
                    CDUInitPage.ShowPage2(mcdu);
                }
            };
            let zfwColor = "[color]red";
            let zfwCell = "□□□.□";
            let zfwCgCell = " /□□.□";
            let zfw = mcdu.getZeroFuelWeight();
            if (isFinite(zfw)) {
                zfwCell = fastToFixed(zfw, 1);
            }
            if (isFinite(mcdu.zeroFuelWeightMassCenter)) {
                zfwCgCell = " /" + fastToFixed(mcdu.zeroFuelWeightMassCenter, 1);
            }
            if (isFinite(zfw) && isFinite(mcdu.zeroFuelWeightMassCenter)) {
                zfwColor = "[color]blue";
            }
            mcdu.onRightInput[0] = async () => {
                let value = mcdu.inOut;
                mcdu.clearUserInput();
                if (value === "") {
                    mcdu.inOut = (isFinite(zfw) ? fastToFixed(zfw, 1) : "") + "/" + (isFinite(mcdu.zeroFuelWeightMassCenter) ? fastToFixed(mcdu.zeroFuelWeightMassCenter, 1) : "");
                }
                else if (await mcdu.trySetZeroFuelWeightZFWCG(value)) {
                    CDUInitPage.ShowPage2(mcdu);
                }
            };
            let blockFuelCell = "□□.□[color]red";
            let blockFuelWeight = mcdu.getBlockFuel(false);
            if (isFinite(blockFuelWeight)) {
                blockFuelCell = fastToFixed(blockFuelWeight, 1) + "[color]blue";
            }
            let towCell = "---.-";
            let takeOffWeight = NaN;
            if (isFinite(zfw)) {
                if (isFinite(blockFuelWeight)) {
                    if (isFinite(taxiFuelWeight)) {
                        takeOffWeight = zfw + blockFuelWeight - taxiFuelWeight;
                    }
                }
            }
            if (isFinite(takeOffWeight)) {
                towCell = fastToFixed(takeOffWeight, 1);
            }
            let lwCell = "---.-";
            let landingWeight = NaN;
            if (isFinite(takeOffWeight)) {
                if (isFinite(tripWeight)) {
                    landingWeight = takeOffWeight - tripWeight;
                }
            }
            if (isFinite(landingWeight)) {
                lwCell = fastToFixed(landingWeight, 1);
            }
            mcdu.onRightInput[3] = async () => {
                let value = mcdu.inOut;
                mcdu.clearUserInput();
                if (await mcdu.trySetTakeOffWeightLandingWeight(value)) {
                    CDUInitPage.ShowPage2(mcdu);
                }
            };
            let tripWindCell = "---.-";
            if (isFinite(mcdu.averageWind)) {
                tripWindCell = fastToFixed(mcdu.averageWind, 1);
            }
            mcdu.onRightInput[4] = async () => {
                let value = mcdu.inOut;
                mcdu.clearUserInput();
                if (await mcdu.trySetAverageWind(value)) {
                    CDUInitPage.ShowPage2(mcdu);
                }
            };
            mcdu.setTemplate([
                ["INIT →"],
                ["TAXI", "ZFW /ZFWCG"],
                [taxiFuelCell + "[color]blue", zfwCell + zfwCgCell + zfwColor],
                ["TRIP/TIME", "BLOCK"],
                [tripWeightCell + " /" + tripTimeCell + "[color]green", blockFuelCell],
                ["RTE RSV /%"],
                [rteRsvWeightCell + " /" + rteRsvPercentCell + "[color]blue"],
                ["ALTN /TIME", "TOW /LW"],
                ["--.-/----", towCell + " /" + lwCell + "[color]green"],
                ["FINAL /TIME", "TRIP WIND"],
                [rteFinalWeightCell + " /" + rteFinalTimeCell + "[color]blue", tripWindCell + "[color]blue"],
                ["MIN DEST FOB", "EXTRA /TIME"],
                ["-----", "--.-/----"]
            ]);
            mcdu.onPrevPage = () => {
                CDUInitPage.ShowPage1(mcdu);
            };
            mcdu.onNextPage = () => {
                CDUInitPage.ShowPage1(mcdu);
            };
        });
    }
}
CDUInitPage._timer = 0;
//# sourceMappingURL=A320_Neo_CDU_InitPage.js.map