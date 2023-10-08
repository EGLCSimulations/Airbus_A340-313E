var A320_Neo_BAT;
(function (A320_Neo_BAT) {
    class Display extends BaseAirliners {
        constructor() {
            super();
            this.batTexts = new Array(null, null);
            this.batValues = new Array(0, 0);
        }
        get templateID() { return "A320_Neo_BAT"; }
        connectedCallback() {
            super.connectedCallback();
            this.batTexts[0] = this.querySelector("#BAT1");
            this.batTexts[1] = this.querySelector("#BAT2");
        }
        onUpdate(_deltaTime) {
            super.onUpdate(_deltaTime);
            if ((this.batTexts != null) && (this.batTexts.length == 2) && (this.batValues != null) && (this.batValues.length == 2)) {
                for (var i = 0; i < 2; ++i) {
                    if (this.batTexts[i] != null) {
                        var batValue = SimVar.GetSimVarValue("ELECTRICAL MAIN BUS VOLTAGE:" + (10 + i), "Volts");
                        if (batValue != this.batValues[i]) {
                            this.batValues[i] = batValue;
                            diffAndSetText(this.batTexts[i], fastToFixed(this.batValues[i], 1));
                        }
                    }
                }
            }
        }
    }
    A320_Neo_BAT.Display = Display;
})(A320_Neo_BAT || (A320_Neo_BAT = {}));
registerInstrument("a320-neo-bat", A320_Neo_BAT.Display);
//# sourceMappingURL=A320_Neo_BAT.js.map