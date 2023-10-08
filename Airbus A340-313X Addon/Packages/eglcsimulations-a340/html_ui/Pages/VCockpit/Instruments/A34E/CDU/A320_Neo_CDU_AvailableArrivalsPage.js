class CDUAvailableArrivalsPage {
    static ShowPage(mcdu, airport, pageCurrent = 0, starSelection = false, selectedStarIndex = -1) {
        let airportInfo = airport.infos;
        if (airportInfo instanceof AirportInfo) {
            mcdu.clearDisplay();
            console.log(airport);
            let selectedApproachCell = "---";
            let selectedViasCell = "NO VIA";
            let selectedTransitionCell = "NO TRANS";
            let selectedApproach = mcdu.flightPlanManager.getApproach();
            if (selectedStarIndex === -1) {
                selectedStarIndex = mcdu.flightPlanManager.getArrivalProcIndex();
            }
            console.log(selectedApproach);
            if (selectedApproach) {
                selectedApproachCell = Avionics.Utils.formatRunway(selectedApproach.name);
                let selectedApproachTransition = selectedApproach.transitions[mcdu.flightPlanManager.getApproachTransitionIndex()];
                if (selectedApproachTransition) {
                    selectedViasCell = selectedApproachTransition.waypoints[0].infos.icao.substr(7);
                }
            }
            let selectedStarCell = "------";
            let selectedArrival = airportInfo.arrivals[mcdu.flightPlanManager.getArrivalProcIndex()];
            if (!selectedArrival) {
                selectedArrival = airportInfo.arrivals[selectedStarIndex];
            }
            if (selectedArrival) {
                selectedStarCell = selectedArrival.name;
                let selectedTransition = selectedArrival.enRouteTransitions[mcdu.flightPlanManager.getArrivalTransitionIndex()];
                if (selectedTransition) {
                    selectedTransitionCell = selectedTransition.name;
                }
            }
            let approaches = airportInfo.approaches;
            let rows = [[""], [""], [""], [""], [""], [""], [""], [""]];
            if (!starSelection) {
                let sortedApproaches = [];
                for (let i = 0; i < approaches.length; i++) {
                    sortedApproaches[i] = {
                        appr: approaches[i],
                        formatName: Avionics.Utils.formatRunway(approaches[i].name),
                        index: i
                    };
                }
                sortedApproaches = sortedApproaches.sort((a, b) => { return a.formatName.localeCompare(b.formatName); });
                for (let i = 0; i < 3; i++) {
                    let index = i + pageCurrent;
                    let approach = sortedApproaches[index];
                    if (approach) {
                        rows[2 * i] = ["←" + approach.formatName + "[color]blue"];
                        mcdu.onLeftInput[i + 2] = () => {
                            mcdu.setApproachIndex(approach.index, () => {
                                CDUAvailableArrivalsPage.ShowPage(mcdu, airport, 0, true);
                            });
                        };
                    }
                }
            }
            else {
                let matchingArrivals = [];
                if (selectedApproach) {
                    let selectedRunway = selectedApproach.runway;
                    for (let i = 0; i < airportInfo.arrivals.length; i++) {
                        let arrival = airportInfo.arrivals[i];
                        if (arrival.runwayTransitions.length > 0) {
                            for (let j = 0; j < arrival.runwayTransitions.length; j++) {
                                let runwayTransition = arrival.runwayTransitions[j];
                                if (runwayTransition) {
                                    if (runwayTransition.name.indexOf(selectedRunway) != -1) {
                                        matchingArrivals.push({ arrival: arrival, arrivalIndex: i });
                                    }
                                }
                            }
                        }
                        else {
                            matchingArrivals.push({ arrival: arrival, arrivalIndex: i });
                        }
                    }
                }
                else {
                    for (let i = 0; i < airportInfo.arrivals.length; i++) {
                        let arrival = airportInfo.arrivals[i];
                        matchingArrivals.push({ arrival: arrival, arrivalIndex: i });
                    }
                }
                for (let i = 0; i < 3; i++) {
                    let index = i + pageCurrent;
                    if (index === 0) {
                        let color = "blue";
                        if (!selectedArrival) {
                            color = "green";
                        }
                        rows[2 * i] = ["←NO STAR[color]" + color];
                        mcdu.onLeftInput[i + 2] = () => {
                            mcdu.setArrivalProcIndex(-1, () => {
                                CDUAvailableArrivalsPage.ShowPage(mcdu, airport, 0, true);
                            });
                        };
                    }
                    else {
                        index--;
                        if (matchingArrivals[index]) {
                            let star = matchingArrivals[index].arrival;
                            let starIndex = matchingArrivals[index].arrivalIndex;
                            let color = "blue";
                            if (selectedStarIndex === starIndex) {
                                color = "green";
                            }
                            rows[2 * i] = ["←" + star.name + "[color]" + color];
                            mcdu.onLeftInput[i + 2] = () => {
                                mcdu.setArrivalProcIndex(starIndex, () => {
                                    if (mcdu.flightPlanManager.getApproachIndex() > -1) {
                                        CDUAvailableArrivalsPage.ShowViasPage(mcdu, airport);
                                    }
                                    else {
                                        CDUAvailableArrivalsPage.ShowPage(mcdu, airport, 0, true);
                                    }
                                });
                            };
                        }
                    }
                }
                let transOptions = [];
                transOptions.push({
                    name: "NO TRANS→[color]blue",
                    callback: () => {
                        mcdu.setArrivalIndex(selectedStarIndex, -1, () => {
                            CDUAvailableArrivalsPage.ShowPage(mcdu, airport);
                        });
                    }
                });
                if (selectedArrival) {
                    for (let i = 0; i < selectedArrival.enRouteTransitions.length; i++) {
                        let transition = selectedArrival.enRouteTransitions[i];
                        if (transition) {
                            let ii = i;
                            let name = transition.name;
                            transOptions.push({
                                name: name + "→[color]blue",
                                callback: () => {
                                    mcdu.setArrivalIndex(selectedStarIndex, ii, () => {
                                        CDUAvailableArrivalsPage.ShowPage(mcdu, airport);
                                    });
                                }
                            });
                        }
                    }
                }
                for (let i = 0; i < 3; i++) {
                    let index = i + pageCurrent;
                    let transOption = transOptions[index];
                    if (transOption) {
                        rows[2 * i][1] = transOption.name;
                        mcdu.onRightInput[i + 2] = transOption.callback;
                    }
                }
            }
            let viasPageLabel = "";
            let viasPageLine = "";
            if (starSelection) {
                if (selectedApproach) {
                    viasPageLabel = "APPR";
                    viasPageLine = "<VIAS";
                    mcdu.onLeftInput[1] = () => {
                        CDUAvailableArrivalsPage.ShowViasPage(mcdu, airport, 0, selectedStarIndex);
                    };
                }
            }
            let bottomLabel = [""];
            let bottomLine = ["\<RETURN"];
            if (mcdu.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
                bottomLabel = ["TMPY[color]yellow", "TMPY[color]red"];
                bottomLine = ["\<F-PLN[color]yellow", "INSERT*[color]red"];
                mcdu.onLeftInput[5] = async () => {
                    mcdu.eraseTemporaryFlightPlan(() => {
                        CDUFlightPlanPage.ShowPage(mcdu);
                    });
                };
                mcdu.onRightInput[5] = async () => {
                    mcdu.insertTemporaryFlightPlan(() => {
                        CDUFlightPlanPage.ShowPage(mcdu);
                    });
                };
            }
            else {
                mcdu.onLeftInput[5] = () => {
                    CDUFlightPlanPage.ShowPage(mcdu);
                };
            }
            let titleColor = "white";
            let selectedCellsColor = "green";
            if (mcdu.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
                titleColor = "yellow";
                selectedCellsColor = "yellow";
            }
            let title = "<span class='" + titleColor + "'>ARRIVAL TO </span><span class='green'>" + airport.ident + "</span><span> ← →</span>";
            mcdu.setTemplate([
                [title],
                ["APPR", "STAR", "VIA"],
                [selectedApproachCell + "[color]" + selectedCellsColor, selectedStarCell + "[color]" + selectedCellsColor, selectedViasCell + "[color]" + selectedCellsColor],
                [viasPageLabel, "TRANS"],
                [viasPageLine, selectedTransitionCell + "[color]" + selectedCellsColor],
                [starSelection ? "STAR" : "APPR", starSelection ? "TRANS" : "", "AVAILABLE"],
                rows[0],
                rows[1],
                rows[2],
                rows[3],
                rows[4],
                bottomLabel,
                bottomLine
            ]);
            mcdu.onUp = () => {
                pageCurrent++;
                if (starSelection) {
                    pageCurrent = Math.min(pageCurrent, airportInfo.arrivals.length - 3);
                }
                else {
                    pageCurrent = Math.min(pageCurrent, airportInfo.approaches.length - 3);
                }
                if (pageCurrent < 0) {
                    pageCurrent = 0;
                }
                CDUAvailableArrivalsPage.ShowPage(mcdu, airport, pageCurrent, starSelection, selectedStarIndex);
            };
            mcdu.onDown = () => {
                pageCurrent--;
                if (pageCurrent < 0) {
                    pageCurrent = 0;
                }
                CDUAvailableArrivalsPage.ShowPage(mcdu, airport, pageCurrent, starSelection, selectedStarIndex);
            };
            mcdu.onPrevPage = () => {
                CDUAvailableArrivalsPage.ShowPage(mcdu, airport, 0, !starSelection);
            };
            mcdu.onNextPage = mcdu.onPrevPage;
        }
    }
    static ShowViasPage(mcdu, airport, pageCurrent = 0, selectedStarIndex = -1) {
        let airportInfo = airport.infos;
        if (airportInfo instanceof AirportInfo) {
            mcdu.clearDisplay();
            let selectedApproachCell = "---";
            let selectedViasCell = "NONE";
            let selectedApproach = mcdu.flightPlanManager.getApproach();
            if (selectedApproach) {
                selectedApproachCell = Avionics.Utils.formatRunway(selectedApproach.name);
                let selectedApproachTransition = selectedApproach.transitions[mcdu.flightPlanManager.getApproachTransitionIndex()];
                if (selectedApproachTransition) {
                    selectedViasCell = selectedApproachTransition.name;
                }
            }
            let selectedStarCell = "------";
            let selectedArrival = airportInfo.arrivals[mcdu.flightPlanManager.getArrivalProcIndex()];
            if (!selectedArrival) {
                selectedArrival = airportInfo.arrivals[selectedStarIndex];
            }
            if (selectedArrival) {
                selectedStarCell = selectedArrival.name;
            }
            let rows = [[""], [""], [""], [""], [""], [""]];
            for (let i = 0; i < 3; i++) {
                let index = i + pageCurrent;
                if (selectedApproach) {
                    let approachTransition = selectedApproach.transitions[index];
                    if (approachTransition) {
                        let name = approachTransition.name;
                        let color = "blue";
                        if (index === mcdu.flightPlanManager.getApproachTransitionIndex()) {
                            color = "green";
                        }
                        rows[2 * i + 1][0] = "←" + name + "[color]" + color;
                        mcdu.onLeftInput[i + 2] = () => {
                            mcdu.setApproachTransitionIndex(index, () => {
                                CDUAvailableArrivalsPage.ShowPage(mcdu, airport, 0, true);
                            });
                        };
                    }
                }
            }
            let bottomLabel = [""];
            let bottomLine = ["\<RETURN"];
            if (mcdu.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
                bottomLabel = ["TMPY[color]yellow", "TMPY[color]red"];
                bottomLine = ["<F-PLN[color]yellow", "INSERT*[color]red"];
                mcdu.onLeftInput[5] = async () => {
                    mcdu.eraseTemporaryFlightPlan(() => {
                        CDUAvailableArrivalsPage.ShowPage(mcdu, airport, 0, true);
                    });
                };
                mcdu.onRightInput[5] = async () => {
                    mcdu.insertTemporaryFlightPlan(() => {
                        CDUAvailableArrivalsPage.ShowPage(mcdu, airport, 0, true);
                    });
                };
            }
            else {
                mcdu.onLeftInput[5] = () => {
                    CDUAvailableArrivalsPage.ShowPage(mcdu, airport, 0, true);
                };
            }
            let titleColor = "white";
            let selectedCellsColor = "green";
            if (mcdu.flightPlanManager.getCurrentFlightPlanIndex() === 1) {
                titleColor = "yellow";
                selectedCellsColor = "yellow";
            }
            let title = "<span class='" + titleColor + "'>ARRIVAL TO </span><span class='green'>" + airport.ident + "</span><span> ← →</span>";
            mcdu.setTemplate([
                [title],
                ["APPR", "STAR", "VIA"],
                [selectedApproachCell + "[color]" + selectedCellsColor, selectedStarCell + "[color]" + selectedCellsColor, selectedViasCell + "[color]" + selectedCellsColor],
                ["APPR VIAS"],
                ["←NO VIAS[color]blue"],
                rows[0],
                rows[1],
                rows[2],
                rows[3],
                rows[4],
                rows[5],
                bottomLabel,
                bottomLine
            ]);
            mcdu.onLeftInput[1] = () => {
                mcdu.setApproachTransitionIndex(-1, () => {
                    CDUAvailableArrivalsPage.ShowPage(mcdu, airport, 0, true);
                });
            };
            mcdu.onUp = () => {
                pageCurrent++;
                pageCurrent = Math.min(pageCurrent, airportInfo.approaches.length - 3);
                if (pageCurrent < 0) {
                    pageCurrent = 0;
                }
                CDUAvailableArrivalsPage.ShowViasPage(mcdu, airport, pageCurrent, selectedStarIndex);
            };
            mcdu.onDown = () => {
                pageCurrent--;
                if (pageCurrent < 0) {
                    pageCurrent = 0;
                }
                CDUAvailableArrivalsPage.ShowViasPage(mcdu, airport, pageCurrent, selectedStarIndex);
            };
        }
    }
}
//# sourceMappingURL=A320_Neo_CDU_AvailableArrivalsPage.js.map