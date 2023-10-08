class CDUDirectToPage {
    static ShowPage(mcdu, directWaypoint, wptsListIndex = 0) {
        mcdu.clearDisplay();
        let directWaypointCell = " ";
        if (directWaypoint) {
            directWaypointCell = directWaypoint.ident;
        }
        else if (mcdu.flightPlanManager.getDirectToTarget()) {
            directWaypointCell = mcdu.flightPlanManager.getDirectToTarget().ident;
        }
        let waypointsCell = ["", "", "", "", ""];
        let iMax = 5;
        let eraseLabel = "";
        if (directWaypoint) {
            iMax--;
            eraseLabel = "DIR TO[color]red";
            waypointsCell[4] = "←ERASE[color]red";
            mcdu.onLeftInput[5] = () => {
                SimVar.SetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO", "number", 0);
                CDUDirectToPage.ShowPage(mcdu);
            };
        }
        mcdu.onLeftInput[0] = () => {
            let value = mcdu.inOut;
            mcdu.clearUserInput();
            mcdu.getOrSelectWaypointByIdent(value, (w) => {
                if (w) {
                    SimVar.SetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO", "number", 1);
                    SimVar.SetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO_LAT_0", "number", SimVar.GetSimVarValue("PLANE LATITUDE", "degree latitude"));
                    SimVar.SetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO_LONG_0", "number", SimVar.GetSimVarValue("PLANE LONGITUDE", "degree longitude"));
                    SimVar.SetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO_LAT_1", "number", w.infos.coordinates.lat);
                    SimVar.SetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO_LONG_1", "number", w.infos.coordinates.long);
                    CDUDirectToPage.ShowPage(mcdu, w, wptsListIndex);
                }
            });
        };
        let i = Math.max(0, mcdu.flightPlanManager.getActiveWaypointIndex(true));
        let index = 0;
        let waypointsCount = mcdu.flightPlanManager.getWaypointsCount() + mcdu.flightPlanManager.getApproachWaypoints().length;
        while (i + wptsListIndex < waypointsCount && index < iMax) {
            let waypoint = mcdu.flightPlanManager.getWaypoint(i + wptsListIndex, undefined, true);
            if (waypoint) {
                if (waypoint.ident != "USR") {
                    waypointsCell[index] = "←" + waypoint.ident + "[color]blue";
                    mcdu.onLeftInput[index + 1] = () => {
                        SimVar.SetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO", "number", 1);
                        SimVar.SetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO_LAT_0", "number", SimVar.GetSimVarValue("PLANE LATITUDE", "degree latitude"));
                        SimVar.SetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO_LONG_0", "number", SimVar.GetSimVarValue("PLANE LONGITUDE", "degree longitude"));
                        SimVar.SetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO_LAT_1", "number", waypoint.infos.coordinates.lat);
                        SimVar.SetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO_LONG_1", "number", waypoint.infos.coordinates.long);
                        CDUDirectToPage.ShowPage(mcdu, waypoint, wptsListIndex);
                    };
                    index++;
                }
            }
            i++;
        }
        if (index < iMax) {
            waypointsCell[i] = "--END--";
        }
        let insertLabel = "";
        let insertLine = "";
        if (directWaypoint) {
            insertLabel = "TMPY[color]red";
            insertLine = "DIRECT*[color]red";
            mcdu.onRightInput[5] = () => {
                mcdu.activateDirectToWaypoint(directWaypoint, () => {
                    SimVar.SetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO", "number", 0);
                    CDUFlightPlanPage.ShowPage(mcdu);
                });
            };
        }
        mcdu.setTemplate([
            ["DIR TO"],
            ["WAYPOINT", "DIST", "UTC"],
            ["[" + directWaypointCell + "][color]blue", "---", "----"],
            ["F-PLN WPTS"],
            [waypointsCell[0], "DIRECT TO[color]blue"],
            ["", "WITH"],
            [waypointsCell[1], "ABEAM PTS[color]blue"],
            ["", "RADIAL IN"],
            [waypointsCell[2], "[ ]°[color]blue"],
            ["", "RADIAL OUT"],
            [waypointsCell[3], "[ ]°[color]blue"],
            [eraseLabel, insertLabel],
            [waypointsCell[4], insertLine]
        ]);
        mcdu.onUp = () => {
            wptsListIndex++;
            wptsListIndex = Math.min(wptsListIndex, waypointsCount - 3);
            CDUDirectToPage.ShowPage(mcdu, directWaypoint, wptsListIndex);
        };
        mcdu.onDown = () => {
            wptsListIndex--;
            wptsListIndex = Math.max(wptsListIndex, 0);
            CDUDirectToPage.ShowPage(mcdu, directWaypoint, wptsListIndex);
        };
    }
}
//# sourceMappingURL=A320_Neo_CDU_DirectToPage.js.map