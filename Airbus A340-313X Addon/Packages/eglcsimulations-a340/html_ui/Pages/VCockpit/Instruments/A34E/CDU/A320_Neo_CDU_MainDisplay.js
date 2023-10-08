class A320_Neo_CDU_MainDisplay extends FMCMainDisplay {
    constructor() {
        super(...arguments);
        this._registered = false;
        this._forceNextAltitudeUpdate = false;
        this._lastUpdateAPTime = NaN;
        this.refreshFlightPlanCooldown = 0;
        this.updateAutopilotCooldown = 0;
        this._lastHasReachFlex = false;
        this._apMasterStatus = false;
        this._hasReachedTopOfDescent = false;
        this._apCooldown = 500;
        this._lastRequestedFLCModeWaypointIndex = -1;
        this._HDGToTRKDelta = 0;
    }
    get templateID() { return "A320_Neo_CDU"; }
    connectedCallback() {
        super.connectedCallback();
        RegisterViewListener("JS_LISTENER_KEYEVENT", () => {
            console.log("JS_LISTENER_KEYEVENT registered.");
            RegisterViewListener("JS_LISTENER_FACILITY", () => {
                console.log("JS_LISTENER_FACILITY registered.");
                this._registered = true;
            }, true);
        });
    }
    Init() {
        super.Init();
        this.defaultInputErrorMessage = "NOT ALLOWED";
        this.onDir = () => { CDUDirectToPage.ShowPage(this); };
        this.onProg = () => { CDUProgressPage.ShowPage(this); };
        this.onPerf = () => { CDUPerformancePage.ShowPage(this); };
        this.onInit = () => { CDUInitPage.ShowPage1(this); };
        this.onData = () => { CDUDataIndexPage.ShowPage(this); };
        this.onFpln = () => { CDUFlightPlanPage.ShowPage(this); };
        this.onRad = () => { CDUNavRadioPage.ShowPage(this); };
        this.onFuel = () => { CDUFuelPredPage.ShowPage(this); };
        let mcduStartPage = SimVar.GetSimVarValue("L:A320_NEO_CDU_START_PAGE", "number");
        if (mcduStartPage < 1) {
            CDUIdentPage.ShowPage(this);
        }
        else if (mcduStartPage === 10) {
            CDUDirectToPage.ShowPage(this);
        }
        else if (mcduStartPage === 20) {
            CDUProgressPage.ShowPage(this);
        }
        else if (mcduStartPage === 30) {
            CDUPerformancePage.ShowPage(this);
        }
        else if (mcduStartPage === 31) {
            CDUPerformancePage.ShowTAKEOFFPage(this);
        }
        else if (mcduStartPage === 32) {
            CDUPerformancePage.ShowCLBPage(this);
        }
        else if (mcduStartPage === 33) {
            CDUPerformancePage.ShowCRZPage(this);
        }
        else if (mcduStartPage === 34) {
            CDUPerformancePage.ShowDESPage(this);
        }
        else if (mcduStartPage === 35) {
            CDUPerformancePage.ShowAPPRPage(this);
        }
        else if (mcduStartPage === 40) {
            CDUInitPage.ShowPage1(this);
        }
        else if (mcduStartPage === 50) {
            CDUDataIndexPage.ShowPage(this);
        }
        else if (mcduStartPage === 60) {
            CDUFlightPlanPage.ShowPage(this);
        }
        else if (mcduStartPage === 70) {
            CDUNavRadioPage.ShowPage(this);
        }
        else if (mcduStartPage === 80) {
            CDUFuelPredPage.ShowPage(this);
        }
        ;
    }
    onFMCFlightPlanLoaded() {
        this.flightPlanManager.onCruisingAltitudeChanged = () => {
            if (this.flightPlanManager.getWaypoints().length > 0 && isFinite(this.flightPlanManager.cruisingAltitude)) {
                this.cruiseFlightLevel = Math.floor(this.flightPlanManager.cruisingAltitude / 100);
            }
        };
        this.flightPlanManager.onCruisingAltitudeChanged();
        this.updateFlyAssistantTakeOffEstimatedSpeed();
    }
    onPowerOn() {
        super.onPowerOn();
        if (Simplane.getAutoPilotAirspeedManaged()) {
            this._onModeManagedSpeed();
        }
        else if (Simplane.getAutoPilotAirspeedSelected()) {
            this._onModeSelectedSpeed();
        }
        this._onModeManagedHeading();
        this._onModeManagedAltitude();
        SimVar.SetSimVarValue("K:VS_SLOT_INDEX_SET", "number", 1);
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        this.updateAutopilot();
    }
    getClbManagedSpeed() {
        let maxSpeed = Infinity;
        if (isFinite(this.v2Speed)) {
            let altitude = Simplane.getAltitude();
            if (altitude < this.thrustReductionAltitude) {
                maxSpeed = this.v2Speed + 10;
            }
        }
        let flapsHandleIndex = Simplane.getFlapsHandleIndex();
        if (flapsHandleIndex != 0) {
            return Math.min(maxSpeed, this.getFlapSpeed());
        }
        let dCI = this.getCostIndexFactor();
        dCI = dCI * dCI;
        let speed = 320 * (1 - dCI) + 330 * dCI;
        if (this.overSpeedLimitThreshold) {
            if (Simplane.getAltitude() < 9800) {
                speed = Math.min(speed, 250);
                this.overSpeedLimitThreshold = false;
            }
        }
        else if (!this.overSpeedLimitThreshold) {
            if (Simplane.getAltitude() < 10000) {
                speed = Math.min(speed, 250);
            }
            else {
                this.overSpeedLimitThreshold = true;
            }
        }
        return Math.min(maxSpeed, speed);
    }
    getFlapTakeOffSpeed() {
        let dWeight = (this.getWeight() - 47) / (78 - 47);
        return 119 + 34 * dWeight;
    }
    getSlatTakeOffSpeed() {
        let dWeight = (this.getWeight() - 47) / (78 - 47);
        return 154 + 44 * dWeight;
    }
    getManagedApproachSpeed(flapsHandleIndex = NaN) {
        if (isNaN(flapsHandleIndex)) {
            flapsHandleIndex = Simplane.getFlapsHandleIndex();
        }
        if (flapsHandleIndex === 0) {
            return Simplane.getGreenDotSpeed();
        }
        else if (flapsHandleIndex === 4) {
            return Simplane.getLowestSelectableSpeed() * 1.1;
        }
        else {
            return Simplane.getFlapsLimitSpeed(this.aircraftType, flapsHandleIndex + 1);
        }
    }
    _onModeSelectedSpeed() {
        if (SimVar.GetSimVarValue("L:A320_FCU_SHOW_SELECTED_SPEED", "number") === 0) {
            let currentSpeed = Simplane.getIndicatedSpeed();
            console.log("Set CurrentSpeed : " + currentSpeed);
            this.setAPSelectedSpeed(currentSpeed, Aircraft.A320_NEO);
        }
        SimVar.SetSimVarValue("K:SPEED_SLOT_INDEX_SET", "number", 1);
    }
    _onModeManagedSpeed() {
        SimVar.SetSimVarValue("K:SPEED_SLOT_INDEX_SET", "number", 2);
        SimVar.SetSimVarValue("L:A320_FCU_SHOW_SELECTED_SPEED", "number", 0);
    }
    _onModeSelectedHeading() {
        if (SimVar.GetSimVarValue("AUTOPILOT APPROACH HOLD", "boolean")) {
            return;
        }
        if (!SimVar.GetSimVarValue("AUTOPILOT HEADING LOCK", "Boolean")) {
            SimVar.SetSimVarValue("K:AP_PANEL_HEADING_HOLD", "Number", 1);
        }
        SimVar.SetSimVarValue("K:HEADING_SLOT_INDEX_SET", "number", 1);
        if (Simplane.getAutoPilotTRKFPAModeActive()) {
            SimVar.SetSimVarValue("K:ALTITUDE_SLOT_INDEX_SET", "number", 1);
        }
        else {
        }
    }
    _onModeManagedHeading() {
        if (SimVar.GetSimVarValue("AUTOPILOT APPROACH HOLD", "boolean")) {
            return;
        }
        if (!SimVar.GetSimVarValue("AUTOPILOT HEADING LOCK", "Boolean")) {
            SimVar.SetSimVarValue("K:AP_PANEL_HEADING_HOLD", "Number", 1);
        }
        SimVar.SetSimVarValue("K:HEADING_SLOT_INDEX_SET", "number", 2);
        SimVar.SetSimVarValue("L:A320_FCU_SHOW_SELECTED_HEADING", "number", 0);
    }
    _onModeSelectedAltitude() {
        if (!Simplane.getAutoPilotGlideslopeHold()) {
            SimVar.SetSimVarValue("L:A320_NEO_FCU_FORCE_IDLE_VS", "Number", 1);
        }
        SimVar.SetSimVarValue("K:ALTITUDE_SLOT_INDEX_SET", "number", 1);
        Coherent.call("AP_ALT_VAR_SET_ENGLISH", 1, Simplane.getAutoPilotDisplayedAltitudeLockValue(), this._forceNextAltitudeUpdate);
    }
    _onModeManagedAltitude() {
        SimVar.SetSimVarValue("K:ALTITUDE_SLOT_INDEX_SET", "number", 2);
        Coherent.call("AP_ALT_VAR_SET_ENGLISH", 1, Simplane.getAutoPilotDisplayedAltitudeLockValue(), this._forceNextAltitudeUpdate);
        Coherent.call("AP_ALT_VAR_SET_ENGLISH", 2, Simplane.getAutoPilotDisplayedAltitudeLockValue(), this._forceNextAltitudeUpdate);
        if (!Simplane.getAutoPilotGlideslopeHold()) {
            this.requestCall(() => {
                SimVar.SetSimVarValue("L:A320_NEO_FCU_FORCE_IDLE_VS", "Number", 1);
            });
        }
    }
    onEvent(_event) {
        super.onEvent(_event);
        if (_event === "MODE_SELECTED_SPEED") {
            this._onModeSelectedSpeed();
        }
        if (_event === "MODE_MANAGED_SPEED") {
            if (this.flightPlanManager.getWaypointsCount() === 0) {
                return;
            }
            this._onModeManagedSpeed();
        }
        if (_event === "MODE_SELECTED_HEADING") {
            if (Simplane.getAutoPilotHeadingManaged()) {
                if (SimVar.GetSimVarValue("L:A320_FCU_SHOW_SELECTED_HEADING", "number") === 0) {
                    if (Simplane.getAutoPilotTRKFPAModeActive()) {
                        Coherent.call("HEADING_BUG_SET", 3, Simplane.getTrackAngle());
                    }
                    else {
                        Coherent.call("HEADING_BUG_SET", 3, Simplane.getHeadingMagnetic());
                        Coherent.call("HEADING_BUG_SET", 1, Simplane.getHeadingMagnetic());
                    }
                }
                else {
                    if (Simplane.getAutoPilotTRKFPAModeActive()) {
                        Coherent.call("HEADING_BUG_SET", 2, Simplane.getAutoPilotDisplayedHeadingValue(false));
                    }
                    else {
                        Coherent.call("HEADING_BUG_SET", 1, Simplane.getAutoPilotDisplayedHeadingValue(false));
                    }
                }
            }
            else {
                if (Simplane.getAutoPilotTRKFPAModeActive()) {
                    Coherent.call("HEADING_BUG_SET", 2, Simplane.getAutoPilotDisplayedHeadingValue(false));
                }
                else {
                    Coherent.call("HEADING_BUG_SET", 1, Simplane.getAutoPilotDisplayedHeadingValue(false));
                }
            }
            this._onModeSelectedHeading();
            if (this.isAltitudeManaged()) {
                this._onModeSelectedAltitude();
            }
        }
        if (_event === "MODE_MANAGED_HEADING") {
            if (this.flightPlanManager.getWaypointsCount() === 0) {
                return;
            }
            this._onModeManagedHeading();
        }
        if (_event === "MODE_SELECTED_ALTITUDE") {
            this._onModeSelectedAltitude();
        }
        if (_event === "MODE_MANAGED_ALTITUDE") {
            if (this.flightPlanManager.getWaypointsCount() === 0) {
                return;
            }
            if (!Simplane.getAutoPilotHeadingManaged()) {
                return;
            }
            this._onModeManagedAltitude();
        }
        if (_event === "AP_DEC_SPEED" || _event === "AP_INC_SPEED") {
            if (SimVar.GetSimVarValue("L:A320_FCU_SHOW_SELECTED_SPEED", "number") === 0) {
                let currentSpeed = Simplane.getIndicatedSpeed();
                this.setAPSelectedSpeed(currentSpeed, Aircraft.A320_NEO);
            }
            SimVar.SetSimVarValue("L:A320_FCU_SHOW_SELECTED_SPEED", "number", 1);
        }
        if (_event === "AP_DEC_HEADING" || _event === "AP_INC_HEADING") {
            if (SimVar.GetSimVarValue("L:A320_FCU_SHOW_SELECTED_HEADING", "number") === 0) {
                let currentHeading = Simplane.getHeadingMagnetic();
                Coherent.call("HEADING_BUG_SET", 3, currentHeading);
            }
            SimVar.SetSimVarValue("L:A320_FCU_SHOW_SELECTED_HEADING", "number", 1);
            let displayedHeadingValue = Simplane.getAutoPilotDisplayedHeadingValue(false);
            if (this._lastDisplayedHeadingValue != displayedHeadingValue) {
                this._lastDisplayedHeadingValue = displayedHeadingValue;
                if (Simplane.getAutoPilotHeadingSelected()) {
                    Coherent.call("HEADING_BUG_SET", 1, displayedHeadingValue);
                }
                else if (Simplane.getAutoPilotTRKModeActive()) {
                    Coherent.call("HEADING_BUG_SET", 2, Simplane.getAutoPilotDisplayedHeadingValue(false));
                }
                clearTimeout(this._syncHeadingKnobTimeOut);
                setTimeout(() => {
                    let displayedHeadingValue = Simplane.getAutoPilotDisplayedHeadingValue(false);
                    if (this._lastDisplayedHeadingValue != displayedHeadingValue) {
                        if (Simplane.getAutoPilotHeadingSelected()) {
                            Coherent.call("HEADING_BUG_SET", 1, displayedHeadingValue);
                        }
                        else if (Simplane.getAutoPilotTRKModeActive()) {
                            Coherent.call("HEADING_BUG_SET", 2, Simplane.getAutoPilotDisplayedHeadingValue(false));
                        }
                    }
                }, 500);
            }
        }
        if (_event === "AP_TRK_FPA") {
            console.log("Simplane.getAutoPilotTRKFPAModeActive() " + Simplane.getAutoPilotTRKFPAModeActive());
            if (!Simplane.getAutoPilotTRKFPAModeActive()) {
                if (Simplane.getAutoPilotHeadingSelected()) {
                    Coherent.call("HEADING_BUG_SET", 1, Simplane.getAutoPilotDisplayedHeadingValue(false));
                }
            }
            else {
                Coherent.call("HEADING_BUG_SET", 2, Simplane.getAutoPilotDisplayedHeadingValue(false));
            }
        }
        if (_event === "AP_INC_ALT" || _event === "AP_DEC_ALT") {
            if (Simplane.getAutoPilotFLCActive() || Simplane.getAutoPilotVerticalSpeedHoldActive()) {
                if (Simplane.getAutoPilotAltitudeSelected()) {
                    Coherent.call("AP_ALT_VAR_SET_ENGLISH", 1, Simplane.getAutoPilotDisplayedAltitudeLockValue(), this._forceNextAltitudeUpdate);
                }
            }
        }
    }
    onFlightPhaseChanged() {
        if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB) {
            if (isFinite(this.preSelectedClbSpeed)) {
                this.setAPSelectedSpeed(this.preSelectedClbSpeed, Aircraft.A320_NEO);
                SimVar.SetSimVarValue("K:SPEED_SLOT_INDEX_SET", "number", 1);
            }
        }
        else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {
            if (isFinite(this.preSelectedCrzSpeed)) {
                this.setAPSelectedSpeed(this.preSelectedCrzSpeed, Aircraft.A320_NEO);
                SimVar.SetSimVarValue("K:SPEED_SLOT_INDEX_SET", "number", 1);
            }
        }
        else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_DESCENT) {
            if (isFinite(this.preSelectedDesSpeed)) {
                this.setAPSelectedSpeed(this.preSelectedDesSpeed, Aircraft.A320_NEO);
                SimVar.SetSimVarValue("K:SPEED_SLOT_INDEX_SET", "number", 1);
            }
        }
    }
    onInputAircraftSpecific(input) {
        if (input === "DIR") {
            if (this.onDir) {
                this.onDir();
            }
            return true;
        }
        else if (input === "PROG") {
            if (this.onProg) {
                this.onProg();
            }
            return true;
        }
        else if (input === "PERF") {
            if (this.onPerf) {
                this.onPerf();
            }
            return true;
        }
        else if (input === "INIT") {
            if (this.onInit) {
                this.onInit();
            }
            return true;
        }
        else if (input === "DATA") {
            if (this.onData) {
                this.onData();
            }
            return true;
        }
        else if (input === "FPLN") {
            if (this.onFpln) {
                this.onFpln();
            }
            return true;
        }
        else if (input === "RAD") {
            if (this.onRad) {
                this.onRad();
            }
            return true;
        }
        else if (input === "FUEL") {
            if (this.onFuel) {
                this.onFuel();
            }
            return true;
        }
        else if (input === "SEC") {
            if (this.onSec) {
                this.onSec();
            }
            return true;
        }
        else if (input === "ATC") {
            if (this.onAtc) {
                this.onAtc();
            }
            return true;
        }
        else if (input === "MCDU") {
            if (this.onMcdu) {
                this.onMcdu();
            }
            return true;
        }
        else if (input === "AIRPORT") {
            if (this.onAirport) {
                this.onAirport();
            }
            return true;
        }
        else if (input === "UP") {
            if (this.onUp) {
                this.onUp();
            }
            return true;
        }
        else if (input === "DOWN") {
            if (this.onDown) {
                this.onDown();
            }
            return true;
        }
        else if (input === "LEFT") {
            if (this.onLeft) {
                this.onLeft();
            }
            return true;
        }
        else if (input === "RIGHT") {
            if (this.onRight) {
                this.onRight();
            }
        }
        else if (input === "OVFY") {
            if (this.onOvfy) {
                this.onOvfy();
            }
            return true;
        }
        return false;
    }
    clearDisplay() {
        super.clearDisplay();
        this.onUp = undefined;
        this.onDown = undefined;
        this.onLeft = undefined;
        this.onRight = undefined;
    }
    getOrSelectWaypointByIdent(ident, callback) {
        this.dataManager.GetWaypointsByIdent(ident).then((waypoints) => {
            if (!waypoints || waypoints.length === 0) {
                return callback(undefined);
            }
            if (waypoints.length === 1) {
                return callback(waypoints[0]);
            }
            A320_Neo_CDU_SelectWptPage.ShowPage(this, waypoints, callback);
        });
    }
    _getIndexFromTemp(temp) {
        if (temp < -10)
            return 0;
        if (temp < 0)
            return 1;
        if (temp < 10)
            return 2;
        if (temp < 20)
            return 3;
        if (temp < 30)
            return 4;
        if (temp < 40)
            return 5;
        if (temp < 43)
            return 6;
        if (temp < 45)
            return 7;
        if (temp < 47)
            return 8;
        if (temp < 49)
            return 9;
        if (temp < 51)
            return 10;
        if (temp < 53)
            return 11;
        if (temp < 55)
            return 12;
        if (temp < 57)
            return 13;
        if (temp < 59)
            return 14;
        if (temp < 61)
            return 15;
        if (temp < 63)
            return 16;
        if (temp < 65)
            return 17;
        if (temp < 66)
            return 18;
        return 19;
    }
    _computeV1Speed() {
        let runwayCoef = 1.0;
        {
            let runway = this.flightPlanManager.getDepartureRunway();
            if (!runway) {
                runway = this.flightPlanManager.getDetectedCurrentRunway();
            }
            console.log(runway);
            if (runway) {
                let f = (runway.length - 1500) / (2500 - 1500);
                runwayCoef = Utils.Clamp(f, 0, 1);
            }
        }
        let dWeightCoeff = (this.getWeight(true) - 100) / (175 - 100);
        dWeightCoeff = Utils.Clamp(dWeightCoeff, 0, 1);
        dWeightCoeff = 0.8 + (1.1 - 0.8) * dWeightCoeff;
        let flapsHandleIndex = Simplane.getFlapsHandleIndex();
        let temp = SimVar.GetSimVarValue("AMBIENT TEMPERATURE", "celsius");
        let index = this._getIndexFromTemp(temp);
        console.log("Index From Temp = " + index);
        let min = A320_Neo_CDU_MainDisplay._v1sConf1[index][0];
        let max = A320_Neo_CDU_MainDisplay._v1sConf1[index][1];
        this.v1Speed = min * (1 - runwayCoef) + max * runwayCoef;
        this.v1Speed *= dWeightCoeff;
        this.v1Speed -= (flapsHandleIndex - 1) * 6;
        this.v1Speed = Math.round(this.v1Speed);
        SimVar.SetSimVarValue("L:AIRLINER_V1_SPEED", "Knots", this.v1Speed);
        console.log("Computed V1Speed = " + this.v1Speed);
    }
    _getComputedVRSpeed() {
        let runwayCoef = 1.0;
        {
            let runway = this.flightPlanManager.getDepartureRunway();
            if (!runway) {
                runway = this.flightPlanManager.getDetectedCurrentRunway();
            }
            console.log(runway);
            if (runway) {
                let f = (runway.length - 1500) / (2500 - 1500);
                runwayCoef = Utils.Clamp(f, 0, 1);
            }
        }
        let dWeightCoeff = (this.getWeight(true) - 100) / (175 - 100);
        dWeightCoeff = Utils.Clamp(dWeightCoeff, 0, 1);
        dWeightCoeff = 0.795 + (1.085 - 0.795) * dWeightCoeff;
        let flapsHandleIndex = Simplane.getFlapsHandleIndex();
        let temp = SimVar.GetSimVarValue("AMBIENT TEMPERATURE", "celsius");
        let index = this._getIndexFromTemp(temp);
        console.log("Index From Temp = " + index);
        let min = A320_Neo_CDU_MainDisplay._vRsConf1[index][0];
        let max = A320_Neo_CDU_MainDisplay._vRsConf1[index][1];
        let vRSpeed = min * (1 - runwayCoef) + max * runwayCoef;
        vRSpeed *= dWeightCoeff;
        vRSpeed -= (flapsHandleIndex - 1) * 6;
        vRSpeed = Math.round(vRSpeed);
        return vRSpeed;
    }
    _computeVRSpeed() {
        this.vRSpeed = this._getComputedVRSpeed();
        SimVar.SetSimVarValue("L:AIRLINER_VR_SPEED", "Knots", this.vRSpeed);
        SimVar.SetSimVarValue("FLY ASSISTANT TAKEOFF SPEED ESTIMATED", "Knots", this.vRSpeed);
        console.log("Computed VRSpeed = " + this.vRSpeed);
    }
    updateFlyAssistantTakeOffEstimatedSpeed() {
        let vRSpeed = this._getComputedVRSpeed();
        SimVar.SetSimVarValue("FLY ASSISTANT TAKEOFF SPEED ESTIMATED", "Knots", vRSpeed);
    }
    _computeV2Speed() {
        let runwayCoef = 1.0;
        {
            let runway = this.flightPlanManager.getDepartureRunway();
            if (!runway) {
                runway = this.flightPlanManager.getDetectedCurrentRunway();
            }
            console.log(runway);
            if (runway) {
                let f = (runway.length - 1500) / (2500 - 1500);
                runwayCoef = Utils.Clamp(f, 0, 1);
            }
        }
        let dWeightCoeff = (this.getWeight(true) - 100) / (175 - 100);
        dWeightCoeff = Utils.Clamp(dWeightCoeff, 0, 1);
        dWeightCoeff = 0.81 + (1.06 - 0.81) * dWeightCoeff;
        let flapsHandleIndex = Simplane.getFlapsHandleIndex();
        let temp = SimVar.GetSimVarValue("AMBIENT TEMPERATURE", "celsius");
        let index = this._getIndexFromTemp(temp);
        console.log("Index From Temp = " + index);
        let min = A320_Neo_CDU_MainDisplay._v2sConf1[index][0];
        let max = A320_Neo_CDU_MainDisplay._v2sConf1[index][1];
        this.v2Speed = min * (1 - runwayCoef) + max * runwayCoef;
        this.v2Speed *= dWeightCoeff;
        this.v2Speed -= (flapsHandleIndex - 1) * 6;
        this.v2Speed = Math.round(this.v2Speed);
        SimVar.SetSimVarValue("L:AIRLINER_V2_SPEED", "Knots", this.v2Speed);
        console.log("Computed V2Speed = " + this.v2Speed);
    }
    getThrustTakeOffLimit() {
        if (this.perfTOTemp <= 10) {
            return 92.8;
        }
        if (this.perfTOTemp <= 40) {
            return 92.8;
        }
        if (this.perfTOTemp <= 45) {
            return 92.2;
        }
        if (this.perfTOTemp <= 50) {
            return 90.5;
        }
        if (this.perfTOTemp <= 55) {
            return 88.8;
        }
        return 88.4;
    }
    getThrustClimbLimit() {
        return this.getThrustTakeOffLimit() - 8;
    }
    isAirspeedManaged() {
        return SimVar.GetSimVarValue("AUTOPILOT SPEED SLOT INDEX", "number") === 2;
    }
    isAltitudeManaged() {
        return SimVar.GetSimVarValue("AUTOPILOT ALTITUDE SLOT INDEX", "number") === 2;
    }
    isVerticalSpeedManaged() {
        return SimVar.GetSimVarValue("AUTOPILOT VS SLOT INDEX", "number") === 2;
    }
    updateAutopilot() {
        let now = performance.now();
        let dt = now - this._lastUpdateAPTime;
        let apLogicOn = (this._apMasterStatus || Simplane.getAutoPilotFlightDirectorActive(1));
        this._lastUpdateAPTime = now;
        if (isFinite(dt)) {
            this.updateAutopilotCooldown -= dt;
        }
        if (SimVar.GetSimVarValue("L:AIRLINER_FMC_FORCE_NEXT_UPDATE", "number") === 1) {
            SimVar.SetSimVarValue("L:AIRLINER_FMC_FORCE_NEXT_UPDATE", "number", 0);
            this.updateAutopilotCooldown = -1;
        }
        if (apLogicOn && this.currentFlightPhase >= FlightPhase.FLIGHT_PHASE_TAKEOFF) {
            if (Simplane.getAutoPilotHeadingManaged()) {
                let heading = SimVar.GetSimVarValue("GPS COURSE TO STEER", "degree", "FMC");
                let bSlewMode = SimVar.GetSimVarValue("IS SLEW ACTIVE", "boolean", "FMC");
                if (isFinite(heading) && !bSlewMode) {
                    Coherent.call("HEADING_BUG_SET", 2, heading);
                }
            }
            else if (Simplane.getAutoPilotTRKFPAModeActive()) {
                Coherent.call("HEADING_BUG_SET", 1, Simplane.convertTrackToHeading(Simplane.getAutoPilotManagedHeadingValue(false)));
            }
        }
        if (this.updateAutopilotCooldown < 0) {
            let currentApMasterStatus = SimVar.GetSimVarValue("AUTOPILOT MASTER", "boolean");
            if (currentApMasterStatus != this._apMasterStatus) {
                this._apMasterStatus = currentApMasterStatus;
                apLogicOn = (this._apMasterStatus || Simplane.getAutoPilotFlightDirectorActive(1));
                this._forceNextAltitudeUpdate = true;
                console.log("Enforce AP in Altitude Lock mode. Cause : AP Master Status has changed.");
                SimVar.SetSimVarValue("L:A320_NEO_FCU_FORCE_IDLE_VS", "Number", 1);
                if (this._apMasterStatus) {
                    if (this.flightPlanManager.getWaypointsCount() === 0) {
                        this._onModeSelectedAltitude();
                        this._onModeSelectedHeading();
                        this._onModeSelectedSpeed();
                    }
                }
            }
            if (apLogicOn) {
                if (!Simplane.getAutoPilotFLCActive()) {
                    this.setAPSpeedHoldMode();
                }
                if (!SimVar.GetSimVarValue("AUTOPILOT HEADING LOCK", "Boolean")) {
                    if (!SimVar.GetSimVarValue("AUTOPILOT APPROACH HOLD", "Boolean")) {
                        SimVar.SetSimVarValue("K:AP_PANEL_HEADING_HOLD", "Number", 1);
                    }
                }
            }
            let currentHasReachedFlex = Simplane.getEngineThrottleMode(0) >= ThrottleMode.FLEX_MCT && Simplane.getEngineThrottleMode(1) >= ThrottleMode.FLEX_MCT;
            if (currentHasReachedFlex != this._lastHasReachFlex) {
                this._lastHasReachFlex = currentHasReachedFlex;
                console.log("Current Has Reached Flex = " + currentHasReachedFlex);
                if (currentHasReachedFlex) {
                    if (!SimVar.GetSimVarValue("AUTOPILOT THROTTLE ARM", "boolean")) {
                        SimVar.SetSimVarValue("K:AUTO_THROTTLE_ARM", "number", 1);
                    }
                }
            }
            let currentAltitude = Simplane.getAltitude();
            let groundSpeed = Simplane.getGroundSpeed();
            let apTargetAltitude = Simplane.getAutoPilotAltitudeLockValue("feet");
            let showTopOfClimb = false;
            let topOfClimbLlaHeading;
            let planeHeading = Simplane.getHeadingMagnetic();
            let planeCoordinates = new LatLong(SimVar.GetSimVarValue("PLANE LATITUDE", "degree latitude"), SimVar.GetSimVarValue("PLANE LONGITUDE", "degree longitude"));
            if (apTargetAltitude > currentAltitude + 40) {
                let vSpeed = Simplane.getVerticalSpeed();
                let climbDuration = (apTargetAltitude - currentAltitude) / vSpeed / 60;
                let climbDistance = climbDuration * groundSpeed;
                if (climbDistance > 1) {
                    topOfClimbLlaHeading = this.flightPlanManager.getCoordinatesHeadingAtDistanceAlongFlightPlan(climbDistance);
                    if (topOfClimbLlaHeading) {
                        showTopOfClimb = true;
                    }
                }
            }
            if (showTopOfClimb) {
                SimVar.SetSimVarValue("L:AIRLINER_FMS_SHOW_TOP_CLIMB", "number", 1);
                SimVar.SetSimVarValue("L:AIRLINER_FMS_LAT_TOP_CLIMB", "number", topOfClimbLlaHeading.lla.lat);
                SimVar.SetSimVarValue("L:AIRLINER_FMS_LONG_TOP_CLIMB", "number", topOfClimbLlaHeading.lla.long);
                SimVar.SetSimVarValue("L:AIRLINER_FMS_HEADING_TOP_CLIMB", "number", topOfClimbLlaHeading.heading);
            }
            else {
                SimVar.SetSimVarValue("L:AIRLINER_FMS_SHOW_TOP_CLIMB", "number", 0);
            }
            if (this.currentFlightPhase >= FlightPhase.FLIGHT_PHASE_CLIMB) {
                let activeWaypoint = this.flightPlanManager.getActiveWaypoint(true);
                if (activeWaypoint != this._activeWaypoint) {
                    console.log("Update FMC Active Waypoint");
                    if (this._activeWaypoint) {
                        this._activeWaypoint.altitudeWasReached = Simplane.getAltitudeAboveGround();
                        this._activeWaypoint.timeWasReached = SimVar.GetGlobalVarValue("LOCAL TIME", "seconds");
                        this._activeWaypoint.fuelWasReached = SimVar.GetSimVarValue("FUEL TOTAL QUANTITY", "gallons") * SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "kilograms") / 1000;
                    }
                    this._activeWaypoint = activeWaypoint;
                }
            }
            SimVar.SetSimVarValue("SIMVAR_AUTOPILOT_AIRSPEED_MIN_CALCULATED", "knots", Simplane.getStallProtectionMinSpeed());
            SimVar.SetSimVarValue("SIMVAR_AUTOPILOT_AIRSPEED_MAX_CALCULATED", "knots", Simplane.getMaxSpeed(Aircraft.A320_NEO));
            if (this.isAltitudeManaged()) {
                let prevWaypoint = this.flightPlanManager.getPreviousActiveWaypoint();
                let nextWaypoint = this.flightPlanManager.getActiveWaypoint();
                if (prevWaypoint && nextWaypoint) {
                    let targetAltitude = nextWaypoint.legAltitude1;
                    if (nextWaypoint.legAltitudeDescription === 4) {
                        targetAltitude = Math.max(nextWaypoint.legAltitude1, nextWaypoint.legAltitude2);
                    }
                    let showTopOfDescent = false;
                    let topOfDescentLat;
                    let topOfDescentLong;
                    let topOfDescentHeading;
                    this._hasReachedTopOfDescent = true;
                    if (currentAltitude > targetAltitude + 40) {
                        let vSpeed = Math.abs(Math.min(0, Simplane.getVerticalSpeed()));
                        if (vSpeed < 200) {
                            vSpeed = 2000;
                        }
                        let descentDuration = Math.abs(targetAltitude - currentAltitude) / vSpeed / 60;
                        let descentDistance = descentDuration * groundSpeed;
                        let distanceToTarget = Avionics.Utils.computeGreatCircleDistance(prevWaypoint.infos.coordinates, nextWaypoint.infos.coordinates);
                        showTopOfDescent = true;
                        let f = 1 - descentDistance / distanceToTarget;
                        topOfDescentLat = Avionics.Utils.lerpAngle(prevWaypoint.infos.lat, nextWaypoint.infos.lat, f);
                        topOfDescentLong = Avionics.Utils.lerpAngle(prevWaypoint.infos.long, nextWaypoint.infos.long, f);
                        topOfDescentHeading = nextWaypoint.bearingInFP;
                        if (distanceToTarget + 1 > descentDistance) {
                            this._hasReachedTopOfDescent = false;
                        }
                    }
                    if (showTopOfDescent) {
                        SimVar.SetSimVarValue("L:AIRLINER_FMS_SHOW_TOP_DSCNT", "number", 1);
                        SimVar.SetSimVarValue("L:AIRLINER_FMS_LAT_TOP_DSCNT", "number", topOfDescentLat);
                        SimVar.SetSimVarValue("L:AIRLINER_FMS_LONG_TOP_DSCNT", "number", topOfDescentLong);
                        SimVar.SetSimVarValue("L:AIRLINER_FMS_HEADING_TOP_DSCNT", "number", topOfDescentHeading);
                    }
                    else {
                        SimVar.SetSimVarValue("L:AIRLINER_FMS_SHOW_TOP_DSCNT", "number", 0);
                    }
                    let selectedAltitude = Simplane.getAutoPilotSelectedAltitudeLockValue("feet");
                    if (!this.flightPlanManager.getIsDirectTo() &&
                        isFinite(nextWaypoint.legAltitude1) &&
                        nextWaypoint.legAltitude1 < 20000 &&
                        nextWaypoint.legAltitude1 > selectedAltitude &&
                        Simplane.getAltitude() > nextWaypoint.legAltitude1 - 200) {
                        Coherent.call("AP_ALT_VAR_SET_ENGLISH", 2, nextWaypoint.legAltitude1, this._forceNextAltitudeUpdate);
                        this._forceNextAltitudeUpdate = false;
                        SimVar.SetSimVarValue("L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT", "number", 1);
                    }
                    else {
                        let altitude = Simplane.getAutoPilotSelectedAltitudeLockValue("feet");
                        if (isFinite(altitude)) {
                            Coherent.call("AP_ALT_VAR_SET_ENGLISH", 2, altitude, this._forceNextAltitudeUpdate);
                            this._forceNextAltitudeUpdate = false;
                            SimVar.SetSimVarValue("L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT", "number", 0);
                        }
                    }
                }
                else {
                    let altitude = Simplane.getAutoPilotSelectedAltitudeLockValue("feet");
                    if (isFinite(altitude)) {
                        Coherent.call("AP_ALT_VAR_SET_ENGLISH", 2, altitude, this._forceNextAltitudeUpdate);
                        this._forceNextAltitudeUpdate = false;
                        SimVar.SetSimVarValue("L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT", "number", 0);
                    }
                }
            }
            if (Simplane.getAutoPilotAltitudeManaged() && SimVar.GetSimVarValue("L:A320_NEO_FCU_STATE", "number") != 1) {
                let currentWaypointIndex = this.flightPlanManager.getActiveWaypointIndex();
                if (currentWaypointIndex != this._lastRequestedFLCModeWaypointIndex) {
                    this._lastRequestedFLCModeWaypointIndex = currentWaypointIndex;
                    if (!Simplane.getAutoPilotVerticalSpeedHoldActive()) {
                        this.requestCall(() => {
                            if (Simplane.getAutoPilotAltitudeManaged()) {
                                this._onModeManagedAltitude();
                            }
                        }, 1000);
                    }
                }
            }
            if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_TAKEOFF) {
                let n1 = this.getThrustTakeOffLimit() / 100;
                SimVar.SetSimVarValue("AUTOPILOT THROTTLE MAX THRUST", "number", n1);
                if (this.isAirspeedManaged()) {
                    let speed = 0;
                    if (isFinite(this.v2Speed)) {
                        let altitude = Simplane.getAltitude();
                        if (altitude < this.thrustReductionAltitude) {
                            speed = this.v2Speed + 10;
                        }
                    }
                    if (speed === 0) {
                        speed = this.getCleanTakeOffSpeed();
                    }
                    this.setAPManagedSpeed(speed, Aircraft.A320_NEO);
                }
            }
            else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB) {
                if (this.isAirspeedManaged()) {
                    let speed = this.getClbManagedSpeed();
                    this.setAPManagedSpeed(speed, Aircraft.A320_NEO);
                }
                let altitude = Simplane.getAltitudeAboveGround();
                let n1 = 100;
                if (altitude < this.thrustReductionAltitude) {
                    n1 = this.getThrustTakeOffLimit() / 100;
                }
                else {
                    n1 = this.getThrustClimbLimit() / 100;
                }
                SimVar.SetSimVarValue("AUTOPILOT THROTTLE MAX THRUST", "number", n1);
            }
            else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {
                if (this.isAirspeedManaged()) {
                    let speed = this.getCrzManagedSpeed();
                    this.setAPManagedSpeed(speed, Aircraft.A320_NEO);
                }
                if (this.isAltitudeManaged()) {
                }
                let altitude = Simplane.getAltitudeAboveGround();
                let n1 = 100;
                if (altitude < this.thrustReductionAltitude) {
                    n1 = this.getThrustTakeOffLimit() / 100;
                }
                else {
                    n1 = this.getThrustClimbLimit() / 100;
                }
                SimVar.SetSimVarValue("AUTOPILOT THROTTLE MAX THRUST", "number", n1);
            }
            else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_DESCENT) {
                if (this.isAirspeedManaged()) {
                    let speed = this.getDesManagedSpeed();
                    this.setAPManagedSpeed(speed, Aircraft.A320_NEO);
                }
            }
            else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_APPROACH) {
                if (this.isAirspeedManaged()) {
                    let speed = this.getManagedApproachSpeed();
                    this.setAPManagedSpeed(speed, Aircraft.A320_NEO);
                }
            }
            this.updateAutopilotCooldown = this._apCooldown;
        }
    }
}
A320_Neo_CDU_MainDisplay._v1sConf1 = [
    [145, 149],
    [143, 151],
    [141, 152],
    [139, 150],
    [137, 147],
    [136, 145],
    [134, 143],
    [134, 142],
    [133, 142],
    [133, 143],
    [133, 144],
    [132, 145],
    [132, 146],
    [132, 146],
    [132, 147],
    [131, 148],
    [131, 148],
    [131, 149],
    [130, 150],
    [130, 150],
];
A320_Neo_CDU_MainDisplay._v1sConf2 = [
    [130, 156],
    [128, 154],
    [127, 151],
    [125, 149],
    [123, 147],
    [122, 145],
    [121, 143],
    [120, 143],
    [120, 143],
    [120, 142],
    [119, 142],
    [119, 142],
    [119, 142],
    [119, 141],
    [118, 141],
    [118, 141],
    [118, 140],
    [118, 140],
    [117, 140],
    [117, 140],
];
A320_Neo_CDU_MainDisplay._vRsConf1 = [
    [146, 160],
    [144, 160],
    [143, 159],
    [141, 158],
    [139, 156],
    [137, 154],
    [136, 152],
    [135, 151],
    [135, 151],
    [134, 151],
    [134, 151],
    [133, 151],
    [133, 151],
    [132, 150],
    [132, 151],
    [131, 151],
    [131, 150],
    [131, 150],
    [130, 151],
    [130, 150],
];
A320_Neo_CDU_MainDisplay._vRsConf2 = [
    [130, 158],
    [128, 156],
    [127, 154],
    [125, 152],
    [123, 150],
    [122, 148],
    [121, 147],
    [120, 146],
    [120, 146],
    [120, 145],
    [119, 145],
    [119, 144],
    [119, 144],
    [119, 143],
    [118, 143],
    [118, 142],
    [118, 142],
    [118, 141],
    [117, 141],
    [117, 140],
];
A320_Neo_CDU_MainDisplay._v2sConf1 = [
    [152, 165],
    [150, 165],
    [148, 164],
    [146, 163],
    [144, 161],
    [143, 159],
    [141, 157],
    [140, 156],
    [140, 156],
    [139, 156],
    [139, 155],
    [138, 155],
    [138, 155],
    [137, 155],
    [137, 155],
    [136, 155],
    [136, 155],
    [136, 155],
    [135, 155],
    [135, 155],
];
A320_Neo_CDU_MainDisplay._v2sConf2 = [
    [135, 163],
    [133, 160],
    [132, 158],
    [130, 157],
    [129, 155],
    [127, 153],
    [127, 151],
    [126, 150],
    [125, 150],
    [125, 149],
    [124, 149],
    [124, 148],
    [124, 148],
    [123, 147],
    [123, 146],
    [123, 146],
    [123, 145],
    [122, 145],
    [122, 144],
    [121, 144],
];
registerInstrument("a320-neo-cdu-main-display", A320_Neo_CDU_MainDisplay);
//# sourceMappingURL=A320_Neo_CDU_MainDisplay.js.map