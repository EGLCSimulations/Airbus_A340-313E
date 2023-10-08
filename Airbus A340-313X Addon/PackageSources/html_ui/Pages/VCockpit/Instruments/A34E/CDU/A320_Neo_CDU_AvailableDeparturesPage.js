class CDUAvailableDeparturesPage {
    static ShowPage(mcdu, airport, pageCurrent = 0, sidSelection = false) {
        let airportInfo = airport.infos;
        console.log(airportInfo);
        if (airportInfo instanceof AirportInfo) {
            mcdu.clearDisplay();
            let selectedRunwayCell = "---";
            let selectedRunway = mcdu.flightPlanManager.getDepartureRunway();
            if (selectedRunway) {
                selectedRunwayCell = Avionics.Utils.formatRunway(selectedRunway.designation);
                if (mcdu.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
                    selectedRunwayCell += "[color]yellow";
                }
            }
            let selectedSidCell = "------";
            let selectedTransCell = "------";
            let departureEnRouteTransition;
            let selectedDeparture = airportInfo.departures[mcdu.flightPlanManager.getDepartureProcIndex()];
            if (selectedDeparture) {
                selectedSidCell = selectedDeparture.name;
                if (mcdu.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
                    selectedSidCell += "[color]yellow";
                }
                let departureEnRouteTransitionIndex = mcdu.flightPlanManager.getDepartureEnRouteTransitionIndex();
                if (departureEnRouteTransitionIndex > -1) {
                    departureEnRouteTransition = selectedDeparture.enRouteTransitions[departureEnRouteTransitionIndex];
                    if (departureEnRouteTransition) {
                        selectedTransCell = departureEnRouteTransition.name;
                        if (mcdu.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
                            selectedTransCell += "[color]yellow";
                        }
                    }
                }
            }
            let doInsertRunwayOnly = false;
            let insertRow = ["\<RETURN"];
            mcdu.onLeftInput[5] = () => { CDUFlightPlanPage.ShowPage(mcdu); };
            let runways = airportInfo.oneWayRunways;
            let rows = [[""], [""], [""], [""], [""], [""], [""], [""]];
            if (!sidSelection) {
                for (let i = 0; i < 4; i++) {
                    let index = i + pageCurrent;
                    let runway = runways[index];
                    if (runway) {
                        rows[2 * i] = [
                            "←" + Avionics.Utils.formatRunway(runway.designation) + "[color]blue",
                            "CRS" + fastToFixed((runway.direction / 10), 0) + "0[color]blue",
                            fastToFixed(runway.length, 0) + "M[color]blue"
                        ];
                        mcdu.onLeftInput[i + 1] = async () => {
                            mcdu.setOriginRunwayIndex(index, () => {
                                CDUAvailableDeparturesPage.ShowPage(mcdu, airport, 0, true);
                            });
                        };
                    }
                }
            }
            else {
                doInsertRunwayOnly = true;
                insertRow = ["\<F-PLN[color]yellow", "INSERT*[color]red"];
                mcdu.onRightInput[5] = () => {
                    mcdu.insertTemporaryFlightPlan(() => {
                        CDUFlightPlanPage.ShowPage(mcdu, 0);
                    });
                };
                let rowIndex = -pageCurrent + 1;
                let index = 0;
                rows[0] = ["←NONE[color]blue"];
                mcdu.onLeftInput[rowIndex + 1] = () => {
                    mcdu.setDepartureIndex(-1, () => {
                        CDUAvailableDeparturesPage.ShowPage(mcdu, airport);
                    });
                };
                while (rowIndex < 4 && index < airportInfo.departures.length) {
                    let sid = airportInfo.departures[index];
                    let scopout = index;
                    let transitionIndex = 0;
                    index++;
                    if (sid) {
                        let sidMatchesSelectedRunway = false;
                        if (!selectedRunway) {
                            sidMatchesSelectedRunway = true;
                        }
                        else {
                            for (let j = 0; j < sid.runwayTransitions.length; j++) {
                                if (sid.runwayTransitions[j].name.indexOf(selectedRunway.designation) !== -1) {
                                    sidMatchesSelectedRunway = true;
                                    transitionIndex = j;
                                    break;
                                }
                            }
                        }
                        if (sidMatchesSelectedRunway) {
                            if (rowIndex >= 1) {
                                rows[2 * rowIndex] = ["←" + sid.name + "[color]blue"];
                                mcdu.onLeftInput[rowIndex + 1] = () => {
                                    mcdu.setRunwayIndex(transitionIndex, (success) => {
                                        mcdu.setDepartureIndex(scopout, () => {
                                            CDUAvailableDeparturesPage.ShowPage(mcdu, airport, 0, true);
                                        });
                                    });
                                };
                            }
                            rowIndex++;
                        }
                    }
                }
                if (selectedDeparture) {
                    for (let i = 0; i < 4; i++) {
                        let enRouteTransitionIndex = i + pageCurrent;
                        let enRouteTransition = selectedDeparture.enRouteTransitions[enRouteTransitionIndex];
                        if (enRouteTransition) {
                            rows[2 * i][1] = enRouteTransition.name + "→[color]blue";
                            mcdu.onRightInput[i + 1] = () => {
                                mcdu.flightPlanManager.setDepartureEnRouteTransitionIndex(enRouteTransitionIndex, () => {
                                    CDUAvailableDeparturesPage.ShowPage(mcdu, airport, 0, true);
                                });
                            };
                        }
                    }
                }
            }
            mcdu.setTemplate([
                ["DEPARTURES FROM " + airport.ident + " →"],
                ["RWY", "TRANS", "SID"],
                [selectedRunwayCell, selectedTransCell, selectedSidCell],
                ["", "", "AVAILABLE " + (sidSelection ? "SIDS" : "RUNWAYS")],
                rows[0],
                rows[1],
                rows[2],
                rows[3],
                rows[4],
                rows[5],
                rows[6],
                [doInsertRunwayOnly ? "TMPY[color]yellow" : ""],
                insertRow
            ]);
            mcdu.onUp = () => {
                pageCurrent++;
                if (sidSelection) {
                    pageCurrent = Math.min(pageCurrent, airportInfo.departures.length - 3);
                }
                else {
                    pageCurrent = Math.min(pageCurrent, airportInfo.oneWayRunways.length - 3);
                }
                if (pageCurrent < 0) {
                    pageCurrent = 0;
                }
                CDUAvailableDeparturesPage.ShowPage(mcdu, airport, pageCurrent, sidSelection);
            };
            mcdu.onDown = () => {
                pageCurrent--;
                if (pageCurrent < 0) {
                    pageCurrent = 0;
                }
                CDUAvailableDeparturesPage.ShowPage(mcdu, airport, pageCurrent, sidSelection);
            };
            mcdu.onPrevPage = () => {
                CDUAvailableDeparturesPage.ShowPage(mcdu, airport, 0, !sidSelection);
            };
            mcdu.onNextPage = mcdu.onPrevPage;
        }
    }
}
//# sourceMappingURL=A320_Neo_CDU_AvailableDeparturesPage.js.map