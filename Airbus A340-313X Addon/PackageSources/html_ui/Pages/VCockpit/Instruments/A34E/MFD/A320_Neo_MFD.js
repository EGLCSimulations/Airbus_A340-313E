class A320_Neo_MFD extends BaseAirliners {
    constructor() {
        super();
        this.initDuration = 11000;
    }
    get templateID() { return "A320_Neo_MFD"; }
    get IsGlassCockpit() { return true; }
    connectedCallback() {
        super.connectedCallback();
        this.pageGroups = [
            new NavSystemPageGroup("Main", this, [
                new A320_Neo_MFD_MainPage()
            ]),
        ];
    }
    disconnectedCallback() {
    }
    onEvent(_event) {
        switch (_event) {
            case "CLR_Long":
                this.currentInteractionState = 0;
                this.popUpElement = null;
                this.overridePage = null;
                this.currentEventLinkedPageGroup = null;
                this.currentPageGroupIndex = 0;
                this.getCurrentPageGroup().pageIndex = 0;
                break;
        }
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
    }
}
class A320_Neo_MFD_MainElement extends NavSystemElement {
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
class A320_Neo_MFD_MainPage extends NavSystemPage {
    constructor() {
        super("Main", "Mainframe", new A320_Neo_MFD_MainElement());
        this.wxRadarOn = false;
        this.wxRadarMode = -1;
        this.wxBrt = 50;
        this.terrainOn = false;
        this.mapMode = -1;
        this.mapRange = -1;
        this.mapConfigId = 0;
        this.modeChangeTimer = -1;
        this.headingSelected = false;
        this.showILS = false;
        this.map = new A320_Neo_MFD_Map();
        this.compass = new A320_Neo_MFD_Compass();
        this.info = new A320_Neo_MFD_NDInfo();
        this.element = new NavSystemElementGroup([
            this.map,
            this.compass,
            this.info
        ]);
    }
    init() {
        super.init();
        this.modeChangeMask = this.gps.getChildById("ModeChangeMask");
        this.map.instrument.setNPCAirplaneManagerTCASMode(true);
        this.map.instrument.showRoads = false;
        this.map.instrument.showObstacles = false;
        this.map.instrument.showVORs = false;
        this.map.instrument.showIntersections = false;
        this.map.instrument.showNDBs = false;
        this.map.instrument.showAirports = false;
        this.map.instrument.showAirspaces = false;
        this.map.instrument.setHideReachedWaypoints(true);
        this.map.instrument.intersectionMaxRange = Infinity;
        this.map.instrument.vorMaxRange = Infinity;
        this.map.instrument.ndbMaxRange = Infinity;
        this.map.instrument.smallAirportMaxRange = Infinity;
        this.map.instrument.medAirportMaxRange = Infinity;
        this.map.instrument.largeAirportMaxRange = Infinity;
        SimVar.SetSimVarValue("L:A320_Neo_MFD_NAV_MODE", "number", 3);
        SimVar.SetSimVarValue("L:XMLVAR_A320_WeatherRadar_Sys", "number", 1);
        this.showILS = SimVar.GetSimVarValue("L:BTN_LS_FILTER_ACTIVE", "bool");
        this.compass.showILS(this.showILS);
        this.info.showILS(this.showILS);
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        this.updateMap(_deltaTime);
        this.updateNDInfo(_deltaTime);
    }
    _updateNDFiltersStatuses() {
        SimVar.SetSimVarValue("L:BTN_CSTR_FILTER_ACTIVE", "number", this.map.instrument.showConstraints ? 1 : 0);
        SimVar.SetSimVarValue("L:BTN_VORD_FILTER_ACTIVE", "number", this.map.instrument.showVORs ? 1 : 0);
        SimVar.SetSimVarValue("L:BTN_WPT_FILTER_ACTIVE", "number", this.map.instrument.showIntersections ? 1 : 0);
        SimVar.SetSimVarValue("L:BTN_NDB_FILTER_ACTIVE", "number", this.map.instrument.showNDBs ? 1 : 0);
        SimVar.SetSimVarValue("L:BTN_ARPT_FILTER_ACTIVE", "number", this.map.instrument.showAirports ? 1 : 0);
    }
    updateMap(_deltaTime) {
        if (this.modeChangeMask && this.modeChangeTimer >= 0) {
            this.modeChangeTimer -= _deltaTime / 1000;
            if (this.modeChangeTimer <= 0) {
                diffAndSetStyle(this.modeChangeMask, StyleProperty.display, "none");
                this.modeChangeTimer = -1;
            }
        }
        var wxRadarOn = (SimVar.GetSimVarValue("L:XMLVAR_A320_WeatherRadar_Sys", "number") != 1) ? true : false;
        var wxRadarMode = SimVar.GetSimVarValue("L:XMLVAR_A320_WeatherRadar_Mode", "number");
        var terrainOn = SimVar.GetSimVarValue("L:BTN_TERRONND_ACTIVE", "number");
        var mapMode = SimVar.GetSimVarValue("L:A320_Neo_MFD_NAV_MODE", "number");
        var mapRange = SimVar.GetSimVarValue("L:A320_Neo_MFD_Range", "number");
        var wxBrt = SimVar.GetSimVarValue("L:XMLVAR_Knob_EFIS_CS_ND_WX_BRT", "number") + 0;
        if (this.wxBrt != wxBrt) {
            this.wxBrt = wxBrt;
            this.map.instrument.setOpacity(this.wxBrt / 100);
        }
        if (this.wxRadarOn != wxRadarOn || this.terrainOn != terrainOn || this.wxRadarMode != wxRadarMode || this.mapMode != mapMode) {
            this.wxRadarOn = wxRadarOn;
            this.wxRadarMode = wxRadarMode;
            this.terrainOn = terrainOn;
            this.mapMode = mapMode;
            this.setMapMode(this.mapMode);
            if (this.terrainOn) {
                this.mapConfigId = 1;
            }
            else if (this.wxRadarOn && this.wxRadarMode != 3) {
                this.showWeather();
            }
            else {
                this.mapConfigId = 0;
            }
            if (this.compass.svg.displayMode === Jet_NDCompass_Display.ARC) {
                this.map.showCompassMask();
                this.map.hidePlanMask();
            }
            else {
                this.map.showPlanMask();
                this.map.hideCompassMask();
            }
            if (this.modeChangeMask) {
                diffAndSetStyle(this.modeChangeMask, StyleProperty.display, "block");
                this.modeChangeTimer = 0.15;
            }
        }
        switch (this.mapConfigId) {
            case 0:
                if (this.map.instrument.mapConfigId != 0) {
                    this.map.instrument.mapConfigId = 0;
                    this.map.instrument.bingMapRef = EBingReference.SEA;
                }
                break;
            case 1:
                let altitude = Simplane.getAltitudeAboveGround();
                if (altitude >= 500 && this.map.instrument.mapConfigId != 1) {
                    this.map.instrument.mapConfigId = 1;
                    this.map.instrument.bingMapRef = EBingReference.PLANE;
                }
                else if (altitude < 490 && this.map.instrument.mapConfigId != 0) {
                    this.map.instrument.mapConfigId = 0;
                    this.map.instrument.bingMapRef = EBingReference.SEA;
                }
                break;
        }
        if (this.mapRange != mapRange) {
            this.mapRange = mapRange;
            this.map.instrument.setZoom(this.mapRange);
            this.compass.svg.mapRange = this.map.zoomRanges[this.mapRange];
        }
        let selected = Simplane.getAutoPilotHeadingSelected();
        if (selected != this.headingSelected) {
            this.headingSelected = selected;
            if (selected) {
                this.map.instrument.setFlightPlanAsDashed(true);
            }
            else {
                this.map.instrument.setFlightPlanAsDashed(false);
            }
        }
        if (SimVar.GetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO", "number")) {
            if (!this.map.instrument.tmpDirectToElement) {
                this.map.instrument.tmpDirectToElement = new SvgDirectToElement("yellow");
            }
            this.map.instrument.tmpDirectToElement.llaRequested = new LatLongAlt(SimVar.GetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO_LAT_0", "number"), SimVar.GetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO_LONG_0", "number"));
            this.map.instrument.tmpDirectToElement.targetLla = new LatLongAlt(SimVar.GetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO_LAT_1", "number"), SimVar.GetSimVarValue("L:A320_NEO_PREVIEW_DIRECT_TO_LONG_1", "number"));
        }
        else {
            this.map.instrument.tmpDirectToElement = undefined;
        }
        this.map.updateTopOfDescent();
        this.map.updateTopOfClimb();
    }
    onEvent(_event) {
        switch (_event) {
            case "BTN_CSTR":
                this.map.instrument.showConstraints = !this.map.instrument.showConstraints;
                this.map.instrument.showIntersections = false;
                this.map.instrument.showNDBs = false;
                this.map.instrument.showAirports = false;
                this.map.instrument.showVORs = false;
                this._updateNDFiltersStatuses();
                break;
            case "BTN_VORD":
                this.map.instrument.showConstraints = false;
                this.map.instrument.showIntersections = false;
                this.map.instrument.showNDBs = false;
                this.map.instrument.showAirports = false;
                this.map.instrument.showVORs = !this.map.instrument.showVORs;
                this._updateNDFiltersStatuses();
                break;
            case "BTN_WPT":
                this.map.instrument.showConstraints = false;
                this.map.instrument.showVORs = false;
                this.map.instrument.showNDBs = false;
                this.map.instrument.showAirports = false;
                this.map.instrument.showIntersections = !this.map.instrument.showIntersections;
                this._updateNDFiltersStatuses();
                break;
            case "BTN_NDB":
                this.map.instrument.showConstraints = false;
                this.map.instrument.showVORs = false;
                this.map.instrument.showIntersections = false;
                this.map.instrument.showAirports = false;
                this.map.instrument.showNDBs = !this.map.instrument.showNDBs;
                this._updateNDFiltersStatuses();
                break;
            case "BTN_ARPT":
                this.map.instrument.showConstraints = false;
                this.map.instrument.showVORs = false;
                this.map.instrument.showIntersections = false;
                this.map.instrument.showNDBs = false;
                this.map.instrument.showAirports = !this.map.instrument.showAirports;
                this._updateNDFiltersStatuses();
                break;
            case "BTN_TERRONND":
                SimVar.SetSimVarValue("L:BTN_TERRONND_ACTIVE", "number", (this.terrainOn) ? 0 : 1);
                break;
            case "BTN_LS":
                this.showILS = !this.showILS;
                SimVar.SetSimVarValue("L:BTN_LS_FILTER_ACTIVE", "number", this.showILS ? 1 : 0);
                this.compass.showILS(this.showILS);
                this.info.showILS(this.showILS);
                break;
        }
    }
    setMapMode(_mode) {
        switch (_mode) {
            case 0:
                this.compass.svg.setMode(Jet_NDCompass_Display.ROSE, Jet_NDCompass_Navigation.ILS);
                this.map.setMode(Jet_NDCompass_Display.ROSE);
                this.info.setMode(Jet_NDCompass_Navigation.ILS);
                break;
            case 1:
                this.compass.svg.setMode(Jet_NDCompass_Display.ROSE, Jet_NDCompass_Navigation.VOR);
                this.map.setMode(Jet_NDCompass_Display.ROSE);
                this.info.setMode(Jet_NDCompass_Navigation.VOR);
                break;
            case 2:
                this.compass.svg.setMode(Jet_NDCompass_Display.ROSE, Jet_NDCompass_Navigation.NAV);
                this.map.setMode(Jet_NDCompass_Display.ROSE);
                this.info.setMode(Jet_NDCompass_Navigation.NAV);
                break;
            case 3:
                this.compass.svg.setMode(Jet_NDCompass_Display.ARC, Jet_NDCompass_Navigation.NAV);
                this.map.setMode(Jet_NDCompass_Display.ARC);
                this.info.setMode(Jet_NDCompass_Navigation.NAV);
                break;
            case 4:
                this.compass.svg.setMode(Jet_NDCompass_Display.PLAN, Jet_NDCompass_Navigation.NAV);
                this.map.setMode(Jet_NDCompass_Display.PLAN);
                this.info.setMode(Jet_NDCompass_Navigation.NAV);
                break;
        }
    }
    showWeather() {
        this.setMapMode(this.mapMode);
        this.map.showWeather();
    }
    updateNDInfo(_deltaTime) {
        this.info.showSymbol(A320_Neo_ND_Symbol.WXR, this.wxRadarOn && this.wxRadarMode == 0);
        this.info.showSymbol(A320_Neo_ND_Symbol.WXRTURB, this.wxRadarOn && this.wxRadarMode == 1);
        this.info.showSymbol(A320_Neo_ND_Symbol.TURB, this.wxRadarOn && this.wxRadarMode == 2);
        this.info.showSymbol(A320_Neo_ND_Symbol.MAP, this.wxRadarOn && this.wxRadarMode == 3);
    }
}
class A320_Neo_MFD_Compass extends NavSystemElement {
    init(root) {
        this.svg = this.gps.getChildById("Compass");
        this.svg.aircraft = Aircraft.A320_NEO;
        this.svg.gps = this.gps;
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        this.svg.update(_deltaTime);
    }
    onExit() {
    }
    onEvent(_event) {
    }
    showILS(_val) {
        if (this.svg) {
            this.svg.showILS(_val);
        }
    }
}
class A320_Neo_MFD_Map extends MapInstrumentElement {
    constructor() {
        super(...arguments);
        this.zoomRanges = [10, 20, 40, 80, 160, 320];
    }
    updateTopOfDescent() {
        let showTopOfDescent = SimVar.GetSimVarValue("L:AIRLINER_FMS_SHOW_TOP_DSCNT", "number") === 1;
        if (showTopOfDescent) {
            if (!this.topOfDescentIcon) {
                this.topOfDescentIcon = new SvgTopOfXElement("a320-neo-top-of-descent", "ICON_TOP_DSCNT_WHITE");
            }
            this.topOfDescentIcon.lat = SimVar.GetSimVarValue("L:AIRLINER_FMS_LAT_TOP_DSCNT", "number");
            this.topOfDescentIcon.long = SimVar.GetSimVarValue("L:AIRLINER_FMS_LONG_TOP_DSCNT", "number");
            this.topOfDescentIcon.heading = SimVar.GetSimVarValue("L:AIRLINER_FMS_HEADING_TOP_DSCNT", "number");
            let index = this.instrument.topOfCurveElements.indexOf(this.topOfDescentIcon);
            if (index === -1) {
                this.instrument.topOfCurveElements.push(this.topOfDescentIcon);
            }
        }
        else {
            let index = this.instrument.topOfCurveElements.indexOf(this.topOfDescentIcon);
            if (index != -1) {
                this.instrument.topOfCurveElements.splice(index, 1);
            }
        }
    }
    updateTopOfClimb() {
        let showTopOfClimb = SimVar.GetSimVarValue("L:AIRLINER_FMS_SHOW_TOP_CLIMB", "number") === 1;
        if (showTopOfClimb) {
            if (!this.topOfClimbIcon) {
                this.topOfClimbIcon = new SvgTopOfXElement("a320-neo-top-of-climb", "ICON_LEVEL_OFF_BLUE");
            }
            this.topOfClimbIcon.lat = SimVar.GetSimVarValue("L:AIRLINER_FMS_LAT_TOP_CLIMB", "number");
            this.topOfClimbIcon.long = SimVar.GetSimVarValue("L:AIRLINER_FMS_LONG_TOP_CLIMB", "number");
            this.topOfClimbIcon.heading = SimVar.GetSimVarValue("L:AIRLINER_FMS_HEADING_TOP_CLIMB", "number");
            let index = this.instrument.topOfCurveElements.indexOf(this.topOfClimbIcon);
            if (index === -1) {
                this.instrument.topOfCurveElements.push(this.topOfClimbIcon);
            }
        }
        else {
            let index = this.instrument.topOfCurveElements.indexOf(this.topOfClimbIcon);
            if (index != -1) {
                this.instrument.topOfCurveElements.splice(index, 1);
            }
        }
    }
    onTemplateLoaded() {
        super.onTemplateLoaded();
        this.compassModeMask = new SvgBottomMaskElement("a320-compass-mask");
        this.planModeMask = new SvgPlanMaskElement("a320-plan-mask");
    }
    getAdaptiveRanges(_factor) {
        let ranges = Array.from(this.zoomRanges);
        for (let i = 0; i < ranges.length; i++)
            ranges[i] *= _factor;
        return ranges;
    }
    setMode(display) {
        this.hideWeather();
        switch (display) {
            case Jet_NDCompass_Display.ROSE:
                {
                    this.instrument.zoomRanges = this.getAdaptiveRanges(4.5);
                    this.instrument.style.top = "0%";
                    this.instrument.rotateWithPlane(true);
                    this.instrument.centerOnActiveWaypoint(false);
                    this.instrument.setPlaneScale(2.0);
                    break;
                }
            case Jet_NDCompass_Display.ARC:
                {
                    this.instrument.zoomRanges = this.getAdaptiveRanges(2.3);
                    this.instrument.style.top = "24%";
                    this.instrument.rotateWithPlane(true);
                    this.instrument.centerOnActiveWaypoint(false);
                    this.instrument.setPlaneScale(3.5);
                    break;
                }
            case Jet_NDCompass_Display.PLAN:
                {
                    this.instrument.zoomRanges = this.getAdaptiveRanges(4.5);
                    this.instrument.style.top = "0%";
                    this.instrument.rotateWithPlane(false);
                    this.instrument.centerOnActiveWaypoint(true);
                    this.instrument.setPlaneScale(2.0);
                    break;
                }
            default:
                this.instrument.style.top = "0%";
                this.instrument.rotateWithPlane(false);
                this.instrument.centerOnActiveWaypoint(false);
                this.instrument.setPlaneScale(1.0);
                break;
        }
    }
    showWeather() {
        this.instrument.showWeatherWithGPS(EWeatherRadar.HORIZONTAL, Math.PI);
        this.instrument.setBingMapStyle("5.5%", "5.5%", "89%", "89%");
    }
    hideWeather() {
        if (this.instrument.getWeather() != EWeatherRadar.OFF) {
            this.instrument.showWeather(EWeatherRadar.OFF);
        }
    }
    showCompassMask() {
        if (this.compassModeMask) {
            if (this.instrument.maskElements.indexOf(this.compassModeMask) === -1) {
                this.instrument.maskElements.push(this.compassModeMask);
            }
        }
    }
    hideCompassMask() {
        if (this.compassModeMask) {
            let maskIndex = this.instrument.maskElements.indexOf(this.compassModeMask);
            if (maskIndex !== -1) {
                this.instrument.maskElements.splice(maskIndex, 1);
            }
        }
    }
    showPlanMask() {
        if (this.planModeMask) {
            if (this.instrument.maskElements.indexOf(this.planModeMask) === -1) {
                this.instrument.maskElements.push(this.planModeMask);
            }
        }
    }
    hidePlanMask() {
        if (this.planModeMask) {
            let maskIndex = this.instrument.maskElements.indexOf(this.planModeMask);
            if (maskIndex !== -1) {
                this.instrument.maskElements.splice(maskIndex, 1);
            }
        }
    }
}
var A320_Neo_ND_Symbol;
(function (A320_Neo_ND_Symbol) {
    A320_Neo_ND_Symbol[A320_Neo_ND_Symbol["WXR"] = 0] = "WXR";
    A320_Neo_ND_Symbol[A320_Neo_ND_Symbol["WXRTURB"] = 1] = "WXRTURB";
    A320_Neo_ND_Symbol[A320_Neo_ND_Symbol["TURB"] = 2] = "TURB";
    A320_Neo_ND_Symbol[A320_Neo_ND_Symbol["MAP"] = 3] = "MAP";
})(A320_Neo_ND_Symbol || (A320_Neo_ND_Symbol = {}));
class A320_Neo_MFD_NDInfo extends NavSystemElement {
    constructor() {
        super(...arguments);
        this.allSymbols = new Array();
    }
    init(root) {
        this.ndInfo = this.gps.getChildById("NDInfo");
        this.ndInfo.aircraft = Aircraft.A320_NEO;
        this.ndInfo.gps = this.gps;
        this.allSymbols.push(this.ndInfo.querySelector("#WXR"));
        this.allSymbols.push(this.ndInfo.querySelector("#WXRTURB"));
        this.allSymbols.push(this.ndInfo.querySelector("#TURB"));
        this.allSymbols.push(this.ndInfo.querySelector("#MAP"));
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        if (this.ndInfo != null) {
            this.ndInfo.update(_deltaTime);
        }
    }
    onExit() {
    }
    onEvent(_event) {
    }
    setMode(display) {
        if (this.ndInfo) {
            this.ndInfo.setMode(display, 0);
        }
    }
    showILS(_val) {
        if (this.ndInfo) {
            this.ndInfo.showILS(_val);
        }
    }
    showSymbol(_symbol, _show) {
        if (this.allSymbols[_symbol])
            diffAndSetAttribute(this.allSymbols[_symbol], "visibility", (_show) ? "visible" : "hidden");
    }
}
registerInstrument("a320-neo-mfd-element", A320_Neo_MFD);
//# sourceMappingURL=A320_Neo_MFD.js.map