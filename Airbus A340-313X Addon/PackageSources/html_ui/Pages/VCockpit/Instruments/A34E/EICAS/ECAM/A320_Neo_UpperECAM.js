var A320_Neo_UpperECAM;
(function (A320_Neo_UpperECAM) {
    class Definitions {
    }
    Definitions.MIN_GAUGE_EGT = 0;
    Definitions.MAX_GAUGE_EGT = 1000;
    Definitions.MIN_GAUGE_EGT_RED = 850;
    Definitions.MAX_GAUGE_EGT_RED = 1000;
    Definitions.MIN_GAUGE_N1 = 0;
    Definitions.MAX_GAUGE_N1 = 110;
    Definitions.THROTTLE_TO_N1_GAUGE = 100 / Definitions.MAX_GAUGE_N1;
    Definitions.MIN_GAUGE_N1_RED = 100;
    Definitions.MAX_GAUGE_N1_RED = 110;
    Definitions.MAX_FF = 9900;
    A320_Neo_UpperECAM.Definitions = Definitions;
    function createDiv(_id, _class = "", _text = "") {
        var div = document.createElement("div");
        if (_id.length > 0) {
            div.id = _id;
        }
        if (_class.length > 0) {
            div.className = _class;
        }
        if (_text.length > 0) {
            diffAndSetText(div, _text);
        }
        return div;
    }
    A320_Neo_UpperECAM.createDiv = createDiv;
    function createSVGText(_text, _class, _x, _y, _alignmentBaseline = "center") {
        var textElement = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetText(textElement, _text);
        diffAndSetAttribute(textElement, "class", _class);
        diffAndSetAttribute(textElement, "x", _x);
        diffAndSetAttribute(textElement, "y", _y);
        diffAndSetAttribute(textElement, "alignment-baseline", _alignmentBaseline);
        return textElement;
    }
    A320_Neo_UpperECAM.createSVGText = createSVGText;
    function createSVGCircle(_class, _radius, _x, _y) {
        var circleElement = document.createElementNS(Avionics.SVG.NS, "circle");
        diffAndSetAttribute(circleElement, "class", _class);
        diffAndSetAttribute(circleElement, "r", _radius);
        diffAndSetAttribute(circleElement, "cx", _x);
        diffAndSetAttribute(circleElement, "cy", _y);
        return circleElement;
    }
    A320_Neo_UpperECAM.createSVGCircle = createSVGCircle;
    class Display extends Airliners.EICASTemplateElement {
        constructor() {
            super();
            this.isInitialised = false;
            this.allPanels = [];
        }
        get templateID() { return "UpperECAMTemplate"; }
        connectedCallback() {
            super.connectedCallback();
        }
        init(_eicas) {
            this.eicas = _eicas;
            this.enginePanel = new A320_Neo_UpperECAM.EnginePanel(this, "EnginesPanel");
            this.infoTopPanel = new A320_Neo_UpperECAM.InfoTopPanel(this, "InfoTopPanel");
            this.flapsPanel = new A320_Neo_UpperECAM.FlapsPanel(this, "FlapsPanel");
            this.infoBottomLeftPanel = new A320_Neo_UpperECAM.InfoBottomLeftPanel(this, "InfoBottomLeftPanel");
            this.infoBottomRightPanel = new A320_Neo_UpperECAM.InfoBottomRightPanel(this, "InfoBottomRightPanel");
            this.infoPanelsManager = new A320_Neo_UpperECAM.InfoPanelsManager();
            this.allPanels.push(this.enginePanel);
            this.allPanels.push(this.infoTopPanel);
            this.allPanels.push(this.flapsPanel);
            this.allPanels.push(this.infoBottomLeftPanel);
            this.allPanels.push(this.infoBottomRightPanel);
            for (var i = 0; i < this.allPanels.length; ++i) {
                if (this.allPanels[i] != null) {
                    this.allPanels[i].init();
                }
            }
            if (this.infoPanelsManager != null) {
                this.infoPanelsManager.init(this.infoBottomLeftPanel, this.infoBottomRightPanel);
            }
            this.isInitialised = true;
        }
        update(_deltaTime) {
            if (!this.isInitialised) {
                return;
            }
            for (var i = 0; i < this.allPanels.length; ++i) {
                if (this.allPanels[i] != null) {
                    this.allPanels[i].update(_deltaTime);
                }
            }
        }
        getInfoPanelManager() {
            return this.infoPanelsManager;
        }
        ;
    }
    A320_Neo_UpperECAM.Display = Display;
    class PanelBase {
        constructor(_parent, _divID) {
            this.parent = _parent;
            this.divID = _divID;
        }
        init() {
            this.create();
        }
        update(_deltaTime) {
        }
        create() {
            if (this.parent != null) {
                this.divMain = A320_Neo_UpperECAM.createDiv(this.divID);
                this.parent.appendChild(this.divMain);
            }
        }
    }
    A320_Neo_UpperECAM.PanelBase = PanelBase;
    class EnginePanel extends A320_Neo_UpperECAM.PanelBase {
        constructor() {
            super(...arguments);
            this.engines = [];
            this.linesStyleInfo = [];
        }
        update(_deltaTime) {
            super.update(_deltaTime);
            for (var i = 0; i < this.engines.length; ++i) {
                this.engines[i].update(_deltaTime);
            }
            for (var i = 0; i < this.linesStyleInfo.length; ++i) {
                this.linesStyleInfo[i].update(_deltaTime);
            }
        }
        create() {
            super.create();
            for (var i = 0; i < 4; i++) {
                this.engines.push(new A320_Neo_UpperECAM.Engine(this.divMain, i));
                this.engines[i].init();
            }
            var gaugeInfoDiv = A320_Neo_UpperECAM.createDiv("GaugeInfo");
            this.statusDiv = A320_Neo_UpperECAM.createDiv("", "STATUS", "");
            gaugeInfoDiv.appendChild(this.statusDiv);
            gaugeInfoDiv.appendChild(A320_Neo_UpperECAM.createDiv("", "SLOT1_TITLE", "N1"));
            gaugeInfoDiv.appendChild(A320_Neo_UpperECAM.createDiv("", "SLOT1_UNIT", "%"));
            gaugeInfoDiv.appendChild(A320_Neo_UpperECAM.createDiv("", "SLOT2_TITLE", "EGT"));
            gaugeInfoDiv.appendChild(A320_Neo_UpperECAM.createDiv("", "SLOT2_UNIT", String.fromCharCode(176) + "C"));
            this.linesStyleInfo.push(new A320_Neo_UpperECAM.LinesStyleInfo_N2(this.divMain, "20%"));
            this.linesStyleInfo.push(new A320_Neo_UpperECAM.LinesStyleInfo_FF(this.divMain, "3%"));
            this.divMain.appendChild(gaugeInfoDiv);
        }
    }
    A320_Neo_UpperECAM.EnginePanel = EnginePanel;
    class Engine {
        constructor(_parent, _index) {
            this.allGauges = [];
            this.parent = _parent;
            this.index = _index;
        }
        init() {
            this.divMain = A320_Neo_UpperECAM.createDiv("Engine" + this.index, "engine");
            this.createN1Gauge();
            this.createEGTGauge();
            this.parent.appendChild(this.divMain);
        }
        update(_deltaTime) {
            if (this.allGauges != null) {
                var active = A320_Neo_ECAM_Common.isEngineDisplayActive(this.index + 1);
                for (var i = 0; i < this.allGauges.length; ++i) {
                    if (this.allGauges[i] != null) {
                        this.allGauges[i].active = active;
                        this.allGauges[i].update(_deltaTime);
                    }
                }
            }
        }
        createEGTGauge() {
            var gaugeDef = new A320_Neo_ECAM_Common.GaugeDefinition();
            gaugeDef.startAngle = -180;
            gaugeDef.arcSize = 180;
            gaugeDef.minValue = A320_Neo_UpperECAM.Definitions.MIN_GAUGE_EGT;
            gaugeDef.maxValue = A320_Neo_UpperECAM.Definitions.MAX_GAUGE_EGT;
            gaugeDef.minRedValue = A320_Neo_UpperECAM.Definitions.MIN_GAUGE_EGT_RED;
            gaugeDef.maxRedValue = A320_Neo_UpperECAM.Definitions.MAX_GAUGE_EGT_RED;
            gaugeDef.cursorLength = 0.4;
            gaugeDef.currentValuePos.x = 0.75;
            gaugeDef.currentValuePos.y = 0.5;
            gaugeDef.currentValueBorderWidth = 0.55;
            gaugeDef.dangerRange[0] = gaugeDef.minRedValue;
            gaugeDef.dangerRange[1] = gaugeDef.maxRedValue;
            gaugeDef.currentValueFunction = this.getEGTGaugeValue.bind(this);
            gaugeDef.currentValuePrecision = 0;
            this.gaugeEGT = window.document.createElement("a320-neo-ecam-gauge");
            this.gaugeEGT.id = "EGT_Gauge";
            this.gaugeEGT.init(gaugeDef);
            this.gaugeEGT.addGraduation(0, true);
            this.gaugeEGT.addGraduation(500, true);
            this.gaugeEGT.addGraduation(1000, false);
            this.divMain.appendChild(this.gaugeEGT);
            this.allGauges.push(this.gaugeEGT);
        }
        createN1Gauge() {
            var gaugeDef = new A320_Neo_ECAM_Common.GaugeDefinition();
            gaugeDef.minValue = A320_Neo_UpperECAM.Definitions.MIN_GAUGE_N1;
            gaugeDef.maxValue = A320_Neo_UpperECAM.Definitions.MAX_GAUGE_N1;
            gaugeDef.arcSize = 200;
            gaugeDef.minRedValue = A320_Neo_UpperECAM.Definitions.MIN_GAUGE_N1_RED;
            gaugeDef.currentValuePos.x = 1.0;
            gaugeDef.currentValuePos.y = 0.75;
            gaugeDef.currentValueBorderWidth = 0.7;
            gaugeDef.outerIndicatorFunction = this.getN1GaugeThrottleValue.bind(this);
            gaugeDef.outerDynamicArcFunction = this.getN1GaugeAutopilotThrottleValues.bind(this);
            gaugeDef.extraMessageFunction = this.getN1GaugeExtraMessage.bind(this);
            gaugeDef.maxRedValue = A320_Neo_UpperECAM.Definitions.MAX_GAUGE_N1_RED;
            gaugeDef.dangerRange[0] = gaugeDef.minRedValue;
            gaugeDef.dangerRange[1] = gaugeDef.maxRedValue;
            gaugeDef.currentValueFunction = this.getN1GaugeValue.bind(this);
            gaugeDef.currentValuePrecision = 1;
            this.gaugeN1 = window.document.createElement("a320-neo-ecam-gauge");
            this.gaugeN1.id = "N1_Gauge";
            this.gaugeN1.init(gaugeDef);
            this.gaugeN1.addGraduation(0, true);
            this.gaugeN1.addGraduation(50, true, "5");
            this.gaugeN1.addGraduation(60, true);
            this.gaugeN1.addGraduation(70, true);
            this.gaugeN1.addGraduation(80, true);
            this.gaugeN1.addGraduation(90, true);
            this.gaugeN1.addGraduation(100, true, "10", true);
            this.divMain.appendChild(this.gaugeN1);
            this.allGauges.push(this.gaugeN1);
        }
        getEGTGaugeValue() {
            var engineId = this.index + 1;
            var value = SimVar.GetSimVarValue("ENG EXHAUST GAS TEMPERATURE:" + engineId, "celsius");
            return value;
        }
        getN1GaugeValue() {
            var engineId = (this.index + 1);
            var value = SimVar.GetSimVarValue("ENG N1 RPM:" + engineId, "percent");
            return value;
        }
        getN1GaugeThrottleValue() {
            var throttle = Math.abs(Simplane.getEngineThrottleCommandedN1(this.index));
            var value = throttle * A320_Neo_UpperECAM.Definitions.THROTTLE_TO_N1_GAUGE;
            return value;
        }
        getN1GaugeAutopilotThrottleValues(_values) {
            if ((_values != null) && (_values.length == 2)) {
                if (Simplane.getAutoPilotThrottleActive()) {
                    var engineThrottle = this.getN1GaugeValue();
                    var autopilotThrottle = Simplane.getAutopilotCommandedN1(this.index);
                    if (engineThrottle < autopilotThrottle) {
                        _values[0] = engineThrottle;
                        _values[1] = autopilotThrottle;
                    }
                    else {
                        _values[0] = autopilotThrottle;
                        _values[1] = engineThrottle;
                    }
                }
                else {
                    _values[0] = 0;
                    _values[1] = 0;
                }
            }
        }
        getN1GaugeExtraMessage() {
            if (Simplane.getEngineRevThrust(this.index) || (Simplane.getEngineThrottle(this.index) < 0.0)) {
                return "REV";
            }
            else {
                return "";
            }
        }
    }
    A320_Neo_UpperECAM.Engine = Engine;
    class LinesStyleComponent_Base {
        constructor(_svgRoot) {
            if (_svgRoot != null) {
                var line = document.createElementNS(Avionics.SVG.NS, "line");
                diffAndSetAttribute(line, "x1", this.getLineX1());
                diffAndSetAttribute(line, "x2", this.getLineX2());
                diffAndSetAttribute(line, "y1", "85%");
                diffAndSetAttribute(line, "y2", "70%");
                line.style.stroke = "rgb(60, 60, 60)";
                line.style.strokeWidth = "2";
                _svgRoot.appendChild(line);
                this.valueText = A320_Neo_UpperECAM.createSVGText("--.-", "Value", this.getValueTextX(), "100%", "bottom");
                _svgRoot.appendChild(this.valueText);
            }
            this.refresh(false, 0, 0, true);
        }
        refresh(_active, _value, _valueDisplayPrecision, _force = false) {
            if ((this.isActive != _active) || (this.currentValue != _value) || _force) {
                this.isActive = _active;
                this.currentValue = _value;
                if (this.valueText != null) {
                    var valueClass = this.isActive ? "Value" : "Inactive";
                    diffAndSetAttribute(this.valueText, "class", valueClass);
                    if (this.isActive) {
                        diffAndSetText(this.valueText, fastToFixed(this.currentValue, _valueDisplayPrecision));
                    }
                    else {
                        diffAndSetText(this.valueText, "XX");
                    }
                }
            }
        }
    }
    A320_Neo_UpperECAM.LinesStyleComponent_Base = LinesStyleComponent_Base;
    class LinesStyleComponent_Left extends LinesStyleComponent_Base {
        getLineX1() { return "37%"; }
        getLineX2() { return "43%"; }
        getValueTextX() { return "25%"; }
    }
    A320_Neo_UpperECAM.LinesStyleComponent_Left = LinesStyleComponent_Left;
    class LinesStyleComponent_Right extends LinesStyleComponent_Base {
        getLineX1() { return "63%"; }
        getLineX2() { return "57%"; }
        getValueTextX() { return "75%"; }
    }
    A320_Neo_UpperECAM.LinesStyleComponent_Right = LinesStyleComponent_Right;
    class LinesStyleInfo {
        constructor(_divMain, _bottomValue) {
            var svgRoot = document.createElementNS(Avionics.SVG.NS, "svg");
            svgRoot.appendChild(A320_Neo_UpperECAM.createSVGText(this.getTitle(), "Title", "50%", "75%", "bottom"));
            svgRoot.appendChild(A320_Neo_UpperECAM.createSVGText(this.getUnit(), "Unit", "50%", "100%", "bottom"));
            this.leftComponent = new LinesStyleComponent_Left(svgRoot);
            this.rightComponent = new LinesStyleComponent_Right(svgRoot);
            var div = A320_Neo_UpperECAM.createDiv("LineStyleInfos");
            div.style.bottom = _bottomValue;
            div.appendChild(svgRoot);
            _divMain.appendChild(div);
        }
        update(_deltaTime) {
            if (this.leftComponent != null) {
                this.leftComponent.refresh(A320_Neo_ECAM_Common.isEngineDisplayActive(1), this.getValue(1), this.getValueStringPrecision());
            }
            if (this.rightComponent != null) {
                this.rightComponent.refresh(A320_Neo_ECAM_Common.isEngineDisplayActive(2), this.getValue(2), this.getValueStringPrecision());
            }
        }
        getValueStringPrecision() { return 0; }
    }
    A320_Neo_UpperECAM.LinesStyleInfo = LinesStyleInfo;
    class LinesStyleInfo_N2 extends LinesStyleInfo {
        getTitle() {
            return "N2";
        }
        getUnit() {
            return "%";
        }
        getValue(_engine) {
            var name = "ENG N2 RPM:" + _engine;
            var percent = SimVar.GetSimVarValue(name, "percent");
            percent = Math.max(0, Math.min(100, percent));
            return percent;
        }
        getValueStringPrecision() { return 1; }
    }
    A320_Neo_UpperECAM.LinesStyleInfo_N2 = LinesStyleInfo_N2;
    class LinesStyleInfo_FF extends LinesStyleInfo {
        constructor(_divMain, _bottomValue) {
            super(_divMain, _bottomValue);
            this.gallonToKG = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "kilogram");
        }
        getTitle() {
            return "FF";
        }
        getUnit() {
            return "KG/H";
        }
        getValue(_engine) {
            var value = SimVar.GetSimVarValue("ENG FUEL FLOW GPH:" + _engine, "gallons per hour") * this.gallonToKG;
            return value;
        }
    }
    A320_Neo_UpperECAM.LinesStyleInfo_FF = LinesStyleInfo_FF;
    class InfoTopPanel extends A320_Neo_UpperECAM.PanelBase {
        create() {
            super.create();
            if (this.divMain != null) {
                var statusDiv = A320_Neo_UpperECAM.createDiv("Status");
                this.throttleState = A320_Neo_UpperECAM.createDiv("ThrottleState");
                statusDiv.appendChild(this.throttleState);
                this.throttleValue = A320_Neo_UpperECAM.createDiv("ThrottleValue");
                statusDiv.appendChild(this.throttleValue);
                this.flexTemperature = A320_Neo_UpperECAM.createDiv("FlexTemperature");
                statusDiv.appendChild(this.flexTemperature);
                this.divMain.appendChild(statusDiv);
                var fuelOnBoardDiv = A320_Neo_UpperECAM.createDiv("FuelOnBoard");
                fuelOnBoardDiv.appendChild(A320_Neo_UpperECAM.createDiv("Title", "", "FOB :"));
                this.fobValue = A320_Neo_UpperECAM.createDiv("Value");
                fuelOnBoardDiv.appendChild(this.fobValue);
                fuelOnBoardDiv.appendChild(A320_Neo_UpperECAM.createDiv("Unit", "", "KG"));
                this.divMain.appendChild(fuelOnBoardDiv);
            }
            this.setThrottle(false, 0, ThrottleMode.UNKNOWN, true);
            this.setFlexTemperature(false, 0, true);
            this.setFuelOnBoard(0, true);
        }
        update(_deltaTime) {
            super.update(_deltaTime);
            if (Simplane.getEngineActive(0) || Simplane.getEngineActive(1)) {
                var throttleMode = Math.max(Simplane.getEngineThrottleMode(0), Simplane.getEngineThrottleMode(1));
                var throttleValue = Simplane.getEngineThrottleMaxThrust(1);
                if (Simplane.getCurrentFlightPhase() < FlightPhase.FLIGHT_PHASE_CLIMB) {
                    if (throttleMode == ThrottleMode.FLEX_MCT) {
                        this.setThrottle(true, throttleValue, throttleMode, true);
                        var flexTemp = Simplane.getFlexTemperature();
                        this.setFlexTemperature((flexTemp > 0), flexTemp);
                    }
                    else {
                        this.setThrottle(true, throttleValue, throttleMode);
                        this.setFlexTemperature(false);
                    }
                }
                else {
                    this.setThrottle(true, throttleValue, throttleMode);
                    this.setFlexTemperature(false);
                }
            }
            else {
                this.setThrottle(false);
                this.setFlexTemperature(false);
            }
            this.setFuelOnBoard(SimVar.GetSimVarValue("FUEL TOTAL QUANTITY WEIGHT", "kg"));
        }
        setThrottle(_active, _value = 0, _mode = ThrottleMode.UNKNOWN, _force = false) {
            if ((_active != this.throttleIsActive) || (_value != this.currentThrottleValue) || (_mode != this.currentThrottleMode) || _force) {
                this.throttleIsActive = _active;
                this.currentThrottleValue = _value;
                this.currentThrottleMode = _mode;
                if (this.throttleState != null) {
                    if (_active && (this.currentThrottleMode != ThrottleMode.UNKNOWN)) {
                        this.throttleState.className = "active";
                        switch (this.currentThrottleMode) {
                            case ThrottleMode.TOGA:
                                {
                                    diffAndSetText(this.throttleState, "TO/GA");
                                    break;
                                }
                            case ThrottleMode.FLEX_MCT:
                                {
                                    if ((Simplane.getCurrentFlightPhase() < FlightPhase.FLIGHT_PHASE_CLIMB) && (Simplane.getFlexTemperature() > 0)) {
                                        diffAndSetText(this.throttleState, "FLX");
                                    }
                                    else {
                                        diffAndSetText(this.throttleState, "MCT");
                                    }
                                    break;
                                }
                            case ThrottleMode.CLIMB:
                                {
                                    diffAndSetText(this.throttleState, "CLB");
                                    break;
                                }
                            case ThrottleMode.AUTO:
                                {
                                    diffAndSetText(this.throttleState, "AUTO");
                                    break;
                                }
                            case ThrottleMode.IDLE:
                                {
                                    diffAndSetText(this.throttleState, "IDLE");
                                    break;
                                }
                            case ThrottleMode.REVERSE:
                                {
                                    diffAndSetText(this.throttleState, "REV");
                                    break;
                                }
                        }
                    }
                    else {
                        this.throttleState.className = "inactive";
                        diffAndSetText(this.throttleState, "XX");
                    }
                }
                if (this.throttleValue != null) {
                    this.throttleValue.className = _active ? "active" : "inactive";
                    if (_active) {
                        diffAndSetText(this.throttleValue, fastToFixed(_value, 1));
                    }
                    else {
                        diffAndSetText(this.throttleValue, "XX");
                    }
                }
            }
        }
        setFlexTemperature(_active, _value = 0, _force = false) {
            if ((_active != this.flexTemperatureIsActive) || (_value != this.currentFlexTemperature) || _force) {
                this.currentFlexTemperature = _value;
                this.flexTemperatureIsActive = _active;
                if (this.flexTemperature != null) {
                    diffAndSetText(this.flexTemperature, fastToFixed(this.currentFlexTemperature, 0));
                    this.flexTemperature.className = this.flexTemperatureIsActive ? "active" : "inactive";
                }
            }
        }
        setFuelOnBoard(_value, _force = false) {
            if ((this.currentFOBValue != _value) || _force) {
                this.currentFOBValue = _value;
                if (this.fobValue != null) {
                    diffAndSetText(this.fobValue, fastToFixed(this.currentFOBValue, 0));
                }
            }
        }
    }
    A320_Neo_UpperECAM.InfoTopPanel = InfoTopPanel;
    class FlapsPanel extends A320_Neo_UpperECAM.PanelBase {
        constructor() {
            super(...arguments);
            this.viewBoxSize = new Vec2(500, 125);
            this.dotSize = 4;
            this.slatArrowPathD = "m20,-12 l-31,6 l0,17, l23,-5 l10,-20";
            this.slatDotPositions = [
                new Vec2(160, 37),
                new Vec2(110, 52),
                new Vec2(68, 68),
                new Vec2(25, 81)
            ];
            this.flapArrowPathD = "m-20,-12 l31,6 l0,17, l-23,-5 l-10,-20";
            this.flapDotPositions = [
                new Vec2(220, 37),
                new Vec2(280, 50),
                new Vec2(327, 61),
                new Vec2(375, 72),
                new Vec2(423, 83)
            ];
            this.sTextPos = new Vec2(66, 32);
            this.fTextPos = new Vec2(330, 32);
            this.currentStateTextPos = new Vec2(190, 87);
            this.mainShapeCorners = [
                new Vec2(180, 25),
                new Vec2(200, 25),
                new Vec2(210, 45),
                new Vec2(170, 45)
            ];
        }
        create() {
            super.create();
            var rootSVG = document.createElementNS(Avionics.SVG.NS, "svg");
            diffAndSetAttribute(rootSVG, "id", "DiagramSVG");
            diffAndSetAttribute(rootSVG, "viewBox", "0 0 " + this.viewBoxSize.x + " " + this.viewBoxSize.y);
            this.divMain.appendChild(rootSVG);
            this.hideOnInactiveGroup = document.createElementNS(Avionics.SVG.NS, "g");
            diffAndSetAttribute(this.hideOnInactiveGroup, "id", "HideOnInactive");
            rootSVG.appendChild(this.hideOnInactiveGroup);
            var shape = document.createElementNS(Avionics.SVG.NS, "path");
            diffAndSetAttribute(shape, "class", "shape");
            {
                var d = [
                    "M", this.mainShapeCorners[0].x, ",", this.mainShapeCorners[0].y,
                    " L", this.mainShapeCorners[1].x, ",", this.mainShapeCorners[1].y,
                    " L", this.mainShapeCorners[2].x, ",", this.mainShapeCorners[2].y,
                    " L", this.mainShapeCorners[3].x, ",", this.mainShapeCorners[3].y,
                    " Z"
                ].join("");
                diffAndSetAttribute(shape, "d", d);
            }
            rootSVG.appendChild(shape);
            this.currentSlatsArrow = document.createElementNS(Avionics.SVG.NS, "path");
            diffAndSetAttribute(this.currentSlatsArrow, "class", "currentArrow");
            rootSVG.appendChild(this.currentSlatsArrow);
            this.currentFlapsArrow = document.createElementNS(Avionics.SVG.NS, "path");
            diffAndSetAttribute(this.currentFlapsArrow, "class", "currentArrow");
            rootSVG.appendChild(this.currentFlapsArrow);
            this.targetSlatsArrow = document.createElementNS(Avionics.SVG.NS, "path");
            diffAndSetAttribute(this.targetSlatsArrow, "class", "targetArrow");
            rootSVG.appendChild(this.targetSlatsArrow);
            this.targetFlapsArrow = document.createElementNS(Avionics.SVG.NS, "path");
            diffAndSetAttribute(this.targetFlapsArrow, "class", "targetArrow");
            rootSVG.appendChild(this.targetFlapsArrow);
            this.targetSlatsArrowsStrings = new Array();
            this.targetSlatsArrowsStrings.push(this.generateArrowPathD(this.slatArrowPathD, null, this.slatDotPositions[0], this.slatDotPositions[1], 0));
            this.targetSlatsArrowsStrings.push(this.generateArrowPathD(this.slatArrowPathD, null, this.slatDotPositions[0], this.slatDotPositions[1], 1));
            this.targetSlatsArrowsStrings.push(this.generateArrowPathD(this.slatArrowPathD, null, this.slatDotPositions[1], this.slatDotPositions[2], 1));
            this.targetSlatsArrowsStrings.push(this.generateArrowPathD(this.slatArrowPathD, null, this.slatDotPositions[1], this.slatDotPositions[2], 1));
            this.targetSlatsArrowsStrings.push(this.generateArrowPathD(this.slatArrowPathD, null, this.slatDotPositions[2], this.slatDotPositions[3], 1));
            this.targetFlapsArrowsStrings = new Array();
            this.targetFlapsArrowsStrings.push(this.generateArrowPathD(this.flapArrowPathD, null, this.flapDotPositions[0], this.flapDotPositions[1], 0));
            this.targetFlapsArrowsStrings.push(this.generateArrowPathD(this.flapArrowPathD, null, this.flapDotPositions[0], this.flapDotPositions[1], 1));
            this.targetFlapsArrowsStrings.push(this.generateArrowPathD(this.flapArrowPathD, null, this.flapDotPositions[1], this.flapDotPositions[2], 1));
            this.targetFlapsArrowsStrings.push(this.generateArrowPathD(this.flapArrowPathD, null, this.flapDotPositions[2], this.flapDotPositions[3], 1));
            this.targetFlapsArrowsStrings.push(this.generateArrowPathD(this.flapArrowPathD, null, this.flapDotPositions[3], this.flapDotPositions[4], 1));
            this.hideOnInactiveGroup.appendChild(A320_Neo_UpperECAM.createSVGText("S", "sfText", this.sTextPos.x + '', this.sTextPos.y + ''));
            this.hideOnInactiveGroup.appendChild(A320_Neo_UpperECAM.createSVGText("F", "sfText", this.fTextPos.x + '', this.fTextPos.y + ''));
            this.currentStateText = A320_Neo_UpperECAM.createSVGText("", "state", this.currentStateTextPos.x + '', this.currentStateTextPos.y + '');
            this.hideOnInactiveGroup.appendChild(this.currentStateText);
            var dotSizeStr = this.dotSize + '';
            for (var i = 1; i < this.slatDotPositions.length; ++i) {
                this.hideOnInactiveGroup.appendChild(A320_Neo_UpperECAM.createSVGCircle("dot", dotSizeStr, this.slatDotPositions[i].x + '', this.slatDotPositions[i].y + ''));
            }
            for (var i = 1; i < this.flapDotPositions.length; ++i) {
                this.hideOnInactiveGroup.appendChild(A320_Neo_UpperECAM.createSVGCircle("dot", dotSizeStr, this.flapDotPositions[i].x + '', this.flapDotPositions[i].y + ''));
            }
            this.deactivate();
            this.cockpitSettings = SimVar.GetGameVarValue("", "GlassCockpitSettings");
        }
        activate() {
            this.isActive = true;
            if (this.hideOnInactiveGroup != null) {
                diffAndSetStyle(this.hideOnInactiveGroup, StyleProperty.display, "block");
            }
        }
        deactivate() {
            this.isActive = false;
            this.currentSlatsAngle = 0;
            this.currentFlapsAngle = 0;
            if (this.hideOnInactiveGroup != null) {
                diffAndSetStyle(this.hideOnInactiveGroup, StyleProperty.display, "none");
            }
            if (this.currentSlatsArrow != null) {
                diffAndSetAttribute(this.currentSlatsArrow, "d", this.targetSlatsArrowsStrings[0]);
            }
            if (this.currentFlapsArrow != null) {
                diffAndSetAttribute(this.currentFlapsArrow, "d", this.targetFlapsArrowsStrings[0]);
            }
            if (this.targetSlatsArrow != null) {
                diffAndSetStyle(this.targetSlatsArrow, StyleProperty.display, "none");
            }
            if (this.targetFlapsArrow != null) {
                diffAndSetStyle(this.targetFlapsArrow, StyleProperty.display, "none");
            }
        }
        update(_deltaTime) {
            super.update(_deltaTime);
            var slatsAngle = (SimVar.GetSimVarValue("LEADING EDGE FLAPS LEFT ANGLE", "degrees") + SimVar.GetSimVarValue("LEADING EDGE FLAPS RIGHT ANGLE", "degrees")) * 0.5;
            var flapsAngle = (SimVar.GetSimVarValue("TRAILING EDGE FLAPS LEFT ANGLE", "degrees") + SimVar.GetSimVarValue("TRAILING EDGE FLAPS RIGHT ANGLE", "degrees")) * 0.5;
            var handleIndex = Simplane.getFlapsHandleIndex(true);
            let slatsTargetIndex = handleIndex;
            let flapsTargetIndex = handleIndex;
            var slatsAngleChanged = (this.currentSlatsAngle != slatsAngle);
            var flapsAngleChanged = (this.currentFlapsAngle != flapsAngle);
            if ((slatsAngleChanged || flapsAngleChanged) && ((this.cockpitSettings != null) && (this.cockpitSettings.FlapsLevels != null) && this.cockpitSettings.FlapsLevels.initialised)) {
                if (slatsAngleChanged) {
                    this.currentSlatsAngle = slatsAngle;
                    var dSlatsArrow = "";
                    if (this.currentSlatsAngle <= this.cockpitSettings.FlapsLevels.slatsAngle[0]) {
                        dSlatsArrow = this.targetSlatsArrowsStrings[0];
                    }
                    else if (this.currentSlatsAngle <= this.cockpitSettings.FlapsLevels.slatsAngle[1]) {
                        var lerp = Utils.Clamp(this.currentSlatsAngle / 18, 0, 1);
                        dSlatsArrow = this.generateArrowPathD(this.slatArrowPathD, this.mainShapeCorners[0], this.slatDotPositions[0], this.slatDotPositions[1], lerp);
                    }
                    else if (this.currentSlatsAngle <= this.cockpitSettings.FlapsLevels.slatsAngle[3]) {
                        var lerp = Utils.Clamp((this.currentSlatsAngle - 18) / 4, 0, 1);
                        dSlatsArrow = this.generateArrowPathD(this.slatArrowPathD, this.mainShapeCorners[0], this.slatDotPositions[1], this.slatDotPositions[2], lerp);
                    }
                    else if (this.currentSlatsAngle <= this.cockpitSettings.FlapsLevels.slatsAngle[4]) {
                        var lerp = Utils.Clamp((this.currentSlatsAngle - 22) / 5, 0, 1);
                        dSlatsArrow = this.generateArrowPathD(this.slatArrowPathD, this.mainShapeCorners[0], this.slatDotPositions[2], this.slatDotPositions[3], lerp);
                    }
                    if (this.currentSlatsArrow != null) {
                        diffAndSetAttribute(this.currentSlatsArrow, "d", dSlatsArrow);
                    }
                }
                if (flapsAngleChanged) {
                    this.currentFlapsAngle = flapsAngle;
                    var dFlapsArrow = "";
                    if (this.currentFlapsAngle <= this.cockpitSettings.FlapsLevels.flapsAngle[0]) {
                        dFlapsArrow = this.targetFlapsArrowsStrings[0];
                    }
                    else if (this.currentFlapsAngle <= this.cockpitSettings.FlapsLevels.flapsAngle[1]) {
                        var lerp = Utils.Clamp(this.currentFlapsAngle / 10, 0, 1);
                        dFlapsArrow = this.generateArrowPathD(this.flapArrowPathD, this.mainShapeCorners[1], this.flapDotPositions[0], this.flapDotPositions[1], lerp);
                    }
                    else if (this.currentFlapsAngle <= this.cockpitSettings.FlapsLevels.flapsAngle[2]) {
                        var lerp = Utils.Clamp((this.currentFlapsAngle - 10) / 5, 0, 1);
                        dFlapsArrow = this.generateArrowPathD(this.flapArrowPathD, this.mainShapeCorners[1], this.flapDotPositions[1], this.flapDotPositions[2], lerp);
                    }
                    else if (this.currentFlapsAngle <= this.cockpitSettings.FlapsLevels.flapsAngle[3]) {
                        var lerp = Utils.Clamp((this.currentFlapsAngle - 15) / 5, 0, 1);
                        dFlapsArrow = this.generateArrowPathD(this.flapArrowPathD, this.mainShapeCorners[1], this.flapDotPositions[2], this.flapDotPositions[3], lerp);
                    }
                    else if (this.currentFlapsAngle <= this.cockpitSettings.FlapsLevels.flapsAngle[4]) {
                        var lerp = Utils.Clamp((this.currentFlapsAngle - 20) / 15, 0, 1);
                        dFlapsArrow = this.generateArrowPathD(this.flapArrowPathD, this.mainShapeCorners[1], this.flapDotPositions[3], this.flapDotPositions[4], lerp);
                    }
                    if (this.currentFlapsArrow != null) {
                        diffAndSetAttribute(this.currentFlapsArrow, "d", dFlapsArrow);
                    }
                }
                if (this.currentStateText != null) {
                    switch (handleIndex) {
                        case 1:
                            {
                                let flapsOut = SimVar.GetSimVarValue("TRAILING EDGE FLAPS LEFT INDEX", "Number");
                                if (flapsOut > 0) {
                                    diffAndSetText(this.currentStateText, "1+F");
                                }
                                else {
                                    diffAndSetText(this.currentStateText, "1");
                                }
                                break;
                            }
                        case 2:
                            {
                                diffAndSetText(this.currentStateText, "2");
                                break;
                            }
                        case 3:
                            {
                                diffAndSetText(this.currentStateText, "3");
                                break;
                            }
                        case 4:
                            {
                                diffAndSetText(this.currentStateText, "FULL");
                                break;
                            }
                        default:
                            {
                                diffAndSetText(this.currentStateText, "");
                                break;
                            }
                    }
                }
                var active = ((this.currentSlatsAngle > 0) || (this.currentFlapsAngle > 0));
                if (this.isActive != active) {
                    if (active) {
                        this.activate();
                    }
                    else {
                        this.deactivate();
                    }
                }
            }
            if (this.targetSlatsArrow != null) {
                if (slatsAngleChanged && (this.targetSlatsArrowsStrings != null) && (slatsTargetIndex >= 0) && (slatsTargetIndex < this.targetSlatsArrowsStrings.length)) {
                    diffAndSetAttribute(this.targetSlatsArrow, "d", this.targetSlatsArrowsStrings[slatsTargetIndex]);
                    diffAndSetStyle(this.targetSlatsArrow, StyleProperty.display, "block");
                }
                else {
                    diffAndSetStyle(this.targetSlatsArrow, StyleProperty.display, "none");
                }
            }
            if (this.targetFlapsArrow != null) {
                if (flapsAngleChanged && (this.targetFlapsArrowsStrings != null) && (flapsTargetIndex >= 0) && (flapsTargetIndex < this.targetFlapsArrowsStrings.length)) {
                    diffAndSetAttribute(this.targetFlapsArrow, "d", this.targetFlapsArrowsStrings[flapsTargetIndex]);
                    diffAndSetStyle(this.targetFlapsArrow, StyleProperty.display, "block");
                }
                else {
                    diffAndSetStyle(this.targetFlapsArrow, StyleProperty.display, "none");
                }
            }
        }
        generateArrowPathD(_baseString, _origin, _start, _end, _currentLineProgress) {
            var dir = new Vec2(_end.x - _start.x, _end.y - _start.y);
            var finalPos = new Vec2();
            if (_currentLineProgress >= 1) {
                finalPos.x = _end.x;
                finalPos.y = _end.y;
            }
            else if (_currentLineProgress > 0) {
                finalPos.x = (_start.x + (dir.x * _currentLineProgress));
                finalPos.y = (_start.y + (dir.y * _currentLineProgress));
            }
            else {
                finalPos.x = _start.x;
                finalPos.y = _start.y;
            }
            var d = "M" + finalPos.x + "," + finalPos.y;
            d += _baseString;
            if (_origin != null) {
                d += " L" + _origin.x + "," + _origin.y;
            }
            return d;
        }
    }
    A320_Neo_UpperECAM.FlapsPanel = FlapsPanel;
    class InfoPanelsManager extends Airliners.EICASInfoPanelManager {
        init(_left, _right) {
            this.leftInfo = _left;
            this.rightInfo = _right;
            Coherent.on("AddUpperECAMMessage", this.onInfoPanelEvent.bind(this, Airliners.EICAS_INFO_PANEL_EVENT_TYPE.ADD_MESSAGE));
            Coherent.on("RemoveUpperECAMMessage", this.onInfoPanelEvent.bind(this, Airliners.EICAS_INFO_PANEL_EVENT_TYPE.REMOVE_MESSAGE));
            Coherent.on("ModifyUpperECAMMessage", this.onInfoPanelEvent.bind(this, Airliners.EICAS_INFO_PANEL_EVENT_TYPE.MODIFY_MESSAGE));
            Coherent.on("ClearUpperECAMScreen", this.onInfoPanelEvent.bind(this, Airliners.EICAS_INFO_PANEL_EVENT_TYPE.CLEAR_SCREEN));
        }
        addMessage(_id, _message, _style) {
            if (_message != "") {
                let infoPanel = this.getInfoPanel(_id);
                if (infoPanel) {
                    infoPanel.addMessage(_message, _style);
                }
            }
        }
        removeMessage(_id, _message) {
            if (_message != "") {
                let infoPanel = this.getInfoPanel(_id);
                if (infoPanel) {
                    infoPanel.removeMessage(_message);
                }
            }
        }
        modifyMessage(_id, _currentMessage, _newMessage, _newStyle) {
            let infoPanel = this.getInfoPanel(_id);
            if (infoPanel) {
                if (_newMessage == "")
                    _newMessage = _currentMessage;
                infoPanel.modifyMessage(_currentMessage, _newMessage, _newStyle);
            }
        }
        clearScreen(_id) {
            let infoPanel = this.getInfoPanel(_id);
            if (infoPanel) {
                infoPanel.clearScreen();
            }
        }
        getInfoPanel(_id) {
            switch (_id) {
                case Airliners.EICAS_INFO_PANEL_ID.PRIMARY:
                    return this.leftInfo;
                case Airliners.EICAS_INFO_PANEL_ID.SECONDARY:
                    return this.rightInfo;
                default:
                    return null;
            }
        }
        onInfoPanelEvent(_type, ..._args) {
            if ((_args != null) && (_args.length > 0)) {
                var strings = _args[0];
                if ((strings != null) && (strings.length > 0)) {
                    let panelId;
                    if (strings[0] == "primary") {
                        panelId = Airliners.EICAS_INFO_PANEL_ID.PRIMARY;
                    }
                    else if (strings[0] == "secondary") {
                        panelId = Airliners.EICAS_INFO_PANEL_ID.PRIMARY;
                    }
                    else {
                        return;
                    }
                    switch (_type) {
                        case Airliners.EICAS_INFO_PANEL_EVENT_TYPE.ADD_MESSAGE:
                            {
                                if (strings.length >= 3) {
                                    this.addMessage(panelId, strings[1], Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE[strings[2]]);
                                }
                                break;
                            }
                        case Airliners.EICAS_INFO_PANEL_EVENT_TYPE.REMOVE_MESSAGE:
                            {
                                if (strings.length >= 2) {
                                    this.removeMessage(panelId, strings[1]);
                                }
                                break;
                            }
                        case Airliners.EICAS_INFO_PANEL_EVENT_TYPE.MODIFY_MESSAGE:
                            {
                                if (strings.length >= 4) {
                                    this.modifyMessage(panelId, strings[1], strings[2], Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE[strings[3]]);
                                }
                                break;
                            }
                        case Airliners.EICAS_INFO_PANEL_EVENT_TYPE.CLEAR_SCREEN:
                            {
                                this.clearScreen(panelId);
                                break;
                            }
                    }
                }
            }
        }
    }
    A320_Neo_UpperECAM.InfoPanelsManager = InfoPanelsManager;
    class InfoPanel extends A320_Neo_UpperECAM.PanelBase {
        constructor() {
            super(...arguments);
            this.allDivs = [];
        }
        getNextAvailableDiv() {
            for (var i = 0; i < this.allDivs.length; ++i) {
                if (this.allDivs[i].textContent.length == 0) {
                    return this.allDivs[i];
                }
            }
            if (this.divMain != null) {
                var newDiv = document.createElement("div");
                this.allDivs.push(newDiv);
                this.divMain.appendChild(newDiv);
                return newDiv;
            }
            return null;
        }
        getDivFromMessage(_message) {
            for (var i = 0; i < this.allDivs.length; ++i) {
                if (this.allDivs[i].textContent == _message) {
                    return this.allDivs[i];
                }
            }
            return null;
        }
        getClassNameFromStyle(_style) {
            switch (_style) {
                case Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.INDICATION: return "InfoIndication";
                case Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.CAUTION: return "InfoCaution";
                case Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.WARNING: return "InfoWarning";
            }
            return "";
        }
        addMessage(_message, _style) {
            var div = this.getNextAvailableDiv();
            if (div != null) {
                diffAndSetText(div, _message);
                div.className = this.getClassNameFromStyle(_style);
            }
        }
        removeMessage(_message) {
            var div = this.getDivFromMessage(_message);
            if (div != null) {
                diffAndSetText(div, "");
                for (var i = 0; i < (this.allDivs.length - 1); ++i) {
                    if (this.allDivs[i].textContent.length == 0) {
                        if (this.allDivs[i + 1].textContent.length > 0) {
                            diffAndSetText(this.allDivs[i], this.allDivs[i + 1].textContent);
                            this.allDivs[i].className = this.allDivs[i + 1].className;
                            diffAndSetText(this.allDivs[i + 1], "");
                        }
                    }
                }
            }
        }
        modifyMessage(_currentMessage, _newMessage, _newStyle) {
            var div = this.getDivFromMessage(_currentMessage);
            if (div != null) {
                diffAndSetText(div, _newMessage);
                div.className = this.getClassNameFromStyle(_newStyle);
            }
        }
        clearScreen() {
            for (var i = 0; i < this.allDivs.length; ++i) {
                diffAndSetText(this.allDivs[i], "");
            }
        }
    }
    A320_Neo_UpperECAM.InfoPanel = InfoPanel;
    class InfoBottomLeftPanel extends A320_Neo_UpperECAM.InfoPanel {
        create() {
            super.create();
            this.addMessage("SEAT BELTS", Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.INDICATION);
            this.addMessage("NO SMOKING", Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.INDICATION);
        }
    }
    A320_Neo_UpperECAM.InfoBottomLeftPanel = InfoBottomLeftPanel;
    class InfoBottomRightPanel extends A320_Neo_UpperECAM.InfoPanel {
    }
    A320_Neo_UpperECAM.InfoBottomRightPanel = InfoBottomRightPanel;
})(A320_Neo_UpperECAM || (A320_Neo_UpperECAM = {}));
customElements.define("a320-neo-upper-ecam", A320_Neo_UpperECAM.Display);
//# sourceMappingURL=A320_Neo_UpperECAM.js.map