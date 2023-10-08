class A320_Neo_PFD extends BaseAirliners {
    constructor() {
        super();
        this.initDuration = 7000;
    }
    get templateID() { return "A320_Neo_PFD"; }
    get IsGlassCockpit() { return true; }
    connectedCallback() {
        super.connectedCallback();
        this.pageGroups = [
            new NavSystemPageGroup("Main", this, [
                new A320_Neo_PFD_MainPage()
            ]),
        ];
    }
    disconnectedCallback() {
        window.console.log("A320 Neo PFD - destroyed");
        super.disconnectedCallback();
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
    }
}
class A320_Neo_PFD_MainElement extends NavSystemElement {
    init(root) {
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class A320_Neo_PFD_MainPage extends NavSystemPage {
    constructor() {
        super("Main", "Mainframe", new A320_Neo_PFD_MainElement());
        this.showILS = false;
        this.attitude = new A320_Neo_PFD_Attitude();
        this.vSpeed = new A320_Neo_PFD_VSpeed();
        this.airspeed = new A320_Neo_PFD_Airspeed();
        this.altimeter = new A320_Neo_PFD_Altimeter();
        this.compass = new A320_Neo_PFD_Compass();
        this.navStatus = new A320_Neo_PFD_NavStatus();
        this.ils = new A320_Neo_PFD_ILS();
        this.element = new NavSystemElementGroup([
            this.attitude,
            this.vSpeed,
            this.airspeed,
            this.altimeter,
            this.compass,
            this.navStatus,
            this.ils
        ]);
    }
    init() {
        super.init();
        this.showILS = SimVar.GetSimVarValue("L:BTN_LS_FILTER_ACTIVE", "bool");
        this.ils.showILS(this.showILS);
        this.compass.showILS(this.showILS);
    }
    onEvent(_event) {
        switch (_event) {
            case "BTN_LS":
                this.showILS = !this.showILS;
                SimVar.SetSimVarValue("L:BTN_LS_FILTER_ACTIVE", "number", this.showILS ? 1 : 0);
                this.ils.showILS(this.showILS);
                this.compass.showILS(this.showILS);
                break;
        }
    }
}
class A320_Neo_PFD_VSpeed extends NavSystemElement {
    init(root) {
        this.vsi = this.gps.getChildById("VSpeed");
        this.vsi.aircraft = Aircraft.A320_NEO;
        this.vsi.gps = this.gps;
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        var vSpeed = Math.round(Simplane.getVerticalSpeed());
        diffAndSetAttribute(this.vsi, "vspeed", vSpeed + '');
        if (Simplane.getAutoPilotVerticalSpeedHoldActive()) {
            var selVSpeed = Math.round(Simplane.getAutoPilotVerticalSpeedHoldValue());
            diffAndSetAttribute(this.vsi, "selected_vspeed", selVSpeed + '');
            diffAndSetAttribute(this.vsi, "selected_vspeed_active", "true");
        }
        else {
            diffAndSetAttribute(this.vsi, "selected_vspeed_active", "false");
        }
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class A320_Neo_PFD_Airspeed extends NavSystemElement {
    constructor() {
        super();
    }
    init(root) {
        this.airspeed = this.gps.getChildById("Airspeed");
        this.airspeed.aircraft = Aircraft.A320_NEO;
        this.airspeed.gps = this.gps;
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        this.airspeed.update(_deltaTime);
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class A320_Neo_PFD_Altimeter extends NavSystemElement {
    constructor() {
        super();
    }
    init(root) {
        this.altimeter = this.gps.getChildById("Altimeter");
        this.altimeter.aircraft = Aircraft.A320_NEO;
        this.altimeter.gps = this.gps;
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        this.altimeter.update(_deltaTime);
    }
    onExit() {
    }
    onEvent(_event) {
        switch (_event) {
            case "BARO_INC":
                SimVar.SetSimVarValue("K:KOHLSMAN_INC", "number", 1);
                break;
            case "BARO_DEC":
                SimVar.SetSimVarValue("K:KOHLSMAN_DEC", "number", 1);
                break;
        }
    }
}
class A320_Neo_PFD_Attitude extends NavSystemElement {
    constructor() {
        super(...arguments);
        this.vDir = new Vec2();
    }
    init(root) {
        this.hsi = this.gps.getChildById("Horizon");
        this.hsi.aircraft = Aircraft.A320_NEO;
        this.hsi.gps = this.gps;
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        if (this.hsi) {
            this.hsi.update(_deltaTime);
            var xyz = Simplane.getOrientationAxis();
            if (xyz) {
                diffAndSetAttribute(this.hsi, "pitch", (xyz.pitch / Math.PI * 180) + '');
                diffAndSetAttribute(this.hsi, "bank", (xyz.bank / Math.PI * 180) + '');
            }
            diffAndSetAttribute(this.hsi, "slip_skid", Simplane.getInclinometer() + '');
            diffAndSetAttribute(this.hsi, "radio_altitude", Simplane.getAltitudeAboveGround() + '');
            diffAndSetAttribute(this.hsi, "radio_decision_height", this.gps.radioNav.getRadioDecisionHeight() + '');
        }
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class A320_Neo_PFD_Compass extends NavSystemElement {
    init(root) {
        this.hsi = this.gps.getChildById("Compass");
        this.hsi.aircraft = Aircraft.A320_NEO;
        this.hsi.gps = this.gps;
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        this.hsi.update(_deltaTime);
    }
    onExit() {
    }
    onEvent(_event) {
    }
    showILS(_val) {
        if (this.hsi) {
            this.hsi.showILS(_val);
        }
    }
}
class A320_Neo_PFD_NavStatus extends NavSystemElement {
    init(root) {
        this.fma = this.gps.getChildById("FMA");
        this.fma.aircraft = Aircraft.A320_NEO;
        this.fma.gps = this.gps;
        this.isInitialized = true;
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        if (this.fma != null) {
            this.fma.update(_deltaTime);
        }
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class A320_Neo_PFD_ILS extends NavSystemElement {
    init(root) {
        this.ils = this.gps.getChildById("ILS");
        this.ils.aircraft = Aircraft.A320_NEO;
        this.ils.gps = this.gps;
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        if (this.ils) {
            this.ils.update(_deltaTime);
            if (Simplane.getAutoPilotGlideslopeActive()) {
                if (this.gps.flightPlanManager.isActiveApproach()) {
                    if (Simplane.getAutoPilotApproachType() === ApproachType.APPROACH_TYPE_RNAV) {
                        this.showGlideslope(true);
                    }
                }
            }
        }
    }
    onExit() {
    }
    onEvent(_event) {
    }
    showILS(_val) {
        if (this.ils) {
            this.ils.showLocalizer(_val);
            this.ils.showGlideslope(_val);
            this.ils.showNavInfo(_val);
        }
    }
    showGlideslope(_val) {
        if (this.ils) {
            this.ils.showGlideslope(_val);
        }
    }
}
registerInstrument("a320-neo-pfd-element", A320_Neo_PFD);
//# sourceMappingURL=A320_Neo_PFD.js.map