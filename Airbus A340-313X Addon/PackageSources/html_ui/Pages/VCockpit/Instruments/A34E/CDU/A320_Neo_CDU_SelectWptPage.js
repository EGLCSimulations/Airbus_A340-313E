class A320_Neo_CDU_SelectWptPage {
    static ShowPage(mcdu, waypoints, callback, page = 0) {
        mcdu.clearDisplay();
        let rows = [
            [""],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""]
        ];
        for (let i = 0; i < 5; i++) {
            let w = waypoints[i + 5 * page];
            if (w) {
                let t = "";
                if (w.icao[0] === "V") {
                    t = " VOR";
                }
                else if (w.icao[0] === "N") {
                    t = " NDB";
                }
                else if (w.icao[0] === "A") {
                    t = " AIRPORT";
                }
                rows[2 * i] = [w.ident + t];
                rows[2 * i + 1] = [w.infos.coordinates.toDegreeString()];
                mcdu.onLeftInput[i] = () => {
                    callback(w);
                };
                mcdu.onRightInput[i] = () => {
                    callback(w);
                };
            }
        }
        mcdu.setTemplate([
            ["SELECT DESIRED WPT", fastToFixed((page + 1), 0), fastToFixed((waypoints.length / 5), 0)],
            ...rows,
            [""]
        ]);
        mcdu.onPrevPage = () => {
            if (page > 0) {
                A320_Neo_CDU_SelectWptPage.ShowPage(mcdu, waypoints, callback, page - 1);
            }
        };
        mcdu.onNextPage = () => {
            if (page < Math.floor(waypoints.length / 5)) {
                A320_Neo_CDU_SelectWptPage.ShowPage(mcdu, waypoints, callback, page + 1);
            }
        };
    }
}
//# sourceMappingURL=A320_Neo_CDU_SelectWptPage.js.map