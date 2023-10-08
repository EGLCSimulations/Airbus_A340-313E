class CDUIdentPage {
    static ShowPage(mcdu) {
        let date = mcdu.getNavDataDateRange();
        mcdu.clearDisplay();
        mcdu.setTemplate([
            ["A340-313E"],
            ["ENG"],
            ["CFM56-5C4/P"],
            ["ACTIVE DATA BASE"],
            [date + "[color]blue", "AIRAC"],
            ["SECOND DATA BASE"],
            ["←" + date + "[color]blue"],
            [""],
            [""],
            [""],
            [""],
            ["", "PERF FACTOR"],
            ["", "0.0"]
        ]);
    }
}
//# sourceMappingURL=A320_Neo_CDU_IdentPage.js.map